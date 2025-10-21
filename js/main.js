document.addEventListener('DOMContentLoaded', function() {
    // Инициализация системы авторизации
    authSystem.updateUI();
    
    // Загрузка акций при загрузке страницы
    if (typeof adminManager !== 'undefined') {
        adminManager.loadPromotions();
    }
    
    console.log('Перекусон загружен!');
    
    // Показываем информацию об администраторе по умолчанию в консоли
    if (!authSystem.isAuthenticated()) {
        console.log('Для тестирования админ-панели используйте:');
        console.log('Email: admin@perekuson.ru');
        console.log('Пароль: admin123');
    }
});