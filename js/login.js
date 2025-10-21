document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            loginEmail: document.getElementById('loginEmail').value.trim(),
            loginPassword: document.getElementById('loginPassword').value
        };
        
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