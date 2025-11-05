// auth.js - УЛЬТРА-ПРОСТАЯ ВЕРСИЯ
console.log('🔧 Загрузка auth.js...');

// Простой объект без классов
window.authSystem = {
    users: [],
    currentUser: null,

    init: function() {
        console.log('🔄 Инициализация authSystem...');
        
        // Загружаем пользователей
        const savedUsers = localStorage.getItem('users');
        this.users = savedUsers ? JSON.parse(savedUsers) : [];
        
        // Если пользователей нет - создаем тестовых
        if (this.users.length === 0) {
            console.log('👥 Создаем тестовых пользователей...');
            this.users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@perekuson.ru',
                    password: 'admin123',
                    role: 'admin'
                },
                {
                    id: 2, 
                    username: 'user',
                    email: 'user@example.com',
                    password: 'password123',
                    role: 'user'
                }
            ];
            localStorage.setItem('users', JSON.stringify(this.users));
        }
        
        // Загружаем текущего пользователя
        const savedUser = localStorage.getItem('currentUser');
        this.currentUser = savedUser ? JSON.parse(savedUser) : null;
        
        console.log('✅ authSystem готов!');
        console.log('👥 Пользователи:', this.users);
        console.log('👤 Текущий пользователь:', this.currentUser);
    },

    login: function(loginData) {
        console.log('🔐 Вход с данными:', loginData);
        
        const login = loginData.loginEmail || loginData.email;
        const password = loginData.loginPassword || loginData.password;
        
        console.log('🔍 Ищем пользователя:', login);
        
        // Ищем пользователя
        const user = this.users.find(u => {
            const loginMatch = u.email === login || u.username === login;
            const passwordMatch = u.password === password;
            console.log(`Проверка ${u.username}: login=${loginMatch}, password=${passwordMatch}`);
            return loginMatch && passwordMatch;
        });
        
        if (user) {
            console.log('✅ ПОЛЬЗОВАТЕЛЬ НАЙДЕН!', user);
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Сразу обновляем UI
            this.updateUI();
            
            return {
                success: true,
                message: 'Вход успешен!',
                user: user
            };
        } else {
            console.log('❌ ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН');
            return {
                success: false, 
                message: 'Неверные данные'
            };
        }
    },

    isAuthenticated: function() {
        return this.currentUser !== null;
    },

    isAdmin: function() {
        if (!this.currentUser) {
            console.log('❌ isAdmin: нет пользователя');
            return false;
        }
        
        const isAdmin = this.currentUser.role === 'admin';
        console.log('🔧 isAdmin проверка:', {
            пользователь: this.currentUser.username,
            роль: this.currentUser.role,
            результат: isAdmin
        });
        
        return isAdmin;
    },

    updateUI: function() {
        console.log('🎨 ОБНОВЛЕНИЕ ИНТЕРФЕЙСА');
        console.log('Текущий пользователь:', this.currentUser);
        
        const isAuth = this.isAuthenticated();
        const isAdmin = this.isAdmin();
        
        console.log('📊 Состояние:', { isAuth, isAdmin });
        
        // Обновляем навигацию
        this.updateNavigation();
        
        // Обновляем админ-панель
        this.updateAdminPanel();
        
        // Обновляем приветствие
        this.updateUserGreeting();
    },

    updateNavigation: function() {
        const guestMenu = document.querySelector('.menu-guest');
        const userMenu = document.querySelector('.menu-user');
        
        if (this.currentUser) {
            if (guestMenu) guestMenu.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
        } else {
            if (guestMenu) guestMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    },

    updateAdminPanel: function() {
        const adminBtn = document.getElementById('adminPanelBtn');
        const adminPanel = document.getElementById('adminPanel');
        
        const isAdmin = this.isAdmin();
        
        console.log('🔘 Обновление админ-панели:', { isAdmin, adminBtn, adminPanel });
        
        if (adminBtn) {
            adminBtn.style.display = isAdmin ? 'block' : 'none';
            console.log('Кнопка админа установлена в:', adminBtn.style.display);
        }
        
        if (adminPanel) {
            adminPanel.style.display = isAdmin ? 'block' : 'none';
            console.log('Панель админа установлена в:', adminPanel.style.display);
        }
    },

    updateUserGreeting: function() {
        const statusElement = document.getElementById('status');
        const greetingElement = document.getElementById('userGreeting');
        const userNameElement = document.getElementById('userName');
        
        if (this.currentUser) {
            if (statusElement) statusElement.textContent = 'Авторизован';
            if (greetingElement) greetingElement.style.display = 'block';
            if (userNameElement) userNameElement.textContent = this.currentUser.username;
        } else {
            if (statusElement) statusElement.textContent = 'Не авторизован';
            if (greetingElement) greetingElement.style.display = 'none';
        }
    },

    logout: function() {
        console.log('🚪 Выход из системы');
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
    }
};

// Инициализируем сразу
authSystem.init();
