/*
  Componente Settings:
  Pantalla de configuración donde un usuario autenticado puede visualizar
  y modificar los datos de su perfil, como su nombre, pronombres y cambiar su contraseña.
*/
import React, { useState } from 'react';

// Componente de configuración de cuenta y perfil de usuario
function Settings({ usuario, onVolver, onCerrarSesion, onUsuarioActualizado }) {
  
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    pronombres: usuario?.pronombres || '', // Asignación de valores por defecto o preexistentes
    contrasenaActual: '',
    nuevaContrasena: ''
  });

  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState(''); // Estado para manejo de UI en errores
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMensajeExito('');
    setMensajeError('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeExito('');
    setMensajeError('');
    
    try {
      // Petición HTTP PUT para actualización de la información del usuario
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/actualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuario.id, // Requisito indispensable de identificación
          nombre: formData.nombre,
          pronombres: formData.pronombres,
          contrasenaActual: formData.contrasenaActual,
          nuevaContrasena: formData.nuevaContrasena
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensajeError(datos.error);
        setCargando(false);
      } else {
        setMensajeExito(datos.mensaje);
        // Limpieza táctica de campos sensibles posteriores a la modificación
        setFormData({ ...formData, contrasenaActual: '', nuevaContrasena: '' });
        // Propagación interactiva del estado editado hacia App.jsx
        onUsuarioActualizado(datos.usuario);
        setCargando(false);
      }
    } catch (error) {
      console.error(error);
      setMensajeError('Error de conexión al guardar.');
      setCargando(false);
    }
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col items-center py-12 px-4 font-sans relative">
      
      {/* Botón de volver */}
      <button 
        onClick={onVolver}
        className="absolute top-8 left-8 text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
      >
        <span>←</span> Volver
      </button>

      <div className="w-full max-w-3xl space-y-8 animate-fade-in-up">
        
        {/* Cabecera de Configuración */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
          <p className="text-gray-400">Personaliza tu identidad en la red espacial</p>
        </div>

        {mensajeExito && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-center font-medium shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            {mensajeExito}
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-6">
          
          {/* Sección de avatar o foto de perfil visual */}
          <div className="bg-[#161b2e] border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8 shadow-xl">
            <div className="relative group cursor-pointer">
              {/* Representación visual predeterminada del avatar */}
              <div className="w-28 h-28 bg-[#3b82f6] rounded-full flex items-center justify-center text-4xl font-bold border-4 border-[#0a0e17] shadow-[0_0_30px_rgba(59,130,246,0.3)] group-hover:opacity-50 transition">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              {/* Control superpuesto de edición */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold mb-1">Avatar del Sistema</h3>
              <p className="text-sm text-gray-400 mb-4">Sube una imagen para que la comunidad te reconozca.</p>
              <button type="button" className="text-sm bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-lg transition">
                Cambiar imagen
              </button>
            </div>
          </div>

          {/* Sección de identidad y datos personales */}
          <div className="bg-[#161b2e] border border-white/10 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              Identidad
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de Usuario</label>
                <input 
                  type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                  className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pronombres (Opcional)</label>
                <input 
                  type="text" name="pronombres" value={formData.pronombres} onChange={handleChange} placeholder="Ej: Él / Ella / Elle"
                  className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico (No modificable)</label>
                <input 
                  type="email" value={usuario.correo} disabled
                  className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Sección de credenciales y seguridad de cuenta */}
          <div className="bg-[#161b2e] border border-white/10 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              Seguridad
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña Actual</label>
                <input 
                  type="password" name="contrasenaActual" value={formData.contrasenaActual} onChange={handleChange} placeholder="Deja en blanco si no quieres cambiarla"
                  className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff5722] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nueva Contraseña</label>
                <input 
                  type="password" name="nuevaContrasena" value={formData.nuevaContrasena} onChange={handleChange} placeholder="Mínimo 8 caracteres"
                  className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff5722] transition"
                />
              </div>
            </div>
          </div>

          {/* Controles de acción persistentes */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <button 
              type="button" onClick={onCerrarSesion}
              className="text-red-400 hover:text-red-300 font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition"
            >
              Cerrar Sesión
            </button>
            
            <button 
              type="submit" disabled={cargando}
              className={`px-8 py-3 rounded-lg font-bold transition ${cargando ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#5b3cff] hover:bg-[#4a2eec] text-white shadow-[0_0_20px_rgba(91,60,255,0.4)]'}`}
            >
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Settings;