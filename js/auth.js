// Система управления пользователями
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.promotions = JSON.parse(localStorage.getItem('promotions')) || [];
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            // Создаем администратора по умолчанию, если его нет
            this.createDefaultAdmin();
            this.updateUI();
            this.setupAutoLogout();
            this.isInitialized = true;
            console.log('AuthSystem инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации AuthSystem:', error);
        }
    }

    // Создание администратора по умолчанию
    createDefaultAdmin() {
        const adminExists = this.users.find(user => user.role === 'admin');
        if (!adminExists) {
            const defaultAdmin = {
                id: this.generateId(),
                username: 'admin',
                email: 'admin@perekuson.ru',
                password: this.hashPassword('admin123'), // Хэшируем пароль
                role: 'admin',
                createdAt: new Date().toISOString(),
                phone: '+7 (999) 000-00-00',
                lastLogin: null,
                isActive: true
            };
            this.users.push(defaultAdmin);
            this.saveUsers();
            console.log('Создан администратор по умолчанию: admin / admin123');
            console.warn('⚠️ ЗАМЕНИТЕ ПАРОЛЬ АДМИНИСТРАТОРА В ПРОДАКШЕНЕ!');
        }
    }

    // Генерация ID
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Простое хэширование пароля (в реальном приложении используйте bcrypt)
   hashPassword(password) {
    return password; // Временно возвращает исходный пароль
}

    // Валидация email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Валидация пароля
    validatePassword(password) {
        return password && password.length >= 6;
    }

    // Валидация имени пользователя
    validateUsername(username) {
        return username && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    // Регистрация нового пользователя
    register(userData) {
        try {
            // Валидация данных
            if (!this.validateEmail(userData.email)) {
                return { success: false, message: 'Некорректный формат email' };
            }

            if (!this.validatePassword(userData.password)) {
                return { success: false, message: 'Пароль должен содержать минимум 6 символов' };
            }

            if (!this.validateUsername(userData.username)) {
                return { success: false, message: 'Имя пользователя должно содержать минимум 3 символа (только буквы, цифры и подчеркивания)' };
            }

            if (userData.password !== userData.confirmPassword) {
                return { success: false, message: 'Пароли не совпадают' };
            }

            // Проверяем, нет ли уже пользователя с таким email или username
            const existingUser = this.users.find(user => 
                user.email === userData.email || user.username === userData.username
            );

            if (existingUser) {
                return { 
                    success: false, 
                    message: existingUser.email === userData.email 
                        ? 'Пользователь с таким email уже существует' 
                        : 'Пользователь с таким именем уже существует' 
                };
            }

            // Создаем нового пользователя
            const newUser = {
                id: this.generateId(),
                username: userData.username,
                email: userData.email,
                password: this.hashPassword(userData.password),
                phone: userData.phone || '',
                role: 'user',
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                orders: [],
                preferences: {
                    notifications: true,
                    newsletter: false
                }
            };

            this.users.push(newUser);
            this.saveUsers();

            // Автоматически входим после регистрации
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.updateUI();

            return { 
                success: true, 
                message: 'Регистрация успешна! Добро пожаловать!', 
                user: newUser 
            };
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, message: 'Ошибка регистрации' };
        }
    }

    // Вход пользователя
    login(loginData) {
    try {
        const user = this.users.find(user => 
            (user.email === loginData.loginEmail || user.username === loginData.loginEmail) && 
            user.password === this.hashPassword(loginData.loginPassword) &&
            user.isActive
        );

            if (user) {
                // Обновляем время последнего входа
                user.lastLogin = new Date().toISOString();
                this.saveUsers();

                this.currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateUI();
                this.resetAutoLogoutTimer();

                // Сохраняем логин для "Запомнить меня"
                if (loginData.rememberMe) {
                    localStorage.setItem('rememberedEmail', loginData.loginEmail);
                }

                return { 
                    success: true, 
                    message: `Добро пожаловать, ${user.username}!`, 
                    user: user 
                };
            } else {
                return { 
                    success: false, 
                    message: 'Неверный email/имя пользователя или пароль' 
                };
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, message: 'Ошибка входа в систему' };
        }
    }

    // Выход пользователя
    logout() {
        try {
            // Сохраняем время выхода
            if (this.currentUser) {
                const user = this.users.find(u => u.id === this.currentUser.id);
                if (user) {
                    user.lastLogin = new Date().toISOString();
                    this.saveUsers();
                }
            }

            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.updateUI();
            this.clearAutoLogoutTimer();

            return { success: true, message: 'Выход выполнен' };
        } catch (error) {
            console.error('Ошибка выхода:', error);
            return { success: false, message: 'Ошибка выхода из системы' };
        }
    }

    // Автоматический выход по таймеру (24 часа)
    setupAutoLogout() {
        this.autoLogoutTimer = null;
        this.resetAutoLogoutTimer();
    }

    resetAutoLogoutTimer() {
        this.clearAutoLogoutTimer();
        // 24 часа в миллисекундах
        this.autoLogoutTimer = setTimeout(() => {
            if (this.currentUser) {
                this.logout();
                showMessage('Сессия истекла. Пожалуйста, войдите снова.', 'warning');
            }
        }, 24 * 60 * 60 * 1000); // 24 часа
    }

    clearAutoLogoutTimer() {
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
            this.autoLogoutTimer = null;
        }
    }

    // Проверка является ли пользователь администратором
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Получение пользователя по ID
    getUserById(userId) {
        return this.users.find(user => user.id === userId);
    }

    // Обновление профиля пользователя
    updateProfile(userId, updates) {
        try {
            const userIndex = this.users.findIndex(user => user.id === userId);
            if (userIndex === -1) {
                return { success: false, message: 'Пользователь не найден' };
            }

            // Разрешаем обновление только определенных полей
            const allowedUpdates = ['username', 'phone', 'preferences'];
            const updateData = {};
            
            allowedUpdates.forEach(field => {
                if (updates[field] !== undefined) {
                    updateData[field] = updates[field];
                }
            });

            this.users[userIndex] = { ...this.users[userIndex], ...updateData };
            this.saveUsers();

            // Обновляем текущего пользователя если это он
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = this.users[userIndex];
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.updateUI();
            }

            return { success: true, message: 'Профиль обновлен', user: this.users[userIndex] };
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return { success: false, message: 'Ошибка обновления профиля' };
        }
    }

    // Смена пароля
    changePassword(userId, currentPassword, newPassword) {
        try {
            const userIndex = this.users.findIndex(user => user.id === userId);
            if (userIndex === -1) {
                return { success: false, message: 'Пользователь не найден' };
            }

            const user = this.users[userIndex];

            // Проверяем текущий пароль
            if (user.password !== this.hashPassword(currentPassword)) {
                return { success: false, message: 'Неверный текущий пароль' };
            }

            // Валидация нового пароля
            if (!this.validatePassword(newPassword)) {
                return { success: false, message: 'Новый пароль должен содержать минимум 6 символов' };
            }

            // Обновляем пароль
            this.users[userIndex].password = this.hashPassword(newPassword);
            this.saveUsers();

            return { success: true, message: 'Пароль успешно изменен' };
        } catch (error) {
            console.error('Ошибка смены пароля:', error);
            return { success: false, message: 'Ошибка смены пароля' };
        }
    }

    // Управление акциями
    addPromotion(promotionData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Недостаточно прав' };
        }

        try {
            const newPromotion = {
                id: this.generateId(),
                title: promotionData.title,
                description: promotionData.description,
                image: promotionData.image,
                startDate: promotionData.startDate,
                endDate: promotionData.endDate,
                active: true,
                createdAt: new Date().toISOString(),
                createdBy: this.currentUser.id,
                views: 0,
                clicks: 0
            };

            this.promotions.push(newPromotion);
            this.savePromotions();

            return { success: true, message: 'Акция добавлена', promotion: newPromotion };
        } catch (error) {
            console.error('Ошибка добавления акции:', error);
            return { success: false, message: 'Ошибка добавления акции' };
        }
    }

    // Удаление акции
    deletePromotion(promotionId) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Недостаточно прав' };
        }

        try {
            const promotionIndex = this.promotions.findIndex(p => p.id === promotionId);
            if (promotionIndex === -1) {
                return { success: false, message: 'Акция не найдена' };
            }

            this.promotions.splice(promotionIndex, 1);
            this.savePromotions();

            return { success: true, message: 'Акция удалена' };
        } catch (error) {
            console.error('Ошибка удаления акции:', error);
            return { success: false, message: 'Ошибка удаления акции' };
        }
    }

    // Получение всех акций
    getPromotions() {
        return this.promotions.filter(promotion => promotion.active);
    }

    // Получение активных акций (текущие)
    getActivePromotions() {
        const now = new Date();
        return this.promotions.filter(promotion => 
            promotion.active && 
            new Date(promotion.startDate) <= now && 
            new Date(promotion.endDate) >= now
        );
    }

    // Сохранение пользователей в localStorage
    saveUsers() {
        try {
            localStorage.setItem('users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
            throw error;
        }
    }

    // Сохранение акций в localStorage
    savePromotions() {
        try {
            localStorage.setItem('promotions', JSON.stringify(this.promotions));
        } catch (error) {
            console.error('Ошибка сохранения акций:', error);
            throw error;
        }
    }

    // Обновление интерфейса
    updateUI() {
        const profileBtn = document.getElementById('profileBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const statusElement = document.getElementById('status');
        const authStatus = document.querySelector('.auth-status');
        const adminPanelBtn = document.getElementById('adminPanelBtn');

        if (this.currentUser && profileBtn) {
            // Пользователь авторизован
            const guestMenu = dropdownMenu?.querySelector('.menu-guest');
            const userMenu = dropdownMenu?.querySelector('.menu-user');
            
            if (guestMenu) guestMenu.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            
            profileBtn.textContent = this.currentUser.username.substring(0, 2).toUpperCase();
            profileBtn.classList.add('authenticated');
            
            if (statusElement) {
                let statusText = `Авторизован как ${this.currentUser.username}`;
                if (this.isAdmin()) {
                    statusText += ' (Администратор)';
                    statusElement.style.color = '#dc3545';
                } else {
                    statusElement.style.color = '#28a745';
                }
                statusElement.textContent = statusText;
                statusElement.classList.add('authenticated');
            }
            
            if (authStatus) {
                authStatus.classList.add('authenticated');
                if (this.isAdmin()) {
                    authStatus.style.borderLeftColor = '#dc3545';
                    authStatus.style.background = 'linear-gradient(135deg, #f8f9fa, #ffe6e6)';
                } else {
                    authStatus.style.borderLeftColor = '#28a745';
                }
            }

            // Показываем кнопку админ-панели для администраторов
            if (adminPanelBtn && this.isAdmin()) {
                adminPanelBtn.style.display = 'inline-block';
            }
        } else if (profileBtn) {
            // Пользователь не авторизован
            const guestMenu = dropdownMenu?.querySelector('.menu-guest');
            const userMenu = dropdownMenu?.querySelector('.menu-user');
            
            if (guestMenu) guestMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
            
            profileBtn.textContent = '👤';
            profileBtn.classList.remove('authenticated');
            
            if (statusElement) {
                statusElement.textContent = 'Не авторизован';
                statusElement.classList.remove('authenticated');
                statusElement.style.color = '#6c757d';
            }
            
            if (authStatus) {
                authStatus.classList.remove('authenticated');
                authStatus.style.borderLeftColor = '#6c757d';
                authStatus.style.background = '';
            }

            // Скрываем кнопку админ-панели
            if (adminPanelBtn) {
                adminPanelBtn.style.display = 'none';
            }
        }
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Получение статистики
    getStats() {
        return {
            totalUsers: this.users.length,
            totalAdmins: this.users.filter(u => u.role === 'admin').length,
            totalPromotions: this.promotions.length,
            activePromotions: this.getActivePromotions().length
        };
    }
}

// Создаем глобальный экземпляр системы авторизации
const authSystem = new AuthSystem();

// Глобальные функции для использования в HTML
function logout() {
    const result = authSystem.logout();
    if (result.success) {
        showMessage(result.message, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        showMessage(result.message, 'error');
    }
}

function showMessage(message, type = 'success') {
    // Создаем элемент сообщения если его нет
    let messageElement = document.getElementById('message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'message';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        document.body.appendChild(messageElement);
    }

    // Устанавливаем стили в зависимости от типа
    const styles = {
        success: { background: '#28a745' },
        error: { background: '#dc3545' },
        warning: { background: '#ffc107', color: '#212529' },
        info: { background: '#17a2b8' }
    };

    Object.assign(messageElement.style, styles[type] || styles.success);
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Автоматически скрываем сообщение через 5 секунд
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Функция для показа/скрытия админ-панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        const isVisible = adminPanel.style.display !== 'none';
        adminPanel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            // При открытии обновляем данные
            if (typeof adminManager !== 'undefined') {
                adminManager.loadPromotions();
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Восстанавливаем сохраненный email для "Запомнить меня"
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && document.getElementById('loginEmail')) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }

});

