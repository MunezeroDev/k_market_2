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
                
            case 'both':
                this.showFields(buyerFields);
                this.showFields(sellerFields);
                this.setFieldsRequired(buyerFields, true);
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
            'both': 'Buyer & Seller'  // Changed from 'buyerseller'
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

    displayMessage(message, type = 'info') {
        const messageBox = document.getElementById('formMessage');

        if (!messageBox) return;

        messageBox.textContent = message;
        messageBox.className = `form-message ${type}`;
        messageBox.style.display = 'block';
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
                this.displayMessage(result.message || 
                    `Registration submitted as ${this.currentAccountType}!`, 'success');
            } else {
                this.displayMessage(result.message || 
                    'Registration failed.', 'error');
            }

        })
        .catch(error => {
          this.displayMessage(
                'Registration failed. Please try again later.',
                'error'
            );
        });
    }
}

// Initialize the registration manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegistrationManager();
});