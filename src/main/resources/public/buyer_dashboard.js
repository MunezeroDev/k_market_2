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
    initializePagination();
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
    updateCartCount();
    updateCartDisplay();
    
    // Cart button click handler - Open cart panel
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            openCart();
        });
    }
    
    // Close cart button
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            closeCart();
        });
    }
    
    // Cart overlay click - Close cart
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            closeCart();
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            handleCheckout();
        });
    }
    
    // Add to cart button handlers (delegated event)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn') && !e.target.disabled) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                addToCart(productCard);
            }
        }
    });
}

function openCart() {
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartPanel && cartOverlay) {
        cartPanel.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        updateCartDisplay();
    }
}

function closeCart() {
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartPanel && cartOverlay) {
        cartPanel.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

function addToCart(productCard) {
    const productId = productCard.querySelector('.add-to-cart-btn').dataset.productId;
    const productName = productCard.querySelector('.product-name').textContent;
    const priceText = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-image img')?.src;
    const productDescription = productCard.querySelector('.product-specs').textContent;
    
    // Extract numeric price
    const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ''));
    
    // Check if product already in cart
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        const product = {
            id: productId,
            name: productName,
            description: productDescription,
            price: price,
            image: productImage,
            quantity: 1
        };
        cart.push(product);
    }
    
    saveCart();
    updateCartCount();
    updateCartDisplay();
    
    DashboardUtils.showNotification('Product added to cart!');
}

function updateCartCount() {
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const totalAmountElement = document.getElementById('totalAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!cartItemsContainer) return;
    
    // Clear container
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // Show empty cart state
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
            </div>
        `;
        
        if (totalAmountElement) totalAmountElement.textContent = 'Ksh. 0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    // Render cart items
    cart.forEach(item => {
        const cartItem = createCartItem(item);
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Calculate and display total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalAmountElement) {
        totalAmountElement.textContent = `Ksh. ${total.toLocaleString()}`;
    }
    
    if (checkoutBtn) checkoutBtn.disabled = false;
}

function createCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.productId = item.id;
    
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <p class="cart-item-description">${item.description}</p>
            <p class="cart-item-price">Ksh. ${item.price.toLocaleString()}</p>
            <div class="cart-item-actions">
                <span class="quantity-label">Quantity:</span>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-qty" data-product-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase-qty" data-product-id="${item.id}">+</button>
                </div>
                <button class="remove-item-btn" data-product-id="${item.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const decreaseBtn = div.querySelector('.decrease-qty');
    const increaseBtn = div.querySelector('.increase-qty');
    const removeBtn = div.querySelector('.remove-item-btn');
    
    decreaseBtn.addEventListener('click', () => decreaseQuantity(item.id));
    increaseBtn.addEventListener('click', () => increaseQuantity(item.id));
    removeBtn.addEventListener('click', () => removeFromCart(item.id));
    
    return div;
}

function increaseQuantity(productId) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity += 1;
        saveCart();
        updateCartCount();
        updateCartDisplay();
    }
}

function decreaseQuantity(productId) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        if (product.quantity > 1) {
            product.quantity -= 1;
            saveCart();
            updateCartCount();
            updateCartDisplay();
        } else {
            removeFromCart(productId);
        }
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
        saveCart();
        updateCartCount();
        updateCartDisplay();
        DashboardUtils.showNotification('Product removed from cart');
    }
}

function handleCheckout() {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Checkout - Total: Ksh. ${total.toLocaleString()}\n\nCheckout functionality coming soon!`);
}

function saveCart() {
    // Cart is kept in memory only during session
    console.log('Cart updated:', cart.length, 'items');
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