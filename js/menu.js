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
        selectedItems.forEach(item => {
            if (typeof app !== 'undefined' && app.addToCart) {
                const result = app.addToCart(this.generateProductId(item.name));
                if (result) addedCount++;
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