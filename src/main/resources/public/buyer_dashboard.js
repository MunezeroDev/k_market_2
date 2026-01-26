// ==================== BUYER-SPECIFIC DATA ====================
let cart = [];
let currentPage = 1;
const productsPerPage = 10;
let allProducts = [];

// ==================== DOM ELEMENTS ====================
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.querySelector('.cart-count');
const profileBtn = document.getElementById('profileBtn');
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.querySelector('.search-input');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    // Load user data using shared utility
    const result = await DashboardUtils.loadUserData();
    
    if (result.success) {
        // Check if user has buyer role
        if (!result.roles.includes('buyer')) {
            alert('Access denied. Buyer role required.');
            window.location.href = '/login.html';
            return;
        }
        
        // Display buyer name
        DashboardUtils.displayUserName(result.user.userName, 'buyerName');
        
        // Store user data for profile modal
        window.currentUserData = result.user;
    }
    
    // Initialize shared components
    DashboardUtils.initializeProfileModal();
    DashboardUtils.initializeLogout();
    
    // Initialize buyer-specific features
    initializeCart();
    initializeSearch();
    initializeProfileButton();
    loadProducts();
});

// ==================== PROFILE BUTTON ====================
function initializeProfileButton() {
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            if (window.currentUserData) {
                DashboardUtils.showProfileModal(window.currentUserData, 'buyer');
            }
        });
    }
}

// ==================== CART FUNCTIONALITY ====================
function initializeCart() {
    // Cart starts empty (in-memory only)
    // No localStorage usage
    updateCartCount();
    
    // Cart button click handler
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            showCartModal();
        });
    }
    
    // Add to cart button handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn') && !e.target.disabled) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                addToCart(productCard);
            }
        }
    });
}

function addToCart(productCard) {
    const productId = productCard.querySelector('.add-to-cart-btn').dataset.productId;
    const productName = productCard.querySelector('.product-name').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-image img')?.src;
    
    // Check if product already in cart
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        };
        cart.push(product);
    }
    
    saveCart();
    updateCartCount();
    
    DashboardUtils.showNotification('Product added to cart!');
}

function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function saveCart() {
    // Cart is kept in memory only during session
    // No localStorage persistence
    console.log('Cart updated:', cart.length, 'items');
}

function showCartModal() {
    // Cart modal implementation
    alert(`You have ${cart.length} items in your cart`);
}

// ==================== PRODUCTS LOADING ====================
async function loadProducts() {
    try {
        const response = await fetch('/api/products', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const responseText = await response.text();
        allProducts = JSON.parse(responseText);
        
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        DashboardUtils.showNotification('Failed to load products');
    }
}

function renderProducts() {
    if (!productsGrid) return;
    
    // Clear existing products
    productsGrid.innerHTML = '';
    
    // Filter products based on search
    let filteredProducts = allProducts;
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        filteredProducts = allProducts.filter(product => 
            product.productName.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Render each product
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    // Show message if no products
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found.</p>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Get first image or use placeholder
    const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400';
    
    // Determine stock status
    const inStock = product.quantity > 0;
    const stockBadgeClass = inStock ? 'in-stock' : 'out-of-stock';
    const stockText = inStock ? 'In Stock' : 'Out of Stock';
    const buttonText = inStock ? 'Add to Cart' : 'Unavailable';
    const buttonDisabled = inStock ? '' : 'disabled';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${imageUrl}" alt="${product.productName}">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.productName}</h3>
            <p class="product-specs">${product.description}</p>
            <p class="product-price">Ksh. ${parseFloat(product.price).toLocaleString()}</p>
            <div class="product-rating">
                <span>★★★★☆</span>
            </div>
            <div class="product-footer">
                <span class="stock-badge ${stockBadgeClass}">${stockText}</span>
                <button class="add-to-cart-btn" ${buttonDisabled} data-product-id="${product.productId}">
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// ==================== SEARCH FUNCTIONALITY ====================
function initializeSearch() {
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch(e) {
    renderProducts(); // Re-render with current search term
}

// ==================== PAGINATION ====================
function initializePagination() {
    const pageButtons = document.querySelectorAll('.page-btn');
    
    pageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.classList.contains('active')) {
                currentPage = parseInt(btn.textContent) || currentPage;
                updateActivePage();
                loadProducts();
            }
        });
    });
}

function updateActivePage() {
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === currentPage) {
            btn.classList.add('active');
        }
    });
}

// Initialize pagination
document.addEventListener('DOMContentLoaded', () => {
    initializePagination();
});