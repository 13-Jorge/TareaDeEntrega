document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los valores del formulario
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validar que todos los campos estén completos
            if (!username || !email || !password || !confirmPassword) {
                displayMessage(registerMessage, 'Por favor, completa todos los campos', 'error');
                return;
            }
            
            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                displayMessage(registerMessage, 'Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Cargar usuarios existentes o crear un array vacío si no hay ninguno
            loadUsers()
                .then(users => {
                    // Verificar si el usuario o email ya existe
                    if (users.some(user => user.username === username)) {
                        displayMessage(registerMessage, 'El nombre de usuario ya está en uso', 'error');
                        return;
                    }
                    
                    if (users.some(user => user.email === email)) {
                        displayMessage(registerMessage, 'El correo electrónico ya está registrado', 'error');
                        return;
                    }
                    
                    // Crear nuevo usuario
                    const newUser = {
                        id: users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1,
                        username: username,
                        email: email,
                        password: password
                    };
                    
                    // Añadir el nuevo usuario al array de usuarios
                    users.push(newUser);
                    
                    // Guardar en localStorage
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    // Mostrar mensaje de éxito
                    displayMessage(registerMessage, 'Registro exitoso. Redirigiendo...', 'success');
                    
                    // Iniciar sesión automáticamente con el nuevo usuario
                    saveUser(newUser);
                    
                    // Redirigir al inicio después de un tiempo
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                })
                .catch(error => {
                    console.error('Error al registrar usuario:', error);
                    displayMessage(registerMessage, 'Error al registrar usuario. Intenta de nuevo más tarde.', 'error');
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
                    // Si falla, devolvemos un array vacío para comenzar
                    resolve([]);
                });
        }
    });
}

function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
}