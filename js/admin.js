// Функции для управления акциями
class AdminManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadPromotions();
        this.setupEventListeners();
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

        // Установка дат по умолчанию
        this.setDefaultDates();
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const startDateInput = document.getElementById('promotionStartDate');
        const endDateInput = document.getElementById('promotionEndDate');
        
        if (startDateInput) startDateInput.value = today;
        if (endDateInput) endDateInput.value = nextWeek;
    }

    addPromotion() {
        if (!authSystem.isAdmin()) {
            showMessage('Недостаточно прав для добавления акций', 'error');
            return;
        }

        const promotionData = {
            title: document.getElementById('promotionTitle').value.trim(),
            description: document.getElementById('promotionDescription').value.trim(),
            image: document.getElementById('promotionImage').value.trim() || 'https://via.placeholder.com/300x200/4CAF50/white?text=Акция',
            startDate: document.getElementById('promotionStartDate').value,
            endDate: document.getElementById('promotionEndDate').value
        };

        // Валидация
        if (!promotionData.title || !promotionData.description) {
            showMessage('Заполните все обязательные поля', 'error');
            return;
        }

        const result = authSystem.addPromotion(promotionData);
        if (result.success) {
            showMessage(result.message, 'success');
            this.loadPromotions();
            this.clearPromotionForm();
        } else {
            showMessage(result.message, 'error');
        }
    }

    clearPromotionForm() {
        document.getElementById('addPromotionForm').reset();
        this.setDefaultDates();
    }

    loadPromotions() {
        const promotions = authSystem.getPromotions();
        this.displayPromotions(promotions);
        this.displayAdminPromotionsList(promotions);
    }

    displayPromotions(promotions) {
        const container = document.getElementById('promotionsContainer');
        if (!container) return;

        if (promotions.length === 0) {
            container.innerHTML = '<p class="no-promotions">На данный момент акций нет</p>';
            return;
        }

        container.innerHTML = promotions.map(promotion => `
            <div class="promotion-card" data-id="${promotion.id}">
                <div class="promotion-image">
                    <img src="${promotion.image}" alt="${promotion.title}" onerror="this.src='https://via.placeholder.com/300x200/4CAF50/white?text=Акция'">
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

    displayAdminPromotionsList(promotions) {
        const container = document.getElementById('promotionsList');
        if (!container) return;

        if (promotions.length === 0) {
            container.innerHTML = '<p>Нет активных акций</p>';
            return;
        }

        container.innerHTML = promotions.map(promotion => `
            <div class="admin-promotion-item">
                <div class="promotion-info">
                    <h4>${promotion.title}</h4>
                    <p>${promotion.description}</p>
                    <small>ID: ${promotion.id} | Создана: ${this.formatDate(promotion.createdAt)}</small>
                </div>
                <div class="promotion-actions">
                    <button class="btn-danger" onclick="adminManager.deletePromotion('${promotion.id}')">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    deletePromotion(promotionId) {
        if (!authSystem.isAdmin()) {
            showMessage('Недостаточно прав для удаления акций', 'error');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить эту акцию?')) {
            const result = authSystem.deletePromotion(promotionId);
            if (result.success) {
                showMessage(result.message, 'success');
                this.loadPromotions();
            } else {
                showMessage(result.message, 'error');
            }
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
}

// Создаем глобальный экземпляр менеджера администратора
const adminManager = new AdminManager();