"use strict";

/**
 * БАЗА ДАННЫХ ТОВАРОВ (Премиум-сегмент в тенге)
 * Интегрировано под дизайн Vitkac: добавлены стильные кроссовки и живые фото
 */
const PRODUCTS_DATA = [
    {
        id: 1,
        brand: "BALENCIAGA",
        name: "Jasnoniebieskie jeansy z szerokimi nogawkami",
        sku: "871354 TDW14-4200",
        category: "jeans",
        price: 601900, 
        installment: 25540, 
        images: [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?w=600&auto=format&fit=crop&q=80"
        ],
        sizes: { "29": 1, "30": 3, "31": 0 },
        badge: "OSTATNIA SZTUKA" 
    },
    {
        id: 2,
        brand: "BALENCIAGA",
        name: "Czarna skórzana torba na ramię Rodeo",
        sku: "783214 TZO01-1000",
        category: "bags",
        price: 1420000,
        installment: 60310,
        images: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80"
        ],
        sizes: { "UNI": 2 },
        badge: null
    },
    {
        id: 3,
        brand: "BALENCIAGA",
        name: "Różowa zamszowa torebka Hourglass",
        sku: "619665 L3710-5506",
        category: "bags",
        price: 1115000,
        installment: 47380,
        images: [
            "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80"
        ],
        sizes: { "UNI": 0 }, 
        badge: "WYPRZEDANE" 
    },
    {
        id: 4,
        brand: "BALENCIAGA",
        name: "Кроссовки Balenciaga Cargo Sneaker Black",
        sku: "739346 W2DB1-1000",
        category: "shoes",
        price: 580000,
        installment: 24650,
        images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80"
        ],
        sizes: { "41": 2, "42": 4, "43": 1, "44": 0 },
        badge: "NEW ARRIVAL"
    },
    {
        id: 5,
        brand: "BALENCIAGA",
        name: "Массивные кроссовки Triple S Clear Sole",
        sku: "541624 W2FB1-9000",
        category: "shoes",
        price: 495000,
        installment: 21000,
        images: [
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&auto=format&fit=crop&q=80"
        ],
        sizes: { "39": 1, "40": 0, "41": 2, "42": 1 },
        badge: null
    }
];

// Состояние интерфейса (Single Source of Truth)
const state = {
    currentCategory: 'all',
    searchQuery: '',
    selectedSize: null,
    currentProduct: null,
    currentImageIndex: 0
};

// Красивое форматирование цен (например: 601900 превращает в "601 900 ₸")
const formatCurrency = (num) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 })
        .replace('₸', '₸')
        .trim();
};

// Защита от XSS-инъекций
const escapeHTML = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
};

// Проверка наличия
const isProductInStock = (product) => {
    return product && product.sizes ? Object.values(product.sizes).some(qty => qty > 0) : false;
};

/**
 * ГЕНЕРАЦИЯ HTML КАРТОЧКИ ТОВАРА
 */
const createProductCardHTML = (product) => {
    if (!product) return '';
    const inStock = isProductInStock(product);
    const mainImage = product.images[0] || 'placeholder.jpg';
    
    const totalQty = Object.values(product.sizes).reduce((a, b) => a + b, 0);
    const isLastItem = inStock && totalQty === 1;

    return `
        <div class="product-card ${inStock ? '' : 'out-of-stock'}" onclick="openProductModal(${Number(product.id)})">
            <div class="product-image-container">
                <img src="${escapeHTML(mainImage)}" alt="${escapeHTML(product.name)}" class="product-main-img" loading="lazy">
                <button class="wishlist-btn" onclick="toggleWishlist(event, ${product.id})">
                    <svg viewBox="0 0 24 24" class="heart-icon"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
                ${isLastItem ? `<span class="card-badge last-piece">ОСТАЛСЯ ПОСЛЕДНИЙ</span>` : ''}
                ${!inStock ? `<span class="card-badge sold-out">ОЖИДАЕТСЯ</span>` : ''}
            </div>
            <div class="product-details">
                <h3 class="brand-title">${escapeHTML(product.brand)}</h3>
                <p class="product-short-name">${escapeHTML(product.name)}</p>
                <div class="price-box">
                    <span class="price-main">${formatCurrency(product.price)}</span>
                    ${product.installment ? `<span class="price-installment">рассрочка от ${formatCurrency(product.installment)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
};

// Рендер каталога
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    let filtered = [...PRODUCTS_DATA];

    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === state.currentCategory);
    }

    const query = state.searchQuery.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.brand.toLowerCase().includes(query)
        );
    }

    container.innerHTML = filtered.length 
        ? filtered.map(createProductCardHTML).join('') 
        : `<div class="no-results-message">По вашему запросу ничего не найдено.</div>`;
}

// Переключение категорий
function changeCategory(category) {
    if (state.currentCategory === category && !state.searchQuery) return;

    state.currentCategory = category;
    state.searchQuery = '';
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
    document.getElementById(`nav-${category}`)?.classList.add('active');

    renderProducts();
}

// Задержка поиска (Debounce)
function debounce(func, timeout = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), timeout);
    };
}

/**
 * ОТКРЫТИЕ МОДАЛЬНОГО ОКНА (Правая боковая панель)
 */
function openProductModal(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    state.currentProduct = product;
    state.selectedSize = null;
    state.currentImageIndex = 0;

    const modal = document.getElementById('product-detail-modal');
    if (!modal) return;

    modal.querySelector('.modal-brand').textContent = product.brand;
    modal.querySelector('.modal-product-name').textContent = product.name;
    modal.querySelector('.modal-price').textContent = formatCurrency(product.price);
    modal.querySelector('.modal-sku').textContent = `СИМВОЛ: ${product.sku}`;
    
    const installmentElem = modal.querySelector('.modal-installment');
    if (installmentElem) {
        installmentElem.textContent = product.installment ? `РАССРОЧКА ОТ ${formatCurrency(product.installment)}` : '';
    }

    const badgeElem = modal.querySelector('.modal-status-badge');
    if (badgeElem) {
        badgeElem.textContent = product.badge || '';
        badgeElem.style.display = product.badge ? 'block' : 'none';
    }

    updateModalImages();

    // Селектор размеров
    const sizesContainer = modal.querySelector('.modal-sizes-selector');
    if (sizesContainer) {
        sizesContainer.innerHTML = '';
        
        Object.entries(product.sizes).forEach(([size, quantity]) => {
            const sizeOption = document.createElement('div');
            sizeOption.className = `size-option-item ${quantity <= 0 ? 'disabled' : ''}`;
            sizeOption.textContent = size;
            
            if (quantity > 0) {
                sizeOption.onclick = () => {
                    modal.querySelectorAll('.size-option-item').forEach(el => el.classList.remove('selected'));
                    sizeOption.classList.add('selected');
                    state.selectedSize = size;
                };
            }
            sizesContainer.appendChild(sizeOption);
        });
    }

    modal.classList.add('open');
    document.body.classList.add('modal-blur');
}

function updateModalImages() {
    const product = state.currentProduct;
    const mainImgNode = document.getElementById('modal-main-preview');
    const thumbsContainer = document.getElementById('modal-thumbnails');

    if (!product || !mainImgNode || !thumbsContainer) return;

    mainImgNode.src = product.images[state.currentImageIndex];

    thumbsContainer.innerHTML = product.images.map((img, idx) => `
        <div class="thumb-wrapper ${idx === state.currentImageIndex ? 'active' : ''}" onclick="setModalImage(${idx})">
            <img src="${img}" alt="thumbnail">
        </div>
    `).join('');
}

function setModalImage(index) {
    state.currentImageIndex = index;
    updateModalImages();
}

function closeProductModal() {
    const modal = document.getElementById('product-detail-modal');
    if (modal) modal.classList.remove('open');
    document.body.classList.remove('modal-blur');
    
    state.selectedSize = null;
    state.currentProduct = null;
}

function toggleWishlist(event, id) {
    event.stopPropagation();
    const btn = event.currentTarget;
    btn.classList.toggle('in-wishlist');
}

/**
 * ОТПРАВКА ДАННЫХ В TELEGRAM-БОТ
 */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            state.searchQuery = e.target.value;
            renderProducts();
        }));
    }

    document.getElementById('telegram-checkout-form')?.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!state.currentProduct) return;

        if (!state.selectedSize) {
            alert("Пожалуйста, выберите размер перед оформлением заказа!");
            return;
        }

        const clientName = document.getElementById('order-name')?.value.trim();
        const clientContact = document.getElementById('order-phone')?.value.trim();
        const clientAddress = document.getElementById('order-address')?.value.trim();

        const botToken = "8918446220:AAHVN891CgnGYXmJcqZCmKF_QKteN0LCTK8";
        const chatId = "320554605"; 

        const message = `
🏛️ <b>NEW ORDER [TDK_SHOES]</b>
────────────────────────
🔥 <b>Бренд:</b> ${state.currentProduct.brand}
📦 <b>Товар:</b> ${state.currentProduct.name}
🔢 <b>Артикул:</b> ${state.currentProduct.sku}
📏 <b>Размер:</b> ${state.selectedSize}
────────────────────────
💰 <b>Цена:</b> ${formatCurrency(state.currentProduct.price)}
────────────────────────
👤 <b>Клиент:</b> ${clientName}
📞 <b>Телефон:</b> ${clientContact}
📍 <b>Адрес доставки:</b> ${clientAddress}
        `.trim();

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Успешно! Ваш заказ передан байеру. ✅\nМы свяжемся с вами в ближайшее время.");
                closeProductModal();
                document.getElementById('telegram-checkout-form').reset();
            } else {
                alert("Произошла ошибка при отправке. Попробуйте еще раз.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Ошибка сети. Проверьте интернет-соединение.");
        });
    });
});
