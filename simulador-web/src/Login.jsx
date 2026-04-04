import React from 'react';

function Login({ onVolver, onIrRegistro }) {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white flex flex-col items-center justify-center font-sans relative">
      
      {/* Botón flotante para volver atrás (opcional, pero útil para probar) */}
      <button 
        onClick={onVolver}
        className="absolute top-8 left-8 text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg transition"
      >
        <span>←</span> Volver al inicio
      </button>

      {/* TÍTULO PRINCIPAL (Igual que en la portada) */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-widest flex items-center justify-center mb-12">
        SISTEMA S
        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.8)] mx-2"></span>
        LAR INTERACTIV
        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#ff5722] shadow-[0_0_30px_rgba(255,87,34,0.8)] ml-2"></span>
      </h1>

      {/* TARJETA DE LOGIN */}
      <div className="bg-[#161b2e]/90 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Bienvenido</h2>
          <p className="text-sm text-gray-400">Inicia sesión en tu cuenta</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          
          {/* Campo Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Usuario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input 
                type="text" 
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
                placeholder="Ingresa tu usuario"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                type="password" 
                className="w-full bg-[#0f1322] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#3b82f6] transition"
                placeholder="Ingresa tu contraseña"
              />
            </div>
          </div>

          {/* Recordarme y Contraseña Olvidada */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-300 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-[#0f1322] text-[#3b82f6] focus:ring-[#3b82f6] focus:ring-offset-[#161b2e] mr-2" />
              Recordarme
            </label>
            <a href="#" className="text-gray-400 hover:text-white transition">¿Olvidaste tu contraseña?</a>
          </div>

          {/* Botón Principal */}
          <button 
            type="submit" 
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition mt-4"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Enlace de Registro */}
        <div className="text-center mt-6 text-sm text-gray-400">
          ¿No tienes cuenta? <button onClick={onIrRegistro} className="text-[#3b82f6] hover:text-blue-400 font-medium transition">Regístrate</button>
        </div>

      </div>
    </div>
  );
}

export default Login;