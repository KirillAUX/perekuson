// login.js - УЛЬТРА-ПРОСТАЯ ВЕРСИЯ
console.log('🔧 Загрузка login.js...');

window.loginManager = {
    init: function() {
        console.log('🔄 Инициализация loginManager...');
        this.setupEventListeners();
        this.addDemoButtons();
        console.log('✅ loginManager готов');
    },

    setupEventListeners: function() {
        const form = document.getElementById('loginForm');
        if (!form) {
            console.error('❌ Форма не найдена!');
            return;
        }
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    },

    addDemoButtons: function() {
        const form = document.getElementById('loginForm');
        if (!form) return;
        
        const demoHTML = `
            <div style="margin: 20px 0; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 2px solid #007bff;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #007bff;">🎯 ДЕМО-АККАУНТЫ (нажмите для автоматического входа):</p>
                <button type="button" onclick="loginManager.demoLogin('admin')" style="padding: 10px 15px; margin: 5px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    🔧 АДМИНИСТРАТОР (admin@perekuson.ru / admin123)
                </button>
                <button type="button" onclick="loginManager.demoLogin('user')" style="padding: 10px 15px; margin: 5px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    👤 ПОЛЬЗОВАТЕЛЬ (user@example.com / password123)
                </button>
            </div>
        `;
        
        form.insertAdjacentHTML('afterbegin', demoHTML);
    },

    demoLogin: function(type) {
        console.log('🎯 Демо-вход как:', type);
        
        const accounts = {
            admin: { email: 'admin@perekuson.ru', password: 'admin123' },
            user: { email: 'user@example.com', password: 'password123' }
        };
        
        const account = accounts[type];
        if (!account) return;
        
        // Заполняем форму
        document.getElementById('loginEmail').value = account.email;
        document.getElementById('loginPassword').value = account.password;
        
        // Показываем сообщение
        this.showMessage(`Демо-вход как: ${type}`, 'success');
        
        // Выполняем вход
        setTimeout(() => {
            this.handleLogin();
        }, 500);
    },

    handleLogin: function() {
        console.log('🔐 Обработка входа...');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        console.log('Введенные данные:', { email, password });
        
        if (!email || !password) {
            this.showMessage('Заполните все поля', 'error');
            return;
        }
        
        this.setLoading(true);
        
        // Минимальная задержка
        setTimeout(() => {
            const result = authSystem.login({
                loginEmail: email,
                loginPassword: password
            });
            
            if (result.success) {
                this.showMessage('✅ Вход успешен! Переход на главную...', 'success');
                console.log('🎉 УСПЕШНЫЙ ВХОД! Пользователь:', result.user);
                
                // Переход на главную
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showMessage('❌ Ошибка входа: ' + result.message, 'error');
            }
            
            this.setLoading(false);
        }, 500);
    },

    setLoading: function(loading) {
        const btn = document.querySelector('#loginForm button[type="submit"]');
        if (btn) {
            btn.disabled = loading;
            btn.textContent = loading ? 'Вход...' : 'Войти';
        }
    },

    showMessage: function(message, type) {
        console.log('📢 Сообщение:', message);
        
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }
};

// Инициализируем
loginManager.init();
