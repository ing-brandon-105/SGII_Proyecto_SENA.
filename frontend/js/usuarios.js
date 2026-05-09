document.addEventListener('DOMContentLoaded', () => {
    // 1. Auditoría estricta de Sesión (Solo Administradores)
    const sesionLocal = localStorage.getItem('usuarioLogueado');
    if (!sesionLocal) {
        window.location.href = '../index.html';
        return;
    }

    const operador = JSON.parse(sesionLocal);
    
    // Si un operario intenta forzar la ruta, se le expulsa
    if (operador.rol_id !== 1) {
        alert("Infracción de Seguridad: Nivel de autorización insuficiente.");
        window.location.href = 'operario-dashboard.html';
        return;
    }

    const labelAdmin = document.getElementById('labelUsuarioAdmin');
    if (labelAdmin) labelAdmin.textContent = `Operador en turno: ${operador.nombre}`;

    // Lógica del Botón de Desconexión
    document.getElementById('btnCerrarSesion').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '../index.html';
    });

    // Encender el barrido del directorio
    cargarDirectorioPersonal();
});

// Extraer y renderizar la plantilla de usuarios
async function cargarDirectorioPersonal() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/usuarios');
        const personal = await respuesta.json();
        const tabla = document.getElementById('tablaUsuarios');
        
        tabla.innerHTML = '';

        personal.forEach(user => {
            const esAdmin = user.rol_id === 1;
            const badgeRol = esAdmin ? '<span class="badge bg-danger">Administrador</span>' : '<span class="badge bg-secondary">Operador</span>';
            const fila = `
                <tr>
                    <td class="fw-bold text-muted">EMP-${user.id.toString().padStart(4, '0')}</td>
                    <td class="fw-bold">${user.nombre}</td>
                    <td>${user.correo}</td>
                    <td>${badgeRol}</td>
                    <td><span class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> Activo</span></td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });
    } catch (error) {
        console.error('Falla estructural en la telemetría de red:', error);
    }
}

// Interceptar y transmitir el payload de registro
document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alerta = document.getElementById('alertaUsuario');
    
    const payload = {
        nombre: document.getElementById('nombreOperario').value,
        correo: document.getElementById('correoOperario').value,
        password: document.getElementById('passwordOperario').value,
        rol_id: parseInt(document.getElementById('rolOperario').value)
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await respuesta.json();
        alerta.classList.remove('d-none', 'alert-danger', 'alert-success');

        if (respuesta.ok && data.success) {
            alerta.classList.add('alert-success');
            alerta.textContent = data.mensaje;
            document.getElementById('formUsuario').reset();
            cargarDirectorioPersonal(); // Recalibrar la tabla en vivo
            
            // Cerrar el modal automáticamente después de 1.5 segundos
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoOperario'));
                modal.hide();
                alerta.classList.add('d-none');
            }, 1500);
        } else {
            alerta.classList.add('alert-danger');
            alerta.textContent = data.error || 'Fallo lógico reportado por el servidor';
        }
    } catch (error) {
        console.error('Colapso de red:', error);
        alerta.classList.remove('d-none', 'alert-success');
        alerta.classList.add('alert-danger');
        alerta.textContent = 'Servidor fuera de línea. Revisar consola lógica.';
    }
});