import React, { useState, useEffect } from 'react';

function SimulationModal({ isOpen, onClose, simulacion, usuario }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [cargandoComentarios, setCargandoComentarios] = useState(true);
  const [respondiendoA, setRespondiendoA] = useState(null);
  const [mostrarEscondidos, setMostrarEscondidos] = useState(false);

  useEffect(() => {
    if (isOpen && simulacion) {
      setCargandoComentarios(true);
      fetch(`http://127.0.0.1:3000/api/simulaciones/${simulacion.id}/comentarios`)
        .then(res => res.json())
        .then(data => {
          setComentarios(data);
          setCargandoComentarios(false);
        })
        .catch(err => {
          console.error("Error:", err);
          setCargandoComentarios(false);
        });
    }
  }, [isOpen, simulacion]);

  if (!isOpen || !simulacion) return null;

  // 1. ENVÍO INSTANTÁNEO (Optimistic UI)
  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !usuario) return;

    const textoGuardado = nuevoComentario;
    const padreIdGuardado = respondiendoA ? respondiendoA.id : null;
    const idTemporal = Date.now(); // ID falso para pintarlo rápido

    // Creamos un comentario falso al instante
    const comentarioOptimista = {
      id: idTemporal,
      contenido: textoGuardado,
      usuario_id: usuario.id,
      autor: usuario.nombre,
      parent_id: padreIdGuardado,
      fecha_publicacion: new Date().toISOString(),
      es_escondido: false
    };

    // Lo pintamos inmediatamente
    setComentarios([...comentarios, comentarioOptimista]);
    setNuevoComentario('');
    setRespondiendoA(null);

    // Lo enviamos a la base de datos en segundo plano
    try {
      const respuesta = await fetch(`http://127.0.0.1:3000/api/simulaciones/${simulacion.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          usuarioId: usuario.id, 
          contenido: textoGuardado,
          parentId: padreIdGuardado
        })
      });

      if (respuesta.ok) {
        const datos = await respuesta.json();
        // Cambiamos el ID falso por el ID real que nos da PostgreSQL
        setComentarios(prev => prev.map(c => c.id === idTemporal ? datos.comentario : c));
      } else {
        // Si falla, borramos el comentario falso
        setComentarios(prev => prev.filter(c => c.id !== idTemporal));
        alert("Error al enviar el comentario.");
      }
    } catch (error) {
      setComentarios(prev => prev.filter(c => c.id !== idTemporal));
      console.error('Error:', error);
    }
  };

  // 2. BORRAR COMENTARIO
  const manejarBorrar = async (idComentario) => {
    if (!window.confirm("¿Eliminar este comentario? Se borrarán también las respuestas.")) return;
    
    // Lo borramos de la pantalla al instante
    setComentarios(comentarios.filter(c => c.id !== idComentario && c.parent_id !== idComentario));

    try {
      await fetch(`http://127.0.0.1:3000/api/comentarios/${idComentario}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id })
      });
    } catch (err) {
      console.error("Error al borrar:", err);
    }
  };

  // 3. ESCONDER / MOSTRAR COMENTARIO
  const manejarEsconder = async (idComentario, estadoActual) => {
    const nuevoEstado = !estadoActual;
    
    // Actualizamos la pantalla al instante
    setComentarios(comentarios.map(c => c.id === idComentario ? { ...c, es_escondido: nuevoEstado } : c));

    try {
      await fetch(`http://127.0.0.1:3000/api/comentarios/${idComentario}/esconder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id, esconder: nuevoEstado })
      });
    } catch (err) {
      console.error("Error al esconder:", err);
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  };

  // 4. PINTAR EL ÁRBOL (ESTÉTICA RESTAURADA)
  const renderComentario = (comentario, nivel = 0) => {
    // Si está escondido y no hemos activado el botón de verlos, no lo pintamos
    if (comentario.es_escondido && !mostrarEscondidos) return null;

    const respuestas = comentarios.filter(c => c.parent_id === comentario.id);
    const esAutorDelComentario = usuario?.id === comentario.usuario_id || usuario?.nombre === comentario.autor;
    const esCreadorDelSistema = usuario?.nombre === simulacion.autor;

    // Clases estéticas que tenías antes
    const clasesBase = nivel > 0 
      ? 'ml-6 md:ml-10 mt-3 border-l-2 border-[#5b3cff]/30 pl-4 animate-fade-in-up' 
      : 'bg-[#161b2e] border border-white/5 p-4 rounded-xl mt-4 animate-fade-in-up';
    
    // Efecto visual si el mensaje está clasificado
    const clasesEscondido = comentario.es_escondido ? 'opacity-40 border-dashed' : '';

    return (
      <div key={comentario.id} className={`${clasesBase} ${clasesEscondido}`}>
        <div className="flex justify-between items-start mb-2">
          
          {/* Nombre y etiquetas */}
          <span className={`font-bold text-sm ${esCreadorDelSistema && comentario.autor === simulacion.autor ? 'text-[#5b3cff]' : 'text-gray-300'}`}>
            {comentario.autor} 
            {comentario.autor === simulacion.autor && <span className="text-[10px] bg-[#5b3cff]/20 text-[#5b3cff] px-1.5 py-0.5 rounded ml-2">CREADOR</span>}
            {comentario.es_escondido && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded ml-2">OCULTO</span>}
          </span>
          
          {/* Botones de moderación y fecha */}
          <div className="flex items-center gap-3">
            {esCreadorDelSistema && (
              <button onClick={() => manejarEsconder(comentario.id, comentario.es_escondido)} title={comentario.es_escondido ? "Hacer visible" : "Ocultar mensaje"} className="text-gray-500 hover:text-white transition">
                {comentario.es_escondido ? '👁️' : 'ocultar'}
              </button>
            )}
            {(esAutorDelComentario || esCreadorDelSistema) && (
              <button onClick={() => manejarBorrar(comentario.id)} title="Borrar mensaje" className="text-gray-500 hover:text-red-500 transition">
                eliminar
              </button>
            )}
            <span className="text-xs text-gray-600">{formatearFecha(comentario.fecha_publicacion)}</span>
          </div>

        </div>
        
        <p className="text-sm text-gray-300 leading-relaxed mb-2">{comentario.contenido}</p>
        
        {/* Botón de responder (Restaurado) */}
        {usuario && !comentario.es_escondido && (
          <button 
            onClick={() => setRespondiendoA(comentario)}
            className="text-xs text-gray-500 hover:text-[#5b3cff] transition font-medium flex items-center gap-1"
          >
            ↳ Responder
          </button>
        )}

        {/* Llamada recursiva para los hijos */}
        {respuestas.map(resp => renderComentario(resp, nivel + 1))}
      </div>
    );
  };

  const comentariosPrincipales = comentarios.filter(c => !c.parent_id);
  const hayEscondidos = comentarios.some(c => c.es_escondido);

  return (
    <div className="fixed inset-0 bg-[#0a0e17]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans animate-fade-in">
      <div className="bg-[#161b2e] border border-[#5b3cff]/30 rounded-2xl w-full max-w-5xl h-[80vh] shadow-[0_0_50px_rgba(91,60,255,0.15)] relative flex flex-col md:flex-row overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg transition z-20 bg-[#161b2e]/80">✕</button>

        {/* COLUMNA IZQUIERDA (Info Simulación) */}
        <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col h-full overflow-y-auto custom-scrollbar">
          <div className="bg-[#0f1322] h-48 rounded-xl mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5b3cff]/20 to-transparent opacity-50"></div>
            <div className="text-6xl group-hover:scale-110 transition-transform duration-500">🪐</div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{simulacion.titulo}</h2>
          <p className="text-[#5b3cff] font-medium mb-6">por {simulacion.autor}</p>
          {/* ¡NUEVO!: Tarjetas de Likes y Fecha */}
          <div className="flex gap-3 mb-6">
            <div className="bg-[#1a1f35] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-gray-300">
              <span className="text-red-400">❤️</span> {simulacion.likes}
            </div>
            <div className="bg-[#1a1f35] border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-gray-300">
              <span>📅</span> {formatearFecha(simulacion.fecha_publicacion)}
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Notas del Creador</h3>
            <div className="bg-[#1a1f35] border border-white/5 p-5 rounded-xl text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {simulacion.descripcion || <span className="text-gray-500 italic">Sin parámetros .</span>}
            </div>
          </div>
          <button className="w-full bg-[#5b3cff] hover:bg-[#4a2eec] text-white font-bold py-4 rounded-xl mt-6 transition">
            📥 Descargar Sistema
          </button>
        </div>

        {/* COLUMNA DERECHA (Chat) */}
        <div className="w-full md:w-1/2 bg-[#0f1322] flex flex-col h-full">
          
          <div className="p-6 border-b border-white/5 bg-[#161b2e]/50 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
               Comentarios <span className="text-xs bg-[#5b3cff]/20 text-[#5b3cff] px-2 py-1 rounded-full">{comentarios.length}</span>
            </h3>
            {/* BOTÓN MÁGICO PARA MOSTRAR ESCONDIDOS (Solo aparece si hay alguno) */}
            {hayEscondidos && (
              <button 
                onClick={() => setMostrarEscondidos(!mostrarEscondidos)}
                className="text-xs border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded-lg text-gray-400 transition"
              >
                {mostrarEscondidos ? 'Ocultar clasificados' : 'Ver clasificados'}
              </button>
            )}
          </div>

          <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
            {cargandoComentarios ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">Sintonizando...</div>
            ) : comentarios.filter(c => !c.es_escondido || mostrarEscondidos).length === 0 ? (
              <div className="text-center py-20 opacity-50"><span className="text-4xl mb-3">🛰️</span><p className="text-gray-400">Sin comentarios.</p></div>
            ) : (
              comentariosPrincipales.map(com => renderComentario(com))
            )}
          </div>

          {/* CAJA DE TEXTO PARA ESCRIBIR */}
          <div className="p-6 border-t border-white/5 bg-[#161b2e]/80 flex flex-col gap-3">
            {respondiendoA && (
              <div className="flex justify-between items-center bg-[#5b3cff]/10 text-[#5b3cff] px-3 py-2 rounded-lg text-sm border border-[#5b3cff]/20">
                <span>Respondiendo a <strong>{respondiendoA.autor}</strong></span>
                <button onClick={() => setRespondiendoA(null)} className="hover:text-white font-bold">✕</button>
              </div>
            )}
            
            {usuario ? (
              <form onSubmit={handleEnviarComentario} className="flex gap-3">
                <input 
                  type="text" 
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder={respondiendoA ? "Escribe tu respuesta..." : "Enviar comentario..."}
                  className="flex-grow bg-[#0f1322] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#5b3cff] transition outline-none"
                />
                <button type="submit" disabled={!nuevoComentario.trim()} className="bg-[#5b3cff] hover:bg-[#4a2eec] text-white p-3 rounded-xl disabled:bg-gray-700">➤</button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 text-center">Inicia sesión para comentar.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default SimulationModal;