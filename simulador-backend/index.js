// Importación de módulos principales y dependencias
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config(); // Carga de variables de entorno
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand} = require('@aws-sdk/client-s3');

// Configuración del cliente S3 para conexión con Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Inicialización de multer con almacenamiento en memoria intermedia (Buffer)
const upload = multer({ storage: multer.memoryStorage() });

// Inicialización de la aplicación Express
const app = express();
const puerto = 3000;

// Configuración de middleware (CORS y parseo JSON)
app.use(cors());
app.use(express.json());

// Configuración del Pool de conexiones para PostgreSQL (Neon DB u otros proveedores Cloud)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint de comprobación de estado y disponibilidad (Healthcheck)
app.get('/', (req, res) => {
  res.send('API del Simulador Solar operativa.');
});

// Endpoint de obtención de simulaciones con validación de estado "has_liked"
app.get('/api/simulaciones', async (req, res) => {
  const { usuarioId } = req.query;

  try {
    // Consulta SQL con subquery para determinar si el usuario actual ha dado like previamente
    const query = `
      SELECT s.*, 
      (SELECT COUNT(*) FROM likes_simulaciones l WHERE l.simulacion_id = s.id AND l.usuario_id = $1) > 0 AS has_liked
      FROM simulaciones s 
      ORDER BY s.fecha_publicacion DESC
    `;
    
    const result = await pool.query(query, [usuarioId || 0]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
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
// Endpoint POST para actualización de perfil de usuario
app.put('/api/usuarios/actualizar', async (req, res) => {
  // Desestructuración del payload (cuerpo JSON de la petición)
  const { id, nombre, pronombres, contrasenaActual, nuevaContrasena } = req.body;

  try {
    // Comprobación de existencia del registro de usuario objetivo
    const busqueda = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    
    if (busqueda.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos.' });
    }

    const usuarioDB = busqueda.rows[0];
    let contrasenaFinal = usuarioDB.contrasena;

    // Validación de seguridad para el cambio de credenciales de acceso
    if (nuevaContrasena) {
      if (contrasenaActual !== usuarioDB.contrasena) {
        return res.status(401).json({ error: 'La contraseña actual no es correcta.' });
      }
      contrasenaFinal = nuevaContrasena;
    }

    // Ejecución de querie SQL para actualización de los datos
    await pool.query(
      'UPDATE usuarios SET nombre_usuario = $1, pronombres = $2, contrasena = $3 WHERE id = $4',
      [nombre, pronombres, contrasenaFinal, id]
    );

    // Devolución correcta con HTTP Status 200 y JSON actualizados
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

// Endpoint DELETE para eliminación de simulación mediante autoría comprobada
app.delete('/api/simulaciones/:id', async (req, res) => {
  const simulacionId = req.params.id;
  const { usuarioId } = req.body;

  if (!usuarioId) {
    return res.status(401).json({ error: 'Requiere autenticación para eliminar recurso.' });
  }

  try {
    // Comprobación de existencia y recuperación de metadatos (S3 URI)
    const busqueda = await pool.query('SELECT usuario_id, archivo_url FROM simulaciones WHERE id = $1', [simulacionId]);
    
    if (busqueda.rows.length === 0) {
      return res.status(404).json({ error: 'La simulación especificada no existe.' });
    }

    const sim = busqueda.rows[0];

    // Política de autorización: restringe la eliminación de recursos de terceros
    if (sim.usuario_id !== usuarioId) {
      return res.status(403).json({ error: 'Rechazado: no dispones de permisos de autoría para eliminar este recurso.' });
    }

    // Proceso de eliminación de objeto físico en el bucket S3 / Cloudflare R2
    if (sim.archivo_url) {
      // Extracción del nombre exacto de la clave del fichero guardado en el storage
      const urlParte = sim.archivo_url.split('/');
      const nombreArchivo = urlParte[urlParte.length - 1];

      try {
        const parametrosBorrado = {
          Bucket: process.env.R2_BUCKET_NAME,
          Key: nombreArchivo,
        };
        await s3Client.send(new DeleteObjectCommand(parametrosBorrado));
        console.log(`Archivo [${nombreArchivo}] desvinculado exitosamente del storage R2.`);
      } catch (errorS3) {
        // Logging de incidente en el storage (No bloquante para la baja en PostgreSQL)
        console.error('Error no crítico durante baja en almacenamiento R2:', errorS3);
      }
    }

    // Eliminación de la entidad principal en la base de datos relacional (PostgreSQL)
    // El borrado en cascada (ON DELETE CASCADE) se encargará de las dependencias (`likes`)
    await pool.query('DELETE FROM simulaciones WHERE id = $1', [simulacionId]);

    res.status(200).json({ mensaje: 'Simulación y binarios vinculados borrados con éxito.' });

  } catch (error) {
    console.error('Error al borrar la simulación:', error);
    res.status(500).json({ error: 'Error interno del servidor al borrar.' });
  }
});

// Endpoint POST asíncrono para gestionar interacciones tipo 'Like' y 'Unlike'
app.post('/api/simulaciones/:id/like', async (req, res) => {
  const simulacionId = req.params.id;
  const { usuarioId } = req.body;

  if (!usuarioId) {
    return res.status(401).json({ error: 'Autorización requerida para interactuar.' });
  }

  try {
    // Apertura de transacción SQL: Atomicidad (ACID) garantizada
    await pool.query('BEGIN');

    // Validación de persistencia de interacciones (Idempotencia)
    const busquedaLike = await pool.query(
      'SELECT * FROM likes_simulaciones WHERE usuario_id = $1 AND simulacion_id = $2',
      [usuarioId, simulacionId]
    );

    let nuevoEstado;

    if (busquedaLike.rows.length > 0) {
      // Existencia confirmada: proceso de UNLIKE y reversión en tabla maestra
      await pool.query('DELETE FROM likes_simulaciones WHERE usuario_id = $1 AND simulacion_id = $2', [usuarioId, simulacionId]);
      await pool.query('UPDATE simulaciones SET likes = likes - 1 WHERE id = $1', [simulacionId]);
      nuevoEstado = 'quitado';
    } else {
      // Inexistencia confirmada: inserción de like en join-table y suma a contrapartes
      await pool.query('INSERT INTO likes_simulaciones (usuario_id, simulacion_id) VALUES ($1, $2)', [usuarioId, simulacionId]);
      await pool.query('UPDATE simulaciones SET likes = likes + 1 WHERE id = $1', [simulacionId]);
      nuevoEstado = 'añadido';
    }

    // Confirmación (commit) de sentencias SQL persistidas en disco
    await pool.query('COMMIT');

    // Consulta de los datos actualizados a retornar como payload
    const simActualizada = await pool.query('SELECT likes FROM simulaciones WHERE id = $1', [simulacionId]);

    res.status(200).json({ 
      mensaje: `Like ${nuevoEstado} con éxito`,
      likesActuales: simActualizada.rows[0].likes,
      estado: nuevoEstado
    });

  } catch (error) {
    // Interrupción abrupta de la operación mediante comando Rollback para evitar fallos de inconsistencia de datos
    await pool.query('ROLLBACK');
    console.error('Error procesando el like:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el like.' });
  }
});

// Endpoint POST de incepción de binarios mediante Multer y metadatos asociados
app.post('/api/simulaciones', upload.single('archivo'), async (req, res) => {
  try {
    const { titulo, autor, num_planetas, usuarioId } = req.body;
    const archivo = req.file; // Buffer y metadatos alojados por el middleware 'multer'
console.log("Datos recibidos:", { titulo, autor, usuarioId });
    console.log("Archivo recibido:", archivo);
    if (!archivo || !titulo || !usuarioId) {
      return res.status(400).json({ error: 'Atributos o buffer faltantes en la request.' });
    }

    // Composición inmutable de nomenclatura de objeto en bucket S3
    const nombreUnico = `${Date.now()}-${archivo.originalname.replace(/\s+/g, '-')}`;

    // Despacho de Command PutObject sobre la instancia AWS SDK conectada a R2
    const parametrosSubida = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: nombreUnico,
      Body: archivo.buffer,
      ContentType: archivo.mimetype,
    };

    // Subida asincrónica al proveedor de almacenamiento
    await s3Client.send(new PutObjectCommand(parametrosSubida));

    // Instanciación de endpoint público asumiendo path público de Cloudflare
    const urlPublica = `${process.env.R2_PUBLIC_URL}/${nombreUnico}`;

    // Volcado SQL: registro asociado al Blob alojado para recuperación posterior
    const nuevaSimulacion = await pool.query(
      `INSERT INTO simulaciones (titulo, autor, num_planetas, usuario_id, archivo_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [titulo, autor, num_planetas || 0, usuarioId, urlPublica]
    );

    res.status(201).json({ 
      mensaje: 'Proceso de subida finalizado y mapeado con éxito.', 
      simulacion: nuevaSimulacion.rows[0] 
    });

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({ error: 'Error interno al subir el archivo.' });
  }
});
// Instanciación del proceso daemon para escuchar peticiones de la red entrantes
app.listen(puerto, () => {
  console.log(`\n========================================`);
  console.log(`Servidor de aplicación inicializado. Interfaz Local HTTP -> [${puerto}]`);
  console.log(`========================================\n`);
});