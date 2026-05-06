// 1. Auditoría de Seguridad (Protección de ruta)
if (!localStorage.getItem('usuarioLogueado')) {
    window.location.href = '../index.html';
}

const formProducto = document.getElementById('formProducto');
const cuerpoTabla = document.getElementById('cuerpoTabla');

// 2. Operación READ: Extraer catálogo de la Base de Datos
async function cargarCatalogo() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/productos');
        const productos = await respuesta.json();
        
        // Purgar la tabla antes de inyectar los nuevos datos
        cuerpoTabla.innerHTML = '';
        
        productos.forEach(prod => {
            // Lógica de semaforización para el stock
            let claseStock = prod.stock <= prod.stock_minimo ? 'text-danger fw-bold' : 'text-success fw-bold';
            
            const fila = `
                <tr>
                    <td>${prod.id}</td>
                    <td class="fw-bold">${prod.nombre}</td>
                    <td><span class="badge bg-secondary">${prod.categoria}</span></td>
                    <td>$${prod.precio}</td>
                    <td class="${claseStock}">${prod.stock}</td>
                    <td>${prod.stock_minimo}</td>
                </tr>
            `;
            cuerpoTabla.innerHTML += fila;
        });
    } catch (error) {
        console.error('Fallo en la telemetría de red:', error);
    }
}

// 3. Operación CREATE: Enviar nuevo producto al Backend
formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        nombre: document.getElementById('nombre').value,
        categoria_id: document.getElementById('categoria_id').value,
        precio: document.getElementById('precio').value,
        stock: document.getElementById('stock').value,
        stock_minimo: document.getElementById('stock_minimo').value
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Verificamos si el servidor responde con un error 404 (No encontrado) o 500
        if (!respuesta.ok) {
            throw new Error(`El servidor respondió con código de error: ${respuesta.status}`);
        }

        const data = await respuesta.json();

        if (data.success) {
            alert('Operación exitosa: ' + data.mensaje);
            formProducto.reset(); // Limpiar el formulario
            cargarCatalogo(); // Recargar la tabla inmediatamente
        } else {
            // Alerta si el servidor dice que hubo un error lógico
            alert('Alerta del Servidor: ' + data.error); 
        }
    } catch (error) {
        // Alerta visible si el servidor está apagado o la ruta no existe
        console.error('Fallo al transmitir la carga útil:', error);
        alert('Falla crítica de transmisión: ' + error.message + '. Revisa la terminal de tu servidor Node.');
    }
});

// 4. Inicialización: Ejecutar la carga del catálogo al arrancar el script
cargarCatalogo();