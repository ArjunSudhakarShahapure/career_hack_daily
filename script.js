// Resource Management System
class ResourceManager {
    constructor() {
        this.resources = this.loadResources();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderResources();
        this.updateStats();
    }

    setupEventListeners() {
        // Modal controls
        const addResourceBtn = document.getElementById('addResourceBtn');
        const modal = document.getElementById('addResourceModal');
        const closeModal = document.getElementById('closeModal');
        const cancelAdd = document.getElementById('cancelAdd');
        const addResourceForm = document.getElementById('addResourceForm');

        addResourceBtn.addEventListener('click', () => this.openModal());
        closeModal.addEventListener('click', () => this.closeModal());
        cancelAdd.addEventListener('click', () => this.closeModal());
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Form submission
        addResourceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addResource();
        });

        // Filter tabs
        const filterTabs = document.querySelectorAll('.tab-btn');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.setActiveFilter(tab.dataset.filter);
            });
        });

        // Highlight categories
        const highlightItems = document.querySelectorAll('.highlight-item');
        highlightItems.forEach(item => {
            item.addEventListener('click', () => {
                const category = item.querySelector('span').textContent.toLowerCase();
                this.filterByCategory(category);
            });
        });

        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActiveNav(item);
            });
        });
    }

    openModal() {
        const modal = document.getElementById('addResourceModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add animation
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.add('slide-up');
    }

    closeModal() {
        const modal = document.getElementById('addResourceModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        document.getElementById('addResourceForm').reset();
    }

    addResource() {
        const form = document.getElementById('addResourceForm');
        const formData = new FormData(form);
        
        const resource = {
            id: Date.now(),
            title: document.getElementById('resourceTitle').value,
            description: document.getElementById('resourceDescription').value,
            type: document.getElementById('resourceType').value,
            url: document.getElementById('resourceUrl').value,
            category: document.getElementById('resourceCategory').value,
            dateAdded: new Date().toISOString(),
            saved: false
        };

        this.resources.push(resource);
        this.saveResources();
        this.renderResources();
        this.updateStats();
        this.closeModal();
        
        // Show success message
        this.showNotification('Resource added successfully!', 'success');
    }

    deleteResource(id) {
        if (confirm('Are you sure you want to delete this resource?')) {
            this.resources = this.resources.filter(resource => resource.id !== id);
            this.saveResources();
            this.renderResources();
            this.updateStats();
            this.showNotification('Resource deleted successfully!', 'success');
        }
    }

    toggleSave(id) {
        const resource = this.resources.find(r => r.id === id);
        if (resource) {
            resource.saved = !resource.saved;
            this.saveResources();
            this.renderResources();
            this.showNotification(
                resource.saved ? 'Resource saved!' : 'Resource unsaved!', 
                'info'
            );
        }
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderResources();
    }

    filterByCategory(category) {
        this.currentFilter = category;
        this.renderResources();
        
        // Update tab buttons to show "all" as active
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]').classList.add('active');
    }

    setActiveNav(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }

    renderResources() {
        const grid = document.getElementById('resourcesGrid');
        let filteredResources = this.resources;

        // Apply filters
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'pdf' || this.currentFilter === 'link' || this.currentFilter === 'document') {
                filteredResources = this.resources.filter(resource => resource.type === this.currentFilter);
            } else {
                // Category filter
                filteredResources = this.resources.filter(resource => 
                    resource.category.toLowerCase().includes(this.currentFilter)
                );
            }
        }

        if (filteredResources.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No resources found</h3>
                    <p>${this.currentFilter === 'all' ? 'Add your first resource to get started!' : 'No resources match the current filter.'}</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredResources.map(resource => this.createResourceCard(resource)).join('');
        
        // Add event listeners to new cards
        this.addCardEventListeners();
    }

    createResourceCard(resource) {
        const typeIcon = this.getTypeIcon(resource.type);
        const categoryIcon = this.getCategoryIcon(resource.category);
        const savedIcon = resource.saved ? 'fas fa-bookmark' : 'far fa-bookmark';
        
        return `
            <div class="resource-card fade-in" data-id="${resource.id}">
                <div class="resource-header">
                    <div class="resource-type">
                        <i class="${typeIcon}"></i> ${resource.type.toUpperCase()}
                    </div>
                    <div class="resource-actions">
                        <button class="resource-action-btn save-btn" title="${resource.saved ? 'Unsave' : 'Save'}">
                            <i class="${savedIcon}"></i>
                        </button>
                        <button class="resource-action-btn delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="resource-title">${resource.title}</div>
                <div class="resource-description">${resource.description}</div>
                <div class="resource-footer">
                    <div class="resource-category">
                        <i class="${categoryIcon}"></i> ${resource.category}
                    </div>
                    <a href="${resource.url}" target="_blank" class="resource-action-btn" title="Open">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            'link': 'fas fa-link',
            'pdf': 'fas fa-file-pdf',
            'document': 'fas fa-file-alt'
        };
        return icons[type] || 'fas fa-file';
    }

    getCategoryIcon(category) {
        const icons = {
            'trending': 'fas fa-newspaper',
            'courses': 'fas fa-graduation-cap',
            'resume': 'fas fa-file-alt',
            'material': 'fas fa-book'
        };
        return icons[category.toLowerCase()] || 'fas fa-folder';
    }

    addCardEventListeners() {
        // Save/unsave buttons
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.resource-card');
                const id = parseInt(card.dataset.id);
                this.toggleSave(id);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.resource-card');
                const id = parseInt(card.dataset.id);
                this.deleteResource(id);
            });
        });

        // Card click to open resource
        document.querySelectorAll('.resource-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.resource-actions')) {
                    const id = parseInt(card.dataset.id);
                    const resource = this.resources.find(r => r.id === id);
                    if (resource) {
                        window.open(resource.url, '_blank');
                    }
                }
            });
        });
    }

    updateStats() {
        const totalResources = this.resources.length;
        const savedResources = this.resources.filter(r => r.saved).length;
        
        // Update stats in header
        const statsElement = document.querySelector('.stats span:first-child');
        if (statsElement) {
            statsElement.innerHTML = `<i class="fas fa-file-alt"></i> ${totalResources} Resources`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#0066ff' : type === 'error' ? '#ff4444' : '#333'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadResources() {
        const saved = localStorage.getItem('resources');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading resources:', e);
                return this.getDefaultResources();
            }
        }
        return this.getDefaultResources();
    }

    saveResources() {
        localStorage.setItem('resources', JSON.stringify(this.resources));
    }

    getDefaultResources() {
        return [
            {
                id: 1,
                title: "Top 4 FREE Tech Courses to Land a Job in 2021",
                description: "Master In-Demand Skills from YouTube - No Cost, Just Wi-Fi!",
                type: "link",
                url: "https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqP",
                category: "courses",
                dateAdded: "2024-01-15T10:00:00.000Z",
                saved: true
            },
            {
                id: 2,
                title: "Top 5 AI Tools Every Job Seeker Should Know in 2025",
                description: "Boost productivity, stand out, and save time",
                type: "link",
                url: "https://medium.com/@career_hack_daily/top-5-ai-tools-2025",
                category: "trending",
                dateAdded: "2024-01-10T14:30:00.000Z",
                saved: true
            },
            {
                id: 3,
                title: "करिअर कुठं करायचं ठरत नाहीय? मग हे ५ स्टेप्स नक्की फॉलो करा!",
                description: "नक्की काय करावं हे कळत नसताना - हा गाईड दिशा देईल.",
                type: "pdf",
                url: "https://docs.google.com/document/d/1PbvfEJp4flqIGL...",
                category: "material",
                dateAdded: "2024-01-05T09:15:00.000Z",
                saved: false
            },
            {
                id: 4,
                title: "Professional Resume Template Collection",
                description: "A curated collection of ATS-friendly resume templates",
                type: "document",
                url: "https://drive.google.com/drive/folders/resume-templates",
                category: "resume",
                dateAdded: "2024-01-12T16:45:00.000Z",
                saved: true
            },
            {
                id: 5,
                title: "Latest Tech Industry Trends Report",
                description: "Comprehensive analysis of emerging technologies and job market",
                type: "pdf",
                url: "https://drive.google.com/file/d/tech-trends-2025.pdf",
                category: "trending",
                dateAdded: "2024-01-08T11:20:00.000Z",
                saved: false
            },
            {
                id: 6,
                title: "Complete Web Development Bootcamp",
                description: "Learn HTML, CSS, JavaScript, React, Node.js from scratch",
                type: "link",
                url: "https://www.udemy.com/course/web-development-bootcamp",
                category: "courses",
                dateAdded: "2024-01-03T13:10:00.000Z",
                saved: true
            },
            {
                id: 7,
                title: "Interview Preparation Guide",
                description: "Common interview questions and best practices for tech roles",
                type: "document",
                url: "https://docs.google.com/document/d/interview-prep-guide",
                category: "material",
                dateAdded: "2024-01-01T08:30:00.000Z",
                saved: false
            }
        ];
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResourceManager();
});

// Add touch support for mobile
document.addEventListener('touchstart', function() {}, {passive: true});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false); 