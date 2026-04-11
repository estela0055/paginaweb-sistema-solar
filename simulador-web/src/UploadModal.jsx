import React, { useState } from 'react';

function UploadModal({ isOpen, onClose }) {
  const [privado, setPrivado] = useState(false);

  // Si isOpen es falso, no dibujamos nada en pantalla
  if (!isOpen) return null;

  return (
    // FONDO OSCURO DESENFOCADO (Ocupa toda la pantalla y se pone por encima de todo)
    <div className="fixed inset-0 bg-[#0a0e17]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans text-white">
      
      {/* CAJA DEL MODAL */}
      <div className="bg-[#161b2e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-in-up">
        
        {/* CABECERA DEL MODAL */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0f1322]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>↑</span> Subir Simulación
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <div className="p-6 space-y-5">
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre de la Simulación</label>
            <input 
              type="text" 
              placeholder="Ej: Sistema Binario Alpha"
              className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripción</label>
            <textarea 
              rows="3"
              placeholder="Explica qué tiene de especial este sistema..."
              className="w-full bg-[#0f1322] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition resize-none"
            ></textarea>
          </div>

          {/* Interruptor Privado/Público */}
          <div className="flex items-center justify-between bg-[#0f1322] p-4 rounded-lg border border-white/5">
            <div>
              <p className="font-medium text-sm">Simulación Privada</p>
              <p className="text-xs text-gray-500">Solo tú podrás ver y cargar este sistema.</p>
            </div>
            {/* Diseño de Toggle personalizado */}
            <button 
              onClick={() => setPrivado(!privado)}
              className={`w-12 h-6 rounded-full transition-colors relative ${privado ? 'bg-[#3b82f6]' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${privado ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>

          {/* Zona de subida de archivo (Placeholder visual) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Archivo de entorno (.unity, .json)</label>
            <div className="border-2 border-dashed border-gray-600 hover:border-[#3b82f6] hover:bg-[#3b82f6]/5 rounded-xl p-8 text-center transition cursor-pointer group">
              <div className="w-12 h-12 bg-[#0f1322] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                <span className="text-xl">📁</span>
              </div>
              <p className="text-sm font-medium mb-1">Haz clic o arrastra tu archivo aquí</p>
              <p className="text-xs text-gray-500">Tamaño máximo: 50MB (Preparado para Cloudflare R2)</p>
            </div>
          </div>
        </div>

        {/* PIE DEL MODAL (Botones) */}
        <div className="p-6 border-t border-white/10 bg-[#0f1322] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition"
          >
            Cancelar
          </button>
          <button className="bg-[#5b3cff] hover:bg-[#4a2eec] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-[0_0_15px_rgba(91,60,255,0.4)] transition">
            Publicar
          </button>
        </div>

      </div>
    </div>
  );
}

export default UploadModal;