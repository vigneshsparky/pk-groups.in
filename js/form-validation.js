// Form Validation Functions
document.addEventListener('DOMContentLoaded', function() {
    // Real-time validation for form fields
    const forms = document.querySelectorAll('form[id$="Form"]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Validate on blur (when user leaves the field)
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Validate on input (for real-time feedback)
            if(input.type !== 'checkbox') {
                input.addEventListener('input', function() {
                    clearFieldError(this);
                });
            }
        });
    });
});

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
    
    // Display error or clear it
    if(errorElement) {
        if(!isValid) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            field.style.borderColor = '#e74c3c';
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

// Franchise form specific validation
function validateFranchiseForm(form) {
    let isValid = true;
    
    // Check pincode
    const pincode = form.querySelector('#pincode');
    if(pincode && pincode.value.trim()) {
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if(!pincodeRegex.test(pincode.value.trim())) {
            isValid = false;
            const errorElement = document.getElementById('pincodeError') || pincode.parentNode.querySelector('.error-message');
            if(errorElement) {
                errorElement.textContent = 'Please enter a valid 6-digit pincode';
                errorElement.style.display = 'block';
                pincode.style.borderColor = '#e74c3c';
            }
        }
    }
    
    return isValid;
}

// Investor form specific validation
function validateInvestorForm(form) {
    let isValid = true;
    
    // Check investment amount
    const investment = form.querySelector('#investmentAmount');
    if(investment && investment.value.trim()) {
        const amount = parseInt(investment.value.replace(/\D/g, ''));
        if(isNaN(amount) || amount < 20000) {
            isValid = false;
            const errorElement = document.getElementById('investmentAmountError') || investment.parentNode.querySelector('.error-message');
            if(errorElement) {
                errorElement.textContent = 'Minimum investment amount is ₹20,000';
                errorElement.style.display = 'block';
                investment.style.borderColor = '#e74c3c';
            }
        }
    }
    
    return isValid;
}