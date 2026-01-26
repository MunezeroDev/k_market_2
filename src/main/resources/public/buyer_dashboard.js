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
    const productName = productCard.querySelector('.product-name').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-image img')?.src;
    
    const product = {
        id: Date.now(),
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
    };
    
    cart.push(product);
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
        // In real app, fetch from API
        // const response = await fetch('/api/products');
        // allProducts = await response.json();
        
        // For now, use products from the grid
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        DashboardUtils.showNotification('Failed to load products');
    }
}

function renderProducts() {
    // Products are already rendered in HTML
    // This function would be used when loading from API
}

// ==================== SEARCH FUNCTIONALITY ====================
function initializeSearch() {
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase();
        const productSpecs = card.querySelector('.product-specs').textContent.toLowerCase();
        
        if (productName.includes(searchTerm) || productSpecs.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
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