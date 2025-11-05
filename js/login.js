// Менеджер для страницы входа
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
            console.log('LoginManager инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации LoginManager:', error);
            this.showMessage('Ошибка загрузки формы входа', 'error');
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) {
            console.error('Форма входа не найдена');
            return;
        }

        // Обработка отправки формы
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Валидация в реальном времени
        this.setupRealTimeValidation();

        // Обработка клавиши Enter
        this.setupEnterKeyHandler();

        // Обработка "Запомнить меня"
        this.setupRememberMeHandler();

        // Обработка "Забыли пароль?"
        this.setupForgotPasswordHandler();
    }

    setupRealTimeValidation() {
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');

        if (emailInput) {
            emailInput.addEventListener('input', () => {
                this.validateEmailField(emailInput);
            });
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.validatePasswordField(passwordInput);
            });
        }
    }

    validateEmailField(input) {
        const value = input.value.trim();
        const errorElement = this.getErrorElement(input);

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
        const errorElement = this.getErrorElement(input);

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

    getErrorElement(input) {
        return input.parentNode.querySelector('.field-error');
    }

    setupEnterKeyHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const focused = document.activeElement;
                if (focused && focused.form && focused.form.id === 'loginForm') {
                    e.preventDefault();
                    this.handleLogin();
                }
            }
        });
    }

    setupRememberMeHandler() {
        const rememberCheckbox = document.getElementById('rememberMe');
        const emailInput = document.getElementById('loginEmail');

        if (rememberCheckbox && emailInput) {
            rememberCheckbox.addEventListener('change', () => {
                if (rememberCheckbox.checked && emailInput.value.trim()) {
                    localStorage.setItem('rememberMe', emailInput.value.trim());
                } else {
                    localStorage.removeItem('rememberMe');
                }
            });
        }
    }

    setupForgotPasswordHandler() {
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    setupPasswordToggle() {
        const passwordInput = document.getElementById('loginPassword');
        const toggleButton = document.createElement('button');
        
        if (!passwordInput) return;

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
        // Автофокус на поле email если оно пустое
        const emailInput = document.getElementById('loginEmail');
        if (emailInput && !emailInput.value.trim()) {
            setTimeout(() => {
                emailInput.focus();
            }, 100);
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
            
            // Автофокус на пароль если email уже заполнен
            const passwordInput = document.getElementById('loginPassword');
            if (passwordInput) {
                setTimeout(() => {
                    passwordInput.focus();
                }, 100);
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
            // Имитация задержки сети для лучшего UX
            await this.simulateNetworkDelay();

            const result = authSystem.login({
                loginEmail: formData.email,
                loginPassword: formData.password,
                rememberMe: formData.rememberMe
            });

            if (result.success) {
                this.showMessage(result.message, 'success');
                this.logLoginSuccess(formData.email);
                
                // Перенаправление после успешного входа
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.showMessage(result.message, 'error');
                this.logLoginFailed(formData.email);
                this.handleFailedLogin();
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
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

        // Валидация email
        if (!formData.email) {
            this.showFieldError(document.getElementById('loginEmail'), 'Email обязателен для заполнения');
            isValid = false;
        } else if (!this.isValidEmail(formData.email)) {
            this.showFieldError(document.getElementById('loginEmail'), 'Введите корректный email адрес');
            isValid = false;
        }

        // Валидация пароля
        if (!formData.password) {
            this.showFieldError(document.getElementById('loginPassword'), 'Пароль обязателен для заполнения');
            isValid = false;
        } else if (formData.password.length < 6) {
            this.showFieldError(document.getElementById('loginPassword'), 'Пароль должен содержать минимум 6 символов');
            isValid = false;
        }

        if (!isValid) {
            this.showMessage('Исправьте ошибки в форме', 'error');
        }

        return isValid;
    }

    handleFailedLogin() {
        // Добавляем вибрацию для неправильного ввода (только на поддерживаемых устройствах)
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }

        // Добавляем класс ошибки к форме
        const form = document.getElementById('loginForm');
        form.classList.add('shake');
        
        setTimeout(() => {
            form.classList.remove('shake');
        }, 500);

        // Фокус на поле пароля для повторного ввода
        const passwordInput = document.getElementById('loginPassword');
        if (passwordInput) {
            passwordInput.focus();
            passwordInput.select();
        }
    }

    handleForgotPassword() {
        const email = document.getElementById('loginEmail').value.trim();
        let emailToRecover = email;

        if (!emailToRecover || !this.isValidEmail(emailToRecover)) {
            emailToRecover = prompt('Введите ваш email для восстановления пароля:');
            
            if (!emailToRecover || !this.isValidEmail(emailToRecover)) {
                this.showMessage('Введите корректный email адрес', 'error');
                return;
            }
        }

        // В реальном приложении здесь был бы запрос к API
        this.showMessage(`Инструкции по восстановлению пароля отправлены на ${emailToRecover}`, 'info');
        console.log('Запрос на восстановление пароля для:', emailToRecover);
    }

    setFormLoading(isLoading) {
        const form = document.getElementById('loginForm');
        const submitButton = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, button');

        if (isLoading) {
            // Сохраняем оригинальный текст кнопки
            if (submitButton && !submitButton.dataset.originalText) {
                submitButton.dataset.originalText = submitButton.textContent;
            }

            // Показываем индикатор загрузки
            if (submitButton) {
                submitButton.innerHTML = '<div class="loading-spinner"></div> Вход...';
                submitButton.disabled = true;
            }

            // Блокируем все поля ввода
            inputs.forEach(input => {
                input.disabled = true;
            });

            form.classList.add('loading');
        } else {
            // Восстанавливаем форму
            if (submitButton && submitButton.dataset.originalText) {
                submitButton.textContent = submitButton.dataset.originalText;
                submitButton.disabled = false;
            }

            inputs.forEach(input => {
                input.disabled = false;
            });

            form.classList.remove('loading');
        }
    }

    async simulateNetworkDelay() {
        // Имитация задержки сети для реалистичности
        const delay = Math.random() * 1000 + 500; // 500-1500ms
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    logLoginSuccess(email) {
        console.log(`Успешный вход: ${email}`);
        // В реальном приложении здесь может быть отправка в analytics
    }

    logLoginFailed(email) {
        console.warn(`Неудачная попытка входа: ${email}`);
        // В реальном приложении здесь может быть логирование для безопасности
    }

    showMessage(message, type = 'success') {
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            // Fallback
            const alertType = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
            alert(`${alertType} ${message}`);
        }
    }
}

// Создаем глобальный экземпляр менеджера входа
const loginManager = new LoginManager();

// Глобальные функции для обратной совместимости
function handleLogin() {
    loginManager.handleLogin();
}