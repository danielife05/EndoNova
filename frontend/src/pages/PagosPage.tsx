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

  // Si no hay idFicha, cargar las fichas disponibles
  useEffect(() => {
    const loadFichas = async () => {
      if (!idPaciente || isNaN(pacienteId)) return;
      
      // Si ya tenemos idFicha válido, no necesitamos cargar fichas
      if (idFicha && !isNaN(fichaId)) return;

      setLoading(true);
      try {
        const response = await api.get<FichaInfo[]>(`/clinical/fichas/${pacienteId}`);
        const fichas = Array.isArray(response.data) ? response.data : [];
        if (fichas.length === 0) {
          alert('Este paciente no tiene fichas. Cree una ficha primero.');
          navigate('/pacientes');
        } else if (fichas.length === 1) {
          // Si solo hay una ficha, navegar directamente
          navigate(`/pacientes/${pacienteId}/ficha/${fichas[0].id_ficha}/pagos`, { replace: true });
        } else {
          // Si hay múltiples fichas, mostrar selector
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500">Cargando fichas...</div>
      </div>
    );
  }

  // Mostrar selector de fichas si hay múltiples
  if (showSelector && !idFicha) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-white">Seleccionar Ficha</h1>
                <p className="text-slate-300 text-sm">Seleccione la ficha para gestionar presupuesto y pagos</p>
              </div>
              <button 
                onClick={() => navigate('/pacientes')}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
              >
                Cancelar
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {fichasDisponibles.map((f) => (
                  <button
                    key={f.id_ficha}
                    onClick={() => navigate(`/pacientes/${pacienteId}/ficha/${f.id_ficha}/pagos`)}
                    className="w-full border border-slate-200 p-4 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium text-blue-900">Pieza {f.pieza_dental}</span>
                      <p className="text-sm text-slate-500">
                        Ficha #{f.id_ficha} • {new Date(f.created_at).toLocaleDateString('es-EC')}
                      </p>
                    </div>
                    <span className="text-blue-500">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si tenemos idFicha válido, mostrar el componente de presupuesto/pagos
  if (idFicha && !isNaN(fichaId)) {
    return (
      <PresupuestoPagos 
        idFicha={fichaId}
        idPaciente={pacienteId}
        onClose={() => navigate('/pacientes')}
      />
    );
  }

  // Mostrar cargando mientras se resuelve la navegación
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-slate-500">Cargando...</div>
    </div>
  );
};

export default PagosPage;
