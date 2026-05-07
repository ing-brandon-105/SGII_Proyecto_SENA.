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

// Función para cargar indicadores de alto nivel
async function cargarTelemetria() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/reportes/resumen');
        const data = await respuesta.json();
        
        document.getElementById('indicadorProductos').textContent = data.total_productos || 0;
        document.getElementById('indicadorEntradas').textContent = data.total_entradas || 0;
        document.getElementById('indicadorSalidas').textContent = data.total_salidas || 0;
    } catch (error) {
        console.error('Fallo en la recepción de indicadores:', error);
    }
}

// Ejecutar telemetría al cargar el dashboard
cargarTelemetria();