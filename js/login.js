document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // ПРАВИЛЬНЫЙ способ получения данных - используем элементы формы по name
        const formData = {
            loginEmail: this.elements['loginEmail'].value.trim(),
            loginPassword: this.elements['loginPassword'].value
        };
        
        console.log('Данные для входа:', formData);
        
        const result = authSystem.login(formData);
        
        if (result.success) {
            showMessage(result.message, 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage(result.message, 'error');
        }
    });
    
    // Заполняем поле email, если есть сохраненные данные
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe) {
        document.getElementById('loginEmail').value = rememberMe;
        document.getElementById('rememberMe').checked = true;
    }
    
    // Сохраняем email при выходе из поля, если отмечено "Запомнить меня"
    document.getElementById('loginEmail').addEventListener('blur', function() {
        if (document.getElementById('rememberMe').checked) {
            localStorage.setItem('rememberMe', this.value);
        }
    });
});
