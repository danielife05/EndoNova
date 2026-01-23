import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface DashboardStats {
  total_fichas: number;
  fichas_abiertas: number;
  fichas_cerradas: number;
  total_presupuestado: number;
  total_cobrado: number;
  saldo_pendiente: number;
  porcentaje_cobrado: number;
  pagos_recientes: PagoReciente[];
  fichas_recientes: FichaReciente[];
  pagos_por_metodo: Record<string, number>;
}

interface PagoReciente {
  id_pago: number;
  valor: number;
  metodo: string;
  fecha: string;
  id_paciente: number | null;
  pieza_dental: string | null;
}

interface FichaReciente {
  id_ficha: number;
  id_paciente: number;
  pieza_dental: string;
  estado: string;
  fecha: string;
}

interface Paciente {
  id_paciente: number;
  nombres: string;
  apellidos: string;
}

// Animated counter hook
const useCounter = (end: number, duration = 1500, delay = 0) => {
  const [count, setCount] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(ease * end));
        if (progress < 1) ref.current = requestAnimationFrame(animate);
        else setCount(end);
      };
      ref.current = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); if (ref.current) cancelAnimationFrame(ref.current); };
  }, [end, duration, delay]);

  return count;
};

// Fondo animado
const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50" />
    <div className="absolute inset-0 pattern-dots opacity-30" />
    
    {/* Blur orbs */}
    <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl animate-drift" />
    <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl animate-float-slow" />
    <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-float-medium" />
    
    {/* Dientes decorativos */}
    <svg className="absolute top-32 right-[15%] w-14 h-14 text-blue-200/40 animate-float-slow" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    <svg className="absolute bottom-40 left-[8%] w-10 h-10 text-cyan-200/30 animate-float-medium" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    <svg className="absolute top-[60%] right-[5%] w-8 h-8 text-teal-200/35 animate-drift" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    
    {/* Brackets decorativos */}
    <svg className="absolute top-[25%] left-[3%] w-20 h-8 text-blue-200/25 animate-float-slow" viewBox="0 0 120 40" fill="currentColor">
      <rect x="5" y="15" width="20" height="10" rx="2"/>
      <rect x="35" y="15" width="20" height="10" rx="2"/>
      <rect x="65" y="15" width="20" height="10" rx="2"/>
      <rect x="95" y="15" width="20" height="10" rx="2"/>
      <line x1="0" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="2"/>
    </svg>
  </div>
);

// Header
const Header: React.FC<{ onLogout: () => void; navigate: (path: string) => void }> = ({ onLogout, navigate }) => (
  <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-shadow">
            <svg className="w-6 h-7 text-white" viewBox="0 0 100 120" fill="currentColor">
              <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Endo</span>
              <span className="text-slate-700">Nova</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Sistema Odontológico</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-2">
          <button className="px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl">
            Dashboard
          </button>
          <button onClick={() => navigate('/pacientes')} 
            className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
            Pacientes
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2" />
          <button onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group">
            <span>Salir</span>
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </header>
);

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: number;
  prefix?: string;
  color: string;
  bgColor: string;
  delay: number;
  icon: React.ReactNode;
}> = ({ label, value, prefix = '', color, bgColor, delay, icon }) => {
  const count = useCounter(value, 1500, delay);
  
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-${color}/10 transition-all duration-300 group animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color} tracking-tight`}>
            {prefix}{count.toLocaleString('es-EC')}
          </p>
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pacientes, setPacientes] = useState<Record<number, Paciente>>({});
  const [loading, setLoading] = useState(true);
  const [totalPacientes, setTotalPacientes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pacientesRes] = await Promise.all([
          api.get<DashboardStats>('/clinical/stats'),
          api.get<Paciente[]>('/patients/patients/')
        ]);
        setStats(statsRes.data);
        setTotalPacientes(pacientesRes.data.length);
        const map: Record<number, Paciente> = {};
        pacientesRes.data.forEach(p => { map[p.id_paciente] = p; });
        setPacientes(map);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30 animate-bounce-subtle">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className="text-slate-500 mt-4 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const metodos = stats?.pagos_por_metodo || {};
  const maxMetodo = Math.max(...Object.values(metodos), 1);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header onLogout={handleLogout} navigate={navigate} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1 ml-15">
            {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard 
            label="Total Pacientes" 
            value={totalPacientes} 
            color="text-blue-600" 
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard 
            label="Fichas Activas" 
            value={stats?.fichas_abiertas || 0} 
            color="text-emerald-600" 
            bgColor="bg-gradient-to-br from-emerald-500 to-teal-500"
            delay={100}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard 
            label="Total Cobrado" 
            value={stats?.total_cobrado || 0} 
            prefix="$" 
            color="text-violet-600" 
            bgColor="bg-gradient-to-br from-violet-500 to-purple-500"
            delay={200}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard 
            label="Saldo Pendiente" 
            value={stats?.saldo_pendiente || 0} 
            prefix="$" 
            color="text-amber-600" 
            bgColor="bg-gradient-to-br from-amber-500 to-orange-500"
            delay={300}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Circle */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Progreso de Cobro</h3>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="60" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle cx="72" cy="72" r="60" fill="none" stroke="url(#progressGrad)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(stats?.porcentaje_cobrado || 0) * 3.77} 377`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
                    {stats?.porcentaje_cobrado || 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 text-sm">Presupuestado</span>
                <span className="text-slate-800 font-bold">${(stats?.total_presupuestado || 0).toLocaleString('es-EC')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                <span className="text-emerald-600 text-sm">Cobrado</span>
                <span className="text-emerald-600 font-bold">${(stats?.total_cobrado || 0).toLocaleString('es-EC')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                <span className="text-amber-600 text-sm">Pendiente</span>
                <span className="text-amber-600 font-bold">${(stats?.saldo_pendiente || 0).toLocaleString('es-EC')}</span>
              </div>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Pagos por Método</h3>
            </div>

            <div className="space-y-4">
              {Object.entries(metodos).map(([method, value], index) => {
                const configs: Record<string, { bg: string; bar: string; icon: React.ReactNode }> = {
                  EFECTIVO: { 
                    bg: 'bg-emerald-50', 
                    bar: 'from-emerald-400 to-emerald-500',
                    icon: <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                  },
                  TRANSFERENCIA: { 
                    bg: 'bg-blue-50', 
                    bar: 'from-blue-400 to-blue-500',
                    icon: <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  },
                  TARJETA: { 
                    bg: 'bg-violet-50', 
                    bar: 'from-violet-400 to-violet-500',
                    icon: <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  },
                  OTRO: { 
                    bg: 'bg-amber-50', 
                    bar: 'from-amber-400 to-amber-500',
                    icon: <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                  }
                };
                const config = configs[method] || configs.OTRO;
                
                return (
                  <div key={method} className={`p-4 ${config.bg} rounded-xl animate-fade-in-up`} style={{ animationDelay: `${600 + index * 100}ms` }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span className="font-medium text-slate-700">{method}</span>
                      </div>
                      <span className="text-slate-800 font-bold">${value.toLocaleString('es-EC')}</span>
                    </div>
                    <div className="h-2.5 bg-white rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${config.bar} rounded-full transition-all duration-1000`}
                        style={{ width: `${(value / maxMetodo) * 100}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(metodos).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">Sin datos de pagos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fichas Recientes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: '700ms' }}>
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Fichas Recientes</h3>
              </div>
              <span className="text-xs text-blue-100 bg-white/20 px-2.5 py-1 rounded-full">Últimas 5</span>
            </div>
            <div className="divide-y divide-slate-100">
              {(stats?.fichas_recientes || []).length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">Sin fichas registradas</p>
                </div>
              ) : (
                stats?.fichas_recientes.map((f, i) => (
                  <div key={f.id_ficha} className="px-6 py-4 hover:bg-slate-50 transition-colors group animate-fade-in-up" style={{ animationDelay: `${800 + i * 50}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{f.pieza_dental}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {pacientes[f.id_paciente] ? `${pacientes[f.id_paciente].nombres} ${pacientes[f.id_paciente].apellidos}` : `Paciente #${f.id_paciente}`}
                          </p>
                          <p className="text-sm text-slate-400">Pieza {f.pieza_dental}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        f.estado === 'ABIERTA' 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {f.estado}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagos Recientes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Pagos Recientes</h3>
              </div>
              <span className="text-xs text-emerald-100 bg-white/20 px-2.5 py-1 rounded-full">Últimos 5</span>
            </div>
            <div className="divide-y divide-slate-100">
              {(stats?.pagos_recientes || []).length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">Sin pagos registrados</p>
                </div>
              ) : (
                stats?.pagos_recientes.map((p, i) => (
                  <div key={p.id_pago} className="px-6 py-4 hover:bg-slate-50 transition-colors group animate-fade-in-up" style={{ animationDelay: `${900 + i * 50}ms` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {p.id_paciente && pacientes[p.id_paciente] ? `${pacientes[p.id_paciente].nombres} ${pacientes[p.id_paciente].apellidos}` : 'Pago registrado'}
                          </p>
                          <p className="text-sm text-slate-400">{p.metodo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">+${p.valor.toLocaleString('es-EC')}</p>
                        <p className="text-xs text-slate-400">{p.fecha ? new Date(p.fecha).toLocaleDateString('es-EC') : ''}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
