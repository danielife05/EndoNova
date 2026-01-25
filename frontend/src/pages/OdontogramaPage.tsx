import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Odontogram from '../components/Odontogram';

const OdontogramaPage: React.FC = () => {
  const { idPaciente } = useParams<{ idPaciente: string }>();
  const navigate = useNavigate();

  const pacienteId = idPaciente ? parseInt(idPaciente, 10) : NaN;

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
          <button 
            onClick={() => navigate('/pacientes')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm transition-all"
          >
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <Odontogram 
      idPaciente={pacienteId} 
      onClose={() => navigate('/pacientes')} 
    />
  );
};

export default OdontogramaPage;
