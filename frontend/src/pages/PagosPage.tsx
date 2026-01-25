import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PresupuestoPagos from '../components/PresupuestoPagos';

interface FichaInfo {
  id_ficha: number;
  pieza_dental: string;
  created_at: string;
}

const PagosPage: React.FC = () => {
  const { idPaciente, idFicha } = useParams<{ idPaciente: string; idFicha: string }>();
  const navigate = useNavigate();
  const [fichasDisponibles, setFichasDisponibles] = useState<FichaInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [noFichas, setNoFichas] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pacienteId = idPaciente ? parseInt(idPaciente, 10) : NaN;
  const fichaId = idFicha ? parseInt(idFicha, 10) : NaN;

  useEffect(() => {
    const loadFichas = async () => {
      if (!idPaciente || isNaN(pacienteId)) return;
      if (idFicha && !isNaN(fichaId)) return;

      setLoading(true);
      setNoFichas(false);
      setErrorMsg(null);
      
      try {
        const response = await api.get<FichaInfo[]>(`/clinical/fichas/${pacienteId}`);
        const fichas = Array.isArray(response.data) ? response.data : [];
        if (fichas.length === 0) {
          setNoFichas(true);
        } else if (fichas.length === 1) {
          navigate(`/pacientes/${pacienteId}/ficha/${fichas[0].id_ficha}/pagos`, { replace: true });
        } else {
          setFichasDisponibles(fichas);
          setShowSelector(true);
        }
      } catch {
        setErrorMsg('Error al cargar las fichas del paciente');
      } finally {
        setLoading(false);
      }
    };
    loadFichas();
  }, [idPaciente, idFicha, pacienteId, fichaId, navigate]);

  // Error state - ID inválido
  if (!idPaciente || isNaN(pacienteId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-500 mb-6">ID de paciente no válido</p>
          <button onClick={() => navigate('/pacientes')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30">
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }

  // Error de carga
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error de Conexión</h2>
          <p className="text-slate-500 mb-6">{errorMsg}</p>
          <button onClick={() => navigate('/pacientes')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30">
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }

  // Sin fichas - pantalla informativa profesional
  if (noFichas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sin Fichas Registradas</h2>
          <p className="text-slate-500 mb-6">
            Este paciente no tiene fichas endodónticas. 
            Debe crear una ficha primero para poder gestionar pagos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate(`/pacientes/${pacienteId}/ficha`)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30">
              Crear Ficha
            </button>
            <button onClick={() => navigate('/pacientes')}
              className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-all">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Cargando fichas...</p>
        </div>
      </div>
    );
  }

  // Selector de fichas
  if (showSelector && !idFicha) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Decorative elements */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="fixed bottom-0 left-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto p-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 mt-12 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Seleccionar Ficha</h1>
                    <p className="text-emerald-100 text-sm">Elija la ficha para gestionar pagos</p>
                  </div>
                </div>
                <button onClick={() => navigate('/pacientes')}
                  className="px-4 py-2 text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/50 rounded-xl transition-all hover:bg-white/10">
                  Cancelar
                </button>
              </div>
            </div>
            
            {/* List */}
            <div className="p-4">
              <div className="space-y-3">
                {fichasDisponibles.map((f, idx) => (
                  <button
                    key={f.id_ficha}
                    onClick={() => navigate(`/pacientes/${pacienteId}/ficha/${f.id_ficha}/pagos`)}
                    className="w-full bg-slate-50 hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-200 rounded-2xl p-4 text-left flex justify-between items-center transition-all group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <span className="text-sm font-bold text-white">
                          {f.pieza_dental}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                          Pieza Dental {f.pieza_dental}
                        </p>
                        <p className="text-sm text-slate-400">
                          Ficha #{f.id_ficha} - {new Date(f.created_at).toLocaleDateString('es-EC')}
                        </p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-all">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar componente de pagos
  if (idFicha && !isNaN(fichaId)) {
    return (
      <PresupuestoPagos 
        idFicha={fichaId}
        idPaciente={pacienteId}
        onClose={() => navigate('/pacientes')}
      />
    );
  }

  // Default loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
        <p className="text-slate-500 font-medium">Cargando...</p>
      </div>
    </div>
  );
};

export default PagosPage;
