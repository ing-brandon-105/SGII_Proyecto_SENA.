// 1. Auditoría de Seguridad y Extracción de Credenciales
const sesionLocal = localStorage.getItem('usuarioLogueado');
if (!sesionLocal) {
    window.location.href = '../index.html';
}
const operador = JSON.parse(sesionLocal);

const formMovimiento = document.getElementById('formMovimiento');
const selectProducto = document.getElementById('producto_id');
const alertaSistema = document.getElementById('alertaSistema');

// 2. Cargar Catálogo Dinámico
async function cargarProductosOptions() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/productos');
        if (!respuesta.ok) throw new Error('Fallo en la lectura del catálogo');
        
        const productos = await respuesta.json();
        selectProducto.innerHTML = '<option value="">Seleccione el material...</option>';
        
        productos.forEach(prod => {
            selectProducto.innerHTML += `<option value="${prod.id}">${prod.nombre} (Stock actual: ${prod.stock})</option>`;
        });
    } catch (error) {
        console.error(error);
        selectProducto.innerHTML = '<option value="">Error de conexión con el motor de BD</option>';
    }
}

// 3. Ejecutar la Transacción
formMovimiento.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        producto_id: document.getElementById('producto_id').value,
        usuario_id: operador.id, // ID extraído dinámicamente de la sesión
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

        alertaSistema.classList.remove('d-none', 'alert-danger', 'alert-success');
        
        if (data.success) {
            alertaSistema.classList.add('alert-success');
            alertaSistema.textContent = 'Reporte de Sistema: ' + data.mensaje;
            formMovimiento.reset();
            cargarProductosOptions(); // Recalibrar el inventario mostrado en el select
        } else {
            alertaSistema.classList.add('alert-danger');
            alertaSistema.textContent = 'Fallo Lógico: ' + data.error;
        }
    } catch (error) {
        console.error('Colapso de red:', error);
        alertaSistema.classList.remove('d-none', 'alert-success');
        alertaSistema.classList.add('alert-danger');
        alertaSistema.textContent = 'Fallo crítico de transmisión hacia el servidor.';
    }
});

// Inicializar componentes
cargarProductosOptions();