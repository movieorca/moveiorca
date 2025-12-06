/**
 * E-Commerce Store - Frontend Application Logic
 */

// ====================
// CONFIGURATION
// ====================

const CONFIG = {
  API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE', // Replace with your deployed Web App URL
};

// ====================
// STATE MANAGEMENT
// ====================

const AppState = {
  currentUser: null,
  cart: [],
  products: [],

  init() {
    this.loadUser();
    this.loadCart();
    this.updateNavigation();
  },

  loadUser() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user_data');

    if (token && user) {
      this.currentUser = {
        token: token,
        ...JSON.parse(user)
      };
    }
  },

  setUser(token, userData) {
    this.currentUser = {
      token: token,
      ...userData
    };
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    this.updateNavigation();
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.updateNavigation();
    window.location.href = 'index.html';
  },

  loadCart() {
    const savedCart = localStorage.getItem('shopping_cart');
    this.cart = savedCart ? JSON.parse(savedCart) : [];
  },

  saveCart() {
    localStorage.setItem('shopping_cart', JSON.stringify(this.cart));
    this.updateCartBadge();
  },

  addToCart(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.product_id === product.product_id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        product_id: product.product_id,
        name: product.name,
        image_url: product.image_url,
        price: product.offer_price || product.price,
        quantity: quantity,
        stock_quantity: product.stock_quantity
      });
    }

    this.saveCart();
    showNotification('Product added to cart!', 'success');
  },

  updateCartItem(product_id, quantity) {
    const item = this.cart.find(item => item.product_id === product_id);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        this.removeFromCart(product_id);
      } else {
        this.saveCart();
      }
    }
  },

  removeFromCart(product_id) {
    this.cart = this.cart.filter(item => item.product_id !== product_id);
    this.saveCart();
  },

  clearCart() {
    this.cart = [];
    this.saveCart();
  },

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getCartItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  },

  updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.getCartItemCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  updateNavigation() {
    const loginLink = document.getElementById('login-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const logoutLink = document.getElementById('logout-link');

    if (this.currentUser) {
      if (loginLink) loginLink.style.display = 'none';
      if (dashboardLink) dashboardLink.style.display = 'block';
      if (logoutLink) logoutLink.style.display = 'block';
    } else {
      if (loginLink) loginLink.style.display = 'block';
      if (dashboardLink) dashboardLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'none';
    }
  }
};

// ====================
// API FUNCTIONS
// ====================

const API = {
  async request(endpoint, options = {}) {
    try {
      const url = `${CONFIG.API_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Network error. Please try again.');
    }
  },

  async getProducts() {
    return this.request('?action=products');
  },

  async signup(userData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'signup',
        ...userData
      })
    });
  },

  async login(credentials) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        ...credentials
      })
    });
  },

  async createOrder(orderData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'createOrder',
        token: AppState.currentUser.token,
        ...orderData
      })
    });
  },

  async getOrders() {
    return this.request(`?action=getOrders&token=${AppState.currentUser.token}`);
  }
};

// ====================
// PRODUCT FUNCTIONS
// ====================

async function loadProducts() {
  const container = document.getElementById('products-container');
  if (!container) return;

  showLoading(container);

  try {
    const response = await API.getProducts();

    if (response.success && response.products) {
      AppState.products = response.products;
      renderProducts(response.products);
    } else {
      showError(container, 'Failed to load products');
    }
  } catch (error) {
    showError(container, error.message);
  }
}

function renderProducts(products) {
  const container = document.getElementById('products-container');

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">📦</div>
        <h3>No Products Available</h3>
        <p>Check back soon for new products!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
  const isOutOfStock = product.stock_quantity === 0;
  const hasDiscount = product.offer_price && product.offer_price < product.price;
  const displayPrice = product.offer_price || product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.offer_price) / product.price) * 100)
    : 0;

  return `
    <div class="product-card">
      <img src="${product.image_url}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/280x240?text=No+Image'">
      <div class="product-content">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>

        <div class="product-price-container">
          <span class="product-price">₹${displayPrice}</span>
          ${hasDiscount ? `
            <span class="product-original-price">₹${product.price}</span>
            <span class="product-discount">${discountPercent}% OFF</span>
          ` : ''}
        </div>

        <div class="product-stock">
          ${isOutOfStock
            ? '<span class="stock-out">Out of Stock</span>'
            : `<span class="stock-available">In Stock (${product.stock_quantity})</span>`
          }
        </div>

        <button
          class="btn btn-primary btn-block"
          onclick="handleAddToCart('${product.product_id}')"
          ${isOutOfStock ? 'disabled' : ''}
        >
          ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

function handleAddToCart(product_id) {
  const product = AppState.products.find(p => p.product_id === product_id);
  if (product && product.stock_quantity > 0) {
    AppState.addToCart(product);
  }
}

// ====================
// CART FUNCTIONS
// ====================

function renderCart() {
  const container = document.getElementById('cart-items');
  const summaryContainer = document.getElementById('cart-summary');

  if (!container) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your Cart is Empty</h3>
        <p>Add some products to get started!</p>
        <a href="index.html" class="btn btn-primary mt-3">Continue Shopping</a>
      </div>
    `;
    if (summaryContainer) summaryContainer.innerHTML = '';
    return;
  }

  container.innerHTML = AppState.cart.map(item => createCartItemHTML(item)).join('');
  if (summaryContainer) summaryContainer.innerHTML = createCartSummaryHTML();
}

function createCartItemHTML(item) {
  return `
    <div class="cart-item">
      <img src="${item.image_url}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100?text=No+Image'">

      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-price">₹${item.price}</p>
      </div>

      <div class="cart-item-actions">
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="updateQuantity('${item.product_id}', ${item.quantity - 1})">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity('${item.product_id}', ${item.quantity + 1})" ${item.quantity >= item.stock_quantity ? 'disabled' : ''}>+</button>
        </div>
        <button class="remove-btn" onclick="removeItem('${item.product_id}')">Remove</button>
      </div>
    </div>
  `;
}

function createCartSummaryHTML() {
  const subtotal = AppState.getCartTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return `
    <h3 class="mb-3">Order Summary</h3>
    <div class="summary-row">
      <span>Subtotal</span>
      <span>₹${subtotal.toFixed(2)}</span>
    </div>
    <div class="summary-row">
      <span>Shipping</span>
      <span>Free</span>
    </div>
    <div class="summary-row">
      <span>Total</span>
      <span>₹${total.toFixed(2)}</span>
    </div>
    <a href="checkout.html" class="btn btn-primary btn-block mt-3">Proceed to Checkout</a>
  `;
}

function updateQuantity(product_id, newQuantity) {
  if (newQuantity >= 1) {
    AppState.updateCartItem(product_id, newQuantity);
    renderCart();
  }
}

function removeItem(product_id) {
  if (confirm('Remove this item from cart?')) {
    AppState.removeFromCart(product_id);
    renderCart();
  }
}

// ====================
// AUTH FUNCTIONS
// ====================

async function handleSignup(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorDiv = document.getElementById('error-message');

  const userData = {
    full_name: form.full_name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    password: form.password.value
  };

  // Validation
  if (userData.password.length < 6) {
    showError(errorDiv, 'Password must be at least 6 characters');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    const response = await API.signup(userData);

    if (response.success) {
      AppState.setUser(response.token, response.user);
      showNotification('Account created successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showError(errorDiv, response.error || 'Signup failed');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  } catch (error) {
    showError(errorDiv, error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorDiv = document.getElementById('error-message');

  const credentials = {
    email: form.email.value.trim(),
    password: form.password.value
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const response = await API.login(credentials);

    if (response.success) {
      AppState.setUser(response.token, response.user);
      showNotification('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      showError(errorDiv, response.error || 'Login failed');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  } catch (error) {
    showError(errorDiv, error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    AppState.logout();
  }
}

// ====================
// CHECKOUT FUNCTIONS
// ====================

function initCheckout() {
  if (!AppState.currentUser) {
    showNotification('Please login to checkout', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  if (AppState.cart.length === 0) {
    showNotification('Your cart is empty', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
    return;
  }

  renderCheckoutSummary();
  prefillCheckoutForm();
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkout-items');
  if (!container) return;

  const itemsHTML = AppState.cart.map(item => `
    <div class="order-item">
      <span>${item.name} x ${item.quantity}</span>
      <span>₹${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const total = AppState.getCartTotal();

  container.innerHTML = `
    <h3 class="mb-2">Order Items</h3>
    ${itemsHTML}
    <div class="order-total mt-3">
      <span>Total Amount</span>
      <span>₹${total.toFixed(2)}</span>
    </div>
  `;
}

function prefillCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form || !AppState.currentUser) return;

  form.full_name.value = AppState.currentUser.full_name || '';
  form.phone.value = AppState.currentUser.phone || '';
}

async function handleCheckout(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const errorDiv = document.getElementById('error-message');

  const orderData = {
    full_name: form.full_name.value.trim(),
    phone: form.phone.value.trim(),
    city: form.city.value.trim(),
    address: form.address.value.trim(),
    items: AppState.cart,
    total_amount: AppState.getCartTotal()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Placing Order...';

  try {
    const response = await API.createOrder(orderData);

    if (response.success) {
      AppState.clearCart();
      showNotification('Order placed successfully!', 'success');

      // Show success message
      document.getElementById('checkout-container').innerHTML = `
        <div class="auth-container text-center">
          <h2 class="auth-title">Order Placed Successfully! 🎉</h2>
          <p class="mb-3">Your order ID: <strong>${response.order_id}</strong></p>
          <p class="mb-4">You will receive a confirmation email shortly.</p>
          <p class="mb-4">Payment Method: Cash on Delivery (COD)</p>
          <a href="dashboard.html" class="btn btn-primary">View Orders</a>
          <a href="index.html" class="btn btn-outline mt-2">Continue Shopping</a>
        </div>
      `;
    } else {
      showError(errorDiv, response.error || 'Failed to place order');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order';
    }
  } catch (error) {
    showError(errorDiv, error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
  }
}

// ====================
// DASHBOARD FUNCTIONS
// ====================

async function loadOrders() {
  if (!AppState.currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const container = document.getElementById('orders-container');
  if (!container) return;

  showLoading(container);

  try {
    const response = await API.getOrders();

    if (response.success && response.orders) {
      renderOrders(response.orders);
    } else {
      showError(container, 'Failed to load orders');
    }
  } catch (error) {
    showError(container, error.message);
  }
}

function renderOrders(orders) {
  const container = document.getElementById('orders-container');

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">📋</div>
        <h3>No Orders Yet</h3>
        <p>Start shopping to see your orders here!</p>
        <a href="index.html" class="btn btn-primary mt-3">Start Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="orders-list">
      ${orders.map(order => createOrderCard(order)).join('')}
    </div>
  `;
}

function createOrderCard(order) {
  const statusClass = order.status.toLowerCase().replace(/\s+/g, '');
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const itemsHTML = order.items.map(item => `
    <div class="order-item">
      <span>${item.name} x ${item.quantity}</span>
      <span>₹${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <div class="order-card">
      <div class="order-header">
        <div>
          <div class="order-id">${order.order_id}</div>
          <div class="order-date">${date}</div>
        </div>
        <div class="order-status status-${statusClass}">${order.status}</div>
      </div>

      <div class="order-items">
        ${itemsHTML}
      </div>

      <div class="order-total">
        <span>Total Amount</span>
        <span>₹${order.total_amount.toFixed(2)}</span>
      </div>

      <div class="order-address">
        <strong>Delivery Address:</strong><br>
        ${order.city}<br>
        ${order.address}<br>
        Phone: ${order.phone}
      </div>
    </div>
  `;
}

// ====================
// UTILITY FUNCTIONS
// ====================

function showLoading(container) {
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
}

function showError(container, message) {
  if (typeof container === 'string') {
    container = document.getElementById(container);
  }

  if (container) {
    container.innerHTML = `
      <div class="alert alert-error">
        ${message}
      </div>
    `;
  }
}

function showNotification(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

function toggleMobileMenu() {
  const menu = document.getElementById('nav-menu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

// ====================
// INITIALIZATION
// ====================

document.addEventListener('DOMContentLoaded', () => {
  AppState.init();

  // Setup logout handler
  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});
