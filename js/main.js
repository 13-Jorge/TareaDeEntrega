// Función para manejar peticiones XMLHttpRequest
function makeRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error('Error en la petición: ' + xhr.status));
                }
            }
        };
        xhr.onerror = function() {
            reject(new Error('Error de red'));
        };
        if (data) {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    });
}

// Funciones para manejo de sesión
function saveUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    updateNavigation();
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Función para obtener o crear un ID de carrito anónimo
function getAnonymousCartId() {
    let anonymousCartId = localStorage.getItem('anonymousCartId');
    
    if (!anonymousCartId) {
        // Crear un ID único para el carrito anónimo
        anonymousCartId = 'anonymous_' + Date.now();
        localStorage.setItem('anonymousCartId', anonymousCartId);
        
        // Establecer tiempo de expiración (7 días en milisegundos)
        const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('anonymousCartExpiration', expirationTime);
    }
    
    // Verificar si el carrito ha expirado
    const expirationTime = parseInt(localStorage.getItem('anonymousCartExpiration') || '0');
    if (expirationTime && Date.now() > expirationTime) {
        // El carrito ha expirado, eliminar
        localStorage.removeItem('anonymousCartId');
        localStorage.removeItem('anonymousCartExpiration');
        
        // Crear un nuevo ID
        anonymousCartId = 'anonymous_' + Date.now();
        localStorage.setItem('anonymousCartId', anonymousCartId);
        
        // Establecer nuevo tiempo de expiración
        const newExpirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('anonymousCartExpiration', newExpirationTime);
    }
    
    return anonymousCartId;
}

// Actualizar la navegación según si hay usuario logueado o no
function updateNavigation() {
    const user = getCurrentUser();
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const logoutLink = document.getElementById('logoutLink');
    const cartLink = document.getElementById('cartLink');
    const welcomeMessage = document.getElementById('welcomeMessage');

    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (cartLink) cartLink.style.display = 'block';
        if (welcomeMessage) welcomeMessage.textContent = `Hola, ${user.username}! Explora nuestros productos`;
        
        // Migrar carrito anónimo al usuario si existe
        migrateAnonymousCart(user.id);
        
        // Actualizar contador del carrito
        updateCartCounter();
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (cartLink) cartLink.style.display = 'block'; // Mostrar carrito siempre
        if (welcomeMessage) welcomeMessage.textContent = 'Explora nuestros productos';
        
        // Actualizar contador para carrito anónimo
        updateCartCounter();
    }
}

// Función para migrar el carrito anónimo al usuario cuando inicia sesión
function migrateAnonymousCart(userId) {
    const anonymousCartId = localStorage.getItem('anonymousCartId');
    if (!anonymousCartId) return;
    
    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    const anonymousCart = carts.find(cart => cart.userId === anonymousCartId);
    
    if (anonymousCart && anonymousCart.items.length > 0) {
        // Buscar si el usuario ya tiene un carrito
        let userCart = carts.find(cart => cart.userId === userId);
        
        if (!userCart) {
            // Crear carrito para el usuario si no existe
            userCart = {
                userId: userId,
                items: []
            };
            carts.push(userCart);
        }
        
        // Transferir items del carrito anónimo al carrito del usuario
        anonymousCart.items.forEach(anonymousItem => {
            const existingItem = userCart.items.find(item => item.productId === anonymousItem.productId);
            
            if (existingItem) {
                // Incrementar cantidad si el producto ya está en el carrito del usuario
                existingItem.quantity += anonymousItem.quantity;
            } else {
                // Añadir el producto al carrito del usuario
                userCart.items.push({
                    productId: anonymousItem.productId,
                    quantity: anonymousItem.quantity
                });
            }
        });
        
        // Eliminar el carrito anónimo
        const anonymousCartIndex = carts.findIndex(cart => cart.userId === anonymousCartId);
        if (anonymousCartIndex !== -1) {
            carts.splice(anonymousCartIndex, 1);
        }
        
        // Actualizar localStorage
        localStorage.setItem('carts', JSON.stringify(carts));
        localStorage.removeItem('anonymousCartId');
        localStorage.removeItem('anonymousCartExpiration');
    }
}

// Actualizar contador del carrito
function updateCartCounter() {
    const user = getCurrentUser();
    const cartId = user ? user.id : getAnonymousCartId();
    
    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    const currentCart = carts.find(cart => cart.userId === cartId);
    const cartCounter = document.getElementById('cartCounter');
    
    if (currentCart && cartCounter) {
        const itemCount = currentCart.items.reduce((total, item) => total + item.quantity, 0);
        cartCounter.textContent = itemCount;
    } else if (cartCounter) {
        cartCounter.textContent = '0';
    }
}

// Inicializar la navegación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    // Evento para cerrar sesión
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});