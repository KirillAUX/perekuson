// Менеджер для страницы регистрации
class RegisterManager {
    constructor() {
        this.isInitialized = false;
        this.passwordStrength = 0;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.setupPasswordStrengthMeter();
            this.setupPasswordToggle();
            this.setupAutoFocus();
            this.isInitialized = true;
            console.log('RegisterManager инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации RegisterManager:', error);
            this.showMessage('Ошибка загрузки формы регистрации', 'error');
        }
    }

    setupEventListeners() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) {
            console.error('Форма регистрации не найдена');
            return;
        }

        // Обработка отправки формы
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Валидация в реальном времени
        this.setupRealTimeValidation();

        // Обработка клавиши Enter
        this.setupEnterKeyHandler();

        // Обработка согласия с условиями
        this.setupTermsHandler();
    }

    setupRealTimeValidation() {
        const inputs = {
            username: document.getElementById('username'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword'),
            phone: document.getElementById('phone')
        };

        Object.entries(inputs).forEach(([field, input]) => {
            if (input) {
                input.addEventListener('input', () => {
                    this.validateField(field, input.value);
                });
                
                input.addEventListener('blur', () => {
                    this.validateField(field, input.value, true);
                });
            }
        });
    }

    setupEnterKeyHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const focused = document.activeElement;
                if (focused && focused.form && focused.form.id === 'registerForm') {
                    e.preventDefault();
                    this.handleRegistration();
                }
            }
        });
    }

    setupPasswordStrengthMeter() {
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;

        // Создаем индикатор силы пароля
        const strengthMeter = document.createElement('div');
        strengthMeter.className = 'password-strength-meter';
        strengthMeter.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <div class="strength-text"></div>
        `;

        passwordInput.parentNode.appendChild(strengthMeter);

        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            this.updatePasswordStrength(password);
        });
    }

    updatePasswordStrength(password) {
        let strength = 0;
        const feedback = [];

        // Критерии силы пароля
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 15;
        if (/[a-z]/.test(password)) strength += 15;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

        this.passwordStrength = Math.min(strength, 100);
        this.updateStrengthVisual();
    }

    updateStrengthVisual() {
        const meter = document.querySelector('.password-strength-meter');
        if (!meter) return;

        const fill = meter.querySelector('.strength-fill');
        const text = meter.querySelector('.strength-text');

        let color, message;

        if (this.passwordStrength < 40) {
            color = '#dc3545';
            message = 'Слабый пароль';
        } else if (this.passwordStrength < 70) {
            color = '#ffc107';
            message = 'Средний пароль';
        } else {
            color = '#28a745';
            message = 'Сильный пароль';
        }

        fill.style.width = `${this.passwordStrength}%`;
        fill.style.background = color;
        text.textContent = message;
        text.style.color = color;
    }

    setupPasswordToggle() {
        const passwordInputs = [
            document.getElementById('password'),
            document.getElementById('confirmPassword')
        ];

        passwordInputs.forEach((input, index) => {
            if (!input) return;

            const toggleButton = document.createElement('button');
            toggleButton.type = 'button';
            toggleButton.innerHTML = '👁️';
            toggleButton.className = 'password-toggle';
            toggleButton.setAttribute('aria-label', 'Показать пароль');
            
            const inputContainer = input.parentNode;
            inputContainer.style.position = 'relative';
            inputContainer.appendChild(toggleButton);

            toggleButton.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                toggleButton.innerHTML = type === 'password' ? '👁️' : '👁️‍🗨️';
                toggleButton.setAttribute('aria-label', 
                    type === 'password' ? 'Показать пароль' : 'Скрыть пароль');
            });
        });
    }

    setupTermsHandler() {
        const termsCheckbox = document.createElement('input');
        termsCheckbox.type = 'checkbox';
        termsCheckbox.id = 'termsAgreement';
        termsCheckbox.name = 'termsAgreement';
        termsCheckbox.required = true;

        const termsLabel = document.createElement('label');
        termsLabel.htmlFor = 'termsAgreement';
        termsLabel.innerHTML = 'Я соглашаюсь с <a href="terms.html" target="_blank">условиями использования</a> и <a href="privacy.html" target="_blank">политикой конфиденциальности</a>';

        const termsGroup = document.createElement('div');
        termsGroup.className = 'form-group terms-group';
        termsGroup.appendChild(termsCheckbox);
        termsGroup.appendChild(termsLabel);

        // Вставляем перед кнопкой отправки
        const submitButton = document.querySelector('#registerForm .submit-btn');
        if (submitButton) {
            submitButton.parentNode.insertBefore(termsGroup, submitButton);
        }
    }

    setupAutoFocus() {
        // Автофокус на поле username если оно пустое
        const usernameInput = document.getElementById('username');
        if (usernameInput && !usernameInput.value.trim()) {
            setTimeout(() => {
                usernameInput.focus();
            }, 100);
        }
    }

    validateField(field, value, showErrors = false) {
        let isValid = true;
        let message = '';

        switch (field) {
            case 'username':
                isValid = this.validateUsername(value);
                if (!isValid && showErrors) {
                    message = 'Имя пользователя должно содержать 3-20 символов (только буквы, цифры и подчеркивания)';
                }
                break;

            case 'email':
                isValid = this.validateEmail(value);
                if (!isValid && showErrors) {
                    message = 'Введите корректный email адрес';
                }
                break;

            case 'password':
                isValid = this.validatePassword(value);
                if (!isValid && showErrors) {
                    message = 'Пароль должен содержать минимум 6 символов';
                }
                break;

            case 'confirmPassword':
                const password = document.getElementById('password').value;
                isValid = this.validateConfirmPassword(value, password);
                if (!isValid && showErrors) {
                    message = 'Пароли не совпадают';
                }
                break;

            case 'phone':
                isValid = this.validatePhone(value);
                if (!isValid && showErrors && value) {
                    message = 'Введите корректный номер телефона';
                }
                break;
        }

        this.updateFieldStatus(field, isValid, message, showErrors);
        return isValid;
    }

    validateUsername(username) {
        if (!username) return false;
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    validateEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        if (!password) return false;
        return password.length >= 6;
    }

    validateConfirmPassword(confirmPassword, password) {
        if (!confirmPassword) return false;
        return confirmPassword === password;
    }

    validatePhone(phone) {
        if (!phone) return true; // Телефон не обязателен
        const phoneRegex = /^[\+]?[7-8]?[0-9\s\-\+\(\)]{10,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    updateFieldStatus(field, isValid, message, showMessage) {
        const input = document.getElementById(field);
        const errorElement = document.getElementById(field + 'Error');

        if (isValid) {
            input.classList.remove('error');
            input.classList.add('valid');
            if (errorElement) errorElement.textContent = '';
        } else {
            input.classList.remove('valid');
            input.classList.add('error');
            if (errorElement && showMessage) {
                errorElement.textContent = message;
            }
        }
    }

    async handleRegistration() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        this.setFormLoading(true);

        try {
            // Имитация задержки сети для лучшего UX
            await this.simulateNetworkDelay();

            const result = authSystem.register(formData);

            if (result.success) {
                this.showMessage(result.message, 'success');
                this.logRegistrationSuccess(formData.email);
                
                // Автоматический вход после успешной регистрации
                setTimeout(() => {
                    const loginResult = authSystem.login({
                        loginEmail: formData.email,
                        loginPassword: formData.password
                    });
                    
                    if (loginResult.success) {
                        window.location.href = 'index.html';
                    } else {
                        this.showMessage('Регистрация успешна, но вход не удался', 'warning');
                        window.location.href = 'login.html';
                    }
                }, 2000);
            } else {
                this.showMessage(result.message, 'error');
                this.handleRegistrationFailed(formData.email);
            }
        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            this.showMessage('Произошла ошибка при регистрации', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }

    getFormData() {
        const termsCheckbox = document.getElementById('termsAgreement');
        
        return {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            phone: document.getElementById('phone').value.trim(),
            agreeToTerms: termsCheckbox ? termsCheckbox.checked : false
        };
    }

    validateForm(formData) {
        let isValid = true;

        // Проверка обязательных полей
        const requiredFields = ['username', 'email', 'password', 'confirmPassword'];
        requiredFields.forEach(field => {
            if (!formData[field]) {
                this.validateField(field, formData[field], true);
                isValid = false;
            }
        });

        // Проверка согласия с условиями
        if (!formData.agreeToTerms) {
            this.showMessage('Необходимо согласие с условиями использования', 'error');
            isValid = false;
        }

        // Проверка силы пароля
        if (this.passwordStrength < 40) {
            this.showMessage('Пароль слишком слабый. Используйте буквы в разных регистрах, цифры и специальные символы', 'warning');
            // Не блокируем регистрацию, но предупреждаем
        }

        if (!isValid) {
            this.showMessage('Исправьте ошибки в форме', 'error');
        }

        return isValid;
    }

    handleRegistrationFailed(email) {
        // Визуальная обратная связь при ошибке
        const form = document.getElementById('registerForm');
        form.classList.add('shake');
        
        setTimeout(() => {
            form.classList.remove('shake');
        }, 500);

        // Фокус на проблемное поле
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.focus();
        }
    }

    setFormLoading(isLoading) {
        const form = document.getElementById('registerForm');
        const submitButton = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, button');

        if (isLoading) {
            // Сохраняем оригинальный текст кнопки
            if (submitButton && !submitButton.dataset.originalText) {
                submitButton.dataset.originalText = submitButton.textContent;
            }

            // Показываем индикатор загрузки
            if (submitButton) {
                submitButton.innerHTML = '<div class="loading-spinner"></div> Регистрация...';
                submitButton.disabled = true;
            }

            // Блокируем все поля ввода
            inputs.forEach(input => {
                if (input.type !== 'submit') {
                    input.disabled = true;
                }
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

    logRegistrationSuccess(email) {
        console.log(`Успешная регистрация: ${email}`);
        // В реальном приложении здесь может быть отправка в analytics
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

// Создаем глобальный экземпляр менеджера регистрации
const registerManager = new RegisterManager();

// Глобальные функции для обратной совместимости
function validateRegistration(data) {
    return registerManager.validateForm(data);
}

function validateUsername() {
    const username = document.getElementById('username').value.trim();
    return registerManager.validateField('username', username, true);
}

function validateEmail() {
    const email = document.getElementById('email').value.trim();
    return registerManager.validateField('email', email, true);
}

function validatePassword() {
    const password = document.getElementById('password').value;
    return registerManager.validateField('password', password, true);
}

function validateConfirmPassword() {
    const confirmPassword = document.getElementById('confirmPassword').value;
    const password = document.getElementById('password').value;
    return registerManager.validateField('confirmPassword', confirmPassword, true);
}