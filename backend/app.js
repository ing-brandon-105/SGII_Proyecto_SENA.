const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middlewares (Filtros de procesamiento de datos)
app.use(cors());
app.use(express.json());

// Endpoint de Autenticación (Ruta de acceso)
app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;
    
    // Consulta parametrizada para mitigar inyecciones SQL
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

// Arranque del motor del servidor
const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`Servidor Backend operando de manera estable en el puerto ${PUERTO}`);
});