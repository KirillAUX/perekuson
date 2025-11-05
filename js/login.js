// login.js - УПРОЩЕННАЯ ВЕРСИЯ
class LoginManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.restoreSavedData();
            this.setupPasswordToggle();
            this.setupAutoFocus();
            this.isInitialized = true;
            console.log('✅ LoginManager инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации LoginManager:', error);
            this.showMessage('Ошибка загрузки формы входа', 'error');
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) {
            console.error('❌ Форма входа не найдена');
            return;
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Простая валидация в реальном времени
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmailField(emailInput);
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('blur', () => {
                this.validatePasswordField(passwordInput);
            });
        }
    }

    validateEmailField(input) {
        const value = input.value.trim();
        if (!value) {
            this.showFieldError(input, 'Email обязателен для заполнения');
            return false;
        }
        if (!this.isValidEmail(value)) {
            this.showFieldError(input, 'Введите корректный email адрес');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    validatePasswordField(input) {
        const value = input.value;
        if (!value) {
            this.showFieldError(input, 'Пароль обязателен для заполнения');
            return false;
        }
        if (value.length < 6) {
            this.showFieldError(input, 'Пароль должен содержать минимум 6 символов');
            return false;
        }
        this.clearFieldError(input);
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(input, message) {
        this.clearFieldError(input);
        input.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 14px;
            margin-top: 5px;
        `;
        
        input.parentNode.appendChild(errorElement);
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    setupPasswordToggle() {
        const passwordInput = document.getElementById('loginPassword');
        if (!passwordInput) return;

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.innerHTML = '👁️';
        toggleButton.className = 'password-toggle';
        toggleButton.style.cssText = `
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

        const inputContainer = passwordInput.parentNode;
        inputContainer.style.position = 'relative';
        inputContainer.appendChild(toggleButton);

        toggleButton.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            toggleButton.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    setupAutoFocus() {
        const emailInput = document.getElementById('loginEmail');
        if (emailInput && !emailInput.value.trim()) {
            setTimeout(() => emailInput.focus(), 100);
        }
    }

    restoreSavedData() {
        const rememberedEmail = localStorage.getItem('rememberMe');
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');

        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    }

    async handleLogin() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        this.setFormLoading(true);

        try {
            // Минимальная задержка для UX
            await new Promise(resolve => setTimeout(resolve, 500));

            // ПРОСТОЙ ВХОД БЕЗ ХЕШИРОВАНИЯ
            const result = authSystem.login({
                loginEmail: formData.email,
                loginPassword: formData.password
            });

            if (result.success) {
                this.showMessage(result.message, 'success');
                console.log('🎉 Успешный вход! Пользователь:', result.user);
                
                // Перенаправление после успешного входа
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                this.showMessage(result.message, 'error');
                this.handleFailedLogin();
            }
        } catch (error) {
            console.error('❌ Ошибка при входе:', error);
            this.showMessage('Произошла ошибка при входе', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }

    getFormData() {
        return {
            email: document.getElementById('loginEmail').value.trim(),
            password: document.getElementById('loginPassword').value,
            rememberMe: document.getElementById('rememberMe').checked
        };
    }

    validateForm(formData) {
        let isValid = true;

        if (!this.validateEmailField(document.getElementById('loginEmail'))) {
            isValid = false;
        }

        if (!this.validatePasswordField(document.getElementById('loginPassword'))) {
            isValid = false;
        }

        if (!isValid) {
            this.showMessage('Исправьте ошибки в форме', 'error');
        }

        return isValid;
    }

    handleFailedLogin() {
        // Простая анимация ошибки
        const form = document.getElementById('loginForm');
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);

        // Фокус на поле пароля
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.select();
        }
    }

    setFormLoading(isLoading) {
        const form = document.getElementById('loginForm');
        const submitButton = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, button');

        if (isLoading) {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Вход...';
            }
            inputs.forEach(input => {
                if (input !== submitButton) input.disabled = true;
            });
        } else {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Войти';
            }
            inputs.forEach(input => {
                input.disabled = false;
            });
        }
    }

    showMessage(message, type = 'success') {
        // Простой показ сообщений
        const messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `message ${type}`;
            messageElement.style.display = 'block';
            
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }
}

// Создаем глобальный экземпляр
const loginManager = new LoginManager();
