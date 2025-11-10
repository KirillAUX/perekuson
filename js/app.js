// Основной класс веб-приложения
class PerekusonApp {
    constructor() {
        this.products = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.registerServiceWorker();
            this.setupEventListeners();
            await this.loadProducts();
            this.updateCartCount();
            this.checkConnection();
            this.setupInstallPrompt();
            
            // Загружаем данные при запуске
            await this.loadInitialData();
            
            this.isInitialized = true;
            console.log('PerekusonApp инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
        }
    }

    // Регистрация Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('Service Worker зарегистрирован:', registration);
                
                // Проверяем обновления Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Обнаружено обновление Service Worker');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Новая версия доступна!');
                            this.showUpdateMessage();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('Ошибка регистрации Service Worker:', error);
                throw error;
            }
        } else {
            console.log('Service Worker не поддерживается');
        }
    }

    // Проверка соединения
    checkConnection() {
        const offlineAlert = document.getElementById('offlineAlert');
        if (!offlineAlert) return;
        
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                offlineAlert.style.display = 'none';
                this.showMessage('Соединение восстановлено', 'success');
                // Перезагружаем данные при восстановлении соединения
                this.loadInitialData().catch(console.error);
            } else {
                offlineAlert.style.display = 'block';
                this.showMessage('Вы в оффлайн-режиме', 'warning');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Инициализируем статус при загрузке
        updateOnlineStatus();
    }

    // Установка PWA
    setupInstallPrompt() {
        let deferredPrompt;
        const installPrompt = document.getElementById('installPrompt');
        const installButton = document.getElementById('installButton');
        const dismissButton = document.getElementById('dismissInstall');

        if (!installPrompt || !installButton || !dismissButton) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Показываем промпт через 5 секунд после загрузки
            setTimeout(() => {
                if (!this.isAppInstalled() && installPrompt) {
                    installPrompt.style.display = 'block';
                }
            }, 5000);
        });

        installButton.addEventListener('click', async () => {
            if (deferredPrompt && installPrompt) {
                try {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`Пользователь ${outcome} установку приложения`);
                    
                    if (outcome === 'accepted') {
                        installPrompt.style.display = 'none';
                        this.showMessage('Приложение успешно установлено!', 'success');
                    }
                    deferredPrompt = null;
                } catch (error) {
                    console.error('Ошибка установки приложения:', error);
                    this.showMessage('Ошибка установки приложения', 'error');
                }
            }
        });

        dismissButton.addEventListener('click', () => {
            if (installPrompt) {
                installPrompt.style.display = 'none';
                // Сохраняем в localStorage, чтобы не показывать снова
                localStorage.setItem('installPromptDismissed', 'true');
            }
        });

        // Не показываем промпт, если пользователь уже отклонял его
        if (localStorage.getItem('installPromptDismissed') === 'true') {
            installPrompt.style.display = 'none';
        }
    }

    // Проверка установлено ли приложение
    isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    // Загрузка продуктов
    async loadProducts() {
        try {
            // В реальном приложении здесь был бы запрос к API
            this.products = [
                {
                    id: 1,
                    name: 'Классический бургер',
                    price: 299,
                    category: 'burgers',
                    image: 'https://gostinyj-dom.qr-cafe.ru/imagebase/a8ccf477bb26cb451f5ea096d58ac0a4.jpeg',
                    description: 'Сочная говяжья котлета с овощами',
                    available: true,
                    ingredients: ['Говяжья котлета', 'Сыр', 'Овощи', 'Соус']
                },
                {
                    id: 2,
                    name: 'Картофель фри',
                    price: 149,
                    category: 'snacks',
                    image: 'https://avatars.mds.yandex.net/get-altay/14350490/2a000001973a1372fa2b3607c0dc77658a7e/XXL_height',
                    description: 'Хрустящий картофель с солью',
                    available: true,
                    ingredients: ['Картофель', 'Соль', 'Масло']
                },
                {
                    id: 3,
                    name: 'Кола',
                    price: 99,
                    category: 'drinks',
                    image: 'https://dogruhabercomtr.teimg.com/dogruhaber-com-tr/uploads/2025/06/5307ef3722439157397a56d79da.jpg',
                    description: 'Освежающий напиток',
                    available: true,
                    ingredients: ['Газированная вода', 'Сахар', 'Ароматизаторы']
                },
                {
                    id: 4,
                    name: 'Чизбургер',
                    price: 259,
                    category: 'burgers',
                    image: 'https://avatars.mds.yandex.net/i?id=df94cef8f7ec4c2e2e4935ed91f17fd9_l-4302779-images-thumbs&n=13',
                    description: 'Бургер с двойным сыром',
                    available: true,
                    ingredients: ['Говяжья котлета', 'Сыр чеддер', 'Овощи', 'Соус']
                },
                {
                    id: 5,
                    name: 'Куриные наггетсы',
                    price: 189,
                    category: 'snacks',
                    image: 'https://scdn.chibbis.ru/live/products/675cbb0fc80ae58007846f4a8e723517.jpeg',
                    description: 'Хрустящие куриные наггетсы',
                    available: true,
                    ingredients: ['Куриное филе', 'Панировка', 'Специи']
                }
            ];
            
            this.displayCategories();
            return this.products;
        } catch (error) {
            console.error('Ошибка загрузки продуктов:', error);
            this.showMessage('Ошибка загрузки меню', 'error');
            return [];
        }
    }

    // Отображение категорий
    displayCategories() {
        const categoriesSection = document.getElementById('categoriesSection');
        if (!categoriesSection) return;

        const categories = {
            burgers: { 
                name: '🍔 Бургеры', 
                products: this.products.filter(p => p.category === 'burgers'),
                icon: '🍔'
            },
            snacks: { 
                name: '🍟 Закуски', 
                products: this.products.filter(p => p.category === 'snacks'),
                icon: '🍟'
            },
            drinks: { 
                name: '🥤 Напитки', 
                products: this.products.filter(p => p.category === 'drinks'),
                icon: '🥤'
            },
            desserts: { 
                name: '🍰 Десерты', 
                products: this.products.filter(p => p.category === 'desserts'),
                icon: '🍰'
            }
        };

        categoriesSection.innerHTML = Object.entries(categories)
            .filter(([_, category]) => category.products.length > 0)
            .map(([key, category]) => `
                <div class="category-section" data-category="${key}">
                    <h3>${category.name}</h3>
                    <div class="products-grid">
                        ${category.products.map(product => this.renderProduct(product)).join('')}
                    </div>
                </div>
            `).join('');
    }

    // Рендер продукта
    renderProduct(product) {
        const isInCart = this.cart.some(item => item.id === product.id);
        const cartButtonText = isInCart ? '✅ В корзине' : '🛒 В корзину';
        
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x200/6c757d/white?text=📷'">
                </div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    ${product.ingredients ? `
                        <div class="product-ingredients">
                            <small>Состав: ${product.ingredients.join(', ')}</small>
                        </div>
                    ` : ''}
                    <div class="product-price">${product.price.toLocaleString('ru-RU')} ₽</div>
                    <button class="add-to-cart-btn ${isInCart ? 'in-cart' : ''}" 
                            onclick="app.addToCart(${product.id})" 
                            ${!product.available ? 'disabled' : ''}>
                        ${product.available ? cartButtonText : '❌ Нет в наличии'}
                    </button>
                </div>
            </div>
        `;
    }

    // Добавление в корзину
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.available) {
            this.showMessage('Товар недоступен', 'error');
            return false;
        }

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showAddToCartAnimation(productId);
        this.updateProductButtons();
        
        this.showMessage(`${product.name} добавлен в корзину`, 'success');
        return true;
    }

    // Обновление кнопок товаров
    updateProductButtons() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productId = parseInt(card.dataset.id);
            const button = card.querySelector('.add-to-cart-btn');
            const isInCart = this.cart.some(item => item.id === productId);
            
            if (button) {
                button.textContent = isInCart ? '✅ В корзине' : '🛒 В корзину';
                button.classList.toggle('in-cart', isInCart);
            }
        });
    }

    // Анимация добавления в корзину
    showAddToCartAnimation(productId) {
        const productCard = document.querySelector(`[data-id="${productId}"]`);
        if (productCard) {
            productCard.classList.add('added-to-cart');
            setTimeout(() => {
                productCard.classList.remove('added-to-cart');
            }, 1000);
        }
    }

    // Обновление счетчика корзины
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems > 99 ? '99+' : totalItems;
        }
    }

    // Сохранение корзины
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
            this.showMessage('Ошибка сохранения корзины', 'error');
        }
    }

    // Показать категорию
    showCategory(category) {
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (categorySection) {
            categorySection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработка быстрых действий
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Сохранение состояния при закрытии
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });

        // Обработка сообщений от Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event.data);
            });
        }
    }

    handleGlobalClick(e) {
        // Обработка навигации
        if (e.target.matches('.nav-link')) {
            e.preventDefault();
            this.navigateTo(e.target.href);
        }
        
        // Обработка быстрых действий
        if (e.target.closest('.action-btn')) {
            const actionBtn = e.target.closest('.action-btn');
            const category = actionBtn.dataset.category;
            if (category) {
                this.showCategory(category);
            }
        }
    }

    // Обработка сообщений от Service Worker
    handleServiceWorkerMessage(message) {
        switch (message.type) {
            case 'CACHE_UPDATED':
                this.showMessage('Доступно обновление приложения', 'info');
                break;
            case 'NEW_CONTENT':
                if (confirm('Доступна новая версия приложения. Перезагрузить?')) {
                    window.location.reload();
                }
                break;
        }
    }

    // Навигация с плавным переходом
    navigateTo(url) {
        document.body.style.opacity = '0.8';
        document.body.style.transition = 'opacity 0.2s ease';
        
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }

    // Загрузка начальных данных
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadProducts(),
                this.loadPromotions?.() // Опционально, если функция существует
            ]);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    // Сохранение состояния приложения
    saveAppState() {
        const state = {
            cart: this.cart,
            lastVisited: new Date().toISOString(),
            version: '1.0.0'
        };
        try {
            localStorage.setItem('appState', JSON.stringify(state));
        } catch (error) {
            console.error('Ошибка сохранения состояния:', error);
        }
    }

    // Загрузка состояния приложения
    loadAppState() {
        try {
            const state = JSON.parse(localStorage.getItem('appState'));
            if (state && state.cart) {
                this.cart = state.cart;
                this.updateCartCount();
                this.updateProductButtons();
            }
        } catch (error) {
            console.error('Ошибка загрузки состояния:', error);
        }
    }

    // Очистка данных приложения
    clearAppData() {
        if (confirm('Вы уверены, что хотите очистить все данные приложения?')) {
            try {
                localStorage.clear();
                sessionStorage.clear();
                this.cart = [];
                this.updateCartCount();
                this.updateProductButtons();
                this.showMessage('Данные очищены', 'success');
                
                // Перезагружаем через 1 секунду
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (error) {
                console.error('Ошибка очистки данных:', error);
                this.showMessage('Ошибка очистки данных', 'error');
            }
        }
    }

    // Показать сообщение
    showMessage(message, type = 'success') {
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            // Fallback для консоли
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Показать сообщение об обновлении
    showUpdateMessage() {
        if (confirm('Доступна новая версия приложения. Обновить?')) {
            window.location.reload();
        }
    }

    // Получить общую сумму корзины
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Получить количество товаров в корзине
    getCartItemsCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }
}

// Создаем глобальный экземпляр приложения
const app = new PerekusonApp();

// Глобальные функции для обратной совместимости
function showCategory(category) {
    app.showCategory(category);
}

function clearAppData() {
    app.clearAppData();

}
