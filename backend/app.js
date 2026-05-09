const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middlewares (Filtros de procesamiento)
app.use(cors());
app.use(express.json());

// ==========================================
// MÓDULO 1: AUTENTICACIÓN (LOGIN)
// ==========================================
app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;
    const sql = 'SELECT id, nombre, rol_id FROM usuarios WHERE correo = ? AND password = ?';
    
    db.query(sql, [correo, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Fallo interno del servidor' });
        
        if (results.length > 0) {
            res.json({ success: true, mensaje: 'Acceso autorizado', usuario: results[0] });
        } else {
            res.status(401).json({ success: false, mensaje: 'Credenciales inválidas' });
        }
    });
});

// ==========================================
// MÓDULO 2: INVENTARIO (RUTAS CRUD)
// ==========================================

// Endpoint para Consultar el Catálogo (READ)
app.get('/api/productos', (req, res) => {
    const sql = `
        SELECT p.id, p.nombre, c.nombre AS categoria, p.precio, p.stock, p.stock_minimo 
        FROM productos p 
        JOIN categorias c ON p.categoria_id = c.id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Fallo en la consulta de inventario' });
        res.json(results);
    });
});

// Endpoint para Registrar un Nuevo Producto (CREATE)
app.post('/api/productos', (req, res) => {
    const { nombre, categoria_id, precio, stock, stock_minimo } = req.body;
    const sql = 'INSERT INTO productos (nombre, categoria_id, precio, stock, stock_minimo) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [nombre, categoria_id, precio, stock, stock_minimo], (err, result) => {
        if (err) return res.status(500).json({ error: 'Fallo al registrar producto en el sistema' });
        res.json({ success: true, mensaje: 'Producto acoplado al inventario exitosamente', id: result.insertId });
    });
});

// ==========================================
// MÓDULO 3: MOVIMIENTOS DE INVENTARIO
// ==========================================

// Endpoint para Registrar Entradas y Salidas
app.post('/api/movimientos', (req, res) => {
    const { producto_id, usuario_id, tipo_movimiento, cantidad } = req.body;

    // 1. Inserción en la bitácora de movimientos
    const sqlMovimiento = 'INSERT INTO movimientos (producto_id, usuario_id, tipo_movimiento, cantidad) VALUES (?, ?, ?, ?)';

    db.query(sqlMovimiento, [producto_id, usuario_id, tipo_movimiento, cantidad], (err, result) => {
        if (err) return res.status(500).json({ error: 'Fallo al registrar la auditoría del movimiento' });

        // 2. Cálculo de la operación (+ para Entrada, - para Salida)
        let operador = tipo_movimiento === 'Entrada' ? '+' : '-';
        
        // 3. Actualización dinámica del stock en el catálogo principal
        const sqlUpdateStock = `UPDATE productos SET stock = stock ${operador} ? WHERE id = ?`;

        db.query(sqlUpdateStock, [cantidad, producto_id], (err2, result2) => {
            if (err2) return res.status(500).json({ error: 'Fallo de integridad: Movimiento registrado pero stock no actualizado' });
            
            res.json({ success: true, mensaje: `Operación de ${tipo_movimiento} ejecutada y stock calibrado exitosamente` });
        });
    });
});

// ==========================================
// MÓDULO 4: REPORTES Y TELEMETRÍA
// ==========================================

// Reporte de Stock Crítico (Alertas de reabastecimiento)
app.get('/api/reportes/stock-critico', (req, res) => {
    const sql = 'SELECT nombre, stock, stock_minimo FROM productos WHERE stock <= stock_minimo';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Fallo en la extracción de alertas' });
        res.json(results);
    });
});

// Resumen General de Operaciones (Totales)
app.get('/api/reportes/resumen', (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM productos) as total_productos,
            (SELECT SUM(cantidad) FROM movimientos WHERE tipo_movimiento = 'Entrada') as total_entradas,
            (SELECT SUM(cantidad) FROM movimientos WHERE tipo_movimiento = 'Salida') as total_salidas
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Fallo en la consolidación de indicadores' });
        res.json(results[0]);
    });
});

// ==========================================
// MÓDULO 5: GESTIÓN DE OPERARIOS Y ROLES
// ==========================================

// Endpoint para auditar el directorio de usuarios (READ)
app.get('/api/usuarios', (req, res) => {
    // Excluimos la contraseña por protocolos de seguridad
    const sql = 'SELECT id, nombre, correo, rol_id FROM usuarios';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Fallo al consultar el directorio de operarios' });
        res.json(results);
    });
});

// Endpoint para dar de alta a un nuevo operario (CREATE)
app.post('/api/usuarios', (req, res) => {
    const { nombre, correo, password, rol_id } = req.body;
    
    // Inyección de credenciales en la base de datos
    const sql = 'INSERT INTO usuarios (nombre, correo, password, rol_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, correo, password, rol_id], (err, result) => {
        if (err) {
            // Manejo del error si el correo ya existe (Clave Única)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'El correo suministrado ya pertenece a un operador activo' });
            }
            return res.status(500).json({ error: 'Fallo al ensamblar el nuevo perfil' });
        }
        res.json({ success: true, mensaje: 'Operario acoplado al sistema exitosamente' });
    });
});

// ==========================================
// ARRANQUE DEL MOTOR DEL SERVIDOR
// ==========================================
const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor Backend operando de manera estable en el puerto ${PUERTO}`);
});