// auth.js - УПРОЩЕННАЯ ВЕРСИЯ БЕЗ ХЕШИРОВАНИЯ
class AuthSystem {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        console.log('🔧 Инициализация AuthSystem');
        this.users = this.loadUsers();
        
        // Создаем тестовых пользователей если нет данных
        if (this.users.length === 0) {
            console.log('👥 Создаем тестовых пользователей...');
            this.users = [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@perekuson.ru',
                    password: 'admin123', // Пароль в чистом виде
                    role: 'admin',
                    createdAt: new Date().toISOString(),
                    isActive: true
                },
                {
                    id: 2,
                    username: 'user',
                    email: 'user@example.com',
                    password: 'password123', // Пароль в чистом виде
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    isActive: true
                }
            ];
            this.saveUsers();
        }

        this.currentUser = this.loadCurrentUser();
        this.isInitialized = true;
        console.log('✅ AuthSystem инициализирован');
        console.log('👥 Пользователи:', this.users);
        console.log('👤 Текущий пользователь:', this.currentUser);
    }

    // ПРОСТАЯ ФУНКЦИЯ ВХОДА БЕЗ ХЕШИРОВАНИЯ
    login(loginData) {
        console.log('🔐 === ПРОЦЕСС ВХОДА ===');
        console.log('📨 Полученные данные:', loginData);
        
        const loginInput = (loginData.loginEmail || loginData.email || '').trim();
        const passwordInput = loginData.loginPassword || loginData.password || '';
        
        console.log('🎯 Извлеченные данные:', {
            логин: loginInput,
            пароль: passwordInput
        });
        
        console.log('👥 Все пользователи в системе:', this.users);
        
        // Ищем пользователя
        let foundUser = null;
        
        for (let user of this.users) {
            console.log(`\n🔍 Проверяем пользователя: ${user.username} (${user.email})`);
            console.log(`   📧 Хранимый пароль: "${user.password}"`);
            console.log(`   🔑 Введенный пароль: "${passwordInput}"`);
            
            const isEmailMatch = user.email === loginInput;
            const isUsernameMatch = user.username === loginInput;
            const isPasswordMatch = user.password === passwordInput; // Прямое сравнение
            
            console.log(`   📧 Email совпадает: ${isEmailMatch}`);
            console.log(`   👤 Username совпадает: ${isUsernameMatch}`);
            console.log(`   🔑 Пароль совпадает: ${isPasswordMatch}`);
            
            if ((isEmailMatch || isUsernameMatch) && isPasswordMatch) {
                foundUser = user;
                console.log('✅ ПОЛЬЗОВАТЕЛЬ НАЙДЕН! Роль:', user.role);
                break;
            }
        }
        
        if (foundUser) {
            console.log('🎉 ВХОД УСПЕШЕН! Пользователь:', foundUser.username);
            this.currentUser = foundUser;
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            
            // Обновляем UI
            this.updateUI();
            
            return { 
                success: true, 
                message: `Вход успешен! Добро пожаловать, ${foundUser.username}!`, 
                user: foundUser 
            };
        } else {
            console.log('❌ ВХОД НЕ УДАЛСЯ: Пользователь не найден или неверный пароль');
            return { 
                success: false, 
                message: 'Неверный email/имя пользователя или пароль' 
            };
        }
    }

    register(userData) {
        console.log('📝 === ПРОЦЕСС РЕГИСТРАЦИИ ===');
        
        // Проверяем, нет ли уже пользователя с таким email или username
        const existingUser = this.users.find(user => 
            user.email === userData.email || user.username === userData.username
        );
        
        if (existingUser) {
            return { 
                success: false, 
                message: 'Пользователь с таким email или именем уже существует' 
            };
        }
        
        // Создаем нового пользователя (пароль сохраняем как есть)
        const newUser = {
            id: Date.now(),
            username: userData.username,
            email: userData.email,
            password: userData.password, // Без хеширования
            role: 'user',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        console.log('✅ Новый пользователь зарегистрирован:', newUser);
        
        return { 
            success: true, 
            message: 'Регистрация успешна! Теперь вы можете войти.', 
            user: newUser 
        };
    }

    logout() {
        console.log('🚪 Выход из системы');
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        return { success: true, message: 'Вы вышли из системы' };
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    isAdmin() {
        if (!this.currentUser) {
            console.log('❌ isAdmin: Нет текущего пользователя');
            return false;
        }
        
        const isAdmin = this.currentUser.role === 'admin';
        console.log('🔧 Проверка прав администратора:', {
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
        console.log('🔄 ОБНОВЛЕНИЕ ИНТЕРФЕЙСА');
        console.log('Текущий пользователь:', this.currentUser);
        
        const isAuthenticated = this.isAuthenticated();
        const isAdminUser = this.isAdmin();
        
        console.log('🔐 Аутентифицирован:', isAuthenticated);
        console.log('👑 Администратор:', isAdminUser);
        
        // Обновляем навигацию
        this.updateNavigation();
        
        // Показываем/скрываем админ-панель
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        const adminPanel = document.getElementById('adminPanel');
        
        if (adminPanelBtn) {
            adminPanelBtn.style.display = isAdminUser ? 'block' : 'none';
            console.log('👨‍💼 Кнопка админа:', isAdminUser ? 'видна' : 'скрыта');
        }
        
        if (adminPanel) {
            adminPanel.style.display = isAdminUser ? 'block' : 'none';
            console.log('📊 Панель админа:', isAdminUser ? 'видна' : 'скрыта');
        }
        
        // Обновляем приветствие
        this.updateUserGreeting();
    }

    updateNavigation() {
        const guestMenu = document.querySelector('.menu-guest');
        const userMenu = document.querySelector('.menu-user');
        
        const isAuthenticated = this.isAuthenticated();
        
        if (guestMenu) guestMenu.style.display = isAuthenticated ? 'none' : 'block';
        if (userMenu) userMenu.style.display = isAuthenticated ? 'block' : 'none';
        
        console.log('🧭 Навигация обновлена. Аутентифицирован:', isAuthenticated);
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

    // Вспомогательные методы
    loadUsers() {
        try {
            const users = localStorage.getItem('users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            return [];
        }
    }

    saveUsers() {
        try {
            localStorage.setItem('users', JSON.stringify(this.users));
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
        }
    }

    loadCurrentUser() {
        try {
            const user = localStorage.getItem('currentUser');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Ошибка загрузки текущего пользователя:', error);
            return null;
        }
    }

    // Метод для отладки - принудительный вход как администратор
    debugLoginAsAdmin() {
        console.log('🔧 ПРИНУДИТЕЛЬНЫЙ ВХОД КАК АДМИНИСТРАТОР');
        
        const adminUser = {
            id: 1,
            username: 'admin',
            email: 'admin@perekuson.ru',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        // Добавляем администратора если его нет
        const existingAdmin = this.users.find(u => u.role === 'admin');
        if (!existingAdmin) {
            this.users.push(adminUser);
            this.saveUsers();
        }
        
        // Выполняем вход
        this.currentUser = adminUser;
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        this.updateUI();
        
        console.log('✅ Принудительный вход выполнен:', adminUser);
        return { success: true, user: adminUser };
    }
}

// Создаем глобальный экземпляр
const authSystem = new AuthSystem();
