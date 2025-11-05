// Основной файл инициализации приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Перекусон загружается...');
    
    initializeApp();
});

async function initializeApp() {
    try {
        // Инициализация систем в правильном порядке
        await initializeAuthSystem();
        initializeUI();
        initializeEventListeners();
        loadInitialData();
        setupPerformanceMonitoring();
        
        console.log('✅ Перекусон успешно загружен!');
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        showErrorMessage('Ошибка загрузки приложения');
    }
}

async function initializeAuthSystem() {
    // Ждем инициализации authSystem если она асинхронная
    if (authSystem && typeof authSystem.init === 'function') {
        await authSystem.init();
    }
    
    // Обновляем UI авторизации
    if (authSystem && typeof authSystem.updateUI === 'function') {
        authSystem.updateUI();
    }
    
    // Показываем тестовые данные в консоли для разработки
    if (!authSystem.isAuthenticated()) {
        showDeveloperInfo();
    }
}

function initializeUI() {
    // Инициализация активной навигации
    setActiveNavigation();
    
    // Инициализация ленивой загрузки изображений
    initializeLazyLoading();
    
    // Инициализация темной темы если включена
    initializeTheme();
    
    // Показываем/скрываем элементы в зависимости от авторизации
    updateAuthDependentElements();
}

function initializeEventListeners() {
    // Глобальные обработчики событий
    setupGlobalEventListeners();
    
    // Обработчики для PWA
    setupPWAEventListeners();
    
    // Обработчики для клавиатуры
    setupKeyboardShortcuts();
}

function setupGlobalEventListeners() {
    // Обработка кликов по навигации
    document.addEventListener('click', handleGlobalClicks);
    
    // Обработка отправки форм
    document.addEventListener('submit', handleFormSubmissions);
    
    // Обработка изменения видимости страницы
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Обработка онлайн/оффлайн статуса
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
}

function setupPWAEventListeners() {
    // Отслеживание изменений Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker обновлен');
            showMessage('Доступно обновление приложения', 'info');
        });
    }
    
    // Обработка жестов для PWA
    setupTouchGestures();
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + / для показа помощи
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            showKeyboardShortcuts();
        }
        
        // Escape для закрытия модальных окон
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function handleGlobalClicks(e) {
    const target = e.target;
    
    // Обработка внешних ссылок
    if (target.matches('a[href^="http"]') && !target.matches('a[href*="'+window.location.hostname+'"]')) {
        e.preventDefault();
        openExternalLink(target.href);
    }
    
    // Обработка кнопок "назад"
    if (target.matches('.back-button, [data-action="back"]')) {
        e.preventDefault();
        window.history.back();
    }
    
    // Обработка кнопок обновления
    if (target.matches('.refresh-button, [data-action="refresh"]')) {
        e.preventDefault();
        location.reload();
    }
}

function handleFormSubmissions(e) {
    const form = e.target;
    
    // Добавляем индикатор загрузки для всех форм
    if (form.matches('form')) {
        showFormLoading(form, true);
        
        // Автоматически скрываем индикатор после отправки
        setTimeout(() => {
            showFormLoading(form, false);
        }, 2000);
    }
}

function handleVisibilityChange() {
    if (!document.hidden) {
        // Страница стала видимой - обновляем данные
        refreshDataOnVisible();
    }
}

function handleOnlineStatus() {
    showMessage('Соединение восстановлено', 'success');
    // Перезагружаем данные при восстановлении соединения
    refreshData();
}

function handleOfflineStatus() {
    showMessage('Вы в оффлайн-режиме', 'warning');
}

function loadInitialData() {
    // Загрузка акций если доступен adminManager
    if (typeof adminManager !== 'undefined' && adminManager.loadPromotions) {
        adminManager.loadPromotions();
    }
    
    // Загрузка продуктов если доступен app
    if (typeof app !== 'undefined' && app.loadProducts) {
        app.loadProducts().catch(console.error);
    }
    
    // Загрузка пользовательских данных если авторизован
    if (authSystem.isAuthenticated()) {
        loadUserData();
    }
}

function refreshData() {
    console.log('Обновление данных...');
    
    if (typeof adminManager !== 'undefined' && adminManager.loadPromotions) {
        adminManager.loadPromotions();
    }
    
    if (typeof app !== 'undefined' && app.loadProducts) {
        app.loadProducts().catch(console.error);
    }
}

function refreshDataOnVisible() {
    // Обновляем данные только если страница была скрыта более 5 минут
    const lastUpdate = parseInt(localStorage.getItem('lastDataUpdate') || '0');
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (lastUpdate < fiveMinutesAgo) {
        refreshData();
        localStorage.setItem('lastDataUpdate', Date.now().toString());
    }
}

function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navButtons = document.querySelectorAll('.nav-button, .bottom-nav-btn');
    
    navButtons.forEach(button => {
        const href = button.getAttribute('href');
        if (href && currentPath.includes(href.replace('.html', ''))) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function initializeLazyLoading() {
    // Инициализация ленивой загрузки для изображений
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

function initializeTheme() {
    // Проверяем предпочтения темы
    const savedTheme = localStorage.getItem('theme') || 'auto';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === 'auto' && systemPrefersDark)) {
        document.body.classList.add('dark-theme');
    }
}

function updateAuthDependentElements() {
    const authOnlyElements = document.querySelectorAll('.auth-only');
    const guestOnlyElements = document.querySelectorAll('.guest-only');
    
    if (authSystem.isAuthenticated()) {
        authOnlyElements.forEach(el => el.style.display = 'block');
        guestOnlyElements.forEach(el => el.style.display = 'none');
    } else {
        authOnlyElements.forEach(el => el.style.display = 'none');
        guestOnlyElements.forEach(el => el.style.display = 'block');
    }
}

function loadUserData() {
    // Загрузка пользовательских данных (история заказов, избранное и т.д.)
    console.log('Загрузка пользовательских данных...');
    
    // Здесь может быть загрузка данных пользователя
    if (typeof app !== 'undefined') {
        app.updateCartCount();
    }
}

function setupPerformanceMonitoring() {
    // Мониторинг производительности
    if ('performance' in window) {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            console.log(`Время загрузки страницы: ${Math.round(navTiming.loadEventEnd - navTiming.navigationStart)}ms`);
        }
    }
    
    // Мониторинг памяти
    if ('memory' in performance) {
        setInterval(() => {
            const used = Math.round(performance.memory.usedJSHeapSize / 1048576);
            const limit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
            console.log(`Использовано памяти: ${used}MB / ${limit}MB`);
        }, 30000);
    }
}

function setupTouchGestures() {
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Горизонтальный свайп (только если вертикальное движение небольшое)
        if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50) {
            if (diffX > 0) {
                // Свайп влево
                console.log('Свайп влево');
            } else {
                // Свайп вправо
                console.log('Свайп вправо');
            }
        }
    });
}

function showWelcomeMessage() {
    // Показываем приветственное сообщение для новых пользователей
    const firstVisit = !localStorage.getItem('hasVisitedBefore');
    
    if (firstVisit) {
        setTimeout(() => {
            showMessage('Добро пожаловать в Перекусон! 🍔', 'success');
            localStorage.setItem('hasVisitedBefore', 'true');
        }, 1000);
    }
}

function showDeveloperInfo() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Информация для разработчика:');
        console.log('Администратор: admin@perekuson.ru / admin123');
        console.log('Текущая версия: 1.0.0');
        console.log('Среда: ' + (window.location.hostname === 'localhost' ? 'Разработка' : 'Продакшен'));
    }
}

function showErrorMessage(message) {
    console.error(message);
    showMessage(message, 'error');
}

function showFormLoading(form, isLoading) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;
    
    if (isLoading) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span> Загрузка...';
        submitButton.classList.add('loading');
    } else {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalText || 'Отправить';
        submitButton.classList.remove('loading');
    }
}

function openExternalLink(url) {
    if (confirm('Вы покидаете Перекусон. Перейти по внешней ссылке?')) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal, .dropdown-menu');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'Ctrl + /', action: 'Показать эту справку' },
        { key: 'Escape', action: 'Закрыть модальные окна' },
        { key: 'F5', action: 'Обновить страницу' }
    ];
    
    const message = 'Горячие клавиши:\n' + 
        shortcuts.map(s => `${s.key} - ${s.action}`).join('\n');
    
    alert(message);
}

// Глобальные утилиты
window.utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(price);
    },
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Экспорт для тестирования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        utils: window.utils
    };
}