document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            phone: document.getElementById('phone').value.trim()
        };
        
        // Валидация
        const validation = validateRegistration(formData);
        if (!validation.isValid) {
            showMessage(validation.message, 'error');
            return;
        }
        
        // Регистрация
        const result = authSystem.register(formData);
        if (result.success) {
            showMessage(result.message, 'success');
            // Автоматически входим после регистрации
            setTimeout(() => {
                authSystem.login({
                    loginEmail: formData.email,
                    loginPassword: formData.password
                });
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(result.message, 'error');
        }
    });
    
    // Валидация в реальном времени
    document.getElementById('username').addEventListener('blur', validateUsername);
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('password').addEventListener('blur', validatePassword);
    document.getElementById('confirmPassword').addEventListener('blur', validateConfirmPassword);
});

function validateRegistration(data) {
    if (data.password !== data.confirmPassword) {
        return { isValid: false, message: 'Пароли не совпадают' };
    }
    
    if (data.password.length < 6) {
        return { isValid: false, message: 'Пароль должен содержать минимум 6 символов' };
    }
    
    if (data.username.length < 3) {
        return { isValid: false, message: 'Имя пользователя должно содержать минимум 3 символа' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return { isValid: false, message: 'Введите корректный email' };
    }
    
    return { isValid: true };
}

function validateUsername() {
    const username = document.getElementById('username').value.trim();
    const errorElement = document.getElementById('usernameError');
    
    if (username.length < 3) {
        errorElement.textContent = 'Минимум 3 символа';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

function validateEmail() {
    const email = document.getElementById('email').value.trim();
    const errorElement = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        errorElement.textContent = 'Введите корректный email';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('passwordError');
    
    if (password.length < 6) {
        errorElement.textContent = 'Минимум 6 символов';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (password !== confirmPassword) {
        errorElement.textContent = 'Пароли не совпадают';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}