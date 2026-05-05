document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault(); // Bloquea la recarga de la página

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const mensajeError = document.getElementById('mensajeError');

    try {
        // Transmisión de carga útil (payload) hacia el servidor
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardamos el token de sesión en el almacenamiento local
            localStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
            
            // Simulación de redirección temporal hasta tener el dashboard
            mensajeError.classList.remove('alert-danger');
            mensajeError.classList.add('alert-success');
            mensajeError.textContent = 'Acceso concedido. Redirigiendo...';
            mensajeError.classList.remove('d-none');
            
             window.location.href = 'pages/dashboard.html'; // salto automatizado al dashboard (descomentar cuando esté listo)
        } else {
            mensajeError.classList.remove('alert-success');
            mensajeError.classList.add('alert-danger');
            mensajeError.textContent = data.mensaje;
            mensajeError.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Fallo en la red de comunicaciones:', error);
        mensajeError.classList.remove('alert-success');
        mensajeError.classList.add('alert-danger');
        mensajeError.textContent = 'Servidor fuera de línea.';
        mensajeError.classList.remove('d-none');
    }
});