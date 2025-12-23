/*
 * ===================================================================================================
 * BANCO DE DADOS DE PRODUTOS AQUI EMBAIXO, É SO COPIAR ALGUM TEMPLATE E COLOCAR OS DADOS DOS PRODUTOS         
 * ===================================================================================================
 */

const productList = [

    {
        id: 1,
        name: "Anel Solitário Safira",
        price: 1250.90,
        stock: 5,
        images: [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=60", 
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&auto=format&fit=crop&q=60"
        ],
        category: "anel",
        gender: "feminino",
        description: "Anel solitário clássico com uma pedra central de safira azul e acabamento em prata esterlina 925."
    },
    {
        id: 2,
        name: "Colar Delicado Coração",
        price: 180.50,
        stock: 12,
        images: [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60"
        ],
        category: "colar",
        gender: "feminino",
        description: "Colar com pingente de coração minimalista, banhado a ouro rosé."
    },
    {
        id: 3,
        name: "Pulseira Masculina Couro",
        price: 95.00,
        stock: 20,
        images: [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1611591437238-b773328d022b?w=500&auto=format&fit=crop&q=60"
        ],
        category: "pulseira",
        gender: "masculino",
        description: "Pulseira moderna combinando couro trançado preto e detalhes em aço inoxidável."
    },
    {
        id: 4,
        name: "Brincos de Pérola",
        price: 250.00,
        stock: 8,
        images: [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60"
        ],
        category: "brinco",
        gender: "feminino",
        description: "Par de brincos clássicos com pérolas de água doce e fecho de ouro branco."
    }
    // Adiciona os produtos em sequencia de id aq embaixo...
];

/**
 * ==========================================
 * LÓGICA DO SITE (precisa mexer em nd aq nn)
 * ==========================================
 */

const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const noResultsMsg = document.getElementById('no-results');
const logoHome = document.getElementById('logoHome');

// Estado atual dos filtros (para lembrar oq foi selecionado)
let currentFilters = {
    type: 'todos',
    gender: 'todos',
    sort: 'default'
};

// --- CONFIGURAÇÃO DOS DROPDOWNS CUSTOMIZADOS ---
function setupCustomDropdown(id, filterKey) {
    const dropdown = document.getElementById(id);
    const selectBtn = dropdown.querySelector('.dropdown-select');
    const selectedValueSpan = dropdown.querySelector('.selected-value');
    const options = dropdown.querySelectorAll('.dropdown-list li');

    //Abrir/Fechar ao clicar no botão
    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita q o clique feche imediatamente
        // Fecha outros dropdowns q possam estar abertos
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
        });
        dropdown.classList.toggle('active');
    });

    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            // Atualiza o texto visualmente
            selectedValueSpan.textContent = option.textContent;
            dropdown.classList.remove('active'); // Fecha a lista

            // Atualiza a lógica do filtro
            currentFilters[filterKey] = option.getAttribute('data-value');
            applyFilters(); // Aplica os filtros novamente
        });
    });
}

// Inicializa os 3 filtros customizados
setupCustomDropdown('dropdownType', 'type');
setupCustomDropdown('dropdownGender', 'gender');
setupCustomDropdown('dropdownPrice', 'sort');

// Fecha qualquer dropdown se clicar fora deles na página
window.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown').forEach(d => {
        d.classList.remove('active');
    });
});


// ---FUNÇÕES GERAIS---
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ---RENDERIZAÇÃO NA GRADE---
function renderProducts(productsToRender) {
    productGrid.innerHTML = '';
    
    if (productsToRender.length === 0) {
        noResultsMsg.style.display = 'block';
        return;
    } 
    noResultsMsg.style.display = 'none';

    productsToRender.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.addEventListener('click', () => openModal(product));

        const stockStatus = product.stock > 0 
            ? `Estoque: ${product.stock}` 
            : `<span class="out-of-stock">Esgotado</span>`;

        const coverImage = product.images && product.images.length > 0 ? product.images[0] : '';

        card.innerHTML = `
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

// APLICAR FILTROS
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredProducts = productList.filter(product => {
        // Usa os valores guardados em currentFilters
        const matchType = currentFilters.type === 'todos' || product.category === currentFilters.type;
        const matchGender = currentFilters.gender === 'todos' || product.gender === currentFilters.gender;
        const matchSearch = product.name.toLowerCase().includes(searchTerm);
        
        return matchType && matchGender && matchSearch;
    });

    // Ordenação
    if (currentFilters.sort === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentFilters.sort === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    renderProducts(filteredProducts);
}

// --- LOGO: RESETAR TUDO ---
logoHome.addEventListener('click', resetHome);

function resetHome() {
    searchInput.value = '';
    
    // Reseta as variáveis de filtro para o padrão
    currentFilters = { type: 'todos', gender: 'todos', sort: 'default' };
    
    // Reseta o texto visual dos dropdowns
    document.querySelector('#dropdownType .selected-value').textContent = 'Todos';
    document.querySelector('#dropdownGender .selected-value').textContent = 'Todos';
    document.querySelector('#dropdownPrice .selected-value').textContent = 'Padrão';

    renderProducts(productList);
}

// --- MODAL E CARROSSEL ---
const modal = document.getElementById('productModal');
const closeModalBtn = document.querySelector('.close-modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const modalStock = document.getElementById('modalStock');
const modalPrice = document.getElementById('modalPrice');
const whatsappBtn = document.getElementById('whatsappBtn');
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
        modalStock.textContent = `Disponível em estoque: ${product.stock} unidades`;
        modalStock.style.color = 'var(--color-medium-blue)';
        whatsappBtn.style.display = 'inline-flex';
        const phoneNumber = '558195228077'; 
        const message = `Olá! Tenho interesse em: ${product.name}`;
        whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    } else {
        modalStock.innerHTML = '<span class="out-of-stock">Produto Esgotado</span>';
        whatsappBtn.style.display = 'none';
    }
    modal.style.display = 'flex';
}

nextImgBtn.addEventListener('click', (e) => { e.stopPropagation(); currentImageIndex = (currentImageIndex + 1) % currentModalImages.length; updateCarouselImage(); });
prevImgBtn.addEventListener('click', (e) => { e.stopPropagation(); currentImageIndex = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length; updateCarouselImage(); });

closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('keyup', (e) => { if(e.key === 'Enter') applyFilters(); });

// Início
renderProducts(productList);
