// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE E AUTENTICAÇÃO
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyC94POEdHdl7gbgL_-xQtRiYJd5rYAZpck",
    authDomain: "lumi-joias-2bd00.firebaseapp.com",
    projectId: "lumi-joias-2bd00",
    storageBucket: "lumi-joias-2bd00.firebasestorage.app",
    messagingSenderId: "637641508263",
    appId: "1:637641508263:web:4fe3aefcf37a2274c5a282"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const emailsPermitidos = [
    "jddaqq@gmail.com", 
    "Nandasantosgom@gmail.com",
    "nandasantosgom@gmail.com"
];

const loginOverlay = document.getElementById('loginOverlay');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const loginError = document.getElementById('loginError');

googleLoginBtn.addEventListener('click', () => {
    loginError.style.display = 'none';
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        verificarPermissao(result.user.email);
    }).catch((error) => {
        console.error("Erro:", error);
        loginError.textContent = "Erro ao fazer login. Verifique os pop-ups.";
        loginError.style.display = 'block';
    });
});

// Verifica se tem permissão e LIBERA O SITE
function verificarPermissao(emailUser) {
    if (emailsPermitidos.includes(emailUser)) {
        loginOverlay.style.display = 'none';
        console.log("Acesso concedido para:", emailUser);
        
        // MUDE DE applyFilters() PARA:
        carregarProdutosDoBanco(); 
    } else {
        auth.signOut();
        loginError.textContent = `Acesso Negado: O e-mail ${emailUser} não tem permissão.`;
        loginError.style.display = 'block';
    }
}

auth.onAuthStateChanged((user) => {
    if (user) { verificarPermissao(user.email); } 
    else { loginOverlay.style.display = 'flex'; }
});

// ==========================================
// 2. COMUNICAÇÃO COM O FIRESTORE (Em Tempo Real)
// ==========================================
let productList = [];

// Lê os dados ao vivo do banco
function carregarProdutosDoBanco() {
    // O onSnapshot cria um "túnel" em tempo real com o banco de dados
    db.collection("produtos").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        productList = []; // Limpa o array local
        snapshot.forEach((doc) => {
            let produto = doc.data();
            produto.id = doc.id; // Guarda o ID único que o Firebase gerou
            productList.push(produto);
        });
        
        // Aplica os filtros e renderiza a tela automaticamente
        applyFilters(); 
    });
}

// ==========================================
// 3. LÓGICA DE FILTROS E PESQUISA
// ==========================================
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const noResultsMsg = document.getElementById('no-results');
const logoHome = document.getElementById('logoHome');

let currentFilters = { type: 'todos', gender: 'todos', sort: 'default' };

function setupCustomDropdown(id, filterKey) {
    const dropdown = document.getElementById(id);
    const selectBtn = dropdown.querySelector('.dropdown-select');
    const selectedValueSpan = dropdown.querySelector('.selected-value');
    const options = dropdown.querySelectorAll('.dropdown-list li');

    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.toggle('active');
    });

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedValueSpan.textContent = option.textContent;
            dropdown.classList.remove('active');
            currentFilters[filterKey] = option.getAttribute('data-value');
            applyFilters();
        });
    });
}

setupCustomDropdown('dropdownType', 'type');
setupCustomDropdown('dropdownGender', 'gender');
setupCustomDropdown('dropdownPrice', 'sort');

window.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
});

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredProducts = productList.filter(product => {
        const matchType = currentFilters.type === 'todos' || product.category === currentFilters.type;
        const matchGender = currentFilters.gender === 'todos' || product.gender === currentFilters.gender;
        const matchSearch = product.name.toLowerCase().includes(searchTerm);
        return matchType && matchGender && matchSearch;
    });

    if (currentFilters.sort === 'asc') filteredProducts.sort((a, b) => a.price - b.price);
    else if (currentFilters.sort === 'desc') filteredProducts.sort((a, b) => b.price - a.price);

    renderAdminProducts(filteredProducts);
}

searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('keyup', (e) => { if(e.key === 'Enter') applyFilters(); });

logoHome.addEventListener('click', () => {
    searchInput.value = '';
    currentFilters = { type: 'todos', gender: 'todos', sort: 'default' };
    document.querySelector('#dropdownType .selected-value').textContent = 'Todos';
    document.querySelector('#dropdownGender .selected-value').textContent = 'Todos';
    document.querySelector('#dropdownPrice .selected-value').textContent = 'Padrão';
    applyFilters();
});


// ==========================================
// 4. RENDERIZAÇÃO DOS CARDS NO ADMIN
// ==========================================
function renderAdminProducts(productsToRender) {
    productGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        noResultsMsg.style.display = 'block';
        return;
    } 
    noResultsMsg.style.display = 'none';

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.style.position = 'relative'; 
        
        // Abre o modal ao clicar no card
        card.addEventListener('click', () => openModal(product));

        const stockStatus = product.stock > 0 ? `Estoque: ${product.stock}` : `<span class="out-of-stock">Esgotado</span>`;
        const coverImage = product.images && product.images.length > 0 ? product.images[0] : '';

        // Botão 'X' para remover
        const deleteBtn = `
            <button onclick="event.stopPropagation(); removerPeca('${product.id}')" 
                style="position: absolute; top: 10px; right: 10px; background: #F59BA3; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-weight: bold; z-index: 10; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                X
            </button>
        `;

        // NOVO: Botão de Lápis para Editar (Azul, no canto esquerdo)
        const editBtn = `
            <button onclick="event.stopPropagation(); abrirEdicao('${product.id}')" 
                style="position: absolute; top: 10px; left: 10px; background: var(--color-medium-blue); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; z-index: 10; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-pencil-alt"></i>
            </button>
        `;

        card.innerHTML = `
            ${deleteBtn}
            ${editBtn}
            <div class="product-image-container">
                <img src="${coverImage}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div>
                    <span class="product-category">${product.category} | ${product.gender}</span>
                    <h3 class="product-title">${product.name}</h3>
                </div>
                <div class="product-bottom">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <span class="product-stock">${stockStatus}</span>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// ==========================================
// 5. FUNÇÕES DE ADICIONAR E REMOVER PEÇA (Conectadas ao Firebase)
// ==========================================

// Apagar Produto
// Expondo a função para o escopo global (para o HTML onclick funcionar)
window.removerPeca = function(id) {
    // Busca o produto correspondente para mostrar o nome correto no aviso de confirmação
    const produto = productList.find(p => p.id === id);
    if (!produto) return;

    const confirmacao = confirm(`Tem certeza que deseja excluir permanentemente "${produto.name}"?`);
    if (confirmacao) {
        // Remove diretamente do Firestore usando o ID único do documento
        db.collection("produtos").doc(id).delete()
            .then(() => {
                console.log("Produto removido com sucesso!");
            })
            .catch((error) => {
                console.error("Erro ao deletar do Firestore:", error);
                alert("Erro ao excluir peça do banco de dados.");
            });
    }
};

// Variável global para saber se estamos editando ou criando
let produtoEditandoId = null; 

// Função que puxa os dados e abre o modal preenchido
window.abrirEdicao = function(id) {
    // Acha os dados do produto clicado
    const produto = productList.find(p => p.id === id);
    if (!produto) return;

    // Avisa o sistema qual produto estamos editando
    produtoEditandoId = id; 

    // Preenche os campos de texto nativos
    document.getElementById('addNome').value = produto.name;
    document.getElementById('addPreco').value = produto.price;
    document.getElementById('addEstoque').value = produto.stock;
    document.getElementById('addCategoria').value = produto.category;
    document.getElementById('addGenero').value = produto.gender;
    document.getElementById('addDescricao').value = produto.description;

    // Recria as caixinhas de imagem dependendo de quantas fotos a peça tem
    const imageInputsContainer = document.getElementById('imageInputsContainer');
    imageInputsContainer.innerHTML = ''; // Limpa a caixinha vazia padrão

    produto.images.forEach((imgUrl, index) => {
        const newInput = document.createElement('input');
        newInput.type = 'url';
        newInput.className = 'img-input admin-input';
        newInput.placeholder = index === 0 ? 'Link da Imagem Principal (Obrigatório)' : 'Link da Imagem (Opcional)';
        if (index === 0) newInput.required = true;
        newInput.value = imgUrl; // Cola o link da foto
        imageInputsContainer.appendChild(newInput);
    });

    // Muda o título do modal e o texto do botão para fazer sentido
    document.querySelector('#addProdutoModal h2').innerHTML = '<i class="fas fa-edit"></i> Editar Joia';
    document.querySelector('#addProdutoForm button[type="submit"]').textContent = 'Salvar Alterações';

    // Abre a tela
    document.getElementById('addProdutoModal').style.display = 'flex';
};

// Lógica do Modal de Adicionar
const addProdutoBtn = document.getElementById('addProdutoBtn');
const addProdutoModal = document.getElementById('addProdutoModal');
const closeAddModal = document.getElementById('closeAddModal');
const addProdutoForm = document.getElementById('addProdutoForm');

// Lógica de adicionar mais campos de imagem dinamicamente
const imageInputsContainer = document.getElementById('imageInputsContainer');
const addMoreImagesBtn = document.getElementById('addMoreImagesBtn');

addMoreImagesBtn.addEventListener('click', () => {
    const newInput = document.createElement('input');
    newInput.type = 'url';
    newInput.className = 'img-input admin-input'; 
    newInput.placeholder = 'Link da Imagem (Opcional)';
    imageInputsContainer.appendChild(newInput);
});

// Abrir modal de NOVA peça (Limpa tudo)
addProdutoBtn.addEventListener('click', () => {
    produtoEditandoId = null; // Reseta para o modo "Criação"
    addProdutoForm.reset(); 
    
    // Devolve os textos originais
    document.querySelector('#addProdutoModal h2').innerHTML = '<i class="fas fa-plus-circle"></i> Cadastrar Nova Joia';
    document.querySelector('#addProdutoForm button[type="submit"]').textContent = 'Salvar Produto';
    
    // Reseta as imagens para 1 só
    imageInputsContainer.innerHTML = '<input type="url" class="img-input admin-input" placeholder="Link da Imagem Principal (Obrigatório)" required>';
    
    addProdutoModal.style.display = 'flex';
});

// Fechar modal clicando no X ou fora
closeAddModal.addEventListener('click', () => addProdutoModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === addProdutoModal) addProdutoModal.style.display = 'none'; });

// Salvar (Criar ou Atualizar)
addProdutoForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const nome = document.getElementById('addNome').value;
    const preco = parseFloat(document.getElementById('addPreco').value);
    const estoque = parseInt(document.getElementById('addEstoque').value);
    const categoria = document.getElementById('addCategoria').value;
    const genero = document.getElementById('addGenero').value;
    const descricao = document.getElementById('addDescricao').value;
    
    const inputsImagem = document.querySelectorAll('.img-input');
    const imagens = [];
    inputsImagem.forEach(input => {
        if (input.value.trim() !== '') {
            imagens.push(input.value.trim());
        }
    });

    // Monta o "pacote" de dados da joia
    const dadosProduto = {
        name: nome,
        price: preco,
        stock: estoque,
        category: categoria,
        gender: genero,
        description: descricao,
        images: imagens
    };

    if (produtoEditandoId) {
        // MODO EDIÇÃO: Atualiza o arquivo existente
        db.collection("produtos").doc(produtoEditandoId).update(dadosProduto)
        .then(() => {
            addProdutoModal.style.display = 'none'; 
        }).catch((error) => {
            console.error("Erro ao atualizar:", error);
            alert("Falha ao salvar alterações.");
        });
    } else {
        // MODO CRIAÇÃO: Adiciona a data e cria um novo arquivo
        dadosProduto.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        db.collection("produtos").add(dadosProduto)
        .then(() => {
            addProdutoModal.style.display = 'none'; 
        }).catch((error) => {
            console.error("Erro ao adicionar:", error);
            alert("Falha ao criar nova joia.");
        });
    }
});

// ==========================================
// 6. MODAL E VISUALIZADOR DE IMAGENS
// ==========================================
const modal = document.getElementById('productModal');
const closeModalBtn = document.querySelector('.close-modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const modalStock = document.getElementById('modalStock');
const modalPrice = document.getElementById('modalPrice');
const whatsappBtn = document.getElementById('whatsappBtn');
const addToCartBtn = document.getElementById('addToCartBtn'); 
const prevImgBtn = document.getElementById('prevImgBtn');
const nextImgBtn = document.getElementById('nextImgBtn');
const imageCounter = document.getElementById('imageCounter');

let currentModalImages = [];
let currentImageIndex = 0;

function updateCarouselImage() {
    if (currentModalImages.length > 0) {
        modalImg.src = currentModalImages[currentImageIndex];
        imageCounter.textContent = `${currentImageIndex + 1} / ${currentModalImages.length}`;
        
        if (currentModalImages.length > 1) {
            prevImgBtn.style.display = 'flex';
            nextImgBtn.style.display = 'flex';
        } else {
            prevImgBtn.style.display = 'none';
            nextImgBtn.style.display = 'none';
        }
    }
}

function openModal(product) {
    currentModalImages = product.images;
    currentImageIndex = 0;
    updateCarouselImage();

    modalTitle.textContent = product.name;
    modalCategory.textContent = `${product.category} | ${product.gender}`;
    modalDescription.textContent = product.description;
    modalPrice.textContent = formatCurrency(product.price);
    
    if(product.stock > 0) {
        modalStock.textContent = `Em estoque: ${product.stock} unidades`;
        modalStock.style.color = 'var(--color-medium-blue)';
    } else {
        modalStock.innerHTML = '<span class="out-of-stock">Produto Esgotado</span>';
    }

    // Esconde os botões de compra para o Admin
    whatsappBtn.style.display = 'none';
    addToCartBtn.style.display = 'none';

    modal.style.display = 'flex';
}

nextImgBtn.addEventListener('click', (e) => { e.stopPropagation(); currentImageIndex = (currentImageIndex + 1) % currentModalImages.length; updateCarouselImage(); });
prevImgBtn.addEventListener('click', (e) => { e.stopPropagation(); currentImageIndex = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length; updateCarouselImage(); });
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// ==========================================
// 7. MENU MOBILE
// ==========================================
const mobileFilterBtn = document.getElementById('mobileFilterBtn');
const filtersSection = document.querySelector('.filters-section');

if(mobileFilterBtn) {
    mobileFilterBtn.addEventListener('click', () => {
        filtersSection.classList.toggle('show-filters');
        mobileFilterBtn.classList.toggle('active');
        const icon = mobileFilterBtn.querySelector('i');
        if (filtersSection.classList.contains('show-filters')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// ==========================================
// 8. ZOOM NAS IMAGENS
// ==========================================
const container = document.querySelector('.carousel-container');
const img = document.querySelector('.carousel-container img');
let isZoomed = false;

container.addEventListener('click', (e) => {
    isZoomed = !isZoomed; 
    if (isZoomed) {
        img.classList.add('zoomed');
        moveZoom(e);
    } else { resetZoom(); }
});

function moveZoom(e) {
    if (!isZoomed) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
}

container.addEventListener('mousemove', moveZoom);
container.addEventListener('mouseleave', resetZoom);

function moveZoomTouch(e) {
    if (!isZoomed) return;
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0]; 
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const xPercent = (Math.max(0, Math.min(x, rect.width)) / rect.width) * 100;
    const yPercent = (Math.max(0, Math.min(y, rect.height)) / rect.height) * 100;
    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
}

container.addEventListener('touchmove', moveZoomTouch, { passive: false });

function resetZoom() {
    isZoomed = false;
    img.classList.remove('zoomed');
    img.style.transformOrigin = 'center center';
}