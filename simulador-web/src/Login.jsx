/*
  Componente Login:
  Maneja el formulario de inicio de sesión de la aplicación.
  Permite al usuario ingresar sus credenciales, las envía al backend para validar,
  y actualiza el estado global si la autenticación es exitosa.
*/
import React, { useState } from 'react';

// Componente de autenticación de usuario
function Login({ onVolver, onIrRegistro, onLoginExitoso }) {
  // Estado local para los campos del formulario
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: ''
  });

  // Estado para el manejo de errores y carga en la interfaz
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Manejo de cambios en los inputs controlados del formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMensajeError(''); // Reseteo del estado de error al modificar datos
  };

  // Procesamiento de envío del formulario de autenticación
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevención de la recarga por defecto del navegador
    setMensajeError('');
    
    // Validación básica de campos requeridos
    if (!formData.usuario || !formData.contrasena) {
      return setMensajeError('Por favor, ingresa tu usuario y contraseña.');
    }

    setCargando(true); // Activación del estado de carga visual

    try {
      // Petición de inicio de sesión a la API del backend usando variable de entorno
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: formData.usuario,
          contrasena: formData.contrasena
        })
      });

      const datos = await respuesta.json();

      // Manejo de respuesta HTTP de error (credenciales incorrectas, etc.)
      if (!respuesta.ok) {
        setMensajeError(datos.error);
        setCargando(false);
      } else {
        // Redirección y propagación del estado de sesión hacia el componente padre
        onLoginExitoso(datos.usuario);
      }
    } catch (error) {
      setMensajeError('Error al conectar con el servidor.');
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col items-center justify-center font-sans relative">
      
      <button onClick={onVolver} className="absolute top-8 left-8 text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg transition">
        <span>←</span> Volver al inicio
      </button>

      <h1 className="text-4xl md:text-5xl font-bold tracking-widest flex items-center justify-center mb-12">
        SISTEMA S
        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.8)] mx-2"></span>
        LAR INTERACTIV
        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#ff5722] shadow-[0_0_30px_rgba(255,87,34,0.8)] ml-2"></span>
      </h1>

      <div className="bg-[#161b2e]/90 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Bienvenido</h2>
          <p className="text-sm text-gray-400">Inicia sesión en tu cuenta</p>
        </div>

        {/* Renderizado condicional de alertas de error en la UI */}
        {mensajeError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
            {mensajeError}
          </div>
        )}

        {/* Formulario de autenticación */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Usuario</label>
            <div className="relative">
              <input 
                type="text" 
                name="usuario" // Clave de vinculación para el estado controlado
                value={formData.usuario}
                onChange={handleChange}
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
                placeholder="Ingresa tu usuario"
              />
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <input 
                type="password" 
                name="contrasena" // Clave de vinculación para el estado controlado
                value={formData.contrasena}
                onChange={handleChange}
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
                placeholder="Ingresa tu contraseña"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-300 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-[#0f1322] text-[#3b82f6] focus:ring-[#3b82f6] focus:ring-offset-[#161b2e] mr-2" />
              Recordarme
            </label>
            <a href="#" className="text-gray-400 hover:text-white transition">¿Olvidaste tu contraseña?</a>
          </div>

          <button 
            type="submit" 
            disabled={cargando} // Bloqueo del botón durante la resolución de fetch
            className={`w-full font-semibold py-3 rounded-lg transition mt-4 ${cargando ? 'bg-blue-800 text-gray-400 cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
          >
            {cargando ? 'Conectando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-400">
          ¿No tienes cuenta? <button onClick={onIrRegistro} className="text-[#3b82f6] hover:text-blue-400 font-medium transition">Regístrate</button>
        </div>

      </div>
    </div>
  );
}

export default Login;