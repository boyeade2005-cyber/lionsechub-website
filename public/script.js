// ========================================
// KODJO'S FURNITURE - FRONTEND (WORKING VERSION)
// Gallery + Form Both Working!
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
// VAULT/GALLERY FUNCTIONS (FROM YOUR WORKING VERSION)
// ========================================

function filterVault(category) {
    const grid = document.getElementById('vault-grid');
    grid.innerHTML = '';
    
    // Update active tab - works with old HTML buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the correct button
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        const text = btn.textContent.toUpperCase();
        if ((text.includes('BEDROOM') && category === 'bedroom') ||
            (text.includes('OFFICE') && category === 'office') ||
            (text.includes('LOUNGE') && category === 'sitting') ||
            (text.includes('ACADEMY') && category === 'institutional')) {
            btn.classList.add('active');
        }
    });

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
// FORM SUBMISSION WITH BACKEND
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
                // Show success message
                showNotification('✅ Quote request submitted successfully! Opening WhatsApp...', 'success');

                // Create WhatsApp message
                const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file attached';
                const whatsappMessage = `
🏛️ *NEW QUOTE REQUEST - KODJO'S ATELIER*

👤 *Client:* ${fullName}
📞 *Phone:* ${phone}
${email ? `📧 *Email:* ${email}\n` : ''}📍 *Location:* ${location}
🛋️ *Category:* ${category}

📝 *Project Description:*
${description}

📎 *Reference Image:* ${fileName}

*Quote ID:* ${result.quoteId}

---
*Sent via Kodjo's Official Website*
                `.trim();

                const whatsappURL = `https://wa.me/2348020681771?text=${encodeURIComponent(whatsappMessage)}`;

                // Redirect to WhatsApp after 2 seconds
                setTimeout(() => {
                    window.open(whatsappURL, '_blank');
                    
                    // Reset form
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    
                    showNotification('Thank you! Your quote has been saved. Please complete your request via WhatsApp.', 'info');
                }, 2000);

            } else {
                throw new Error(result.message || 'Failed to submit quote');
            }

        } catch (error) {
            console.error('Error submitting quote:', error);
            showNotification('❌ Failed to submit quote. Please try contacting us directly via WhatsApp.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    console.log('Form handler attached successfully'); // Debug log
}

// ========================================
// NOTIFICATION SYSTEM
// ========================================

function showNotification(message, type = 'info') {
    // Remove existing notification if any
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

    // Add styles dynamically if not already present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .luxury-notification {
                position: fixed;
                top: 100px;
                right: 30px;
                background: rgba(10, 10, 10, 0.98);
                border: 2px solid var(--gold-leaf);
                padding: 25px 35px;
                border-radius: 5px;
                z-index: 10000;
                backdrop-filter: blur(10px);
                animation: slideIn 0.5s ease;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .notification-icon {
                font-size: 1.5rem;
                color: var(--gold-leaf);
                font-weight: bold;
            }
            .luxury-notification p {
                margin: 0;
                font-family: 'Cormorant Garamond', serif;
                font-size: 0.95rem;
                color: white;
                line-height: 1.4;
            }
            .luxury-notification.success { 
                border-color: #4CAF50;
                background: rgba(76, 175, 80, 0.1);
            }
            .luxury-notification.success .notification-icon { color: #4CAF50; }
            .luxury-notification.error { 
                border-color: #f44336;
                background: rgba(244, 67, 54, 0.1);
            }
            .luxury-notification.error .notification-icon { color: #f44336; }
            .luxury-notification.warning { 
                border-color: #ff9800;
                background: rgba(255, 152, 0, 0.1);
            }
            .luxury-notification.warning .notification-icon { color: #ff9800; }
            .luxury-notification.info { 
                border-color: var(--gold-leaf);
                background: rgba(197, 160, 89, 0.1);
            }
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                to { transform: translateX(400px); opacity: 0; }
            }
            @media (max-width: 768px) {
                .luxury-notification {
                    right: 15px;
                    left: 15px;
                    max-width: none;
                    top: 80px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Auto remove after 6 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 6000);
}

// ========================================
// SMOOTH SCROLL & NAVIGATION
// ========================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================

function initHeaderScroll() {
    const header = document.querySelector('.atelier-header');
    if (!header) return;
    
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.background = 'rgba(0, 0, 0, 0.98)';
            header.style.borderBottom = '1px solid rgba(197, 160, 89, 0.2)';
            header.style.padding = '20px 60px';
        } else {
            header.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.95), transparent)';
            header.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            header.style.padding = '30px 60px';
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observe sections
    document.querySelectorAll('.section, .vault, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });
}

// ========================================
// FILE UPLOAD PREVIEW
// ========================================

function initFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const wrapper = document.querySelector('.file-input-wrapper');

    if (fileInput && wrapper) {
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                const file = this.files[0];
                const fileName = file.name;
                const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB

                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    showNotification('File size must be less than 5MB', 'error');
                    this.value = '';
                    return;
                }

                wrapper.querySelector('label').innerHTML = `✓ Selected: ${fileName} (${fileSize}MB)`;
                wrapper.style.borderColor = 'var(--gold-leaf)';
                wrapper.style.background = 'rgba(197, 160, 89, 0.05)';
            }
        });

        // Drag and drop support
        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            wrapper.style.borderColor = 'var(--gold-leaf)';
            wrapper.style.background = 'rgba(197, 160, 89, 0.1)';
        });

        wrapper.addEventListener('dragleave', () => {
            wrapper.style.borderColor = '#222';
            wrapper.style.background = 'transparent';
        });

        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            wrapper.style.borderColor = '#222';
            wrapper.style.background = 'transparent';
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });

        // Click to open file dialog
        wrapper.addEventListener('click', () => {
            fileInput.click();
        });
    }
}

// ========================================
// WHATSAPP FLOAT ANIMATION
// ========================================

function initWhatsAppAnimation() {
    const waButton = document.querySelector('.whatsapp-float');
    
    if (waButton) {
        setInterval(() => {
            waButton.style.transform = 'scale(1.1)';
            setTimeout(() => {
                waButton.style.transform = 'scale(1)';
            }, 300);
        }, 3000);
    }
}

// ========================================
// INITIALIZE ON PAGE LOAD
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('🏛️ KODJO\'S ATELIER - Initializing...');
    
    // Hide loader
    setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }, 1500);

    // Initialize bedroom gallery by default
    filterVault('bedroom');

    // Initialize all features
    handleFormSubmission();
    initSmoothScroll();
    initHeaderScroll();
    initScrollAnimations();
    initFileUpload();
    initWhatsAppAnimation();

    console.log('✅ Website loaded successfully');
    console.log('📡 API Endpoint: ' + API_BASE_URL);
});

// ========================================
// ERROR HANDLING
// ========================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

// Performance: Lazy load images
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}
