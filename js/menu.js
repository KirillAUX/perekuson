// Функции для работы с меню
class MenuManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartTotal(); // Инициализируем итог при загрузке
    }

    setupEventListeners() {
        // Обработчики для чекбоксов
        const checkboxes = document.querySelectorAll('.menu-item input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCartTotal();
                this.toggleCheckboxStyle(checkbox);
            });
            
            // Инициализируем стиль при загрузке
            this.toggleCheckboxStyle(checkbox);
        });

        // Обработчик для кнопки добавления в корзину
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.addSelectedToCart());
        }
    }

    addSelectedToCart() {
    const selectedItems = this.getSelectedItems();
    
    if (selectedItems.length === 0) {
        this.showMessage('Выберите хотя бы один товар!', 'error');
        return;
    }
    
    // Добавляем выбранные товары в корзину
    let addedCount = 0;
    
    // Пробуем разные способы добавления в корзину
    selectedItems.forEach(item => {
        let added = false;
        
        // Способ 1: через app (если доступен)
        if (typeof app !== 'undefined' && app.addToCart) {
            // Создаем временный ID для товара из меню
            const tempProduct = {
                id: item.id,
                name: item.name,
                price: item.price,
                available: true
            };
            // Добавляем в app.cart
            const existingItem = app.cart.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                app.cart.push({
                    ...tempProduct,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                });
            }
            app.saveCart();
            app.updateCartCount();
            added = true;
        }
        // Способ 2: через cartManager (если доступен)
        else if (typeof cartManager !== 'undefined' && cartManager.addToCart) {
            const product = {
                id: item.id,
                name: item.name,
                price: item.price,
                image: this.getProductImage(item.name),
                category: this.getProductCategory(item.element)
            };
            cartManager.addToCart(product, 1);
            added = true;
        }
        // Способ 3: напрямую в localStorage
        else {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(cartItem => cartItem.name === item.name);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    image: this.getProductImage(item.name),
                    category: this.getProductCategory(item.element),
                    addedAt: new Date().toISOString()
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Обновляем счетчик в навигации
            const cartCountElements = document.querySelectorAll('#cartCount');
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
            });
            
            added = true;
        }
        
        if (added) {
            addedCount++;
            this.showAddToCartAnimation(item.element);
        }
    });
    
    this.updateCartTotal();
    this.showMessage(`Добавлено ${addedCount} товаров в корзину!`, 'success');
    
    // Сбрасываем выбор после добавления
    this.clearSelection();
}

    getSelectedItems() {
        const checkboxes = document.querySelectorAll('.menu-item input[type="checkbox"]:checked');
        const selectedItems = [];
        
        checkboxes.forEach(checkbox => {
            selectedItems.push({
                id: this.generateProductId(checkbox.dataset.name),
                name: checkbox.dataset.name,
                price: parseInt(checkbox.dataset.price),
                element: checkbox
            });
        });
        
        return selectedItems;
    }

    generateProductId(name) {
        // Создаем ID на основе имени товара и временной метки
        return 'product_' + name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
    }

    updateCartTotal() {
        const checkboxes = document.querySelectorAll('.menu-item input[type="checkbox"]:checked');
        let total = 0;
        let itemCount = 0;
        
        checkboxes.forEach(checkbox => {
            total += parseInt(checkbox.dataset.price);
            itemCount++;
        });
        
        const cartTotal = document.getElementById('cartTotal');
        const totalAmount = document.getElementById('totalAmount');
        const addToCartBtn = document.getElementById('addToCartBtn');
        
        if (total > 0) {
            totalAmount.textContent = total.toLocaleString('ru-RU');
            cartTotal.style.display = 'block';
            
            // Обновляем текст кнопки
            if (addToCartBtn) {
                addToCartBtn.textContent = `🛒 Добавить ${itemCount} товаров (${total.toLocaleString('ru-RU')} ₽)`;
            }
        } else {
            cartTotal.style.display = 'none';
            if (addToCartBtn) {
                addToCartBtn.textContent = '🛒 Добавить выбранное в корзину';
            }
        }
    }

    toggleCheckboxStyle(checkbox) {
        const menuItem = checkbox.closest('.menu-item');
        if (checkbox.checked) {
            menuItem.classList.add('selected');
            menuItem.style.background = '#e8f5e8';
            menuItem.style.borderColor = '#28a745';
        } else {
            menuItem.classList.remove('selected');
            menuItem.style.background = '';
            menuItem.style.borderColor = '';
        }
    }

    clearSelection() {
        const checkboxes = document.querySelectorAll('.menu-item input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            this.toggleCheckboxStyle(checkbox);
        });
        this.updateCartTotal();
    }

    showMessage(message, type = 'success') {
        // Используем существующую функцию showMessage или создаем свою
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            // Fallback: простой alert
            if (type === 'error') {
                alert('❌ ' + message);
            } else {
                alert('✅ ' + message);
            }
        }
    }

    // Дополнительные методы для управления меню
    expandAllCategories() {
        const details = document.querySelectorAll('.menu-category');
        details.forEach(detail => {
            detail.open = true;
        });
    }

    collapseAllCategories() {
        const details = document.querySelectorAll('.menu-category');
        details.forEach(detail => {
            detail.open = false;
        });
    }

    // Поиск товаров в меню
    searchProducts(query) {
        const menuItems = document.querySelectorAll('.menu-item');
        const searchTerm = query.toLowerCase().trim();
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('.item-name').textContent.toLowerCase();
            const itemDescription = item.querySelector('.item-description')?.textContent.toLowerCase() || '';
            
            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                item.style.display = 'flex';
                // Показываем родительские категории
                this.showParentCategories(item);
            } else {
                item.style.display = 'none';
            }
        });
    }

    showParentCategories(item) {
        let parent = item.closest('.menu-category, .sub-category');
        while (parent) {
            parent.open = true;
            parent = parent.parentElement.closest('.menu-category, .sub-category');
        }
    }
    getProductImage(productName) {
    // Маппинг названий товаров на эмодзи
    const imageMap = {
        'Чизбургер': '🍔',
        'Чикенбургер': '🍗',
        'Вегетарианский бургер': '🥬',
        'Бургер с беконом': '🥓',
        'Мини-сэндвич с ветчиной и сыром': '🥪',
        'Куриные крылышки': '🍗',
        'Наггетсы': '🍖',
        'Картофель фри': '🍟',
        'Картофель по-деревенски': '🥔',
        'Минеральная вода': '💧',
        'Добрый Кола': '🥤',
        'Добрый Лимон-Лайм': '🍋',
        'Добрый Апельсин': '🍊',
        'Зелёный чай': '🍵',
        'Чёрный чай': '🫖',
        'Фруктовый чай': '🍎',
        'Апельсиновый сок': '🧃',
        'Яблочный сок': '🧃',
        'Вишнёвый сок': '🧃',
        'Шоколадное мороженое': '🍫',
        'Ванильное мороженое': '🍦',
        'Клубничное мороженое': '🍓',
        'Шоколадное печенье': '🍪',
        'Овсяное печенье': '🥠',
        'Песочное печенье': '🥨'
    };

    return imageMap[productName] || '🍕';
}

getProductCategory(element) {
    // Определяем категорию по родительскому элементу
    const categoryElement = element.closest('.menu-category, .sub-category');
    if (categoryElement) {
        const summary = categoryElement.querySelector('summary');
        if (summary) {
            return summary.textContent.trim();
        }
    }
    return 'Другое';
}

showAddToCartAnimation(element) {
    const menuItem = element.closest('.menu-item');
    if (menuItem) {
        menuItem.style.background = '#d4edda';
        setTimeout(() => {
            menuItem.style.background = '';
        }, 1000);
    }
}
}

// Создаем глобальный экземпляр менеджера меню
const menuManager = new MenuManager();

// Глобальные функции для обратной совместимости
function addSelectedToCart() {
    menuManager.addSelectedToCart();
}

function updateCartTotal() {
    menuManager.updateCartTotal();
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Менеджер меню уже инициализирован через конструктор
    
    // Добавляем кнопки управления меню (опционально)
    addMenuControls();
});

function addMenuControls() {
    // Можно добавить кнопки для управления меню
    const menuControls = document.createElement('div');
    menuControls.className = 'menu-controls';
    menuControls.innerHTML = `
        <button onclick="menuManager.expandAllCategories()" class="menu-control-btn">📖 Развернуть все</button>
        <button onclick="menuManager.collapseAllCategories()" class="menu-control-btn">📕 Свернуть все</button>
    `;
    
    const menuSection = document.querySelector('.menu-categories');
    if (menuSection) {
        menuSection.parentNode.insertBefore(menuControls, menuSection);
    }

}
