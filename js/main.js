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
        
        // Actualizar contador del carrito
        updateCartCounter();
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (cartLink) cartLink.style.display = 'none';
        if (welcomeMessage) welcomeMessage.textContent = 'Explora nuestros productos';
    }
}

// Actualizar contador del carrito
function updateCartCounter() {
    const user = getCurrentUser();
    if (!user) return;

    const carts = JSON.parse(localStorage.getItem('carts')) || [];
    const userCart = carts.find(cart => cart.userId === user.id);
    const cartCounter = document.getElementById('cartCounter');
    
    if (userCart && cartCounter) {
        const itemCount = userCart.items.reduce((total, item) => total + item.quantity, 0);
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