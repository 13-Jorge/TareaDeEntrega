document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                displayMessage(loginMessage, 'Por favor, completa todos los campos', 'error');
                return;
            }
            
            // Hacer la petición para validar el login
            makeRequest('GET', 'data/users.json')
                .then(users => {
                    const user = users.find(u => u.username === username && u.password === password);
                    
                    if (user) {
                        // Login exitoso
                        saveUser(user);
                        displayMessage(loginMessage, 'Login exitoso. Redirigiendo...', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    } else {
                        // Login fallido
                        displayMessage(loginMessage, 'Usuario o contraseña incorrectos', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error al iniciar sesión:', error);
                    displayMessage(loginMessage, 'Error al iniciar sesión. Intenta de nuevo más tarde.', 'error');
                });
        });
    }
});

function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}