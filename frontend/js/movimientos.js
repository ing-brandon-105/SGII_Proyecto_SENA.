let operador = null;

document.addEventListener('DOMContentLoaded', () => {
    const sesionLocal = localStorage.getItem('usuarioLogueado');
    if (!sesionLocal) { window.location.href = '../index.html'; return; }
    
    operador = JSON.parse(sesionLocal);
    document.getElementById('labelUsuario').textContent = `Op: ${operador.nombre}`;

    // LÓGICA POLIMÓRFICA: Renderizar menú según el Rol
    const linkDashboard = document.getElementById('linkDashboard');
    const linkUsuarios = document.getElementById('linkUsuarios');
    
    if (operador.rol_id === 1) { // Administrador
        linkDashboard.innerHTML = `<a href="admin-dashboard.html" class="nav-link m-2"><i class="nav-icon bi bi-speedometer2 text-white"></i><p>Dashboard</p></a>`;
        linkUsuarios.innerHTML = `<a href="usuarios.html" class="nav-link m-2"><i class="nav-icon bi bi-people-fill text-warning"></i><p>Usuarios</p></a>`;
    } else { // Operario
        linkDashboard.innerHTML = `<a href="operario-dashboard.html" class="nav-link m-2"><i class="nav-icon bi bi-speedometer2 text-white"></i><p>Mi Tablero</p></a>`;
    }

    // Inicializar motores de datos
    cargarProductosOptions();
    cargarHistorial();

    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });
});

// Llenar el menú desplegable del modal
async function cargarProductosOptions() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/productos');
        const productos = await respuesta.json();
        const select = document.getElementById('producto_id');
        select.innerHTML = '<option value="">Seleccione el material...</option>';
        productos.forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.nombre} (Disponibles: ${p.stock})</option>`;
        });
    } catch (error) { console.error("Fallo de red en catálogo."); }
}

// Llenar la tabla de historial transaccional
async function cargarHistorial() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/movimientos');
        const historial = await respuesta.json();
        const tabla = document.getElementById('cuerpoTablaMov');
        tabla.innerHTML = '';

        historial.forEach(m => {
            // Formatear la fecha para que sea legible
            const fechaFormateada = new Date(m.fecha).toLocaleString('es-CO');
            const badgeTipo = m.tipo_movimiento === 'Entrada' 
                ? '<span class="badge bg-success"><i class="bi bi-box-arrow-in-down"></i> Entrada</span>' 
                : '<span class="badge bg-danger"><i class="bi bi-box-arrow-up"></i> Salida</span>';

            tabla.innerHTML += `
                <tr>
                    <td class="fw-bold text-secondary">TK-${m.id.toString().padStart(5, '0')}</td>
                    <td class="small">${fechaFormateada}</td>
                    <td class="fw-bold text-dark">${m.producto}</td>
                    <td class="fst-italic text-muted">${m.operador}</td>
                    <td>${badgeTipo}</td>
                    <td class="fw-bold fs-5">${m.cantidad}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary" title="Auditar" onclick="verAuditoria(${m.id}, '${m.producto}', '${m.tipo_movimiento}')">
                            <i class="bi bi-search"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (e) { console.error("Fallo en lectura de auditoría."); }
}

// Enviar nuevo movimiento (POST)
document.getElementById('formMovimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alerta = document.getElementById('alertaSistema');

    const payload = {
        producto_id: document.getElementById('producto_id').value,
        usuario_id: operador.id, // Se inyecta automáticamente el ID del que tiene la sesión abierta
        tipo_movimiento: document.getElementById('tipo_movimiento').value,
        cantidad: parseInt(document.getElementById('cantidad').value)
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();
        alerta.classList.remove('d-none', 'alert-danger', 'alert-success');

        if (respuesta.ok && data.success) {
            alerta.classList.add('alert-success');
            alerta.textContent = data.mensaje;
            
            // Recalibrar sistemas
            cargarHistorial();
            cargarProductosOptions(); // Actualiza el stock en el desplegable
            document.getElementById('formMovimiento').reset();
            
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalMovimiento'));
                modal.hide();
                alerta.classList.add('d-none');
            }, 1500);
        } else {
            alerta.classList.add('alert-danger');
            alerta.textContent = data.error;
        }
    } catch (error) {
        alerta.classList.remove('d-none', 'alert-success');
        alerta.classList.add('alert-danger');
        alerta.textContent = 'Colapso de servidor central.';
    }
});

// Función de botón de acción (Cumpliendo estándares de inmutabilidad)
window.verAuditoria = function(id, producto, tipo) {
    alert(`AUDITORÍA TRANSACCIONAL\nTicket: TK-${id.toString().padStart(5, '0')}\nMaterial: ${producto}\nOperación: ${tipo}\n\n* Por normativas de calidad, este registro es inmutable y no puede ser alterado ni eliminado.`);
};