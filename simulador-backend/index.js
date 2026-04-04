// 1. Importamos las herramientas que instalaste
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); // Esto lee tu archivo .env secreto

// 2. Inicializamos el servidor
const app = express();
const puerto = 3000;

// 3. Configuramos la seguridad (CORS) y el formato de datos (JSON)
app.use(cors()); // Permite que tu React web se conecte aquí
app.use(express.json()); // Permite que el servidor entienda datos en formato JSON

// 4. Configuramos la conexión a tu base de datos PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido por servicios en la nube como Neon
  }
});

// 5. Creamos una ruta de prueba para comprobar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor del Simulador Solar está funcionando correctamente. 🚀');
});

// 6. Creamos una ruta para probar la base de datos
app.get('/test-db', async (req, res) => {
  try {
    // Intentamos hacer una consulta sencilla a la base de datos
    const result = await pool.query('SELECT NOW() AS hora_actual');
    res.json({
      mensaje: '¡Conexión a la base de datos exitosa! 🎉',
      hora_servidor: result.rows[0].hora_actual
    });
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    res.status(500).json({ error: 'Error al conectar con la base de datos.' });
  }
});

// 7. Encendemos el servidor para que empiece a escuchar
app.listen(puerto, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Servidor backend encendido y escuchando en http://localhost:${puerto}`);
  console.log(`========================================\n`);
});

// 8. Ruta para obtener todas las simulaciones de la comunidad
app.get('/api/simulaciones', async (req, res) => {
  try {
    // Le pedimos a la base de datos TODAS las simulaciones, ordenadas por las más recientes
    const result = await pool.query('SELECT * FROM simulaciones ORDER BY fecha_publicacion DESC');
    
    // El servidor responde enviando esas filas en formato JSON
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo las simulaciones:', error);
    res.status(500).json({ error: 'Hubo un problema al pedir los datos a la base de datos.' });
  }
});

// Ruta para registrar un nuevo usuario
app.post('/api/registro', async (req, res) => {
  // 1. Recogemos los datos que nos envía React
  const { usuario, correo, contrasena } = req.body;

  try {
    // 2. BUSCAMOS DUPLICADOS: Preguntamos a la base de datos si ya existe ese nombre o correo
    const busqueda = await pool.query(
      'SELECT * FROM usuarios WHERE nombre_usuario = $1 OR correo_electronico = $2',
      [usuario, correo]
    );

    // 3. Si encontramos algo, averiguamos qué es lo que está repetido y devolvemos un error
    if (busqueda.rows.length > 0) {
      const usuarioEncontrado = busqueda.rows[0];
      
      if (usuarioEncontrado.correo_electronico === correo) {
        return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
      }
      if (usuarioEncontrado.nombre_usuario === usuario) {
        return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso. ¡Elige otro!' });
      }
    }

    // 4. Si todo está libre, guardamos al nuevo usuario en la base de datos
    await pool.query(
      'INSERT INTO usuarios (nombre_usuario, correo_electronico, contrasena) VALUES ($1, $2, $3)',
      [usuario, correo, contrasena]
    );

    res.status(201).json({ mensaje: '¡Cuenta creada con éxito!' });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Hubo un problema interno en el servidor.' });
  }
});