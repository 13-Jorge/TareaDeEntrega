// Modificación en register.js para usar localStorage
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validaciones...
            
            // Obtener usuarios actuales de localStorage o del JSON
            let users = JSON.parse(localStorage.getItem('users'));
            
            if (!users) {
                // Si no hay usuarios en localStorage, cargar desde el JSON
                makeRequest('GET', 'data/users.json')
                    .then(loadedUsers => {
                        users = loadedUsers;
                        processRegistration();
                    })
                    .catch(error => {
                        console.error('Error al cargar usuarios:', error);
                        displayMessage(registerMessage, 'Error al registrar. Intenta de nuevo más tarde.', 'error');
                    });
            } else {
                processRegistration();
            }
            
            function processRegistration() {
                const existingUser = users.find(u => u.username === username || u.email === email);
                
                if (existingUser) {
                    // Manejo de usuario existente...
                    return;
                }
                
                // Crear nuevo usuario
                const newUser = {
                    id: users.length + 1,
                    username: username,
                    email: email,
                    password: password
                };
                
                // Añadir el nuevo usuario a la lista
                users.push(newUser);
                
                // Guardar en localStorage
                localStorage.setItem('users', JSON.stringify(users));
                
                displayMessage(registerMessage, 'Registro exitoso. Redirigiendo al inicio de sesión...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    }
});