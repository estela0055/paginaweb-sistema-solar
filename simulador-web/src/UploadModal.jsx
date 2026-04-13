/*
  Componente UploadModal:
  Al igual que el LoginModal, es un componente emergente. 
  Aquí el usuario autenticado puede subir un archivo que contenga su simulación.
  Interacciona con el servidor enviando los archivos por medio de FormData.
*/
import React, { useState } from 'react';

function UploadModal({ isOpen, onClose, usuario }) {
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Si el modal está cerrado o no hay usuario, no pintamos nada
  if (!isOpen || !usuario) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!titulo.trim() || !archivo) {
      return setMensaje({ texto: 'Por favor, ponle un título y selecciona un archivo.', tipo: 'error' });
    }

    setCargando(true);

    // MAGIA AQUÍ: Usamos FormData para empaquetar el archivo junto con el texto
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('autor', usuario.nombre);
    formData.append('usuarioId', usuario.id);
    formData.append('num_planetas', 0); // Lo dejamos en 0 de momento
    formData.append('archivo', archivo); // Añadimos el archivo físico

    try {
      // OJO: Al usar FormData, NO ponemos 'Content-Type'. El navegador lo pone automáticamente.
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/simulaciones`, {
        method: 'POST',
        body: formData,
      });

      if (respuesta.ok) {
        setMensaje({ texto: '¡Simulación en órbita! 🚀', tipo: 'exito' });
        
        // Esperamos 2 segundos para que lea el mensaje, cerramos y recargamos para verla
        setTimeout(() => {
          onClose();
          window.location.reload(); 
        }, 2000);
      } else {
        const datos = await respuesta.json();
        setMensaje({ texto: datos.error || 'Hubo un error al subir.', tipo: 'error' });
        setCargando(false);
      }
    } catch (error) {
      console.error(error);
      setMensaje({ texto: 'Error de conexión con la base espacial.', tipo: 'error' });
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0e17]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-[#161b2e] border border-[#5b3cff]/30 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(91,60,255,0.15)] relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg transition z-10">
          ✕
        </button>

        <div className="p-8 pb-4 text-center">
          <div className="text-4xl mb-4">🛰️</div>
          <h2 className="text-2xl font-bold mb-2">Subir Simulación</h2>
          <p className="text-sm text-gray-400">Comparte tu sistema con la comunidad</p>
        </div>

        <div className="p-8 pt-4">
          {mensaje.texto && (
            <div className={`p-3 rounded-lg mb-6 text-sm text-center border ${
              mensaje.tipo === 'exito' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'
            }`}>
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del Sistema</label>
              <input 
                type="text" 
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5b3cff] transition"
                placeholder="Ej: Sistema Binario Alpha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Archivo de simulación (.json)</label>
              {/* Botón de archivo personalizado para que encaje con el diseño oscuro */}
              <input 
                type="file" 
                accept=".json,.txt" // Aquí puedes restringir el tipo de archivo
                onChange={(e) => setArchivo(e.target.files[0])}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5b3cff]/20 file:text-[#5b3cff] hover:file:bg-[#5b3cff]/30 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-2">Sube el archivo exportado desde Unity.</p>
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full font-bold py-3 rounded-lg transition mt-4 ${
                cargando 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#5b3cff] hover:bg-[#4a2eec] text-white shadow-[0_0_15px_rgba(91,60,255,0.4)]'
              }`}
            >
              {cargando ? 'Subiendo a la nube...' : 'Publicar Sistema'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;