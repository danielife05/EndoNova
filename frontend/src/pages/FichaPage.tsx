import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FichaEndonova from '../components/FichaEndonova';

const FichaPage: React.FC = () => {
  const { idPaciente } = useParams<{ idPaciente: string }>();
  const navigate = useNavigate();

  const pacienteId = idPaciente ? parseInt(idPaciente, 10) : NaN;

  if (!idPaciente || isNaN(pacienteId)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
          <p className="text-red-600 mb-4">Error: ID de paciente no válido</p>
          <button 
            onClick={() => navigate('/pacientes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <FichaEndonova 
      idPaciente={pacienteId} 
      onClose={() => navigate('/pacientes')}
      onSave={(ficha) => {
        // Navegar a pagos después de guardar
        navigate(`/pacientes/${pacienteId}/ficha/${ficha.id_ficha}/pagos`);
      }}
    />
  );
};

export default FichaPage;
