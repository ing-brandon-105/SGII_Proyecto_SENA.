document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const mensajeError = document.getElementById('mensajeError');

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar la credencial en la guantera del navegador
            localStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
            
            // LÓGICA DE DESPACHO (SWITCH DE RUTAS)
            if (data.usuario.rol_id === 1) {
                // Si es Administrador
                window.location.href = 'pages/admin-dashboard.html';
            } else if (data.usuario.rol_id === 2) {
                // Si es Operario de Planta
                window.location.href = 'pages/operario-dashboard.html';
            } else {
                mensajeError.textContent = 'Error crítico: Rol no reconocido.';
                mensajeError.classList.remove('d-none');
            }
        } else {
            mensajeError.textContent = data.mensaje;
            mensajeError.classList.remove('d-none');
        }
    } catch (error) {
        console.error('Falla en la transmisión:', error);
        mensajeError.textContent = 'Servidor fuera de línea. Verifica la terminal Node.js.';
        mensajeError.classList.remove('d-none');
    }
});