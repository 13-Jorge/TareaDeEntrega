document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('productsContainer');
    
    if (productsContainer) {
        loadProducts();
    }
});

function loadProducts() {
    makeRequest('GET', 'data/products.json')
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            document.getElementById('productsContainer').innerHTML = `
                <div class="error-message">
                    Error al cargar los productos. Por favor, intenta de nuevo más tarde.
                </div>
            `;
        });
}

function displayProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <p class="product-price">${product.price.toFixed(2)} €</p>
                    <button class="add-to-cart" data-id="${product.id}">
                        <span class="cart-icon">🛒</span>Añadir
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
    
    // Añadir eventos a los botones de añadir al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const user = getCurrentUser();
    const cartId = user ? user.id : getAnonymousCartId();
    
    // Obtener el carrito actual del localStorage o inicializar uno nuevo
    let carts = JSON.parse(localStorage.getItem('carts')) || [];
    let currentCart = carts.find(cart => cart.userId === cartId);
    
    if (!currentCart) {
        // Crear nuevo carrito si no existe
        currentCart = {
            userId: cartId,
            items: []
        };
        carts.push(currentCart);
    }
    
    // Buscar si el producto ya está en el carrito
    const existingItem = currentCart.items.find(item => item.productId === productId);
    
    if (existingItem) {
        // Incrementar cantidad si ya existe
        existingItem.quantity += 1;
    } else {
        // Añadir nuevo item si no existe
        currentCart.items.push({
            productId: productId,
            quantity: 1
        });
    }
    
    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carts', JSON.stringify(carts));
    alert('Producto añadido al carrito');
    updateCartCounter();
}