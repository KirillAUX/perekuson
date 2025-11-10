// Менеджер корзины
class CartManager {
    constructor() {
        // Синхронизируем с app.cart если app существует
        if (typeof app !== 'undefined' && app.cart) {
            this.cart = app.cart;
        } else {
            this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        }
        this.promoCode = null;
        this.deliveryCost = 0;
        this.init();
    }

    init() {
        this.loadCart();
        this.setupEventListeners();
        this.updateCartUI();
    }

    setupEventListeners() {
        // Применение промокода
        const applyPromoBtn = document.getElementById('applyPromo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => {
                this.applyPromoCode();
            });
        }

        // Ввод промокода по Enter
        const promoInput = document.getElementById('promoCode');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyPromoCode();
                }
            });
        }

        // Изменение способа доставки
        const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
        deliveryOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                this.updateDeliveryCost(e.target.value);
                this.updateCartSummary();
            });
        });

        // Оформление заказа
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }
    }

    // Загрузка корзины
    loadCart() {
        const cartData = localStorage.getItem('cart');
        this.cart = cartData ? JSON.parse(cartData) : [];
        this.updateCartUI();
    }

    // Сохранение корзины
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        
        // Синхронизируем с app если он существует
        if (typeof app !== 'undefined' && app.cart) {
            app.cart = this.cart;
            app.updateCartCount();
        }
    }

    // Добавление товара в корзину
    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image,
                category: product.category
            });
        }
        
        this.saveCart();
        this.showAddToCartAnimation(product.name);
    }

    // Удаление товара из корзины
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
    }

    // Изменение количества товара
    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartUI();
        }
    }

    // Очистка корзины
    clearCart() {
        this.cart = [];
        this.promoCode = null;
        this.deliveryCost = 0;
        this.saveCart();
        this.updateCartUI();
    }

    // Обновление интерфейса корзины
    updateCartUI() {
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartSummary();
        this.toggleEmptyState();
    }

    // Обновление счетчика в навигации
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cartCount');
        const totalItems = this.getTotalItems();
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    // Получение общего количества товаров
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Получение общей стоимости
    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Получение скидки
    getDiscount() {
        if (!this.promoCode) return 0;
        
        const subtotal = this.getSubtotal();
        // Пример промокода на 10%
        if (this.promoCode === 'PERECUSON10') {
            return subtotal * 0.1;
        }
        // Пример промокода на 20%
        if (this.promoCode === 'PERECUSON20') {
            return subtotal * 0.2;
        }
        
        return 0;
    }

    // Обновление стоимости доставки
    updateDeliveryCost(deliveryType) {
        this.deliveryCost = deliveryType === 'delivery' ? 200 : 0;
    }

    // Получение итоговой суммы
    getTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        return subtotal - discount + this.deliveryCost;
    }

    // Отображение товаров в корзине
    renderCartItems() {
        const cartItemsList = document.getElementById('cartItemsList');
        if (!cartItemsList) return;

        if (this.cart.length === 0) {
            cartItemsList.innerHTML = '';
            return;
        }

        cartItemsList.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNENBRjUwIi8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjAiPjHwn5G0PC90ZXh0Pgo8L3N2Zz4K'">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">${item.price} ₽</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="cartManager.removeFromCart('${item.id}')">🗑️</button>
                </div>
                <div class="cart-item-total">
                    ${item.price * item.quantity} ₽
                </div>
            </div>
        `).join('');
    }

    // Обновление итогов
    updateCartSummary() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscount();
        const total = this.getTotal();

        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('totalAmount');
        const deliveryElement = document.getElementById('deliveryCost');
        
        if (subtotalElement) subtotalElement.textContent = `${subtotal} ₽`;
        if (totalElement) totalElement.textContent = `${total} ₽`;
        if (deliveryElement) deliveryElement.textContent = `${this.deliveryCost} ₽`;

        const discountRow = document.querySelector('.discount-row');
        const discountAmount = document.getElementById('discountAmount');
        
        if (discount > 0 && discountRow && discountAmount) {
            discountRow.style.display = 'flex';
            discountAmount.textContent = `-${discount} ₽`;
        } else if (discountRow) {
            discountRow.style.display = 'none';
        }
    }

    // Переключение состояния пустой корзины
    toggleEmptyState() {
        const emptyCart = document.getElementById('emptyCart');
        const cartContent = document.getElementById('cartContent');

        if (emptyCart && cartContent) {
            if (this.cart.length === 0) {
                emptyCart.style.display = 'block';
                cartContent.style.display = 'none';
            } else {
                emptyCart.style.display = 'none';
                cartContent.style.display = 'block';
            }
        }
    }

    // Применение промокода
    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        if (!promoInput) return;

        const code = promoInput.value.trim().toUpperCase();

        if (!code) {
            showMessage('Введите промокод', 'error');
            return;
        }

        const validPromoCodes = ['PERECUSON10', 'PERECUSON20'];
        
        if (validPromoCodes.includes(code)) {
            this.promoCode = code;
            this.updateCartSummary();
            showMessage(`Промокод "${code}" применен! Скидка ${code === 'PERECUSON10' ? '10%' : '20%'}`, 'success');
            promoInput.value = '';
        } else {
            showMessage('Неверный промокод', 'error');
        }
    }

    // Оформление заказа
    checkout() {
        if (!authSystem || !authSystem.isAuthenticated()) {
            showMessage('Для оформления заказа необходимо войти в систему', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        if (this.cart.length === 0) {
            showMessage('Корзина пуста', 'error');
            return;
        }

        const order = {
            id: Date.now().toString(),
            items: [...this.cart],
            subtotal: this.getSubtotal(),
            discount: this.getDiscount(),
            deliveryCost: this.deliveryCost,
            total: this.getTotal(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            userId: authSystem.getCurrentUser().id
        };

        // Сохраняем заказ
        this.saveOrder(order);
        
        // Очищаем корзину
        this.clearCart();
        
        showMessage('Заказ успешно оформлен!', 'success');
        
        setTimeout(() => {
            window.location.href = 'orders.html';
        }, 2000);
    }

    // Сохранение заказа
    saveOrder(order) {
        try {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));
        } catch (error) {
            console.error('Ошибка сохранения заказа:', error);
        }
    }

    // Анимация добавления в корзину
    showAddToCartAnimation(productName) {
        showMessage(`"${productName}" добавлен в корзину!`, 'success');
    }

    // Получение содержимого корзины
    getCart() {
        return this.cart;
    }
}

// Создаем глобальный экземпляр менеджера корзины
const cartManager = new CartManager();
