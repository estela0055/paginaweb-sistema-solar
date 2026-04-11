import React, { useState } from 'react';

function LoginModal({ isOpen, onClose, onIrRegistro, onLoginExitoso }) {
  const [formData, setFormData] = useState({ usuario: '', contrasena: '' });
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMensajeError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError('');
    if (!formData.usuario || !formData.contrasena) return setMensajeError('Rellena todos los campos.');

    setCargando(true);
    try {
      const respuesta = await fetch('http://127.0.0.1:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(datos.error);
        setCargando(false);
      } else {
        // ¡Magia! Iniciamos sesión y cerramos el modal automáticamente
        onLoginExitoso(datos.usuario);
        onClose(); 
      }
    } catch (error) {
      console.error("EL ERROR REAL ES:", error);
      setMensajeError('Error de conexión espacial.');
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0e17]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white animate-fade-in">
      
      <div className="bg-[#161b2e] border border-[#3b82f6]/30 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
        
        {/* BOTÓN CERRAR */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition z-10">
          ✕
        </button>

        {/* CABECERA PERSUASIVA */}
        <div className="p-8 pb-4 text-center relative overflow-hidden">
          {/* Un toque de luz de fondo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#3b82f6] rounded-full blur-[60px] opacity-20"></div>
          
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold mb-2">¡Aviso a Navegantes!</h2>
          <p className="text-sm text-gray-400">
            Para participar en la comunidad y subir tus propios sistemas solares, <strong className="text-[#3b82f6]">tienes que ser uno de nosotros</strong>.
          </p>
        </div>

        {/* FORMULARIO */}
        <div className="p-8 pt-4">
          {mensajeError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 text-center">
              {mensajeError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input 
                type="text" name="usuario" value={formData.usuario} onChange={handleChange}
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
                placeholder="Tu usuario"
              />
            </div>
            <div>
              <input 
                type="password" name="contrasena" value={formData.contrasena} onChange={handleChange}
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
                placeholder="Tu contraseña"
              />
            </div>

            <button 
              type="submit" disabled={cargando}
              className={`w-full font-semibold py-3 rounded-lg transition mt-2 ${cargando ? 'bg-blue-800 text-gray-400 cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
            >
              {cargando ? 'Conectando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* REDIRECCIÓN A REGISTRO */}
          <div className="text-center mt-6 pt-6 border-t border-white/5 text-sm text-gray-400">
            ¿Aún no eres miembro? <br/>
            <button onClick={onIrRegistro} className="text-[#3b82f6] hover:text-blue-400 font-bold transition mt-2 px-4 py-2 bg-[#3b82f6]/10 rounded-lg w-full hover:bg-[#3b82f6]/20">
              Crear una cuenta gratis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginModal;