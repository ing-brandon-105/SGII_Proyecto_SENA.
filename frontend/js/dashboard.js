document.addEventListener('DOMContentLoaded', () => {
    // 1. Auditoría de Seguridad
    const sesionLocal = localStorage.getItem('usuarioLogueado');
    if (!sesionLocal) {
        window.location.href = '../index.html';
        return;
    }

    const operador = JSON.parse(sesionLocal);

    // 2. Inyección de Identidad (Detecta automáticamente si es Admin u Operario)
    const labelAdmin = document.getElementById('labelUsuarioAdmin');
    const labelOp = document.getElementById('labelUsuarioOp');
    
    if (labelAdmin) labelAdmin.textContent = `Administrador: ${operador.nombre}`;
    if (labelOp) labelOp.textContent = `Operador en turno: ${operador.nombre}`;

    // 3. Encender telemetría y alertas
    ejecutarTelemetria();
    
    // Solo intenta cargar alertas si la tabla existe en el HTML (Evita errores en el Dashboard Operario)
    if (document.getElementById('tablaAlertas')) {
        cargarAlertasCriticas();
    }

    // 4. Lógica del Botón de Cierre de Sesión
    const btnCerrar = document.getElementById('btnCerrarSesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
});

// Función Analítica: Cada sensor funciona de forma independiente
async function ejecutarTelemetria() {
    try {
        const res = await fetch('http://localhost:3000/api/reportes/resumen');
        if (!res.ok) throw new Error('Error en el sensor de datos');
        
        const data = await res.json();
        
        // Capturamos todos los posibles indicadores
        const elProductos = document.getElementById('indicadorProductos');
        const elEntradas = document.getElementById('indicadorEntradas');
        const elSalidas = document.getElementById('indicadorSalidas');

        // Solo inyectamos el dato si el elemento existe en el tablero actual
        if (elProductos) elProductos.textContent = data.total_productos || 0;
        if (elEntradas) elEntradas.textContent = data.total_entradas || 0;
        if (elSalidas) elSalidas.textContent = data.total_salidas || 0;

    } catch (error) {
        console.error("Fallo de comunicación con el motor de reportes:", error);
    }
}

// Función Auditoría de Inventario Crítico
async function cargarAlertasCriticas() {
    try {
        const res = await fetch('http://localhost:3000/api/reportes/stock-critico');
        const alertas = await res.json();
        const tabla = document.getElementById('tablaAlertas');
        
        if (!tabla) return; 

        tabla.innerHTML = ''; 

        if (alertas.length === 0) {
            tabla.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-success fw-bold"><i class="bi bi-check-circle-fill me-2"></i> Niveles de stock óptimos.</td></tr>`;
            return;
        }

        alertas.forEach(item => {
            tabla.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold text-dark">${item.nombre}</td>
                    <td class="text-danger fw-bold fs-5">${item.stock}</td>
                    <td class="text-secondary">${item.stock_minimo}</td>
                    <td><span class="badge bg-danger px-3 py-2">Reabastecer</span></td>
                </tr>`;
        });
    } catch (error) {
        console.error("Fallo en el módulo de auditoría de stock:", error);
    }
}