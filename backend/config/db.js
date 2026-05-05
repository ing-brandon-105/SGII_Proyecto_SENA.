const mysql = require('mysql2');

// Parámetros de conexión a la instancia local de MySQL Workbench
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', //  usuario en Workbench 
    password: 'ingbrandon105', //  clave de Workbench 
    database: 'sgii_db' // base de datos creada en Workbench
});

db.connect((err) => {
    if (err) {
        console.error('Fallo en la conexión al clúster de base de datos:', err);
        return;
    }
    console.log('Motor de base de datos MySQL en línea y operando.');
});

module.exports = db;