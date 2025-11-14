// Функции для управления акциями
class AdminManager {
    constructor() {
        this.currentFilter = {
            search: '',
            status: 'all'
        };
        console.log('AdminManager создан');
        this.init();
    }

    init() {
        console.log('AdminManager инициализация...');
        this.loadPromotions();
        this.setupEventListeners();
        console.log('AdminManager инициализирован');
    }

    setupEventListeners() {
        console.log('Настройка обработчиков событий...');
        
        // Форма добавления/редактирования акции
        const promotionForm = document.getElementById('promotionForm');
        if (promotionForm) {
            promotionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePromotionSubmit();
            });
            console.log('Обработчик формы настроен');
        }

        // Установка дат по умолчанию
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const startDateInput = document.getElementById('promotionStartDate');
        const endDateInput = document.getElementById('promotionEndDate');
        
        if (startDateInput && !startDateInput.value) startDateInput.value = today;
        if (endDateInput && !endDateInput.value) endDateInput.value = nextWeek;
        
        console.log('Даты по умолчанию установлены');
    }

    handlePromotionSubmit() {
        if (!authSystem.isAdmin()) {
            this.showMessage('Недостаточно прав для управления акциями', 'error');
            return;
        }

        const editingId = document.getElementById('editingPromotionId').value;
        
        if (editingId) {
            this.updatePromotion(editingId);
        } else {
            this.addPromotion();
        }
    }

    addPromotion() {
        console.log('Добавление новой акции...');
        
        const promotionData = {
            title: document.getElementById('promotionTitle').value.trim(),
            description: document.getElementById('promotionDescription').value.trim(),
            image: document.getElementById('promotionImage').value.trim() || this.getDefaultPromotionImage(),
            startDate: document.getElementById('promotionStartDate').value,
            endDate: document.getElementById('promotionEndDate').value,
            status: document.getElementById('promotionStatus').value || 'active'
        };

        console.log('Данные акции:', promotionData);

        // Валидация
        if (!this.validatePromotionData(promotionData)) {
            return;
        }

        const result = authSystem.addPromotion(promotionData);
        if (result.success) {
            this.showMessage(result.message, 'success');
            this.loadPromotions();
            this.clearPromotionForm();
            this.hidePromotionForm();
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    updatePromotion(promotionId) {
        console.log('Обновление акции:', promotionId);
        
        const promotionData = {
            title: document.getElementById('promotionTitle').value.trim(),
            description: document.getElementById('promotionDescription').value.trim(),
            image: document.getElementById('promotionImage').value.trim() || this.getDefaultPromotionImage(),
            startDate: document.getElementById('promotionStartDate').value,
            endDate: document.getElementById('promotionEndDate').value,
            status: document.getElementById('promotionStatus').value
        };

        // Валидация
        if (!this.validatePromotionData(promotionData)) {
            return;
        }

        const result = authSystem.updatePromotion(promotionId, promotionData);
        if (result.success) {
            this.showMessage(result.message, 'success');
            this.loadPromotions();
            this.clearPromotionForm();
            this.hidePromotionForm();
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    // Получение изображения по умолчанию
    getDefaultPromotionImage() {
        // Простой SVG без emoji
        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%234CAF50"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">АКЦИЯ</text></svg>';
    }

    // Получение миниатюры по умолчанию
    getDefaultThumbnail() {
        // Простой SVG без emoji
        return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="100%" height="100%" fill="%234CAF50"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy=".3em">АКЦ</text></svg>';
    }

    validatePromotionData(data) {
        if (!data.title || !data.description) {
            this.showMessage('Заполните все обязательные поля', 'error');
            return false;
        }

        if (data.startDate > data.endDate) {
            this.showMessage('Дата окончания не может быть раньше даты начала', 'error');
            return false;
        }

        const startDate = new Date(data.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today && data.status === 'scheduled') {
            this.showMessage('Запланированная акция не может начинаться в прошлом', 'error');
            return false;
        }

        return true;
    }

    clearPromotionForm() {
        const form = document.getElementById('promotionForm');
        if (form) form.reset();
        
        document.getElementById('editingPromotionId').value = '';
        document.getElementById('submitPromotionBtn').textContent = '🎉 Добавить акцию';
        this.setDefaultDates();
        
        console.log('Форма очищена');
    }

    hidePromotionForm() {
        const formContainer = document.getElementById('promotionFormContainer');
        const toggleBtn = document.getElementById('toggleFormBtn');
        
        if (formContainer) formContainer.style.display = 'none';
        if (toggleBtn) toggleBtn.textContent = '➕ Добавить акцию';
    }

    loadPromotions() {
        console.log('Загрузка акций...');
        
        let promotions = authSystem.getPromotions();
        console.log('Все акции:', promotions);
        
        // Применяем фильтры
        promotions = this.applyFilters(promotions);
        
        this.displayPromotionsList(promotions);
        this.displayPromotionsPreview(promotions);
        this.updatePromotionsCounter(promotions);
    }

    applyFilters(promotions) {
        const searchTerm = this.currentFilter.search.toLowerCase();
        const statusFilter = this.currentFilter.status;

        return promotions.filter(promotion => {
            const matchesSearch = promotion.title.toLowerCase().includes(searchTerm) ||
                                promotion.description.toLowerCase().includes(searchTerm);
            
            const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }

    displayPromotionsList(promotions) {
        const container = document.getElementById('promotionsList');
        if (!container) {
            console.error('Контейнер списка акций не найден');
            return;
        }

        console.log('Отображение списка акций:', promotions.length);

        if (promotions.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <p>${this.currentFilter.search || this.currentFilter.status !== 'all' ? 
                        'Акции по вашему запросу не найдены' : 
                        'Нет активных акций'}</p>
                    ${this.currentFilter.search || this.currentFilter.status !== 'all' ? 
                        '<button onclick="adminManager.clearFilters()" class="btn-secondary">Очистить фильтры</button>' : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = promotions.map(promotion => `
            <div class="admin-promotion-item ${promotion.status}">
                <div class="promotion-image-preview">
                    <img src="${promotion.image}" alt="${promotion.title}" 
                         onerror="this.src='${this.getDefaultThumbnail()}'">
                </div>
                <div class="promotion-info">
                    <h4>${promotion.title}</h4>
                    <p>${promotion.description}</p>
                    <div class="promotion-meta">
                        <span class="promotion-id">ID: ${promotion.id}</span>
                        <span class="promotion-dates">${this.formatDate(promotion.startDate)} - ${this.formatDate(promotion.endDate)}</span>
                        <span class="promotion-status ${promotion.status}">${this.getStatusText(promotion.status)}</span>
                        <span class="promotion-created">Создана: ${this.formatDateTime(promotion.createdAt)}</span>
                    </div>
                </div>
                <div class="promotion-actions">
                    <button class="btn-warning" onclick="editPromotion('${promotion.id}')" 
                            title="Редактировать">
                        ✏️ Редактировать
                    </button>
                    <button class="btn-danger" onclick="adminManager.deletePromotion('${promotion.id}')" 
                            title="Удалить">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayPromotionsPreview(promotions) {
        const container = document.getElementById('promotionsPreview');
        if (!container) return;

        // Показываем только активные акции в превью
        const activePromotions = promotions.filter(p => p.status === 'active');

        if (activePromotions.length === 0) {
            container.innerHTML = '<p class="no-promotions">Нет активных акций для отображения</p>';
            return;
        }

        container.innerHTML = activePromotions.map(promotion => `
            <div class="promotion-card" data-id="${promotion.id}">
                <div class="promotion-image">
                    <img src="${promotion.image}" alt="${promotion.title}" 
                         onerror="this.src='${this.getDefaultPromotionImage()}'">
                </div>
                <div class="promotion-content">
                    <h3>${promotion.title}</h3>
                    <p>${promotion.description}</p>
                    <div class="promotion-dates">
                        <small>Действует с ${this.formatDate(promotion.startDate)} по ${this.formatDate(promotion.endDate)}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    editPromotion(promotionId) {
        console.log('Редактирование акции:', promotionId);
        
        const promotions = authSystem.getPromotions();
        const promotion = promotions.find(p => p.id === promotionId);
        
        if (!promotion) {
            this.showMessage('Акция не найдена', 'error');
            return;
        }

        // Заполнение формы данными
        document.getElementById('editingPromotionId').value = promotion.id;
        document.getElementById('promotionTitle').value = promotion.title;
        document.getElementById('promotionDescription').value = promotion.description;
        document.getElementById('promotionImage').value = promotion.image;
        document.getElementById('promotionStartDate').value = promotion.startDate;
        document.getElementById('promotionEndDate').value = promotion.endDate;
        document.getElementById('promotionStatus').value = promotion.status || 'active';
        
        // Обновление кнопки
        document.getElementById('submitPromotionBtn').textContent = '💾 Сохранить изменения';
        
        // Показ формы
        document.getElementById('promotionFormContainer').style.display = 'block';
        document.getElementById('toggleFormBtn').textContent = '👁️ Скрыть форму';
        
        // Прокрутка к форме
        document.getElementById('promotionFormContainer').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    cancelEditing() {
        // Сброс формы
        this.clearPromotionForm();
    }

    deletePromotion(promotionId) {
        if (!authSystem.isAdmin()) {
            this.showMessage('Недостаточно прав для удаления акций', 'error');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить эту акцию?')) {
            const result = authSystem.deletePromotion(promotionId);
            if (result.success) {
                this.showMessage(result.message, 'success');
                this.loadPromotions();
            } else {
                this.showMessage(result.message, 'error');
            }
        }
    }

    updatePromotionsCounter(promotions) {
        const counter = document.getElementById('activePromotionsCount');
        if (counter) {
            const activeCount = promotions.filter(p => p.status === 'active').length;
            counter.textContent = activeCount;
        }
    }

    clearFilters() {
        this.currentFilter = {
            search: '',
            status: 'all'
        };
        
        document.getElementById('promotionSearch').value = '';
        document.getElementById('statusFilter').value = 'all';
        
        this.loadPromotions();
    }

    filterPromotions() {
        const searchTerm = document.getElementById('promotionSearch').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        this.currentFilter = {
            search: searchTerm,
            status: statusFilter
        };
        
        this.loadPromotions();
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Активная',
            'inactive': 'Неактивная',
            'scheduled': 'Запланированная'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            return dateString;
        }
    }

    formatDateTime(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU');
        } catch (e) {
            return dateString;
        }
    }

    showMessage(message, type = 'success') {
        // Используем функцию из admin.html
        if (typeof showAdminMessage === 'function') {
            showAdminMessage(message, type);
        } else {
            // Fallback
            console.log(`${type}: ${message}`);
            alert(`${type === 'error' ? '❌' : '✅'} ${message}`);
        }
    }
}

// Создаем глобальный экземпляр менеджера администратора
console.log('Создание adminManager...');
const adminManager = new AdminManager();
console.log('adminManager создан:', typeof adminManager);
