/*
  Componente Community:
  Representa la pantalla "Comunidad" donde los usuarios pueden explorar, 
  buscar, dar "like" y descargar simulaciones compartidas por otros.
  También permite a los usuarios logueados subir nuevas simulaciones 
  o eliminar las suyas propias.
*/
import React, { useState, useEffect } from 'react';
import UploadModal from './UploadModal';
import LoginModal from './LoginModal';
import SimulationModal from './SimulationModal';
function Community({ usuario, setPagina, onLoginExitoso, onVolver }) {
  const [simulaciones, setSimulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalSubirAbierto, setModalSubirAbierto] = useState(false);
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('recientes'); 
const [modalSimulacionAbierto, setModalSimulacionAbierto] = useState(false);
  const [simulacionSeleccionada, setSimulacionSeleccionada] = useState(null);
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/simulaciones?usuarioId=${usuario?.id || 0}`);
        const datosReales = await respuesta.json();
        setSimulaciones(datosReales);
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar las simulaciones:", error);
        setCargando(false);
      }
    };
    obtenerDatos();
  }, [usuario?.id]); // Recargar si el usuario inicia/cierra sesión

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  };

  const manejarClickSubir = () => {
    if (usuario) {
      setModalSubirAbierto(true);
    } else {
      setModalLoginAbierto(true); 
    }
  };

  const manejarClickLike = async (simulacionId) => {
    if (!usuario) {
      setModalLoginAbierto(true);
      return; 
    }
    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/simulaciones/${simulacionId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id }) 
      });

      if (respuesta.ok) {
        const datosActualizados = await respuesta.json();
        setSimulaciones(simulaciones.map(sim => {
          if (sim.id === simulacionId) {
             return { 
               ...sim, 
               likes: datosActualizados.likesActuales,
               has_liked: datosActualizados.estado === 'añadido' 
             };
          }
          return sim;
        }));
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  // Eliminación de una simulación en el backend y actualización del estado
  const manejarBorrado = async (simulacionId) => {
    // Verificación de intención de borrado del usuario
    if (!window.confirm("¿Está seguro de que desea eliminar esta simulación? Esta acción no se puede deshacer.")) {
      return; 
    }

    try {
      const respuesta = await fetch(`${import.meta.env.VITE_API_URL}/api/simulaciones/${simulacionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id }) 
      });

      if (respuesta.ok) {
        // Actualización del estado local excluyendo el registro eliminado
        setSimulaciones(simulaciones.filter(sim => sim.id !== simulacionId));
      } else {
        const datos = await respuesta.json();
        alert(datos.error); // Manejo de errores de autorización o de servidor
      }
    } catch (error) {
      console.error('Error al borrar:', error);
    }
  };

  // Procesamiento de datos: filtrado y ordenamiento de las simulaciones
  const simulacionesProcesadas = simulaciones
    .filter((sim) => {
      const coincideBusqueda = sim.titulo.toLowerCase().includes(busqueda.toLowerCase());
      
      if (filtroActivo === 'favoritos') return coincideBusqueda && sim.has_liked;
      
      // Filtrado por autoría del usuario autenticado actualmente
      if (filtroActivo === 'propias') return coincideBusqueda && (usuario && sim.autor === usuario.nombre);
      
      return coincideBusqueda;
    })
    .sort((a, b) => {
      if (filtroActivo === 'populares') {
        return b.likes - a.likes; 
      } else {
        return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
      }
    });

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-8 font-sans">
      
      {/* Componente de cabecera con navegación y acciones principales */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 mb-8 p-6 bg-[#161b2e] rounded-xl border border-white/5 shadow-2xl">
        <button 
          onClick={onVolver}
          className="text-sm bg-[#1a1f35] border border-white/10 hover:bg-white/5 text-white/70 hover:text-white px-5 py-2.5 rounded-lg flex items-center gap-2.5 transition whitespace-nowrap"
        >
          <span>←</span> Volver al inicio
        </button>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold mb-1.5">Simulaciones de la Comunidad</h1>
          <p className="text-sm text-gray-400">Explora y descarga las simulaciones creadas por usuarios</p>
        </div>
        <button 
          onClick={manejarClickSubir} 
          className="bg-[#4f39f6] hover:bg-[#402de6] transition px-6 py-3 rounded-lg font-semibold flex items-center gap-2.5 whitespace-nowrap"
        >
          <span>↑</span> Subir Simulación
        </button>
      </div>

      {/* Controles de filtrado y barra de búsqueda */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-grow bg-[#1a1f35] rounded-lg flex items-center px-4 border border-white/5 focus-within:border-[#4f39f6] transition">
          <input 
            type="text" 
            placeholder="Buscar por nombre o autor..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-transparent border-none outline-none w-full py-3 text-white placeholder-gray-500"
          />
        </div>
        
        {/* Renderizado condicional del filtro de simulaciones propias */}
        {usuario && (
          <button 
            onClick={() => setFiltroActivo('propias')}
            className={`border px-6 rounded-lg transition font-medium ${
              filtroActivo === 'propias' 
                ? 'bg-[#5b3cff]/20 border-[#5b3cff]/50 text-[#5b3cff]' 
                : 'bg-[#1a1f35] border-white/5 hover:bg-white/5 text-gray-400'
            }`}
          >
            Mis Simulaciones
          </button>
        )}

        <button 
          onClick={() => setFiltroActivo('favoritos')}
          className={`border px-6 rounded-lg transition font-medium ${
            filtroActivo === 'favoritos' 
              ? 'bg-red-500/20 border-red-500/50 text-red-400' 
              : 'bg-[#1a1f35] border-white/5 hover:bg-white/5 text-gray-400'
          }`}
        >
           Mis Favoritos
        </button>
        <button 
          onClick={() => setFiltroActivo('populares')}
          className={`border px-6 rounded-lg transition font-medium ${
            filtroActivo === 'populares' 
              ? 'bg-white/20 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
              : 'bg-[#1a1f35] border-white/5 hover:bg-white/5 text-gray-400'
          }`}
        >
           Más populares
        </button>
        <button 
          onClick={() => setFiltroActivo('recientes')}
          className={`border px-6 rounded-lg transition font-medium ${
            filtroActivo === 'recientes' 
              ? 'bg-white/20 border-white/30 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
              : 'bg-[#1a1f35] border-white/5 hover:bg-white/5 text-gray-400'
          }`}
        >
           Más recientes
        </button>
      </div>

      {cargando ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">
          <p className="text-xl font-medium">Cargando simulaciones...</p>
        </div>
      ) : simulacionesProcesadas.length === 0 ? (
        <div className="text-center py-24 text-gray-500 bg-[#161b2e] rounded-xl border border-white/5">
          <p className="text-xl mb-2.5">No se encontraron resultados</p>
          <p className="text-sm">No hemos encontrado ninguna simulación con esos criterios.</p>
        </div>
      ) : (
        /* Renderizado de la cuadrícula de simulaciones */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {simulacionesProcesadas.map((sim) => {
            // Verificación de autoría para renderizado condicional de opciones
            const esMio = usuario && sim.autor === usuario.nombre;

            return (
            <div key={sim.id}
            onClick={() => {
                setSimulacionSeleccionada(sim);
                setModalSimulacionAbierto(true);
              }}
               className="bg-[#161b2e] border border-white/5 rounded-xl p-5 hover:border-white/10 transition group shadow-lg relative overflow-hidden">
              
              {/* Etiqueta visual indicadora de autoría */}
              {esMio && (
                <div className="absolute top-0 right-0 bg-[#5b3cff] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md z-10">
                  TUYA
                </div>
              )}

              <div className="bg-[#0f1322] h-40 rounded-lg mb-4 flex items-center justify-center border border-white/5">
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className="absolute w-20 h-20 rounded-full border border-gray-600/50"></div>
                  <div className="absolute w-12 h-12 rounded-full border border-gray-600/50"></div>
                  <div className="w-6 h-6 rounded-full bg-[#ff9800] shadow-[0_0_15px_#ff9800]"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-[#5b3cff] translate-x-6"></div>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1 pr-8">{sim.titulo}</h3>
              <p className="text-sm text-gray-400 mb-4">por <span className="text-[#5b3cff] font-medium">{sim.autor}</span></p>
              
              {/* Contenedor de estadísticas y metadata */}
              <div className="flex justify-between items-end text-xs text-gray-500 mb-4 pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-[#ff5722]">♡ {sim.likes} likes</span>
                </div>
                <span>{formatearFecha(sim.fecha_publicacion)}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-grow bg-[#4f39f6] hover:bg-[#402de6] transition py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <span>📥</span> Descargar
                </button>
                
                {/* Control de eliminación (renderizado condicional para el autor) */}
                {esMio && (
                  <button 
                    onClick={() =>{ e.stopPropagation(); manejarBorrado(sim.id); }}
                    className="p-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition text-sm font-semibold"
                    title="Eliminar simulación"
                  >
                    Borrar
                  </button>
                )}

                <button 
                  onClick={() =>{ e.stopPropagation(); manejarBorrado(sim.id); }}
                  className={`p-2.5 rounded-lg border transition ${
                    sim.has_liked 
                      ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                      : 'border-white/10 text-gray-500 hover:text-red-400 hover:border-red-400/50'
                  }`}
                >
                  {sim.has_liked ? '❤️' : '♥'}
                </button>
              </div>
            </div>
          )})}
        </div>
      )}
      
      {/* MODALES */}
      <UploadModal 
        isOpen={modalSubirAbierto} 
        onClose={() => setModalSubirAbierto(false)} 
        usuario={usuario} 
      />
      <LoginModal isOpen={modalLoginAbierto} onClose={() => setModalLoginAbierto(false)} onIrRegistro={() => setPagina('registro')} onLoginExitoso={onLoginExitoso} />
    <SimulationModal 
        isOpen={modalSimulacionAbierto} 
        onClose={() => setModalSimulacionAbierto(false)} 
        simulacion={simulacionSeleccionada}
        usuario={usuario}
      />
    </div>
  );
}

export default Community;