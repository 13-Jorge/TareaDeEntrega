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
            
            // Cargar usuarios de localStorage o del archivo JSON
            loadUsers()
                .then(users => {
                    const user = users.find(u => u.username === username && u.password === password);
                    
                    if (user) {
                        // Login exitoso
                        handleSuccessfulLogin(user);
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

// Función para cargar usuarios desde localStorage o del archivo JSON
function loadUsers() {
    return new Promise((resolve, reject) => {
        // Primero intentamos cargar desde localStorage
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            resolve(JSON.parse(storedUsers));
        } else {
            // Si no hay usuarios en localStorage, intentamos cargar del archivo JSON
            makeRequest('GET', 'data/users.json')
                .then(users => {
                    // Guardamos los usuarios cargados en localStorage para futuras referencias
                    localStorage.setItem('users', JSON.stringify(users));
                    resolve(users);
                })
                .catch(error => {
                    console.error('Error al cargar usuarios:', error);
                    // Si falla, devolvemos un array vacío
                    resolve([]);
                });
        }
    });
}

function handleSuccessfulLogin(user) {
    saveUser(user);
    displayMessage(loginMessage, 'Login exitoso. Redirigiendo...', 'success');
    
    // Comprobar si hay redirección pendiente
    const redirectUrl = localStorage.getItem('redirectAfterLogin') || 'index.html';
    localStorage.removeItem('redirectAfterLogin');
    
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1500);
}

function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}