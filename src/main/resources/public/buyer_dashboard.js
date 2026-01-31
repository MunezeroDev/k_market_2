
let cart = [];
let currentPage = 1;
const productsPerPage = 10;
let allProducts = [];


const cartBtn = document.getElementById('cartBtn');
const cartCount = document.querySelector('.cart-count');
const profileBtn = document.getElementById('profileBtn');
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.querySelector('.search-input');


document.addEventListener('DOMContentLoaded', async function() {
    
    const result = await DashboardUtils.loadUserData();
    
    if (result.success) {
        
        if (!result.roles.includes('buyer')) {
            alert('Access denied. Buyer role required.');
            window.location.href = '/login.html';
            return;
        }
        
        
        DashboardUtils.displayUserName(result.user.userName, 'buyerName');
        
        
        window.currentUserData = result.user;
    }
    
    
    DashboardUtils.initializeProfileModal();
    DashboardUtils.initializeLogout();
    
    
    initializeCart();
    initializeSearch();
    initializeProfileButton();
    initializePagination();
    loadProducts();
});


function initializeProfileButton() {
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            if (window.currentUserData) {
                DashboardUtils.showProfileModal(window.currentUserData, 'buyer');
            }
        });
    }
}


function initializeCart() {
    
    updateCartCount();
    updateCartDisplay();
    
    
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            openCart();
        });
    }
    
    
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            closeCart();
        });
    }
    
    
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', () => {
            closeCart();
        });
    }
    
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            handleCheckout();
        });
    }
    
    
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
        document.body.style.overflow = 'hidden'; 
        updateCartDisplay();
    }
}

function closeCart() {
    const cartPanel = document.getElementById('cartPanel');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartPanel && cartOverlay) {
        cartPanel.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = ''; 
    }
}

function addToCart(productCard) {
    const productId = productCard.querySelector('.add-to-cart-btn').dataset.productId;
    const productName = productCard.querySelector('.product-name').textContent;
    const price = parseFloat(productCard.querySelector('.product-price').dataset.price);
    const productImage = productCard.querySelector('.product-image img')?.src;
    const productDescription = productCard.querySelector('.product-specs').textContent;
    
    
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
    
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        
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
    
    
    cart.forEach(item => {
        const cartItem = createCartItem(item);
        cartItemsContainer.appendChild(cartItem);
    });
    
    
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
    
    
    closeCart();
    
    
    showPaymentMethodModal(total);
}

function showPaymentMethodModal(total) {
    
    const modalHTML = `
        <div id="paymentModal" class="modal active">
            <div class="modal-content payment-modal">
                <div class="modal-header">
                    <h3>Choose Payment Method</h3>
                    <button class="close-modal" onclick="closePaymentModal()">&times;</button>
                </div>
                <div class="payment-summary">
                    <p>Total Amount: <strong>Ksh. ${total.toLocaleString()}</strong></p>
                </div>
                <div class="payment-methods">
                    <button class="payment-method-btn" onclick="showMpesaForm(${total})">
                        <div class="payment-icon">📱</div>
                        <div class="payment-name">M-Pesa</div>
                    </button>
                    <button class="payment-method-btn" onclick="showPayPalForm(${total})">
                        <div class="payment-icon">💳</div>
                        <div class="payment-name">PayPal</div>
                    </button>
                    <button class="payment-method-btn" onclick="showCreditCardForm(${total})">
                        <div class="payment-icon">💳</div>
                        <div class="payment-name">Credit Card</div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.remove();
    }
}

function showMpesaForm(total) {
    const formHTML = `
        <div id="paymentFormModal" class="modal active">
            <div class="modal-content payment-form-modal">
                <div class="modal-header">
                    <h3>M-Pesa Payment</h3>
                    <button class="close-modal" onclick="closePaymentFormModal()">&times;</button>
                </div>
                <div class="payment-form">
                    <p class="form-instruction">Enter your M-Pesa details</p>
                    <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" id="mpesaPhone" placeholder="07XX XXX XXX" required>
                    </div>
                    <div class="payment-total">
                        <span>Amount to Pay:</span>
                        <span class="amount">Ksh. ${total.toLocaleString()}</span>
                    </div>
                    <button class="submit-payment-btn" onclick="processMpesaPayment(${total})">
                        Pay with M-Pesa
                    </button>
                </div>
            </div>
        </div>
    `;
    
    closePaymentModal();
    document.body.insertAdjacentHTML('beforeend', formHTML);
}

function showPayPalForm(total) {
    const formHTML = `
        <div id="paymentFormModal" class="modal active">
            <div class="modal-content payment-form-modal">
                <div class="modal-header">
                    <h3>PayPal Payment</h3>
                    <button class="close-modal" onclick="closePaymentFormModal()">&times;</button>
                </div>
                <div class="payment-form">
                    <p class="form-instruction">Enter your PayPal details</p>
                    <div class="form-group">
                        <label>PayPal Email</label>
                        <input type="email" id="paypalEmail" placeholder="your-email@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>PayPal Password</label>
                        <input type="password" id="paypalPassword" placeholder="Enter password" required>
                    </div>
                    <div class="payment-total">
                        <span>Amount to Pay:</span>
                        <span class="amount">Ksh. ${total.toLocaleString()}</span>
                    </div>
                    <button class="submit-payment-btn" onclick="processPayPalPayment(${total})">
                        Pay with PayPal
                    </button>
                </div>
            </div>
        </div>
    `;
    
    closePaymentModal();
    document.body.insertAdjacentHTML('beforeend', formHTML);
}

function showCreditCardForm(total) {
    const formHTML = `
        <div id="paymentFormModal" class="modal active">
            <div class="modal-content payment-form-modal">
                <div class="modal-header">
                    <h3>Credit Card Payment</h3>
                    <button class="close-modal" onclick="closePaymentFormModal()">&times;</button>
                </div>
                <div class="payment-form">
                    <p class="form-instruction">Enter your card details</p>
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="text" id="cardCVV" placeholder="123" maxlength="3" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" id="cardName" placeholder="John Doe" required>
                    </div>
                    <div class="payment-total">
                        <span>Amount to Pay:</span>
                        <span class="amount">Ksh. ${total.toLocaleString()}</span>
                    </div>
                    <button class="submit-payment-btn" onclick="processCreditCardPayment(${total})">
                        Pay with Credit Card
                    </button>
                </div>
            </div>
        </div>
    `;
    
    closePaymentModal();
    document.body.insertAdjacentHTML('beforeend', formHTML);
}

function closePaymentFormModal() {
    const modal = document.getElementById('paymentFormModal');
    if (modal) {
        modal.remove();
    }
}

function processMpesaPayment(total) {
    const phone = document.getElementById('mpesaPhone').value;
    
    if (!phone) {
        alert('Please enter your M-Pesa phone number');
        return;
    }
    
    
    closePaymentFormModal();
    showPaymentSuccess('M-Pesa', total);
}

function processPayPalPayment(total) {
    const email = document.getElementById('paypalEmail').value;
    const password = document.getElementById('paypalPassword').value;
    
    if (!email || !password) {
        alert('Please enter your PayPal credentials');
        return;
    }
    
    
    closePaymentFormModal();
    showPaymentSuccess('PayPal', total);
}

function processCreditCardPayment(total) {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiry = document.getElementById('cardExpiry').value;
    const cvv = document.getElementById('cardCVV').value;
    const name = document.getElementById('cardName').value;
    
    if (!cardNumber || !expiry || !cvv || !name) {
        alert('Please fill in all card details');
        return;
    }
    
    
    closePaymentFormModal();
    showPaymentSuccess('Credit Card', total);
}

function showPaymentSuccess(method, total) {
    const successHTML = `
        <div id="successModal" class="modal active">
            <div class="modal-content success-modal">
                <div class="success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <div class="success-details">
                    <p>Payment Method: <strong>${method}</strong></p>
                    <p>Amount Paid: <strong>Ksh. ${total.toLocaleString()}</strong></p>
                    <p class="success-message">Thank you for your purchase!</p>
                </div>
                <button class="close-success-btn" onclick="closeSuccessModal()">Close</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', successHTML);
    
    
    cart = [];
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.remove();
    }
}

function saveCart() {
    
    console.log('Cart updated:', cart.length, 'items');
}


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
    
    
    productsGrid.innerHTML = '';
    
    
    let filteredProducts = allProducts;
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        filteredProducts = allProducts.filter(product => 
            product.productName.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
    
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No products found.</p>';
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    
    const imageUrl = product.images && product.images.length > 0 
        ? product.images[0] 
        : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400';
    
    
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
            <p class="product-price" data-price="${product.price}">Ksh. ${parseFloat(product.price).toLocaleString()}</p>
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


function initializeSearch() {
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch(e) {
    renderProducts(); 
}


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