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

  const pacienteId = idPaciente ? parseInt(idPaciente, 10) : NaN;
  const fichaId = idFicha ? parseInt(idFicha, 10) : NaN;

  useEffect(() => {
    const loadFichas = async () => {
      if (!idPaciente || isNaN(pacienteId)) return;
      if (idFicha && !isNaN(fichaId)) return;

      setLoading(true);
      try {
        const response = await api.get<FichaInfo[]>(`/clinical/fichas/${pacienteId}`);
        const fichas = Array.isArray(response.data) ? response.data : [];
        if (fichas.length === 0) {
          alert('Este paciente no tiene fichas. Cree una ficha primero.');
          navigate('/pacientes');
        } else if (fichas.length === 1) {
          navigate(`/pacientes/${pacienteId}/ficha/${fichas[0].id_ficha}/pagos`, { replace: true });
        } else {
          setFichasDisponibles(fichas);
          setShowSelector(true);
        }
      } catch {
        alert('Error cargando fichas');
        navigate('/pacientes');
      } finally {
        setLoading(false);
      }
    };
    loadFichas();
  }, [idPaciente, idFicha, pacienteId, fichaId, navigate]);

  // Error state
  if (!idPaciente || isNaN(pacienteId)) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="border border-slate-800 bg-slate-900/50 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white mb-2">Error</p>
          <p className="text-slate-500 text-sm mb-6">ID de paciente no válido</p>
          <button onClick={() => navigate('/pacientes')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm transition-all">
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Cargando fichas...
        </div>
      </div>
    );
  }

  // Selector de fichas
  if (showSelector && !idFicha) {
    return (
      <div className="min-h-screen bg-[#0a0e1a]">
        {/* Grid background */}
        <div className="fixed inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="relative max-w-2xl mx-auto p-6">
          <div className="border border-slate-800 bg-slate-900/50 mt-12">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-emerald-500" />
                <div>
                  <h1 className="text-lg font-semibold text-white">Seleccionar Ficha</h1>
                  <p className="text-xs text-slate-500">Elija la ficha para gestionar pagos</p>
                </div>
              </div>
              <button onClick={() => navigate('/pacientes')}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition-all">
                Cancelar
              </button>
            </div>
            
            {/* List */}
            <div className="p-4">
              <div className="space-y-2">
                {fichasDisponibles.map((f) => (
                  <button
                    key={f.id_ficha}
                    onClick={() => navigate(`/pacientes/${pacienteId}/ficha/${f.id_ficha}/pagos`)}
                    className="w-full border border-slate-700 hover:border-blue-500/50 p-4 text-left flex justify-between items-center hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border border-slate-600 group-hover:border-blue-500/50 flex items-center justify-center transition-all">
                        <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors">
                          {f.pieza_dental}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">Pieza {f.pieza_dental}</p>
                        <p className="text-xs text-slate-500">
                          Ficha #{f.id_ficha} • {new Date(f.created_at).toLocaleDateString('es-EC')}
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        Cargando...
      </div>
    </div>
  );
};

export default PagosPage;
