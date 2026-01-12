/*
 * ===================================================================================================
 * BANCO DE DADOS DE PRODUTOS
 * ===================================================================================================
 */

const productList = [
    {
        id: 1,
        name: "Anel Solitário Safira",
        price: 1250.90,
        stock: 17,
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
        stock: 17,
        images: [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=60"
        ],
        category: "colar",
        gender: "feminino",
        description: "Colar com pingente de coração minimalista, banhado a ouro rosé."
    },
    {
        id: 3,
        name: "Anel de ouro cravejado",
        price: 95.00,
        stock: 22,
        images: [
            "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=60",
            "https://images.unsplash.com/photo-1611591437238-b773328d022b?w=500&auto=format&fit=crop&q=60"
        ],
        category: "anel",
        gender: "masculino",
        description: "Um lindo anel dourado de ouro muito bonito e cravejado com pedras brilhantes."
    },
    {
        id: 4,
        name: "Brincos de Pérola",
        price: 250.00,
        stock: 22,
        images: [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=60"
        ],
        category: "brinco",
        gender: "feminino",
        description: "Par de brincos clássicos com pérolas de água doce e fecho de ouro branco."
    }
    // Adicione mais produtos aqui...
];

/**
 * ==========================================
 * LÓGICA DO SITE
 * ==========================================
 */

// Elementos Gerais
const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const noResultsMsg = document.getElementById('no-results');
const logoHome = document.getElementById('logoHome');

// Estado atual dos filtros
let currentFilters = {
    type: 'todos',
    gender: 'todos',
    sort: 'default'
};

// --- FILTROS CUSTOMIZADOS (DROPDOWNS) ---
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
    document.querySelectorAll('.custom-dropdown').forEach(d => {
        d.classList.remove('active');
    });
});

// --- FUNÇÕES UTILITÁRIAS ---
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// --- RENDERIZAÇÃO ---
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

// --- FILTROS ---
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredProducts = productList.filter(product => {
        const matchType = currentFilters.type === 'todos' || product.category === currentFilters.type;
        const matchGender = currentFilters.gender === 'todos' || product.gender === currentFilters.gender;
        const matchSearch = product.name.toLowerCase().includes(searchTerm);
        
        return matchType && matchGender && matchSearch;
    });

    if (currentFilters.sort === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentFilters.sort === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    renderProducts(filteredProducts);
}

// --- LOGO RESET ---
logoHome.addEventListener('click', resetHome);

function resetHome() {
    searchInput.value = '';
    currentFilters = { type: 'todos', gender: 'todos', sort: 'default' };
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
const addToCartBtn = document.getElementById('addToCartBtn'); // Botão do carrinho
const prevImgBtn = document.getElementById('prevImgBtn');
const nextImgBtn = document.getElementById('nextImgBtn');
const imageCounter = document.getElementById('imageCounter');

let currentModalImages = [];
let currentImageIndex = 0;
let currentProductInModal = null; // Variável para saber qual produto está aberto

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

// --- FUNÇÃO ÚNICA PARA ABRIR MODAL ---
function openModal(product) {
    currentProductInModal = product; // Salva o produto atual para usar no carrinho
    
    currentModalImages = product.images;
    currentImageIndex = 0;
    updateCarouselImage();

    modalTitle.textContent = product.name;
    modalCategory.textContent = `${product.category} | ${product.gender}`;
    modalDescription.textContent = product.description;
    modalPrice.textContent = formatCurrency(product.price);

    // Lógica de estoque: Mostra/Esconde botões
    if(product.stock > 0) {
        modalStock.textContent = `Disponível em estoque: ${product.stock} unidades`;
        modalStock.style.color = 'var(--color-medium-blue)';
        
        whatsappBtn.style.display = 'inline-flex';
        addToCartBtn.style.display = 'inline-flex'; 
        
        const phoneNumber = '558195228077'; 
        const message = `Olá! Tenho interesse em: \n\n${product.name}\n\nvalor: ${formatCurrency(product.price)}.`;
        whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    } else {
        modalStock.innerHTML = '<span class="out-of-stock">Produto Esgotado</span>';
        whatsappBtn.style.display = 'none';
        addToCartBtn.style.display = 'none';
    }
    modal.style.display = 'flex';
}

// Listeners do Modal
nextImgBtn.addEventListener('click', (e) => { e.stopPropagation(); currentImageIndex = (currentImageIndex + 1) % currentModalImages.length; updateCarouselImage(); });
prevImgBtn.addEventListener('click', (e) => { e.stopPropagation(); currentImageIndex = (currentImageIndex - 1 + currentModalImages.length) % currentModalImages.length; updateCarouselImage(); });
closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

// Listeners de Pesquisa
searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('keyup', (e) => { if(e.key === 'Enter') applyFilters(); });


/* * ==========================================
 * MENU MOBILE
 * ==========================================
 */
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

/*
 * ==========================================
 * CARRINHO DE COMPRAS
 * ==========================================
 */

let cart = []; // Lista de produtos

// Elementos do Carrinho
const floatingCartBtn = document.getElementById('floatingCartBtn');
const cartModal = document.getElementById('cartModal');
const closeCartModalBtn = document.getElementById('closeCartModal');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCountSpan = document.getElementById('cartCount');
const cartTotalValue = document.getElementById('cartTotalValue');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

// Adicionar ao Carrinho
addToCartBtn.addEventListener('click', () => {
    if (currentProductInModal) {
        cart.push(currentProductInModal);
        updateCartUI();
        modal.style.display = 'none'; // Fecha o modal do produto e volta pra loja
    }
});

// Atualizar Interface do Carrinho
function updateCartUI() {
    cartCountSpan.textContent = cart.length;
    cartItemsContainer.innerHTML = '';
    
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Seu carrinho está vazio.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price;
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            const thumb = item.images && item.images.length > 0 ? item.images[0] : '';

            itemDiv.innerHTML = `
                <img src="${thumb}" alt="${item.name}">
                <div class="cart-item-details">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-price">${formatCurrency(item.price)}</span>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }
    cartTotalValue.textContent = formatCurrency(total);
}

// Remover Item
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Abrir/Fechar Carrinho
floatingCartBtn.addEventListener('click', () => {
    updateCartUI();
    cartModal.style.display = 'flex';
});

closeCartModalBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCartUI();
});

window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
});

// Finalizar Compra (WhatsApp)
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    const phoneNumber = '558195228077'; 
    let message = "Olá, tenho interesse nesses produtos:\n\n";
    let total = 0;

    cart.forEach(item => {
        message += `• ${item.name} ; ${formatCurrency(item.price)}\n`;
        total += item.price;
    });

    message += `\nTotal: ${formatCurrency(total)}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
});

// Inicialização
renderProducts(productList);