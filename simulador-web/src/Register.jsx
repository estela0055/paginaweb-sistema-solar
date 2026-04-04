import React, { useState } from 'react';

function Register({ onVolver, onIrLogin }) {
  // 1. Creamos la memoria para guardar lo que el usuario escribe
  const [formData, setFormData] = useState({
    usuario: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: ''
  });

  // Memoria para mostrar mensajes de error o éxito
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // 2. Esta función actualiza la memoria cada vez que el usuario teclea algo
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMensajeError(''); // Limpiamos errores si el usuario empieza a escribir de nuevo
  };

  // 3. Esta función se ejecuta al darle al botón "Registrarse"
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue sola
    setMensajeError('');
    setMensajeExito('');

    // Validación 1: Que no haya campos vacíos
    if (!formData.usuario || !formData.correo || !formData.contrasena) {
      return setMensajeError('Por favor, rellena todos los campos.');
    }

    // Validación 2: Que las contraseñas coincidan
    if (formData.contrasena !== formData.confirmarContrasena) {
      return setMensajeError('Las contraseñas no coinciden.');
    }

    try {
      // Llamamos al servidor enviando los datos
      const respuesta = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: formData.usuario,
          correo: formData.correo,
          contrasena: formData.contrasena
        })
      });

      const datos = await respuesta.json();

      // Si el servidor nos devuelve un error (ej. usuario repetido), lo mostramos
      if (!respuesta.ok) {
        setMensajeError(datos.error);
      } else {
        // Si todo va bien, mostramos éxito y podríamos enviarlo al login
        setMensajeExito('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
        setFormData({ usuario: '', correo: '', contrasena: '', confirmarContrasena: '' }); // Limpiamos el formulario
      }
    } catch (error) {
      setMensajeError('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col items-center justify-center font-sans relative pb-10">
      
      <button onClick={onVolver} className="absolute top-8 left-8 text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg transition">
        <span>←</span> Volver al inicio
      </button>

      <h1 className="text-4xl md:text-5xl font-bold tracking-widest flex items-center justify-center mb-8 mt-12">
        SISTEMA S
        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.8)] mx-2"></span>
        LAR INTERACTIV
        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#ff5722] shadow-[0_0_30px_rgba(255,87,34,0.8)] ml-2"></span>
      </h1>

      <div className="bg-[#161b2e]/90 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Crear Cuenta</h2>
          <p className="text-sm text-gray-400">Regístrate para comenzar</p>
        </div>

        {/* Zona para mostrar alertas (Errores en rojo, Éxito en verde) */}
        {mensajeError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {mensajeError}
          </div>
        )}
        {mensajeExito && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-sm p-3 rounded-lg mb-6 text-center">
            {mensajeExito}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Usuario</label>
            <input 
              type="text" 
              name="usuario" // Muy importante poner el 'name'
              value={formData.usuario}
              onChange={handleChange}
              className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
              placeholder="Elige un nombre de usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo Electrónico</label>
            <input 
              type="email" 
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <input 
              type="password" 
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
              placeholder="Crea una contraseña"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar Contraseña</label>
            <input 
              type="password" 
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
              placeholder="Confirma tu contraseña"
            />
          </div>

          <button type="submit" className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition mt-6">
            Registrarse
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-400">
          ¿Ya tienes cuenta? <button onClick={onIrLogin} className="text-[#3b82f6] hover:text-blue-400 font-medium transition">Inicia sesión</button>
        </div>
      </div>
    </div>
  );
}

export default Register;