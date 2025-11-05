// login.js - ПРОСТАЯ И РАБОЧАЯ ВЕРСИЯ
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔄 Инициализация LoginManager...');
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.restoreSavedData();
        this.setupAutoFocus();
        console.log('✅ LoginManager готов');
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        
        if (!loginForm) {
            console.error('❌ Форма входа не найдена!');
            return;
        }

        // Обработка отправки формы
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Валидация при потере фокуса
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => this.validateEmail(emailInput));
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', () => this.validatePassword(passwordInput));
        }
    }

    setupPasswordToggle() {
        const passwordInput = document.getElementById('loginPassword');
        if (!passwordInput) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.className = 'password-toggle';
        toggleBtn.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 5px;
        `;

        const container = passwordInput.parentNode;
        container.style.position = 'relative';
        container.appendChild(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            toggleBtn.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    restoreSavedData() {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');

        if (savedEmail && emailInput) {
            emailInput.value = savedEmail;
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    }

    setupAutoFocus() {
        const emailInput = document.getElementById('loginEmail');
        if (emailInput && !emailInput.value) {
            setTimeout(() => emailInput.focus(), 100);
        }
    }

    validateEmail(input) {
        const value = input.value.trim();
        this.clearError(input);

        if (!value) {
            this.showError(input, 'Email обязателен');
            return false;
        }

        if (!this.isValidEmail(value)) {
            this.showError(input, 'Введите корректный email');
            return false;
        }

        return true;
    }

    validatePassword(input) {
        const value = input.value;
        this.clearError(input);

        if (!value) {
            this.showError(input, 'Пароль обязателен');
            return false;
        }

        if (value.length < 6) {
            this.showError(input, 'Пароль должен быть не менее 6 символов');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showError(input, message) {
        input.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
        `;
        
        input.parentNode.appendChild(errorDiv);
    }

    clearError(input) {
        input.classList.remove('error');
        const errorMsg = input.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    async handleLogin() {
        console.log('🔐 Обработка входа...');
        
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        this.setLoading(true);

        try {
            // Имитация задержки сети
            await new Promise(resolve => setTimeout(resolve, 500));

            const result = authSystem.login({
                loginEmail: formData.email,
                loginPassword: formData.password
            });

            if (result.success) {
                this.showMessage(result.message, 'success');
                
                // Сохраняем email если отмечено "Запомнить меня"
                if (formData.rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                
                // Переход на главную через 1 секунду
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } else {
                this.showMessage(result.message, 'error');
                this.handleLoginError();
            }

        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            this.showMessage('Произошла ошибка при входе', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    getFormData() {
        return {
            email: document.getElementById('loginEmail').value.trim(),
            password: document.getElementById('loginPassword').value,
            rememberMe: document.getElementById('rememberMe')?.checked || false
        };
    }

    validateForm(formData) {
        const emailValid = this.validateEmail(document.getElementById('loginEmail'));
        const passwordValid = this.validatePassword(document.getElementById('loginPassword'));
        
        return emailValid && passwordValid;
    }

    handleLoginError() {
        // Анимация ошибки
        const form = document.getElementById('loginForm');
        form.classList.add('error-shake');
        setTimeout(() => form.classList.remove('error-shake'), 500);

        // Фокус на пароле
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.select();
        }
    }

    setLoading(loading) {
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        
        if (submitBtn) {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Вход...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Войти';
            }
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('message');
        
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            
            // Автоскрытие через 5 секунд
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        } else {
            // Fallback
            alert(message);
        }
    }
}

// Демо-функции для быстрого тестирования
function fillDemoAccount(type) {
    const accounts = {
        admin: {
            email: 'admin@perekuson.ru',
            password: 'admin123'
        },
        user: {
            email: 'user@example.com',
            password: 'password123'
        }
    };
    
    const account = accounts[type];
    if (account) {
        document.getElementById('loginEmail').value = account.email;
        document.getElementById('loginPassword').value = account.password;
        
        // Показываем сообщение
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = `Заполнен демо-аккаунт: ${type}`;
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
        }
        
        console.log(`🎯 Заполнен ${type} аккаунт`);
        
        // Автоматический вход через 1 секунду
        setTimeout(() => {
            loginManager.handleLogin();
        }, 1000);
    }
}

// Создаем экземпляр менеджера
const loginManager = new LoginManager();

// Глобальные функции для HTML
window.fillDemoAccount = fillDemoAccount;
