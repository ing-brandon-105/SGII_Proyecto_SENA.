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
// ARRANQUE DEL MOTOR DEL SERVIDOR
// ==========================================
const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor Backend operando de manera estable en el puerto ${PUERTO}`);
});