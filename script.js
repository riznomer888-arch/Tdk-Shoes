// Используем строгий режим для избежания скрытых ошибок в коде
"use strict";

// БАЗА ДАННЫХ ТОВАРОВ
const PRODUCTS_DATA = [
    {
        id: 1,
        name: "Кроссовки Minimal White S1",
        category: "shoes",
        price: "8,900 ₽",
        sizes: { "41": 2, "42": 5, "43": 1 }
    },
    {
        id: 2,
        name: "Белая оверсайз футболка Cotton",
        category: "clothes",
        price: "3,200 ₽",
        sizes: { "S": 3, "M": 4, "L": 0 }
    },
    {
        id: 3,
        name: "Джинсы Прямого Кроя Light Blue",
        category: "jeans",
        price: "6,500 ₽",
        sizes: { "30": 0, "32": 0, "34": 0 }
    },
    {
        id: 4,
        name: "Кожаные кеды Classic Low",
        category: "shoes",
        price: "11,200 ₽",
        sizes: { "40": 1, "41": 0, "42": 0 }
    },
    {
        id: 5,
        name: "Хлопковый лонгслив Off-White",
        category: "clothes",
        price: "4,000 ₽",
        sizes: { "M": 2, "L": 1 }
    },
    {
        id: 6,
        name: "Джинсы Черные Slim Fit",
        category: "jeans",
        price: "5,900 ₽",
        sizes: { "31": 1, "32": 2, "33": 0 }
    },
    {
        id: 7,
        name: "Летние сандалии Air Sandal",
        category: "shoes",
        price: "7,400 ₽",
        sizes: { "39": 0, "40": 0 }
    }
];

// Изолированное состояние приложения (App State)
const appState = {
    currentCategory: 'all',
    searchQuery: ''
};

// Функция безопасного отображения текста (защита от XSS-атак в поиске или названиях)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Оптимальная проверка наличия товара на складе через .some()
function checkInStock(product) {
    // Если хотя бы у одного размера количество больше нуля, товар в наличии
    return Object.values(product.sizes).some(quantity => quantity > 0);
}

// Эффективная генерация HTML-строки для карточки товара
function createProductCardHTML(product) {
    const inStock = checkInStock(product);
    const statusClass = inStock ? 'status-in-stock' : 'status-out-stock';
    const statusText = inStock ? 'В наличии' : 'Нет в наличии';
    const cardClass = inStock ? 'product-card' : 'product-card out-of-stock';

    return `
        <div class="${cardClass}" data-id="${product.id}">
            <div class="product-image-wrapper">
                <div class="product-placeholder-img"></div>
            </div>
            <div class="product-info">
                <span class="product-name">${escapeHTML(product.name)}</span>
                <span class="product-price">${escapeHTML(product.price)}</span>
                <span class="availability-badge ${statusClass}">${statusText}</span>
            </div>
        </div>
    `;
}

// Главная функция рендеринга интерфейса
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    // 1. Фильтрация по категории через метод массивов
    let filteredProducts = PRODUCTS_DATA;
    if (appState.currentCategory !== 'all') {
        filteredProducts = PRODUCTS_DATA.filter(p => p.category === appState.currentCategory);
    }

    // 2. Фильтрация по поисковому запросу
    const cleanSearch = appState.searchQuery.trim().toLowerCase();
    if (cleanSearch !== '') {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(cleanSearch));
    }

    // Если товары не найдены, выводим сообщение один раз
    if (filteredProducts.length === 0) {
        container.innerHTML = `<div class="no-results">По вашему запросу ничего не найдено.</div>`;
        return;
    }

    // Оптимизация: собираем всю разметку в одну большую строку в памяти перед вставкой в DOM
    const gridHTML = filteredProducts.map(product => createProductCardHTML(product)).join('');
    container.innerHTML = gridHTML;
}

// Функция смены категорий
function changeCategory(category) {
    appState.currentCategory = category;
    appState.searchQuery = ''; // Сброс поиска
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // Обновляем визуальное выделение активной вкладки
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${category}`);
    if (activeNav) activeNav.classList.add('active');

    // Логика обновления заголовка
    const titles = { 'all': 'Все товары', 'shoes': 'Обувь', 'clothes': 'Одежда', 'jeans': 'Джинсы' };
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titles[category] || 'Товары';

    renderProducts();
}

// Оптимизатор функций (Debounce) — предотвращает лаги при очень быстром вводе букв в поиск
function debounce(func, delay = 200) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Обработчик ввода в поисковую строку с встроенным дебаунсом
const handleSearch = debounce(() => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        appState.searchQuery = searchInput.value;
        renderProducts();
    }
});

// Инициализация приложения после полной загрузки документа DOM
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    
    // Привязываем обработчики событий динамически (убираем inline onClick из разметки для чистоты HTML)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
});
