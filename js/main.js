// Main JavaScript for PK Group Website

document.addEventListener('DOMContentLoaded', function() {
    console.log('PK Group Website Loaded');
    
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if(menuToggle && navMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            menuToggle.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if(!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    // Initialize Swiper for testimonials
    if(document.querySelector('.testimonials-swiper')) {
        try {
            const swiper = new Swiper('.testimonials-swiper', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    }
                }
            });
            console.log('Swiper initialized successfully');
        } catch (error) {
            console.error('Swiper initialization error:', error);
        }
    }
    
    // Add active class to current page in navigation
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if(linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Form validation and submission for all forms
    initializeForms();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Modal functionality
    initializeModals();
    
    // Pincode validation
    const pincodeInput = document.getElementById('pincode');
    if(pincodeInput) {
        pincodeInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
            if(this.value.length > 6) {
                this.value = this.value.substring(0, 6);
            }
        });
    }
    
    // Phone number validation
    const phoneInputs = document.querySelectorAll('input[type="tel"], #phone');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
            if(this.value.length > 10) {
                this.value = this.value.substring(0, 10);
            }
        });
    });
    
    // WhatsApp Floating Button Click Handler
    const whatsappButton = document.querySelector('.whatsapp-float');
    if(whatsappButton) {
        whatsappButton.addEventListener('click', function(e) {
            e.preventDefault();
            const defaultMessage = "Hi PK Group, I need details about your services";
            const phone = "7010704215"; // Your phone number
            const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(defaultMessage)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
});

// Initialize all forms on the page
function initializeForms() {
    const forms = document.querySelectorAll('form[id$="Form"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if(validateForm(this)) {
                const formData = getFormData(this);
                const formType = this.id.replace('Form', '');
                
                // Log form data for debugging
                // console.log('Form Data:', formData);
                // console.log('Form Type:', formType);
                
                // Send data to WhatsApp
                const whatsappSent = sendToWhatsApp(formData, formType);
                
                if(whatsappSent) {
                    // Show success notification
                    showNotification();
                    
                    // Reset form
                    this.reset();
                    
                    // Close modal if open
                    const modal = document.querySelector('.modal[style*="block"]');
                    if(modal) {
                        modal.style.display = 'none';
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = 'auto';
                    }
                } else {
                    alert('Failed to send WhatsApp message. Please try again or call us at 7010704215');
                }
            }
        });
        
        // Add real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
}

// Initialize all modals
function initializeModals() {
    // Modal open buttons
    const modalOpenButtons = document.querySelectorAll('[id$="Btn"]');
    
    modalOpenButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.id.replace('Btn', 'FormModal');
            const modal = document.getElementById(modalId);
            if(modal) {
                modal.style.display = 'block';
                document.body.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Modal close buttons
    const modalCloseButtons = document.querySelectorAll('.modal-close, .modal-overlay');
    
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal') || document.querySelector('.modal[style*="block"]');
            if(modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close modal when clicking outside content
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if(event.target === modal) {
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Notification close
    const notificationClose = document.getElementById('notificationClose');
    if(notificationClose) {
        notificationClose.addEventListener('click', function() {
            const notification = document.getElementById('successNotification');
            if(notification) {
                notification.classList.remove('show');
            }
        });
    }
}

// Validate individual field
function validateField(field) {
    const fieldId = field.id;
    const errorElement = document.getElementById(`${fieldId}Error`) || field.parentNode.querySelector('.error-message');
    
    // If field is not required and empty, it's valid
    if(!field.hasAttribute('required') && !field.value.trim()) {
        if(errorElement) errorElement.style.display = 'none';
        field.style.borderColor = '#ddd';
        return true;
    }
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if field is empty
    if(field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    // Validate phone number
    else if(field.type === 'tel' || field.id === 'phone') {
        const phoneRegex = /^[0-9]{10}$/;
        if(!phoneRegex.test(field.value.replace(/\D/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit phone number';
        }
    }
    // Validate email if provided
    else if(field.type === 'email' && field.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(field.value.trim())) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    // Validate pincode
    else if(field.id === 'pincode' && field.value.trim()) {
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if(!pincodeRegex.test(field.value.trim())) {
            isValid = false;
            errorMessage = 'Please enter a valid 6-digit pincode';
        }
    }
    
    // Display error or clear it
    if(errorElement) {
        if(!isValid) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            field.style.borderColor = '#ff3333';
        } else {
            errorElement.style.display = 'none';
            field.style.borderColor = '#27ae60';
            
            // Reset to normal border after 2 seconds
            setTimeout(() => {
                if(field.style.borderColor === 'rgb(39, 174, 96)') {
                    field.style.borderColor = '#ddd';
                }
            }, 2000);
        }
    }
    
    return isValid;
}

// Clear field error
function clearFieldError(field) {
    const fieldId = field.id;
    const errorElement = document.getElementById(`${fieldId}Error`) || field.parentNode.querySelector('.error-message');
    
    if(errorElement) {
        errorElement.style.display = 'none';
    }
    
    field.style.borderColor = '#ddd';
}

// Validate form inputs
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // Reset error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.style.display = 'none';
        error.textContent = '';
    });
    
    // Reset field borders
    const allFields = form.querySelectorAll('input, select, textarea');
    allFields.forEach(field => {
        field.style.borderColor = '#ddd';
    });
    
    // Validate each required field
    requiredFields.forEach(field => {
        if(!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Get form data as object
function getFormData(form) {
    const formData = {};
    const formElements = form.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
        if(element.name && element.type !== 'submit') {
            if(element.type === 'checkbox') {
                formData[element.name] = element.checked ? 'Yes' : 'No';
            } else {
                formData[element.name] = element.value.trim();
            }
        }
    });
    
    return formData;
}

// WORKING WhatsApp Function - FIXED VERSION
function sendToWhatsApp(formData, formType) {
    // console.log('Form Data to WhatsApp:', formData);
    
    // Get current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    // Format message based on form type
    let message = '';
    
    // Determine form type based on the fields present
    if (formData.fullName && formData.address && formData.phone) {
        if (formData.pincode && formData.city) {
            // Franchise Application
            message = `*🏪 NEW FRANCHISE ENQUIRY - PK GROUP*\n\n`;
            message += `*👤 Name:* ${formData.fullName || 'Not provided'}\n`;
            message += `*📱 Phone:* ${formData.phone || 'Not provided'}\n`;
            message += `*📧 Email:* ${formData.email || 'Not provided'}\n`;
            message += `*📍 Address:* ${formData.address || 'Not provided'}\n`;
            message += `*📍 Pincode:* ${formData.pincode || 'Not provided'}\n`;
            message += `*🏙️ City:* ${formData.city || 'Not provided'}\n`;
            message += `*💰 Investment:* ${formData.investment || 'Not provided'}\n`;
            message += `*💼 Experience:* ${formData.experience || 'Not provided'}\n\n`;
            message += `*📅 Submitted:* ${dateStr} at ${timeStr}\n`;
            message += `*🌐 Source:* Franchise Page - PK Group Website`;
        } else if (formData.profession && formData.investmentAmount) {
            // Investor Interest
            message = `*💰 NEW INVESTOR ENQUIRY - PK GROUP*\n\n`;
            message += `*👤 Name:* ${formData.fullName || 'Not provided'}\n`;
            message += `*📱 Phone:* ${formData.phone || 'Not provided'}\n`;
            message += `*📧 Email:* ${formData.email || 'Not provided'}\n`;
            message += `*📍 Address:* ${formData.address || 'Not provided'}\n`;
            message += `*💼 Profession:* ${formData.profession || 'Not provided'}\n`;
            message += `*💰 Investment Amount:* ${formData.investmentAmount || 'Not provided'}\n`;
            message += `*📊 Interest Vertical:* ${formData.interestVertical || 'Not provided'}\n\n`;
            message += `*📅 Submitted:* ${dateStr} at ${timeStr}\n`;
            message += `*🌐 Source:* Investors Page - PK Group Website`;
        } else if (formData.education || formData.experience) {
            // Job Application
            message = `*💼 NEW JOB APPLICATION - PK GROUP*\n\n`;
            message += `*👤 Name:* ${formData.fullName || 'Not provided'}\n`;
            message += `*📱 Phone:* ${formData.phone || 'Not provided'}\n`;
            message += `*📧 Email:* ${formData.email || 'Not provided'}\n`;
            message += `*📍 Address:* ${formData.address || 'Not provided'}\n`;
            message += `*🎓 Education:* ${formData.education || 'Not provided'}\n`;
            message += `*💼 Experience:* ${formData.experience || 'Not provided'}\n\n`;
            message += `*📅 Submitted:* ${dateStr} at ${timeStr}\n`;
            message += `*🌐 Source:* Careers Page - PK Group Website`;
        } else {
            // General Enquiry
            message = `*📋 NEW WEBSITE ENQUIRY - PK GROUP*\n\n`;
            message += `*👤 Name:* ${formData.fullName || 'Not provided'}\n`;
            message += `*📱 Phone:* ${formData.phone || 'Not provided'}\n`;
            message += `*📧 Email:* ${formData.email || 'Not provided'}\n`;
            message += `*📍 Address:* ${formData.address || 'Not provided'}\n\n`;
            message += `*📅 Submitted:* ${dateStr} at ${timeStr}\n`;
            message += `*🌐 Source:* PK Group Website`;
        }
    } else {
        // Fallback message
        message = `*📋 NEW ENQUIRY - PK GROUP*\n\n`;
        for(const key in formData) {
            const label = key.replace(/([A-Z])/g, ' $1')
                           .replace(/^./, str => str.toUpperCase())
                           .replace('Full Name', 'Name')
                           .replace('Phone Number', 'Phone')
                           .replace('Email Address', 'Email');
            message += `*${label}:* ${formData[key]}\n`;
        }
        message += `\n*📅 Submitted:* ${dateStr} at ${timeStr}\n`;
        message += `*🌐 Source:* PK Group Website`;
    }
    
    // Clean the message
    const cleanMessage = message.trim();
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(cleanMessage);
    
    // WhatsApp phone number (remove any spaces or special characters)
    const phoneNumber = '917010704215'; // Your WhatsApp number in international format
    
    // Create WhatsApp URL (using wa.me which is more reliable)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // console.log('WhatsApp URL:', whatsappUrl);
    
    // Open WhatsApp in new tab
    try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        return true;
    } catch (error) {
        console.error('Error opening WhatsApp:', error);
        
        // Fallback: Try opening in same tab
        try {
            window.location.href = whatsappUrl;
            return true;
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return false;
        }
    }
}

// Show success notification
function showNotification() {
    const notification = document.getElementById('successNotification');
    if(notification) {
        notification.classList.add('show');
        
        // Auto hide after 8 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 8000);
    }
}

// Function to open modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
}

// Function to close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
    }
}