const express = require('express');
const path = require('path');
const cors = require('cors');



const port = 3001; // O usa process.env.PORT si prefieres configuración a través de variables de entorno
const app = express();

// Configuración de la aplicación
app.set('json spaces', 2);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use( require('./routes/products'));
app.use( require('./routes/prices'));
app.use( require('./routes/db'));
app.use(require('./routes/upload'));

const { initializeDatabase } = require('./db');
initializeDatabase((err) => {
  if (err) {
    console.error("Database initialization failed.");
  } else {
    console.log("Database initialized successfully.");
  }
});



// Ruta GET de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente en el puerto 3001');
});

// Inicia el servidor 
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});



