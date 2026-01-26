// ==================== SELLER-SPECIFIC DATA ====================
const products = [];
const uploadedImages = [];

// ==================== DOM ELEMENTS ====================
const profileBtn = document.getElementById('profileBtn');
const addInventoryBtn = document.getElementById('addInventoryBtn');
const productsList = document.getElementById('productsList');
const productCount = document.getElementById('productCount');
const searchInput = document.getElementById('searchInput');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    // Load user data using shared utility
    const result = await DashboardUtils.loadUserData();
    
    if (result.success) {
        // Check if user has seller role
        if (!result.roles.includes('seller')) {
            alert('Access denied. Seller role required.');
            window.location.href = '/login.html';
            return;
        }
        
        // Display seller name
        DashboardUtils.displayUserName(result.user.userName, 'sellerName');
        
        // Store user data for profile modal
        window.currentUserData = result.user;
    }
    
    // Initialize shared components
    DashboardUtils.initializeProfileModal();
    DashboardUtils.initializeLogout();
    
    // Initialize seller-specific features
    initializeProfileButton();
    initializeInventoryManagement();
    initializeSearch();
    renderProducts();
});

// ==================== PROFILE BUTTON ====================
function initializeProfileButton() {
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            if (window.currentUserData) {
                DashboardUtils.showProfileModal(window.currentUserData, 'seller');
            }
        });
    }
}

// ==================== INVENTORY MANAGEMENT ====================
function initializeInventoryManagement() {
    // Add inventory button
    if (addInventoryBtn) {
        addInventoryBtn.addEventListener('click', function() {
            showListItemModal();
        });
    }
    
    // Initialize table actions
    initializeTableActions();
}

function initializeTableActions() {
    const tableBody = document.getElementById('inventoryTableBody');
    
    if (tableBody) {
        // Edit buttons
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const row = e.target.closest('tr');
                handleEditProduct(row);
            }
        });
        
        // Delete buttons
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const row = e.target.closest('tr');
                handleDeleteProduct(row);
            }
        });
    }
    
    // Select all checkbox
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('#inventoryTableBody input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
        });
    }
}

function handleEditProduct(row) {
    const productId = row.cells[1].textContent;
    const productName = row.querySelector('.item-link').textContent;
    
    alert(`Edit product: ${productName} (${productId})`);
    // In real app, open edit modal with product data
}

function handleDeleteProduct(row) {
    const productName = row.querySelector('.item-link').textContent;
    
    if (DashboardUtils.confirmAction(`Are you sure you want to delete ${productName}?`)) {
        row.remove();
        DashboardUtils.showNotification('Product deleted successfully');
    }
}

// ==================== LIST ITEM MODAL ====================
function showListItemModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('listItemModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create list item modal
    const modal = document.createElement('div');
    modal.id = 'listItemModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content list-item-modal">
            <div class="modal-header">
                <h3>List New Product</h3>
                <button class="close-modal" onclick="closeListItemModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="productForm">
                    <div class="form-group">
                        <label for="productName">Product Name *</label>
                        <input type="text" id="productName" placeholder="e.g., Samsung Galaxy S25" required>
                    </div>

                    <div class="form-group">
                        <label for="productDescription">Description *</label>
                        <textarea id="productDescription" placeholder="Enter product description and specifications" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="productPrice">Price (Ksh.) *</label>
                        <input type="number" id="productPrice" placeholder="0" min="0" step="1" required>
                    </div>

                    <div class="form-group">
                        <label for="productQuantity">Quantity *</label>
                        <input type="number" id="productQuantity" placeholder="0" min="1" value="1" required>
                    </div>

                    <div class="form-group">
                        <label>Product Images</label>
                        <div class="image-upload" id="imageUpload">
                            <input type="file" id="imageInput" accept="image/*" multiple>
                            <div class="upload-text">
                                📸 Click to upload images<br>
                                <small>You can select multiple images</small>
                            </div>
                        </div>
                        <div class="image-preview" id="imagePreview"></div>
                    </div>

                    <button type="submit" class="btn-primary">List Product</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize product form
    initializeProductForm();

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeListItemModal();
        }
    });
}

function closeListItemModal() {
    const modal = document.getElementById('listItemModal');
    if (modal) {
        modal.remove();
    }
    uploadedImages.length = 0;
}

// Make function globally accessible
window.closeListItemModal = closeListItemModal;

// ==================== PRODUCT FORM FUNCTIONALITY ====================
function initializeProductForm() {
    const imageInput = document.getElementById('imageInput');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const productForm = document.getElementById('productForm');
    
    if (!productForm) return;

    if (imageUpload && imageInput) {
        imageUpload.addEventListener('click', () => {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        uploadedImages.push(event.target.result);
                        renderImagePreviews();
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const product = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            quantity: parseInt(document.getElementById('productQuantity').value),
            images: [...uploadedImages]
        };
        
        products.push(product);
        renderProducts();
        
        DashboardUtils.showNotification('Product listed successfully!');
        closeListItemModal();
        
        // Reset form
        productForm.reset();
        uploadedImages.length = 0;
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }
    });
}

function renderImagePreviews() {
    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview) return;
    
    imagePreview.innerHTML = '';
    
    uploadedImages.forEach((src, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${src}" alt="Preview">
            <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
        `;
        imagePreview.appendChild(previewItem);
    });
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderImagePreviews();
}

// Make function globally accessible
window.removeImage = removeImage;

// ==================== PRODUCTS LIST RENDERING ====================
function renderProducts() {
    if (!productsList || !productCount) return;
    
    if (products.length === 0) {
        productsList.innerHTML = '<div class="empty-state">No products listed yet</div>';
        productCount.textContent = '0 products';
        return;
    }

    productCount.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

    productsList.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.images.length > 0 ? 
                    `<img src="${product.images[0]}" alt="${product.name}">` : 
                    '📦'
                }
            </div>
            <div class="product-details">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description}</div>
                <div class="product-quantity">Quantity: ${product.quantity}</div>
                <div class="product-price">${DashboardUtils.formatPrice(product.price)}</div>
            </div>
        </div>
    `).join('');
}

// ==================== SEARCH FUNCTIONALITY ====================
function initializeSearch() {
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#inventoryTableBody tr');
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}