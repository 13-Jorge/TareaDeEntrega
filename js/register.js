document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!username || !password || !confirmPassword) {
                displayMessage(registerMessage, 'Por favor, completa todos los campos', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                displayMessage(registerMessage, 'Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Hacer la petición para registrar el usuario
            makeRequest('GET', 'data/users.json')
                .then(users => {
                    if (users.find(u => u.username === username)) {
                        displayMessage(registerMessage, 'El nombre de usuario ya existe', 'error');
                        return;
                    }
                    
                    const newUser = {
                        id: users.length + 1,
                        username,
                        password
                    };
                    users.push(newUser);
                    
                    makeRequest('POST', 'data/users.json', users)
                        .then(() => {
                            displayMessage(registerMessage, 'Registro exitoso. Redirigiendo...', 'success');
                            setTimeout(() => {
                                window.location.href = 'login.html';
                            }, 1500);
                        })
                        .catch(error => {
                            console.error('Error al registrar:', error);
                            displayMessage(registerMessage, 'Error al registrar. Intenta de nuevo más tarde.', 'error');
                        });
                })
                .catch(error => {
                    console.error('Error al obtener usuarios:', error);
                    displayMessage(registerMessage, 'Error al registrar. Intenta de nuevo más tarde.', 'error');
                });
        });
    }
});

function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

function makeRequest(method, url, data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(xhr.statusText));
            }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(data ? JSON.stringify(data) : null);
    });
}