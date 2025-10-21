// Система управления пользователями
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.promotions = JSON.parse(localStorage.getItem('promotions')) || [];
        this.init();
    }

    init() {
        // Создаем администратора по умолчанию, если его нет
        this.createDefaultAdmin();
        this.updateUI();
    }

    // Создание администратора по умолчанию
    createDefaultAdmin() {
        const adminExists = this.users.find(user => user.role === 'admin');
        if (!adminExists) {
            const defaultAdmin = {
                id: '1',
                username: 'admin',
                email: 'admin@perekuson.ru',
                password: 'admin123', // В реальном приложении нужно хэшировать!
                role: 'admin',
                createdAt: new Date().toISOString(),
                phone: '+7 (999) 000-00-00'
            };
            this.users.push(defaultAdmin);
            this.saveUsers();
            console.log('Создан администратор по умолчанию: admin / admin123');
        }
    }

    // Регистрация нового пользователя
    register(userData) {
        // Проверяем, нет ли уже пользователя с таким email или username
        const existingUser = this.users.find(user => 
            user.email === userData.email || user.username === userData.username
        );

        if (existingUser) {
            return { success: false, message: 'Пользователь с таким email или именем уже существует' };
        }

        // Создаем нового пользователя
        const newUser = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || '',
            role: 'user', // По умолчанию обычный пользователь
            createdAt: new Date().toISOString(),
            orders: []
        };

        this.users.push(newUser);
        this.saveUsers();

        return { success: true, message: 'Регистрация успешна!', user: newUser };
    }

    // Вход пользователя
    login(loginData) {
        const user = this.users.find(user => 
            (user.email === loginData.loginEmail || user.username === loginData.loginEmail) && 
            user.password === loginData.loginPassword
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateUI();
            return { success: true, message: 'Вход успешен!', user: user };
        } else {
            return { success: false, message: 'Неверный email/имя пользователя или пароль' };
        }
    }

    // Выход пользователя
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        return { success: true, message: 'Выход выполнен' };
    }

    // Проверка является ли пользователь администратором
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Управление акциями
    addPromotion(promotionData) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Недостаточно прав' };
        }

        const newPromotion = {
            id: Date.now().toString(),
            title: promotionData.title,
            description: promotionData.description,
            image: promotionData.image,
            startDate: promotionData.startDate,
            endDate: promotionData.endDate,
            active: true,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };

        this.promotions.push(newPromotion);
        this.savePromotions();

        return { success: true, message: 'Акция добавлена', promotion: newPromotion };
    }

    // Удаление акции
    deletePromotion(promotionId) {
        if (!this.isAdmin()) {
            return { success: false, message: 'Недостаточно прав' };
        }

        const promotionIndex = this.promotions.findIndex(p => p.id === promotionId);
        if (promotionIndex === -1) {
            return { success: false, message: 'Акция не найдена' };
        }

        this.promotions.splice(promotionIndex, 1);
        this.savePromotions();

        return { success: true, message: 'Акция удалена' };
    }

    // Получение всех акций
    getPromotions() {
        return this.promotions.filter(promotion => promotion.active);
    }

    // Сохранение пользователей в localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Сохранение акций в localStorage
    savePromotions() {
        localStorage.setItem('promotions', JSON.stringify(this.promotions));
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
                }
                statusElement.textContent = statusText;
                statusElement.classList.add('authenticated');
            }
            
            if (authStatus) {
                authStatus.classList.add('authenticated');
                if (this.isAdmin()) {
                    authStatus.style.borderLeftColor = '#dc3545';
                }
            }

            // Показываем кнопку админ-панели для администраторов
            if (adminPanelBtn && this.isAdmin()) {
                adminPanelBtn.style.display = 'block';
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
            }
            
            if (authStatus) {
                authStatus.classList.remove('authenticated');
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
}

// Создаем глобальный экземпляр системы авторизации
const authSystem = new AuthSystem();

// Глобальные функции для использования в HTML
function logout() {
    authSystem.logout();
    window.location.href = 'index.html';
}

function showMessage(message, type = 'success') {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        // Автоматически скрываем сообщение через 5 секунд
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
}

// Функция для показа/скрытия админ-панели
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
    }
}