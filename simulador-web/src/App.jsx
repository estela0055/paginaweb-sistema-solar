import React, { useState } from 'react';
import Community from './Community';
import Login from './Login';
import Register from './Register'; // 1. Importamos la nueva pantalla

function App() {
  const [paginaActiva, setPaginaActiva] = useState('inicio');

  // --- RUTAS DE LA APLICACIÓN ---

  // Pantalla de Login
  if (paginaActiva === 'login') {
    return (
      <Login 
        onVolver={() => setPaginaActiva('inicio')} 
        onIrRegistro={() => setPaginaActiva('registro')} // Conectado al registro
      />
    );
  }

  // Pantalla de Registro
  if (paginaActiva === 'registro') {
    return (
      <Register 
        onVolver={() => setPaginaActiva('inicio')} 
        onIrLogin={() => setPaginaActiva('login')} // Conectado al login
      />
    );
  }

  // Pantalla de la Comunidad
  if (paginaActiva === 'comunidad') {
    return (
      <div className="relative">
        <button 
          onClick={() => setPaginaActiva('inicio')}
          className="absolute top-8 text-sm left-8 bg-[#1a1f35] border border-white/10 hover:bg-white/5 text-white/70 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 z-10 transition"
        >
          <span>←</span> Volver al inicio
        </button>
        <Community />
      </div>
    );
  }

  // --- PANTALLA PRINCIPAL (INICIO) ---
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans">
      
      <nav className="flex justify-between items-center px-8 py-4 border-b border-white/10">
        
        {/* Botón de Iniciar Sesión */}
        <button 
          onClick={() => setPaginaActiva('login')}
          className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Iniciar Sesión
        </button>

        <div className="flex items-center gap-6 text-sm font-medium">
          <button onClick={() => setPaginaActiva('comunidad')} className="flex items-center gap-2 hover:text-gray-300 transition">
            <span>🌐</span> Simulaciones
          </button>
          <a href="#" className="hover:text-gray-300 transition">Acerca de</a>
          <button className="bg-[#5b3cff] hover:bg-[#4a2eec] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition font-semibold">
            <span>📥</span> Descargar App
          </button>
        </div>
      </nav>

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
            <span>📥</span> Descargar Ahora
          </button>
          <button onClick={() => setPaginaActiva('comunidad')} className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-8 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span>🌐</span> Explorar Simulaciones
          </button>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm">
        © 2026 Solar Simulator. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App;