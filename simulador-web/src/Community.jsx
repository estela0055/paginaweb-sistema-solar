import React, { useState, useEffect } from 'react';
import UploadModal from './UploadModal'; // Añade esta línea
import LoginModal from './LoginModal';

function Community({ usuario, setPagina, onLoginExitoso }) {
  // 1. Ahora 'simulaciones' empieza como una lista vacía []
  const [simulaciones, setSimulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
 const [modalSubirAbierto, setModalSubirAbierto] = useState(false);
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false);
  // 2. useEffect: Esto se ejecuta UNA SOLA VEZ cuando se abre esta pestaña
  useEffect(() => {
    // Función para ir a buscar los datos al backend
    const obtenerDatos = async () => {
      try {
        // Llamamos a la dirección de tu servidor Node.js
        const respuesta = await fetch('http://127.0.0.1:3000/api/simulaciones');
        const datosReales = await respuesta.json();
        
        // Guardamos los datos en la memoria de React y quitamos el "Cargando"
        setSimulaciones(datosReales);
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar las simulaciones:", error);
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []); // Los corchetes vacíos [] significan "hazlo solo al cargar la página"

  // Función auxiliar para poner la fecha bonita (ya que la base de datos la manda un poco fea)
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  };
const manejarClickSubir = () => {
    if (usuario) {
      setModalSubirAbierto(true);
    } else {
      // 4. Si no hay usuario, ABRIMOS EL MODAL en vez de cambiar de página
      setModalLoginAbierto(true); 
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white p-8 font-sans">
      
     {/* CABECERA */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Simulaciones de la Comunidad</h1>
          <p className="text-gray-400">Explora y descarga las simulaciones creadas por usuarios</p>
        </div>
        
        {/* 3. CAMBIAMOS EL BOTÓN para que use nuestra nueva función */}
        <button 
          onClick={manejarClickSubir} 
          className="bg-[#4f39f6] hover:bg-[#402de6] transition px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2"
        >
          <span>↑</span> Subir Simulación
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="flex gap-4 mb-8">
        <div className="flex-grow bg-[#1a1f35] rounded-lg flex items-center px-4 border border-white/5">
          <span className="text-gray-400 mr-2">🔍</span>
          <input 
            type="text" 
            placeholder="Buscar simulaciones..." 
            className="bg-transparent border-none outline-none w-full py-3 text-white placeholder-gray-500"
          />
        </div>
        <button className="bg-[#1a1f35] border border-white/5 px-6 rounded-lg flex items-center gap-2 hover:bg-white/5 transition">
          <span>⏳</span> Filtros
        </button>
        <button className="bg-[#1a1f35] border border-white/5 px-6 rounded-lg hover:bg-white/5 transition">
          Más populares
        </button>
        <button className="bg-[#1a1f35] border border-white/5 px-6 rounded-lg hover:bg-white/5 transition">
          Más recientes
        </button>
      </div>

      {/* MUESTRA UN MENSAJE MIENTRAS CARGA */}
      {cargando ? (
        <div className="text-center py-20 text-gray-400 animate-pulse">
          <p className="text-xl">Conectando con la base de datos espacial...</p>
        </div>
      ) : (
        /* CUADRÍCULA DE SIMULACIONES CON DATOS DE LA BASE DE DATOS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {simulaciones.map((sim) => (
            <div key={sim.id} className="bg-[#161b2e] border border-white/5 rounded-xl p-5 hover:border-white/10 transition group">
              
              <div className="bg-[#0f1322] h-40 rounded-lg mb-4 flex items-center justify-center">
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className="absolute w-20 h-20 rounded-full border border-gray-600/50"></div>
                  <div className="absolute w-12 h-12 rounded-full border border-gray-600/50"></div>
                  <div className="w-6 h-6 rounded-full bg-[#ff9800] shadow-[0_0_15px_#ff9800]"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-[#5b3cff] translate-x-6"></div>
                </div>
              </div>

              {/* Fíjate que aquí usamos los nombres exactos de las columnas de tu base de datos: titulo, autor, num_planetas */}
              <h3 className="font-bold text-lg mb-1">{sim.titulo}</h3>
              <p className="text-sm text-gray-400 mb-4">por <span className="text-[#5b3cff]">{sim.autor}</span></p>
              
              <div className="flex justify-between items-end text-xs text-gray-500 mb-4">
                <div className="flex flex-col gap-1">
                  <span>{sim.num_planetas} planetas</span>
                  <span className="flex items-center gap-1">♡ {sim.likes} likes</span>
                </div>
                <span>{formatearFecha(sim.fecha_publicacion)}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-grow bg-[#4f39f6] hover:bg-[#402de6] transition py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <span>📥</span> Descargar
                </button>
                <button className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 transition">
                  ♥
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <UploadModal 
        isOpen={modalSubirAbierto} 
        onClose={() => setModalSubirAbierto(false)} 
      />

      <LoginModal
        isOpen={modalLoginAbierto}
        onClose={() => setModalLoginAbierto(false)}
        // Si le da a registrarse, le mandamos a la página de registro
        onIrRegistro={() => setPagina('registro')} 
        // Si se loguea bien, le avisamos a App.jsx para que ponga su nombre arriba
        onLoginExitoso={onLoginExitoso}
      />
    </div>
  );
}

export default Community;