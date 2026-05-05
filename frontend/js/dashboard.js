// 1. Verificación de Seguridad (Protección de ruta)
const usuarioGuardado = localStorage.getItem('usuarioLogueado');

if (!usuarioGuardado) {
    // Si no hay token de sesión, abortar operación y regresar al login
    alert("Acceso denegado. Debe iniciar sesión.");
    window.location.href = '../index.html';
} else {
    // 2. Extraer y parsear los datos del usuario
    const usuario = JSON.parse(usuarioGuardado);
    
    // 3. Inyectar el nombre del usuario en la interfaz
    document.getElementById('nombreUsuario').textContent = `Bienvenido(a), ${usuario.nombre}`;
}

// 4. Lógica de Cierre de Sesión
document.getElementById('btnCerrarSesion').addEventListener('click', () => {
    // Purgar la memoria local
    localStorage.removeItem('usuarioLogueado');
    // Redireccionar a la pantalla de inicio
    window.location.href = '../index.html';
});