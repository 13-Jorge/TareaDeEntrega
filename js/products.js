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
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price.toFixed(2)} €</p>
                <button class="add-to-cart" data-id="${product.id}">Añadir al carrito</button>
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
    
    if (!user) {
        // Redireccionar al login si no hay usuario
        window.location.href = 'login.html';
        return;
    }
    
    // Obtener el carrito actual del localStorage o inicializar uno nuevo
    let carts = JSON.parse(localStorage.getItem('carts')) || [];
    let userCart = carts.find(cart => cart.userId === user.id);
    
    if (!userCart) {
        // Crear nuevo carrito si no existe
        userCart = {
            userId: user.id,
            items: []
        };
        carts.push(userCart);
    }
    
    // Buscar si el producto ya está en el carrito
    const existingItem = userCart.items.find(item => item.productId === productId);
    
    if (existingItem) {
        // Incrementar cantidad si ya existe
        existingItem.quantity += 1;
    } else {
        // Añadir nuevo item si no existe
        userCart.items.push({
            productId: productId,
            quantity: 1
        });
    }
    
    // Guardar el carrito actualizado en localStorage
    localStorage.setItem('carts', JSON.stringify(carts));
    alert('Producto añadido al carrito');
    updateCartCounter();
}