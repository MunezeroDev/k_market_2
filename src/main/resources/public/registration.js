// Registration form handler for KenyaMarket

class RegistrationManager {
    constructor() {
        this.currentAccountType = 'buyer';
        this.modal = document.getElementById('accountTypeModal');
        this.form = document.getElementById('registrationForm');
        this.accountTypeDisplay = document.getElementById('accountTypeDisplay');
        
        this.init();
    }

    init() {
        // Set initial account type from URL or default to buyer
        const urlParams = new URLSearchParams(window.location.search);
        const accountType = urlParams.get('type') || 'buyer';
        this.setAccountType(accountType);

        // Event listeners
        document.getElementById('updateAccountType').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        });

        document.getElementById('confirmAccountType').addEventListener('click', () => {
            this.updateAccountType();
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Success modal buttons
        document.getElementById('goToLogin').addEventListener('click', () => {
            window.location.href = 'login.html';
        });

        document.getElementById('closeSuccess').addEventListener('click', () => {
            this.hideSuccessModal();
            this.form.reset();
        });

        // Error modal button
        document.getElementById('closeError').addEventListener('click', () => {
            this.hideErrorModal();
        });
    }

    setAccountType(type) {
        this.currentAccountType = type.toLowerCase();
        this.updateFormFields();
        this.updateDisplay();
    }

    updateFormFields() {
        const buyerFields = document.querySelectorAll('.buyer-field');
        const sellerFields = document.querySelectorAll('.seller-field');
        
        switch(this.currentAccountType) {
            case 'buyer':
                this.showFields(buyerFields);
                this.hideFields(sellerFields);
                this.setFieldsRequired(buyerFields, true);
                this.setFieldsRequired(sellerFields, false);
                break;
                
            case 'seller':
                this.hideFields(buyerFields);
                this.showFields(sellerFields);
                this.setFieldsRequired(buyerFields, false);
                this.setFieldsRequired(sellerFields, true);
                break;
        }
    }

    showFields(fields) {
        fields.forEach(field => {
            field.style.display = 'block';
        });
    }

    hideFields(fields) {
        fields.forEach(field => {
            field.style.display = 'none';
        });
    }

    setFieldsRequired(fields, required) {
        fields.forEach(field => {
            const input = field.querySelector('input');
            if (input) {
                if (required) {
                    input.setAttribute('required', 'required');
                } else {
                    input.removeAttribute('required');
                }
            }
        });
    }

    updateDisplay() {
        const displayText = {
            'buyer': 'Buyer',
            'seller': 'Seller',
        };
        
        this.accountTypeDisplay.textContent = displayText[this.currentAccountType] || 'Buyer';
    }
    
    showModal() {
        // Set current selection in modal
        const radio = document.querySelector(`input[name="accountType"][value="${this.currentAccountType}"]`);
        if (radio) {
            radio.checked = true;
        }
        
        this.modal.classList.add('active');
    }

    hideModal() {
        this.modal.classList.remove('active');
    }

    updateAccountType() {
        const selectedType = document.querySelector('input[name="accountType"]:checked').value;
        this.setAccountType(selectedType);
        this.hideModal();
    }

    showSuccessModal(message) {
        const modal = document.getElementById('successModal');
        const messageElement = document.getElementById('successMessage');
        messageElement.textContent = message;
        modal.classList.add('active');
    }

    showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const messageElement = document.getElementById('errorMessage');
        messageElement.textContent = message;
        modal.classList.add('active');
    }

    hideSuccessModal() {
        document.getElementById('successModal').classList.remove('active');
    }

    hideErrorModal() {
        document.getElementById('errorModal').classList.remove('active');
    }

    handleSubmit() {
        // Collect form data
        const formData = new FormData(this.form);
        const data = {
            accountType: this.currentAccountType
        };

        // Add all form fields to data object
        for (let [key, value] of formData.entries()) {
            // Only include visible/required fields
            const field = this.form.querySelector(`[name="${key}"]`);
            const fieldGroup = field?.closest('.form-group');
            
            if (!fieldGroup || fieldGroup.style.display !== 'none') {
                data[key] = value;
            }
        }

        console.log('Registration data:', data);

        
        // Send to backend
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                this.showSuccessModal(result.message || 
                    `Registration successful! Welcome ${this.currentAccountType}!`);
            } else {
                this.showErrorModal(result.message || 'Registration failed.');
            }
        })
        .catch(error => {
            this.showErrorModal('Registration failed. Please try again later.');
        });
        
    }
}

// Initialize the registration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();
});