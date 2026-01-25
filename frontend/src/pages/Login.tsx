import React, { useState } from 'react';
import api from '../api/axios';
import type { AuthResponse } from '../types';

// Componente de fondo animado con elementos dentales
const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {/* Gradiente base */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50" />
    
    {/* Patrón de puntos */}
    <div className="absolute inset-0 pattern-dots opacity-50" />
    
    {/* Blur orbs */}
    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-drift" />
    <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float-slow" />
    <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl animate-float-medium" />
    
    {/* Dientes flotantes */}
    <svg className="absolute top-[15%] left-[10%] w-16 h-16 text-blue-300/40 animate-float-slow" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    
    <svg className="absolute top-[60%] right-[8%] w-12 h-12 text-cyan-300/30 animate-float-medium" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    
    <svg className="absolute bottom-[20%] left-[15%] w-10 h-10 text-teal-300/25 animate-drift" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>

    {/* Brackets decorativos */}
    <svg className="absolute top-[30%] right-[20%] w-20 h-8 text-blue-400/20 animate-float-fast" viewBox="0 0 120 40" fill="currentColor">
      <rect x="5" y="15" width="20" height="10" rx="2"/>
      <rect x="35" y="15" width="20" height="10" rx="2"/>
      <rect x="65" y="15" width="20" height="10" rx="2"/>
      <rect x="95" y="15" width="20" height="10" rx="2"/>
      <line x1="0" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="2"/>
    </svg>

    <svg className="absolute bottom-[35%] left-[5%] w-16 h-6 text-cyan-400/15 animate-float-medium" viewBox="0 0 120 40" fill="currentColor">
      <rect x="5" y="15" width="20" height="10" rx="2"/>
      <rect x="35" y="15" width="20" height="10" rx="2"/>
      <rect x="65" y="15" width="20" height="10" rx="2"/>
      <rect x="95" y="15" width="20" height="10" rx="2"/>
      <line x1="0" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="2"/>
    </svg>
    
    {/* Cruz médica */}
    <svg className="absolute top-[75%] right-[30%] w-8 h-8 text-emerald-400/25 animate-pulse-glow" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
    </svg>

    {/* Espejo dental */}
    <svg className="absolute top-[45%] left-[85%] w-10 h-10 text-blue-300/20 animate-drift" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="5"/>
      <line x1="12" y1="13" x2="12" y2="22"/>
    </svg>

    {/* Estrellas / destellos */}
    <div className="absolute top-[25%] left-[40%] w-2 h-2 bg-blue-400/40 rounded-full animate-pulse-glow" />
    <div className="absolute top-[55%] left-[70%] w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-pulse-glow delay-300" />
    <div className="absolute top-[80%] left-[25%] w-2 h-2 bg-teal-400/40 rounded-full animate-pulse-glow delay-600" />
  </div>
);

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) { setError('Ingrese su usuario'); return; }
    if (!password.trim()) { setError('Ingrese su contraseña'); return; }

    try {
      setLoading(true);
      const response = await api.post<AuthResponse>('/auth/auth/login', { 
        username: username.trim(), 
        password 
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        window.location.href = '/dashboard';
      } else {
        setError('Error del servidor');
      }
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8 animate-fade-in-down">
          {/* Logo animado */}
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 hover-scale">
              <svg className="w-14 h-16 text-white drop-shadow-lg" viewBox="0 0 100 120" fill="currentColor">
                <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
              </svg>
              {/* Indicador de estado */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full border-4 border-white shadow-lg animate-pulse" />
            </div>
            
            {/* Anillos decorativos */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-3xl border-2 border-blue-300/30 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Endo</span>
            <span className="text-slate-700">Nova</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-wide">Sistema de Gestión Odontológica</p>
        </div>

        {/* Card del formulario */}
        <div className="glass-strong rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden animate-fade-in-up">
          {/* Header decorativo */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
          
          <div className="p-8">
            {/* Título del form */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Bienvenido</h2>
                <p className="text-sm text-slate-500">Ingresa tus credenciales</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-scale-in">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Usuario */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Usuario
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-8 h-8 bg-slate-100 group-focus-within:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="w-full pl-14 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <div className="w-8 h-8 bg-slate-100 group-focus-within:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-14 pr-12 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-8 animate-fade-in-up delay-300">
          © 2026 EndoNova — Sistema de Gestión Odontológica
        </p>
      </div>
    </div>
  );
};

export default Login;
