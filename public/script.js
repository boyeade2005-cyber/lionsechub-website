// ========================================
// KODJO'S FURNITURE - FRONTEND (UPDATED)
// With Backend API Integration - NO AUTO WHATSAPP
// ========================================

// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Gallery Data Management
const galleryData = {
    bedroom: [
        { path: "Kodjo_s Furniture Photos/Bedroom Design/Bedroom Design", count: 88, name: "MASTER SUITE" },
        { path: "Kodjo_s Furniture Photos/Bedroom Dressing Table/Bedroom Dressing Table", count: 36, name: "DRESSING ATELIER" }
    ],
    office: [
        { path: "Kodjo_s Furniture Photos/Office Tables/Office Tables", count: 7, name: "EXECUTIVE DESK" },
        { path: "Kodjo_s Furniture Photos/Reading table/Reading table", count: 34, name: "SCHOLAR DESK" }
    ],
    sitting: [
        { path: "Kodjo_s Furniture Photos/Sitting Room Sofas/Sitting Room Sofas", count: 50, name: "GRAND LOUNGE" }
    ],
    institutional: [
        { path: "Kodjo_s Furniture Photos/Teacher_s Tables/Teacher Table", count: 8, name: "ACADEMIC SERIES" }
    ]
};

// ========================================
// VAULT/GALLERY FUNCTIONS
// ========================================

function filterVault(category, clickedButton) {
    const grid = document.getElementById('vault-grid');
    grid.innerHTML = '';
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (clickedButton) {
        clickedButton.classList.add('active');
    }

    // Load images for selected category
    galleryData[category].forEach(sub => {
        for (let i = 1; i <= sub.count; i++) {
            const cell = document.createElement('div');
            cell.className = 'vault-cell';
            const src = `${sub.path} (${i}).jpg`;
            
            cell.innerHTML = `
                <div class="cell-inner">
                    <img src="${src}" loading="lazy" alt="${sub.name} ${i}" onerror="this.parentElement.parentElement.remove()">
                    <div class="cell-overlay">
                        <span class="serial">KDJ-${category.toUpperCase()}-${i.toString().padStart(3, '0')}</span>
                        <span class="label">${sub.name}</span>
                    </div>
                </div>
            `;
            grid.appendChild(cell);
        }
    });

    // Add smooth scroll reveal animation
    setTimeout(() => {
        document.querySelectorAll('.vault-cell').forEach((cell, index) => {
            cell.style.opacity = '0';
            cell.style.transform = 'translateY(30px)';
            setTimeout(() => {
                cell.style.transition = 'all 0.6s ease';
                cell.style.opacity = '1';
                cell.style.transform = 'translateY(0)';
            }, index * 30);
        });
    }, 50);
}

// ========================================
// FORM SUBMISSION WITH BACKEND (FIXED)
// ========================================

function handleFormSubmission() {
    const form = document.querySelector('.luxe-form');
    
    if (!form) {
        console.error('Form not found');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // CRITICAL: Prevent page refresh
        
        console.log('Form submitted!'); // Debug log
        
        // Get form elements
        const inputs = form.querySelectorAll('input[type="text"]');
        const fullName = inputs[0].value.trim();
        const location = inputs[1].value.trim();
        const phone = form.querySelector('input[type="tel"]').value.trim();
        const emailField = form.querySelector('input[type="email"]');
        const email = emailField ? emailField.value.trim() : '';
        const category = form.querySelector('select').value;
        const description = form.querySelector('textarea').value.trim();
        const fileInput = form.querySelector('input[type="file"]');

        // Validation
        if (!fullName || !phone || !location || !category || !description) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = form.querySelector('.gold-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'SENDING...';
        submitBtn.disabled = true;

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('location', location);
            formData.append('category', category);
            formData.append('description', description);
            
            if (fileInput.files.length > 0) {
                formData.append('referenceImage', fileInput.files[0]);
            }

            console.log('Sending to API...'); // Debug log

            // Send to backend API
            const response = await fetch(`${API_BASE_URL}/quote`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            console.log('API Response:', result); // Debug log

            if (result.success) {
                // SUCCESS MESSAGE WITHOUT WHATSAPP REDIRECT
                showNotification('✅ Quote request submitted successfully! We will reach out to you shortly.', 'success');

                // Reset form
                setTimeout(() => {
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    // Reset file upload label if present
                    const fileLabel = form.querySelector('.file-input-wrapper label');
                    if (fileLabel) fileLabel.innerHTML = 'Upload Reference (Optional)';
                }, 1000);

            } else {
                throw new Error(result.message || 'Failed to submit quote');
            }

        } catch (error) {
            console.error('Error submitting quote:', error);
            showNotification('❌ Failed to submit quote. Please try again later.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.luxury-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `luxury-notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type]}</span>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);

    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .luxury-notification {
                position: fixed;
                top: 100px;
                right: 30px;
                background: rgba(10, 10, 10, 0.98);
                border: 2px solid #c5a059;
                padding: 25px 35px;
                border-radius: 5px;
                z-index: 10000;
                backdrop-filter: blur(10px);
                animation: slideIn 0.5s ease;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            .notification-content { display: flex; align-items: center; gap: 15px; }
            .notification-icon { font-size: 1.5rem; color: #c5a059; font-weight: bold; }
            .luxury-notification p { margin: 0; font-family: 'serif'; font-size: 0.95rem; color: white; }
            @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { to { transform: translateX(400px); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 6000);
}

// ========================================
// INITIALIZE REMAINING FUNCTIONS
// ========================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function initHeaderScroll() {
    const header = document.querySelector('.atelier-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
            header.style.background = 'transparent';
        }
    });
}

// Call all initialization functions
document.addEventListener('DOMContentLoaded', () => {
    handleFormSubmission();
    initSmoothScroll();
    initHeaderScroll();
});
