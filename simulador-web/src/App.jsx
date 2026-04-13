/*
  Este es el componente principal de la aplicación React.
  Actúa como el contenedor central que gestiona el estado global (como el usuario autenticado)
  y se encarga de la navegación básica (renderizar diferentes pantallas como Inicio, Login, Comunidad, etc.) 
  dependiendo del estado actual.
*/
import React, { useState, useEffect} from 'react';
import Community from './Community';
import Login from './Login';
import Register from './Register';
import Settings from './Settings';
import About from './About';

function App() {
  const [paginaActiva, setPaginaActiva] = useState(() => {
    const paginaGuardada = localStorage.getItem('simulador_pagina');
    return paginaGuardada ? paginaGuardada : 'inicio';
  });
  // Inicialización del estado del usuario autenticado desde el almacenamiento local.
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    const usuarioGuardado = localStorage.getItem('simulador_usuario');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  useEffect(() => {
    localStorage.setItem('simulador_pagina', paginaActiva);
  }, [paginaActiva]);

  // Funciones de enrutamiento básico de la aplicación dependientes del estado
  if (paginaActiva === 'login') {
    return (
      <Login 
        onVolver={() => setPaginaActiva('inicio')} 
        onIrRegistro={() => setPaginaActiva('registro')}
        onLoginExitoso={(datosUsuario) => {
          // Persistencia de los datos del usuario en el almacenamiento local tras un inicio de sesión exitoso
          setUsuarioLogueado(datosUsuario); 
          localStorage.setItem('simulador_usuario', JSON.stringify(datosUsuario));
          setPaginaActiva('inicio');        
        }}
      />
    );
  }
if (paginaActiva === 'acerca') {
  return <About onVolver={() => setPaginaActiva('inicio')} />;
}
  if (paginaActiva === 'registro') {
    return (
      <Register 
        onVolver={() => setPaginaActiva('inicio')} 
        onIrLogin={() => setPaginaActiva('login')} 
      />
    );
  }

  if (paginaActiva === 'configuracion') {
    return (
      <Settings 
        usuario={usuarioLogueado}
        onVolver={() => setPaginaActiva('inicio')}
        onCerrarSesion={() => {
          // Eliminación de los datos de sesión en el almacenamiento local al cerrar sesión
          setUsuarioLogueado(null);
          localStorage.removeItem('simulador_usuario');
          setPaginaActiva('inicio');
        }}
        onUsuarioActualizado={(nuevosDatos) => {
          setUsuarioLogueado(nuevosDatos);
          localStorage.setItem('simulador_usuario', JSON.stringify(nuevosDatos)); // Sincronizamos las modificaciones con el almacenamiento local
        }}
      />
    );
  }

  if (paginaActiva === 'comunidad') {
    return (
      <div className="min-h-screen bg-[#0a0f1d]">
        <Community 
          usuario={usuarioLogueado} 
          setPagina={setPaginaActiva} 
          onLoginExitoso={(datosUsuario) => {
            setUsuarioLogueado(datosUsuario);
            localStorage.setItem('simulador_usuario', JSON.stringify(datosUsuario));
          }}
          onVolver={() => setPaginaActiva('inicio')} 
        />
      </div>
    );
  }

  // Renderizado de la vista principal o de inicio
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans">
      
      <nav className="flex justify-between items-center px-8 py-4 border-b border-white/10">
        
       {/* Renderizado condicional: muestra información de la cuenta si el usuario está autenticado; de lo contrario, muestra el botón de inicio de sesión */}
      {usuarioLogueado ? (
        <div 
          onClick={() => setPaginaActiva('configuracion')}
          className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold border border-white/20">
            {usuarioLogueado.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{usuarioLogueado.nombre}</p>
            <p className="text-xs text-[#3b82f6]">Mi Cuenta</p>
          </div>
        </div>
      ) : (
        <button
             onClick={() => setPaginaActiva('login')}
             className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
           >
             <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
             </svg>
             Iniciar Sesión
           </button>
         )}

        <div className="flex items-center gap-6 text-sm font-medium">
          <button onClick={() => setPaginaActiva('comunidad')} className="flex items-center gap-2 hover:text-gray-300 transition">
            <span></span> Simulaciones
          </button>
         <button onClick={() => setPaginaActiva('acerca')} className="hover:text-gray-300 transition">Acerca de</button>
          <button className="bg-[#5b3cff] hover:bg-[#4a2eec] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition font-semibold">
            <span></span> Descargar App
          </button>
        </div>
      </nav>

      {/* Componente principal de la vista de inicio */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 -mt-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-widest flex items-center justify-center mb-6">
          SISTEMA S
          <span className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#3b82f6] shadow-[0_0_40px_rgba(59,130,246,0.8)] mx-2"></span>
          LAR INTERACTIV
          <span className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#ff5722] shadow-[0_0_40px_rgba(255,87,34,0.8)] ml-2"></span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
          Diseña sistemas solares, experimenta con la gravedad y descubre las leyes de la física
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-[#5b3cff] hover:bg-[#4a2eec] text-white px-8 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span></span> Descargar Ahora
          </button>
          <button onClick={() => setPaginaActiva('comunidad')} className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-8 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span></span> Explorar Simulaciones
          </button>
        </div>
      </main>

     
    </div>
  );
}

export default App;