"use strict";

// БАЗА ДАННЫХ ТОВАРОВ (Цены в тенге + размеры)
const PRODUCTS_DATA = [
    { id: 1, name: "Кроссовки Street Air S1 Black", category: "shoes", price: "45,000 ₸", sizes: { "41": 2, "42": 5, "43": 1 } },
    { id: 2, name: "Оверсайз худи TDK Cargo", category: "clothes", price: "18,500 ₸", sizes: { "S": 3, "M": 4, "L": 0 } },
    { id: 3, name: "Джинсы Прямого Кроя Light Denim", category: "jeans", price: "24,000 ₸", sizes: { "30": 0, "32": 0, "34": 0 } },
    { id: 4, name: "Кеды Classic Custom Orange", category: "shoes", price: "38,000 ₸", sizes: { "40": 1, "41": 4, "42": 0 } },
    { id: 5, name: "Футболка Basic Heavyweight White", category: "clothes", price: "9,900 ₸", sizes: { "M": 6, "L": 3 } },
    { id: 6, name: "Джинсы Черные Graphite Slim", category: "jeans", price: "26,500 ₸", sizes: { "31": 1, "32": 2, "33": 0 } }
];

// Единый источник правды (Состояние сайта)
const state = {
    currentCategory: 'all',
    searchQuery: '',
    selectedSize: null,
    currentProduct: null
};

// Хелпер для безопасного вывода текста (Защита от XSS-атак)
const escapeHTML = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
};

// Проверка: остался ли товар хотя бы в одном размере
const isProductInStock = (product) => {
    return product && product.sizes ? Object.values(product.sizes).some(qty => qty > 0) : false;
};

// Генерация HTML-шаблона карточки
const createProductCardHTML = (product) => {
    if (!product) return '';
    const inStock = isProductInStock(product);
    
    return `
        <div class="product-card ${inStock ? '' : 'out-of-stock'}" onclick="openOrderModal(${Number(product.id)})">
            <div class="product-image-wrapper">
                <div class="product-logo-bg"></div>
            </div>
            <div class="product-info">
                <span class="product-name">${escapeHTML(product.name)}</span>
                <div class="product-meta">
                    <span class="product-price">${escapeHTML(product.price)}</span>
                    <span class="availability-badge ${inStock ? 'status-in-stock' : 'status-out-stock'}">
                        ${inStock ? 'В наличии' : 'Ожидается'}
                    </span>
                </div>
            </div>
        </div>
    `;
};

// Отображение каталога
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    let filtered = [...PRODUCTS_DATA];

    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === state.currentCategory);
    }

    const query = state.searchQuery.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    container.innerHTML = filtered.length 
        ? filtered.map(createProductCardHTML).join('') 
        : `<div class="no-results">По вашему запросу ничего не найдено.</div>`;
}

// Переключение вкладок меню
function changeCategory(category) {
    if (state.currentCategory === category && !state.searchQuery) return;

    state.currentCategory = category;
    state.searchQuery = '';
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.getElementById(`nav-${category}`)?.classList.add('active');

    const titles = { 'all': 'Все товары', 'shoes': 'Обувь', 'clothes': 'Одежда', 'jeans': 'Джинсы' };
    const titlePage = document.getElementById('page-title');
    if (titlePage) titlePage.textContent = titles[category] || 'Товары';

    renderProducts();
}

// Задержка поиска против фризов (Debounce)
function debounce(func, timeout = 150) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), timeout);
    };
}

// Открытие окна заказа
function openOrderModal(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;
    
    if (!isProductInStock(product)) {
        alert("Этого товара сейчас нет в наличии!");
        return;
    }

    state.currentProduct = product;
    state.selectedSize = null;

    const modalName = document.getElementById('modal-product-name');
    const modalPrice = document.getElementById('modal-product-price');
    const sizesContainer = document.getElementById('modal-sizes-container');
    const modalOverlay = document.getElementById('order-modal');

    if (modalName) modalName.textContent = product.name;
    if (modalPrice) modalPrice.textContent = product.price;
    if (!sizesContainer || !modalOverlay) return;

    sizesContainer.innerHTML = '';

    Object.entries(product.sizes).forEach(([size, quantity]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'size-btn';
        btn.textContent = size;

        if (quantity <= 0) {
            btn.classList.add('disabled');
            btn.disabled = true;
        } else {
            btn.onclick = () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                state.selectedSize = size;
                
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'none', 80);
            };
        }
        sizesContainer.appendChild(btn);
    });

    modalOverlay.classList.add('active');
}

// Сброс и закрытие модального окна
function closeOrderModal() {
    const modalOverlay = document.getElementById('order-modal');
    const orderForm = document.getElementById('order-form');
    
    if (modalOverlay) modalOverlay.classList.remove('active');
    if (orderForm) orderForm.reset();
    
    state.selectedSize = null;
    state.currentProduct = null;
}

// Запуск после загрузки DOM страницы
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            state.searchQuery = e.target.value;
            renderProducts();
        }));
    }

    // ОТПРАВКА В TELEGRAM
    document.getElementById('order-form')?.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!state.selectedSize) {
            alert("Пожалуйста, выберите ваш размер перед подтверждением заказа!");
            return;
        }

        if (!state.currentProduct) {
            alert("Произошла системная ошибка. Попробуйте открыть окно товара заново.");
            closeOrderModal();
            return;
        }

        const clientName = document.getElementById('client-name')?.value.trim();
        const clientContact = document.getElementById('client-contact')?.value.trim();
        const clientAddress = document.getElementById('client-address')?.value.trim();

        if (!clientName || !clientContact || !clientAddress) {
            alert("Заполните все текстовые поля корректно!");
            return;
        }

        // ТВОИ КЛЮЧИ ТЕЛЕГРАМ АВТОМАТИЧЕСКИ ИНТЕГРИРОВАНЫ СЮДА:
        const botToken = "8918446220:AAHVN891CgnGYXmJcqZCmKF_QKteN0LCTK8";
        const chatId = "320554605"; 

        // Оформление текста сообщения для бота
        const message = `
🛍️ <b>НОВЫЙ ЗАКАЗ [TDK_SHOES]</b>

👟 <b>Товар:</b> ${state.currentProduct.name}
📏 <b>Размер:</b> ${state.selectedSize}
💰 <b>Цена:</b> ${state.currentProduct.price}

👤 <b>Покупатель:</b> ${clientName}
📞 <b>Контакты:</b> ${clientContact}
📍 <b>Адрес:</b> ${clientAddress}
        `.trim();

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        // Отправка данных на сервера Telegram
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
                alert(`Успешно оформлено! ✅\n\nВаш заказ мгновенно отправлен администрации TDK_SHOES.\nМы свяжемся с вами по контакту: ${clientContact}`);
            } else {
                alert("Ошибка отправки заказа боту. Пожалуйста, напишите нам в личные сообщения напрямую.");
            }
            closeOrderModal();
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Ошибка сети. Пожалуйста, проверьте подключение к интернету.");
        });
    });
});
