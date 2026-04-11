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

// 8. Ruta para obtener todas las simulaciones de la comunidad
app.get('/api/simulaciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM simulaciones ORDER BY fecha_publicacion DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo las simulaciones:', error);
    res.status(500).json({ error: 'Hubo un problema al pedir los datos a la base de datos.' });
  }
});

// Ruta para registrar un nuevo usuario
app.post('/api/registro', async (req, res) => {
  const { usuario, correo, contrasena } = req.body;
  try {
    const busqueda = await pool.query(
      'SELECT * FROM usuarios WHERE nombre_usuario = $1 OR correo_electronico = $2',
      [usuario, correo]
    );

    if (busqueda.rows.length > 0) {
      const usuarioEncontrado = busqueda.rows[0];
      if (usuarioEncontrado.correo_electronico === correo) {
        return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
      }
      if (usuarioEncontrado.nombre_usuario === usuario) {
        return res.status(400).json({ error: 'Ese nombre de usuario ya está en uso. ¡Elige otro!' });
      }
    }

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

// Ruta para Iniciar Sesión
app.post('/api/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  try {
    const busqueda = await pool.query(
      'SELECT * FROM usuarios WHERE nombre_usuario = $1',
      [usuario]
    );

    if (busqueda.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado. Comprueba el nombre.' });
    }

    const usuarioEncontrado = busqueda.rows[0];
    
    if (usuarioEncontrado.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    res.status(200).json({ 
      mensaje: '¡Inicio de sesión exitoso!',
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre_usuario,
        correo: usuarioEncontrado.correo_electronico
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Hubo un problema interno en el servidor.' });
  }
});
// Ruta para actualizar el perfil del usuario
app.put('/api/usuarios/actualizar', async (req, res) => {
  // 1. Recibimos los datos que nos manda React
  const { id, nombre, pronombres, contrasenaActual, nuevaContrasena } = req.body;

  try {
    // 2. Buscamos al usuario en la base de datos usando su ID
    const busqueda = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    
    if (busqueda.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos.' });
    }

    const usuarioDB = busqueda.rows[0];
    let contrasenaFinal = usuarioDB.contrasena;

    // 3. Si el usuario quiere cambiar la contraseña, verificamos la antigua primero
    if (nuevaContrasena) {
      if (contrasenaActual !== usuarioDB.contrasena) {
        return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
      }
      contrasenaFinal = nuevaContrasena; // Si es correcta, preparamos la nueva
    }

    // 4. Guardamos los cambios en la base de datos
    await pool.query(
      'UPDATE usuarios SET nombre_usuario = $1, pronombres = $2, contrasena = $3 WHERE id = $4',
      [nombre, pronombres, contrasenaFinal, id]
    );

    // 5. Devolvemos los datos actualizados a React
    res.status(200).json({ 
      mensaje: '¡Datos actualizados correctamente!',
      usuario: {
        id: id,
        nombre: nombre,
        correo: usuarioDB.correo_electronico,
        pronombres: pronombres
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno al guardar los datos.' });
  }
});
// 7. ENCENDEMOS EL SERVIDOR AL FINAL DEL TODO (¡Muy importante!)
app.listen(puerto, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Servidor backend encendido y escuchando en http://localhost:${puerto}`);
  console.log(`========================================\n`);
});