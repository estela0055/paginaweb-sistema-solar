import React from 'react';

function App() {
  return (
    // Contenedor principal con el color de fondo exacto
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col font-sans">
      
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-white/10">
        {/* Icono de Usuario (Izquierda) */}
        <div className="w-10 h-10 border-2 border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>

        {/* Menú derecho */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="flex items-center gap-2 hover:text-gray-300 transition">
            <span>🌐</span> Simulaciones
          </a>
          <a href="#" className="hover:text-gray-300 transition">Acerca de</a>
          <button className="bg-[#5b3cff] hover:bg-[#4a2eec] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition font-semibold">
            <span>📥</span> Descargar App
          </button>
        </div>
      </nav>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 -mt-10">
        
        {/* Título principal con planetas CSS */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-widest flex items-center justify-center mb-6">
          SISTEMA S
          {/* Planeta Azul */}
          <span className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#3b82f6] shadow-[0_0_40px_rgba(59,130,246,0.8)] mx-2"></span>
          LAR INTERACTIV
          {/* Planeta Naranja */}
          <span className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#ff5722] shadow-[0_0_40px_rgba(255,87,34,0.8)] ml-2"></span>
        </h1>

        {/* Subtítulo */}
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl">
          Diseña sistemas solares, experimenta con la gravedad y descubre las leyes de la física
        </p>
        
        {/* Botones principales */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-[#5b3cff] hover:bg-[#4a2eec] text-white px-8 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span>📥</span> Descargar Ahora
          </button>
          <button className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-8 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <span>🌐</span> Explorar Simulaciones
          </button>
        </div>
      </main>

      {/* PIE DE PÁGINA */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        © 2026 Solar Simulator. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default App;