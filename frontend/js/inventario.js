document.addEventListener('DOMContentLoaded', () => {
    const sesion = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (!sesion) { window.location.href = '../index.html'; return; }

    const labelUsuario = document.getElementById('labelUsuario');
    if(labelUsuario) labelUsuario.textContent = `Operador en turno: ${sesion.nombre}`;
    
    cargarCatalogo();

    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });
});

// Función para cerrar el modal suavemente y limpiar basura de datos
function cerrarModal() {
    const modalEl = document.getElementById('modalProducto');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if(modal) modal.hide();
    document.getElementById('formProducto').reset();
    document.getElementById('idProducto').value = ''; // Limpiar el ID
}

async function cargarCatalogo() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/productos');
        const productos = await respuesta.json();
        const tabla = document.getElementById('cuerpoTabla');
        tabla.innerHTML = '';

        productos.forEach(p => {
            let colorStock = p.stock <= p.stock_minimo ? 'text-danger fw-bold' : 'text-success fw-bold';
            
            // Empaquetamos los datos del producto para enviarlos al botón de edición
            const productoJSON = encodeURIComponent(JSON.stringify(p));

            tabla.innerHTML += `
                <tr>
                    <td class="fw-bold text-secondary">PRD-${p.id.toString().padStart(4, '0')}</td>
                    <td class="fw-bold text-dark">${p.nombre}</td>
                    <td><span class="badge bg-secondary">${p.categoria}</span></td>
                    <td>$${p.precio}</td>
                    <td class="${colorStock}">${p.stock}</td>
                    <td>
                        <div class="btn-group shadow-sm">
                            <button class="btn btn-sm btn-outline-info" title="Ver" onclick="verDetalle('${p.nombre}', ${p.stock})"><i class="bi bi-eye"></i></button>
                            <button class="btn btn-sm btn-outline-warning" title="Editar" onclick="abrirEdicion('${productoJSON}')"><i class="bi bi-pencil-square"></i></button>
                            <button class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="eliminarProducto(${p.id})"><i class="bi bi-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (e) { console.error("Fallo de telemetría de red."); }
}

// ==========================================
// OPERACIONES TRANSACCIONALES (CREATE / UPDATE)
// ==========================================
document.getElementById('formProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Capturamos el ID oculto. Si está vacío, es un producto nuevo. Si tiene número, es una edición.
    const id = document.getElementById('idProducto').value; 
    
    const payload = {
        nombre: document.getElementById('nombre').value,
        categoria_id: parseInt(document.getElementById('categoria_id').value),
        precio: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value),
        stock_minimo: parseInt(document.getElementById('stock_minimo').value)
    };

    // Configuramos el disparador dinámicamente
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:3000/api/productos/${id}` : 'http://localhost:3000/api/productos';

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await respuesta.json();

        if (respuesta.ok && data.success) {
            alert('Operación de sistema: ' + data.mensaje);
            cerrarModal();
            cargarCatalogo(); // Refrescar la tabla en vivo
        } else {
            alert('Alerta Lógica: ' + data.error);
        }
    } catch (error) {
        alert('Fallo crítico de transmisión hacia el servidor central.');
    }
});

// ==========================================
// FUNCIONES DE ACCIÓN DIRECTA (BOTONES TABLA)
// ==========================================

// Acción 1: Leer Detalle (Simulado en alerta por ahora)
window.verDetalle = function(nombre, stock) {
    alert(`Auditoría Rápida:\nMaterial: ${nombre}\nUnidades Disponibles: ${stock}`);
};

// Acción 2: Extraer datos y pegarlos en el modal para Editar
window.abrirEdicion = function(productoSerializado) {
    const p = JSON.parse(decodeURIComponent(productoSerializado));
    
    // Rellenamos el formulario con los datos extraídos
    document.getElementById('idProducto').value = p.id;
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('categoria_id').value = p.categoria_id;
    document.getElementById('precio').value = p.precio;
    document.getElementById('stock').value = p.stock;
    document.getElementById('stock_minimo').value = p.stock_minimo;
    
    // Forzamos la apertura del modal mediante JavaScript
    const modalEl = document.getElementById('modalProducto');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

// Acción 3: Detonar eliminación (DELETE)
window.eliminarProducto = async function(id) {
    if(confirm('⚠️ ALERTA DE SISTEMA: ¿Está completamente seguro de dar de baja este material del inventario general?')) {
        try {
            const respuesta = await fetch(`http://localhost:3000/api/productos/${id}`, {
                method: 'DELETE'
            });
            const data = await respuesta.json();
            
            if (respuesta.ok && data.success) {
                alert('Confirmación: ' + data.mensaje);
                cargarCatalogo();
            } else {
                alert('Operación Denegada: ' + data.error);
            }
        } catch (error) {
            console.error("Fallo de red en la solicitud de baja.");
        }
    }
};