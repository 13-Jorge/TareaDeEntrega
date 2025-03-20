document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartMessage = document.getElementById('cartMessage');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    loadCart();
    
    // Añadir evento al botón de finalizar compra
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            checkout();
        });
    }
});

function loadCart() {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Obtener el carrito desde localStorage
    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    const userCart = carts.find(cart => cart.userId === user.id);
    
    if (!userCart || userCart.items.length === 0) {
        showEmptyCart();
        return;
    }
    
    // Cargar información de productos
    makeRequest('GET', 'data/products.json')
        .then(products => {
            displayCartItems(userCart.items, products);
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            document.getElementById('cartItems').innerHTML = `
                <div class="error-message">
                    Error al cargar los productos del carrito. Por favor, intenta de nuevo más tarde.
                </div>
            `;
        });
}

function displayCartItems(cartItems, products) {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    let total = 0;
    
    cartItemsContainer.innerHTML = '';
    
    cartItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        
        if (product) {
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${product.name}</h3>
                    <p>${product.price.toFixed(2)} € x ${item.quantity}</p>
                    <p class="item-total">${itemTotal.toFixed(2)} €</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn decrease" data-id="${product.id}">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${product.id}">+</button>
                    <button class="remove-item" data-id="${product.id}">Eliminar</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        }
    });
    
    // Mostrar el total
    document.getElementById('cartTotal').textContent = total.toFixed(2);
    cartSummary.style.display = 'block';
    
    // Añadir eventos a los botones
    addCartItemEvents();
}

function addCartItemEvents() {
    // Botones de incrementar cantidad
    const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateCartItemQuantity(productId, 1);
        });
    });
    
    // Botones de decrementar cantidad
    const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateCartItemQuantity(productId, -1);
        });
    });
    
    // Botones de eliminar
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeCartItem(productId);
        });
    });
}

function updateCartItemQuantity(productId, change) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Obtener carrito del localStorage
    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    const userCart = carts.find(cart => cart.userId === user.id);
    
    if (!userCart) return;
    
    // Encontrar el item en el carrito
    const item = userCart.items.find(item => item.productId === productId);
    
    if (item) {
        // Actualizar cantidad
        item.quantity += change;
        
        // Si la cantidad es 0 o menos, eliminar el producto
        if (item.quantity <= 0) {
            userCart.items = userCart.items.filter(i => i.productId !== productId);
        }
        
        // Guardar el carrito actualizado
        localStorage.setItem('carts', JSON.stringify(carts));
        
        // Actualizar la vista
        loadCart();
        updateCartCounter();
    }
}

function removeCartItem(productId) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Obtener carrito del localStorage
    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    const userCart = carts.find(cart => cart.userId === user.id);
    
    if (userCart) {
        // Eliminar el producto del carrito
        userCart.items = userCart.items.filter(item => item.productId !== productId);
        
        // Guardar el carrito actualizado
        localStorage.setItem('carts', JSON.stringify(carts));
        
        // Actualizar la vista
        loadCart();
        updateCartCounter();
        
        // Mostrar mensaje
        displayMessage(document.getElementById('cartMessage'), 'Producto eliminado del carrito', 'success');
    }
}

function showEmptyCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    
    cartItems.innerHTML = '';
    cartSummary.style.display = 'none';
    emptyCartMessage.style.display = 'block';
}

function checkout() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Obtener carrito del localStorage
    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    const userCartIndex = carts.findIndex(cart => cart.userId === user.id);
    
    if (userCartIndex !== -1) {
        // Crear copia del carrito para historial si fuera necesario
        const completedOrder = {
            userId: user.id,
            items: [...carts[userCartIndex].items],
            date: new Date().toISOString(),
            total: parseFloat(document.getElementById('cartTotal').textContent)
        };
        
        // Vaciar el carrito del usuario
        carts[userCartIndex].items = [];
        localStorage.setItem('carts', JSON.stringify(carts));
        
        // Guardar historial de órdenes (opcional)
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.push(completedOrder);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        
        // Mostrar mensaje de éxito
        displayMessage(document.getElementById('cartMessage'), 'Compra finalizada con éxito. ¡Gracias por su compra!', 'success');
        
        // Actualizar vista
        showEmptyCart();
        updateCartCounter();
        
        // Opcionalmente redirigir a una página de confirmación
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }
}

function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}