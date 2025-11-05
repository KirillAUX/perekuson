// Функции для управления акциями
class AdminManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            this.setupEventListeners();
            this.setDefaultDates();
            this.loadPromotions();
            this.isInitialized = true;
            console.log('AdminManager инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации AdminManager:', error);
        }
    }

    setupEventListeners() {
        // Форма добавления акции
        const addPromotionForm = document.getElementById('addPromotionForm');
        if (addPromotionForm) {
            addPromotionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addPromotion();
            });
        }

        // Валидация дат в реальном времени
        this.setupDateValidation();

        // Обработчик для переключения админ-панели
        const adminPanelBtn = document.getElementById('adminPanelBtn');
        if (adminPanelBtn) {
            adminPanelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAdminPanel();
            });
        }
    }

    setupDateValidation() {
        const startDateInput = document.getElementById('promotionStartDate');
        const endDateInput = document.getElementById('promotionEndDate');

        if (startDateInput && endDateInput) {
            startDateInput.addEventListener('change', () => this.validateDates());
            endDateInput.addEventListener('change', () => this.validateDates());
        }
    }

    validateDates() {
        const startDateInput = document.getElementById('promotionStartDate');
        const endDateInput = document.getElementById('promotionEndDate');
        
        if (!startDateInput || !endDateInput) return;

        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (endDate < startDate) {
            this.showMessage('Дата окончания не может быть раньше даты начала', 'error');
            endDateInput.value = '';
        }
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const startDateInput = document.getElementById('promotionStartDate');
        const endDateInput = document.getElementById('promotionEndDate');
        
        if (startDateInput && !startDateInput.value) startDateInput.value = today;
        if (endDateInput && !endDateInput.value) endDateInput.value = nextWeek;
    }

    addPromotion() {
        // Проверяем авторизацию и права
        if (!authSystem || !authSystem.isAdmin()) {
            this.showMessage('Недостаточно прав для добавления акций', 'error');
            return;
        }

        const promotionData = this.getPromotionFormData();
        
        if (!promotionData) {
            return; // Валидация не прошла
        }

        try {
            const result = authSystem.addPromotion(promotionData);
            if (result.success) {
                this.showMessage(result.message, 'success');
                this.loadPromotions();
                this.clearPromotionForm();
                
                // Закрываем админ-панель после успешного добавления
                setTimeout(() => {
                    this.toggleAdminPanel(false);
                }, 1500);
            } else {
                this.showMessage(result.message, 'error');
            }
        } catch (error) {
            console.error('Ошибка при добавлении акции:', error);
            this.showMessage('Ошибка при добавлении акции', 'error');
        }
    }

    getPromotionFormData() {
        const title = document.getElementById('promotionTitle')?.value.trim();
        const description = document.getElementById('promotionDescription')?.value.trim();
        const image = document.getElementById('promotionImage')?.value.trim();
        const startDate = document.getElementById('promotionStartDate')?.value;
        const endDate = document.getElementById('promotionEndDate')?.value;

        // Валидация обязательных полей
        if (!title || !description || !startDate || !endDate) {
            this.showMessage('Заполните все обязательные поля', 'error');
            return null;
        }

        // Валидация дат
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (end < start) {
            this.showMessage('Дата окончания не может быть раньше даты начала', 'error');
            return null;
        }

        if (start < new Date()) {
            this.showMessage('Дата начала не может быть в прошлом', 'error');
            return null;
        }

        return {
            title: title,
            description: description,
            image: image || 'https://via.placeholder.com/300x200/4CAF50/white?text=🎉 Акция',
            startDate: startDate,
            endDate: endDate
        };
    }

    clearPromotionForm() {
        const form = document.getElementById('addPromotionForm');
        if (form) {
            form.reset();
            this.setDefaultDates();
        }
    }

    loadPromotions() {
        if (!authSystem) {
            console.warn('AuthSystem не доступен');
            return;
        }

        try {
            const promotions = authSystem.getPromotions();
            this.displayPromotions(promotions);
            this.displayAdminPromotionsList(promotions);
            this.updatePromotionsCounter(promotions);
        } catch (error) {
            console.error('Ошибка загрузки акций:', error);
            this.showMessage('Ошибка загрузки акций', 'error');
        }
    }

    displayPromotions(promotions) {
        const container = document.getElementById('promotionsContainer');
        if (!container) return;

        // Фильтруем активные акции (текущая дата между startDate и endDate)
        const currentDate = new Date();
        const activePromotions = promotions.filter(promotion => {
            const startDate = new Date(promotion.startDate);
            const endDate = new Date(promotion.endDate);
            return promotion.active && currentDate >= startDate && currentDate <= endDate;
        });

        if (activePromotions.length === 0) {
            container.innerHTML = `
                <div class="no-promotions">
                    <h3>🎉 Акции</h3>
                    <p>На данный момент активных акций нет</p>
                    <small>Добавьте новую акцию через панель администратора</small>
                </div>
            `;
            return;
        }

        container.innerHTML = activePromotions.map(promotion => `
            <div class="promotion-card" data-id="${promotion.id}">
                <div class="promotion-image">
                    <img src="${promotion.image}" alt="${promotion.title}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/300x200/4CAF50/white?text=🎉 Акция'">
                    ${this.getPromotionBadge(promotion)}
                </div>
                <div class="promotion-content">
                    <h3>${promotion.title}</h3>
                    <p>${promotion.description}</p>
                    <div class="promotion-dates">
                        <small>📅 Действует с ${this.formatDate(promotion.startDate)} по ${this.formatDate(promotion.endDate)}</small>
                    </div>
                    <div class="promotion-status">
                        ${this.getPromotionStatus(promotion)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayAdminPromotionsList(promotions) {
        const container = document.getElementById('promotionsList');
        if (!container) return;

        if (promotions.length === 0) {
            container.innerHTML = '<p class="no-data">Нет созданных акций</p>';
            return;
        }

        // Сортируем по дате создания (новые сверху)
        const sortedPromotions = promotions.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        container.innerHTML = sortedPromotions.map(promotion => `
            <div class="admin-promotion-item ${this.getPromotionRowClass(promotion)}">
                <div class="promotion-info">
                    <h4>${promotion.title}</h4>
                    <p>${promotion.description}</p>
                    <div class="promotion-meta">
                        <small>🆔 ID: ${promotion.id}</small>
                        <small>📅 Создана: ${this.formatDateTime(promotion.createdAt)}</small>
                        <small>${this.getPromotionStatusBadge(promotion)}</small>
                    </div>
                </div>
                <div class="promotion-actions">
                    <button class="btn-danger" onclick="adminManager.deletePromotion('${promotion.id}')"
                            title="Удалить акцию">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    getPromotionBadge(promotion) {
        const currentDate = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        
        if (currentDate < startDate) {
            return '<div class="promotion-badge upcoming">Скоро</div>';
        } else if (currentDate > endDate) {
            return '<div class="promotion-badge expired">Завершена</div>';
        }
        
        return '<div class="promotion-badge active">Активная</div>';
    }

    getPromotionStatus(promotion) {
        const currentDate = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        const daysLeft = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (currentDate < startDate) {
            const daysUntil = Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24));
            return `<span class="status-upcoming">Начнется через ${daysUntil} дней</span>`;
        } else if (currentDate > endDate) {
            return '<span class="status-expired">Акция завершена</span>';
        } else {
            return `<span class="status-active">Осталось ${daysLeft} дней</span>`;
        }
    }

    getPromotionStatusBadge(promotion) {
        const currentDate = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        
        if (currentDate < startDate) {
            return '⏳ Ожидает начала';
        } else if (currentDate > endDate) {
            return '❌ Завершена';
        } else {
            return '✅ Активная';
        }
    }

    getPromotionRowClass(promotion) {
        const currentDate = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        
        if (currentDate < startDate) {
            return 'upcoming';
        } else if (currentDate > endDate) {
            return 'expired';
        } else {
            return 'active';
        }
    }

    updatePromotionsCounter(promotions) {
        const counter = document.getElementById('promotionsCounter');
        if (counter) {
            const activePromotions = promotions.filter(p => {
                const currentDate = new Date();
                const startDate = new Date(p.startDate);
                const endDate = new Date(p.endDate);
                return p.active && currentDate >= startDate && currentDate <= endDate;
            }).length;
            
            counter.textContent = `Активных акций: ${activePromotions}`;
        }
    }

    deletePromotion(promotionId) {
        if (!authSystem || !authSystem.isAdmin()) {
            this.showMessage('Недостаточно прав для удаления акций', 'error');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить эту акцию? Это действие нельзя отменить.')) {
            try {
                const result = authSystem.deletePromotion(promotionId);
                if (result.success) {
                    this.showMessage(result.message, 'success');
                    this.loadPromotions();
                } else {
                    this.showMessage(result.message, 'error');
                }
            } catch (error) {
                console.error('Ошибка при удалении акции:', error);
                this.showMessage('Ошибка при удалении акции', 'error');
            }
        }
    }

    toggleAdminPanel(show) {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;

        const shouldShow = show !== undefined ? show : adminPanel.style.display === 'none';
        
        if (shouldShow) {
            adminPanel.style.display = 'block';
            this.loadPromotions(); // Обновляем данные при открытии
        } else {
            adminPanel.style.display = 'none';
        }
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return 'неизвестно';
        }
    }

    formatDateTime(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return 'неизвестно';
        }
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

    // Экспорт данных акций (для резервного копирования)
    exportPromotions() {
        if (!authSystem) return;
        
        const promotions = authSystem.getPromotions();
        const dataStr = JSON.stringify(promotions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `promotions-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showMessage('Данные акций экспортированы', 'success');
    }

    // Импорт данных акций
    importPromotions(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const promotions = JSON.parse(e.target.result);
                // Здесь должна быть логика импорта
                this.showMessage('Функция импорта в разработке', 'info');
            } catch (error) {
                this.showMessage('Ошибка чтения файла', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Создаем глобальный экземпляр менеджера администратора
const adminManager = new AdminManager();

// Глобальные функции для обратной совместимости
function toggleAdminPanel() {
    adminManager.toggleAdminPanel();
}