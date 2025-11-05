// auth.js - ПРОСТАЯ И РАБОЧАЯ ВЕРСИЯ
class AuthSystem {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🔄 Инициализация AuthSystem...');
        
        // Загружаем пользователей
        this.loadUsers();
        
        // Если пользователей нет - создаем тестовых
        if (this.users.length === 0) {
            this.createDefaultUsers();
        }
        
        // Загружаем текущего пользователя
        this.loadCurrentUser();
        
        console.log('✅ AuthSystem готов. Пользователей:', this.users.length);
        console.log('👤 Текущий пользователь:', this.currentUser);
    }

    createDefaultUsers() {
        console.log('👥 Создаем тестовых пользователей...');
        
        this.users = [
            {
                id: 1,
                username: 'admin',
                email: 'admin@perekuson.ru',
                password: 'admin123', // Пароль в открытом виде
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'user',
                email: 'user@example.com', 
                password: 'password123', // Пароль в открытом виде
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ];
        
        this.saveUsers();
    }

    login(loginData) {
        console.log('🔐 Попытка входа:', loginData);
        
        const login = (loginData.loginEmail || loginData.email || '').trim();
        const password = loginData.loginPassword || loginData.password || '';
        
        // Ищем пользователя
        const user = this.users.find(u => 
            (u.email === login || u.username === login) && 
            u.password === password // Прямое сравнение пароля
        );
        
        if (user) {
            console.log('✅ Вход успешен! Пользователь:', user.username, 'Роль:', user.role);
            
            this.currentUser = user;
            this.saveCurrentUser();
            this.updateUI();
            
            return {
                success: true,
                message: `Добро пожаловать, ${user.username}!`,
                user: user
            };
        } else {
            console.log('❌ Ошибка входа: неверные данные');
            return {
                success: false,
                message: 'Неверный email/логин или пароль'
            };
        }
    }

    logout() {
        console.log('🚪 Выход из системы');
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        
        return {
            success: true,
            message: 'Вы вышли из системы'
        };
    }

    register(userData) {
        console.log('📝 Регистрация:', userData);
        
        // Проверяем, нет ли пользователя с таким email или username
        const existingUser = this.users.find(u => 
            u.email === userData.email || u.username === userData.username
        );
        
        if (existingUser) {
            return {
                success: false,
                message: 'Пользователь с таким email или логином уже существует'
            };
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // Пароль в открытом виде
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        console.log('✅ Новый пользователь создан:', newUser.username);
        
        return {
            success: true,
            message: 'Регистрация успешна! Теперь войдите в систему.',
            user: newUser
        };
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        if (!this.currentUser) {
            console.log('❌ isAdmin: нет текущего пользователя');
            return false;
        }
        
        const isAdmin = this.currentUser.role === 'admin';
        console.log('🔧 Проверка прав:', {
            пользователь: this.currentUser.username,
            роль: this.currentUser.role,
            isAdmin: isAdmin
        });
        
        return isAdmin;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUI() {
        console.log('🎨 Обновление интерфейса...');
        
        const isAuth = this.isAuthenticated();
        const isAdmin = this.isAdmin();
        
        console.log('📊 Состояние:', { isAuth, isAdmin });
        
        // Обновляем навигацию
        this.updateNavigation();
        
        // Обновляем админ-панель
        this.updateAdminPanel();
        
        // Обновляем приветствие
        this.updateUserGreeting();
    }

    updateNavigation() {
        const guestMenu = document.querySelector('.menu-guest');
        const userMenu = document.querySelector('.menu-user');
        
        if (guestMenu) guestMenu.style.display = this.currentUser ? 'none' : 'block';
        if (userMenu) userMenu.style.display = this.currentUser ? 'block' : 'none';
        
        console.log('🧭 Навигация обновлена');
    }

    updateAdminPanel() {
        const adminBtn = document.getElementById('adminPanelBtn');
        const adminPanel = document.getElementById('adminPanel');
        
        const isAdmin = this.isAdmin();
        
        if (adminBtn) {
            adminBtn.style.display = isAdmin ? 'block' : 'none';
            console.log('🔘 Кнопка админа:', isAdmin ? 'показана' : 'скрыта');
        }
        
        if (adminPanel) {
            adminPanel.style.display = isAdmin ? 'block' : 'none';
            console.log('📊 Панель админа:', isAdmin ? 'показана' : 'скрыта');
        }
    }

    updateUserGreeting() {
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
    }

    // Вспомогательные методы для работы с localStorage
    loadUsers() {
        try {
            const usersJson = localStorage.getItem('users');
            this.users = usersJson ? JSON.parse(usersJson) : [];
            console.log('📁 Загружено пользователей:', this.users.length);
        } catch (error) {
            console.error('❌ Ошибка загрузки пользователей:', error);
            this.users = [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('users', JSON.stringify(this.users));
            console.log('💾 Пользователи сохранены');
        } catch (error) {
            console.error('❌ Ошибка сохранения пользователей:', error);
        }
    }

    loadCurrentUser() {
        try {
            const userJson = localStorage.getItem('currentUser');
            this.currentUser = userJson ? JSON.parse(userJson) : null;
            console.log('👤 Загружен текущий пользователь:', this.currentUser?.username);
        } catch (error) {
            console.error('❌ Ошибка загрузки текущего пользователя:', error);
            this.currentUser = null;
        }
    }

    saveCurrentUser() {
        try {
            if (this.currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                console.log('💾 Текущий пользователь сохранен');
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения текущего пользователя:', error);
        }
    }

    // Методы для отладки
    debugShowUsers() {
        console.log('👥 Все пользователи:', this.users);
    }
    
    debugShowCurrentUser() {
        console.log('👤 Текущий пользователь:', this.currentUser);
    }
    
    debugForceAdminLogin() {
        console.log('🔧 Принудительный вход как администратор...');
        
        const adminUser = this.users.find(u => u.role === 'admin');
        if (adminUser) {
            this.currentUser = adminUser;
            this.saveCurrentUser();
            this.updateUI();
            console.log('✅ Вошли как:', adminUser.username);
        } else {
            console.log('❌ Администратор не найден');
        }
    }
}

// Создаем глобальный экземпляр
const authSystem = new AuthSystem();
