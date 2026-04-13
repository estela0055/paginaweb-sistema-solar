/*
  Componente About:
  Página estática e informativa ("Acerca de"). 
  Suele contener información sobre el proyecto, sus creadores o cómo funciona
  el simulador en un formato amigable.
*/
import React from 'react';

function About({ onVolver }) {
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white font-sans overflow-hidden relative">
      
      {/* Fondos espaciales difuminados para dar ambiente */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#5b3cff]/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ff5722]/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Barra de navegación rápida */}
      <nav className="relative z-10 flex items-center px-8 py-6 border-b border-white/5 bg-[#0a0f1d]/80 backdrop-blur-md sticky top-0">
        <button 
          onClick={onVolver}
          className="text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
        >
          <span>←</span> Volver
        </button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-32">
        
        {/* SECCIÓN 1: HERO / LA MISIÓN */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Más que un simulador.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5b3cff] to-[#ff5722]">Un universo colaborativo.</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            El Sistema Solar Interactivo nació con una misión: convertir la física abstracta en experimentación real. No leas sobre órbitas; créalas, destrúyelas y compártelas con el mundo.
          </p>
        </section>

        {/* SECCIÓN 2: EL ECOSISTEMA (COMO FUNCIONA LA COMUNIDAD) */}
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">El Ciclo Estelar</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nuestra plataforma conecta la potencia gráfica de Unity con la accesibilidad de la web. Así es como la comunidad da vida a nuevos sistemas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tarjeta 1 */}
            <div className="bg-[#161b2e] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-[#5b3cff]/50 transition duration-500">
              <div className="text-4xl mb-6">🛠️</div>
              <h3 className="text-xl font-bold mb-3">1. Diseña en la App</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Descarga nuestro simulador de escritorio. Usa el motor físico para añadir soles, planetas y lunas. Ajusta masas, velocidades y mira cómo la gravedad de Newton hace el resto. Cuando estés orgulloso, exporta tu `.json`.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-[#161b2e] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-[#ff5722]/50 transition duration-500">
              <div className="text-4xl mb-6">☁️</div>
              <h3 className="text-xl font-bold mb-3">2. Sube a la Nube</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nuestra web es tu repositorio. Inicia sesión, ponle un título épico a tu creación y súbela. Utilizamos tecnología de almacenamiento ultrarrápida (Cloudflare R2) para que tus archivos estén disponibles globalmente.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-[#161b2e] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-green-400/50 transition duration-500">
              <div className="text-4xl mb-6">📥</div>
              <h3 className="text-xl font-bold mb-3">3. Descarga y Explora</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Navega por la galería, filtra por popularidad o busca los favoritos de la comunidad. Descarga el sistema de otro usuario, cárgalo en tu aplicación local y descubre cómo logró esa órbita estable imposible.
              </p>
            </div>
          </div>
        </section>


      </main>
     
    </div>
  );
}

export default About;