/*
  Componente Settings:
  Pantalla de configuración donde un usuario autenticado puede visualizar
  y modificar los datos de su perfil, como su nombre, pronombres, contraseña y foto de perfil.
*/
import React, { useState, useRef } from 'react';

function Settings({ usuario, onVolver, onCerrarSesion, onUsuarioActualizado }) {
  
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    pronombres: usuario?.pronombres || '',
    contrasenaActual: '',
    nuevaContrasena: ''
  });

  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  // ¡NUEVO!: Estado y Referencia para la subida de imagen
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const archivoInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMensajeExito('');
    setMensajeError('');
  };

  // --- NUEVA FUNCIÓN: Manejar la subida automática de la foto ---
  const handleSubirImagen = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendoImagen(true);
    setMensajeExito('');
    setMensajeError('');

    // Preparamos el "paquete" con la imagen y el ID del usuario
    const datosImagen = new FormData();
    datosImagen.append('imagen', archivo);
    datosImagen.append('usuarioId', usuario.id);

    try {
const respuesta = await fetch(`http://127.0.0.1:3000/api/usuarios/foto-perfil`, {
        method: 'PUT',
        body: datosImagen, // Al enviar FormData, el navegador pone los headers automáticamente
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensajeExito('¡Avatar actualizado correctamente!');
        // Actualizamos App.jsx al instante para que la barra de navegación también cambie la foto
        onUsuarioActualizado(datos.usuario); 
      } else {
        setMensajeError(datos.error || 'No se pudo subir la imagen.');
      }
    } catch (error) {
      console.error(error);
      setMensajeError('Error de conexión al subir el avatar.');
    } finally {
      setSubiendoImagen(false);
      // Reseteamos el input para que se pueda volver a seleccionar la misma foto si se borra
      if (archivoInputRef.current) archivoInputRef.current.value = '';
    }
  };

  // --- FUNCIÓN ORIGINAL: Guardar el resto de datos ---
  const handleGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensajeExito('');
    setMensajeError('');
    
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/actualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: usuario.id,
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
        setFormData({ ...formData, contrasenaActual: '', nuevaContrasena: '' });
        // ¡IMPORTANTE! Al actualizar los datos, nos aseguramos de no perder la foto actual
        onUsuarioActualizado({ ...datos.usuario, fotoPerfilUrl: usuario.fotoPerfilUrl });
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
      
      <button 
        onClick={onVolver}
        className="absolute top-8 left-8 text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
      >
        <span>←</span> Volver
      </button>

      <div className="w-full max-w-3xl space-y-8 animate-fade-in-up">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Panel de Control</h1>
          <p className="text-gray-400">Personaliza tu identidad en la red espacial</p>
        </div>

        {mensajeExito && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl text-center font-medium shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            {mensajeExito}
          </div>
        )}
        {mensajeError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-center font-medium shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            {mensajeError}
          </div>
        )}

        <form onSubmit={handleGuardar} className="space-y-6">
          
          {/* SECCIÓN AVATAR MEJORADA */}
          <div className="bg-[#161b2e] border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8 shadow-xl">
            
            {/* Input oculto que hace la magia */}
            <input 
              type="file" 
              accept="image/*" 
              ref={archivoInputRef} 
              onChange={handleSubirImagen} 
              className="hidden" 
            />

            <div 
              className="relative group cursor-pointer" 
              onClick={() => archivoInputRef.current.click()} // Al hacer clic en el círculo, abrimos archivos
            >
              <div className="w-28 h-28 bg-[#3b82f6] rounded-full flex items-center justify-center text-4xl font-bold border-4 border-[#0a0e17] shadow-[0_0_30px_rgba(59,130,246,0.3)] overflow-hidden transition group-hover:opacity-75">
                {/* Lógica condicional: ¿Tiene foto o mostramos la letra? */}
                {usuario.fotoPerfilUrl ? (
                  <img src={usuario.fotoPerfilUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  usuario.nombre.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-full">
                <span className="text-2xl">📷</span>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold mb-1">Avatar del Sistema</h3>
              <p className="text-sm text-gray-400 mb-4">Sube una imagen para que la comunidad te reconozca.</p>
              <button 
                type="button" 
                onClick={() => archivoInputRef.current.click()} // Al hacer clic en el botón, abrimos archivos
                disabled={subiendoImagen}
                className="text-sm bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subiendoImagen ? 'Subiendo datos...' : 'Cambiar imagen'}
              </button>
            </div>
          </div>

          {/* El resto de tu formulario de Identidad y Seguridad se mantiene intacto... */}
          <div className="bg-[#161b2e] border border-white/10 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">Identidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de Usuario</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] transition"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pronombres (Opcional)</label>
                <input type="text" name="pronombres" value={formData.pronombres} onChange={handleChange} placeholder="Ej: Él / Ella / Elle" className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] transition"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico (No modificable)</label>
                <input type="email" value={usuario.correo} disabled className="w-full bg-[#0a0e17] border border-white/5 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"/>
              </div>
            </div>
          </div>

          <div className="bg-[#161b2e] border border-white/10 rounded-2xl p-8 shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">Seguridad</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña Actual</label>
                <input type="password" name="contrasenaActual" value={formData.contrasenaActual} onChange={handleChange} placeholder="Deja en blanco si no quieres cambiarla" className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff5722] transition"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nueva Contraseña</label>
                <input type="password" name="nuevaContrasena" value={formData.nuevaContrasena} onChange={handleChange} placeholder="Mínimo 8 caracteres" className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff5722] transition"/>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
            <button type="button" onClick={onCerrarSesion} className="text-red-400 hover:text-red-300 font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition">
              Cerrar Sesión
            </button>
            <button type="submit" disabled={cargando} className={`px-8 py-3 rounded-lg font-bold transition ${cargando ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-[#5b3cff] hover:bg-[#4a2eec] text-white shadow-[0_0_20px_rgba(91,60,255,0.4)]'}`}>
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Settings;