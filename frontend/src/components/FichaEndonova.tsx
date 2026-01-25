import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from './Toast';

interface FichaEndodontica {
  id_ficha: number;
  id_paciente: number;
  pieza_dental: string;
  motivo_consulta: string;
  diagnostico_pulpar: string;
  diagnostico_periapical: string;
  observaciones: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface FichaEndodonticaCreate {
  id_paciente: number;
  pieza_dental: string;
  motivo_consulta: string;
  diagnostico_pulpar: string;
  diagnostico_periapical: string;
  observaciones: string;
}

interface Props {
  idPaciente: number;
  onClose: () => void;
  onSave: (ficha: FichaEndodontica) => void;
}

const DIAGNOSTICOS_PULPARES = [
  'Pulpa Normal',
  'Pulpitis Reversible',
  'Pulpitis Irreversible Sintomática',
  'Pulpitis Irreversible Asintomática',
  'Necrosis Pulpar',
  'Tratamiento Previo Iniciado',
  'Terapia Previamente Iniciada'
];

const DIAGNOSTICOS_PERIAPICALES = [
  'Tejidos Apicales Normales',
  'Periodontitis Apical Sintomática',
  'Periodontitis Apical Asintomática',
  'Absceso Apical Agudo',
  'Absceso Apical Crónico',
  'Osteítis Condensante'
];

const PIEZAS_DENTALES = [
  // Adultos superior
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
  // Adultos inferior
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38',
  // Niños superior
  '55', '54', '53', '52', '51',
  '61', '62', '63', '64', '65',
  // Niños inferior
  '85', '84', '83', '82', '81',
  '71', '72', '73', '74', '75'
];

// Fondo animado
const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50" />
    <div className="absolute inset-0 pattern-dots opacity-30" />
    
    {/* Blur orbs */}
    <div className="absolute top-10 right-10 w-80 h-80 bg-violet-400/15 rounded-full blur-3xl animate-drift" />
    <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl animate-float-slow" />
    <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl animate-float-medium" />
    
    {/* Diente decorativo */}
    <svg className="absolute top-24 right-[12%] w-12 h-12 text-violet-200/40 animate-float-slow" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    <svg className="absolute bottom-28 left-[6%] w-8 h-8 text-blue-200/35 animate-float-medium" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
  </div>
);

const FichaEndonova: React.FC<Props> = ({ idPaciente, onClose, onSave }) => {
  const [fichas, setFichas] = useState<FichaEndodontica[]>([]);
  const [selectedFicha, setSelectedFicha] = useState<FichaEndodontica | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { showSuccess, showError } = useToast();

  const emptyForm: FichaEndodonticaCreate = {
    id_paciente: idPaciente,
    pieza_dental: '',
    motivo_consulta: '',
    diagnostico_pulpar: '',
    diagnostico_periapical: '',
    observaciones: ''
  };

  const [formData, setFormData] = useState<FichaEndodonticaCreate>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FichaEndodonticaCreate, string>>>({});

  useEffect(() => {
    fetchFichas();
  }, [idPaciente]);

  const fetchFichas = async () => {
    try {
      setLoading(true);
      const response = await api.get<FichaEndodontica[]>(`/clinical/fichas/${idPaciente}`);
      const fichasData = Array.isArray(response.data) ? response.data : [];
      setFichas(fichasData);
      if (fichasData.length > 0) {
        setSelectedFicha(fichasData[0]);
      }
    } catch (error) {
      console.error('Error:', error);
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FichaEndodonticaCreate, string>> = {};
    if (!formData.pieza_dental) errors.pieza_dental = 'Seleccione una pieza';
    if (!formData.motivo_consulta.trim()) errors.motivo_consulta = 'Requerido';
    if (!formData.diagnostico_pulpar) errors.diagnostico_pulpar = 'Seleccione diagnóstico';
    if (!formData.diagnostico_periapical) errors.diagnostico_periapical = 'Seleccione diagnóstico';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (selectedFicha && !showForm) {
        // Actualizar ficha existente
        const response = await api.put<FichaEndodontica>(`/clinical/fichas/update/${selectedFicha.id_ficha}`, {
          ...formData,
          estado: selectedFicha.estado
        });
        showSuccess('Ficha actualizada');
        onSave(response.data);
      } else {
        // Crear nueva ficha
        const response = await api.post<FichaEndodontica>('/clinical/fichas/', formData);
        showSuccess('Ficha creada');
        onSave(response.data);
      }
      fetchFichas();
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      showError('Error al guardar la ficha');
    }
  };

  const handleNewFicha = () => {
    setSelectedFicha(null);
    setFormData(emptyForm);
    setFormErrors({});
    setShowForm(true);
  };

  const handleSelectFicha = (ficha: FichaEndodontica) => {
    setSelectedFicha(ficha);
    setFormData({
      id_paciente: ficha.id_paciente,
      pieza_dental: ficha.pieza_dental,
      motivo_consulta: ficha.motivo_consulta,
      diagnostico_pulpar: ficha.diagnostico_pulpar,
      diagnostico_periapical: ficha.diagnostico_periapical,
      observaciones: ficha.observaciones || ''
    });
    setFormErrors({});
    setShowForm(false);
  };

  const handleCerrarFicha = async () => {
    if (!selectedFicha) return;
    try {
      await api.put(`/clinical/fichas/update/${selectedFicha.id_ficha}`, {
        ...formData,
        estado: 'CERRADA'
      });
      showSuccess('Ficha cerrada');
      fetchFichas();
    } catch {
      showError('Error al cerrar la ficha');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-500/30 animate-bounce-subtle">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
          <p className="text-slate-500 mt-4 font-medium">Cargando ficha endodóntica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Ficha Endodóntica</h1>
                  <p className="text-sm text-slate-400">Paciente #{idPaciente}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewFicha}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Ficha
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de fichas */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-fade-in-left">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Fichas del Paciente
                </h2>
                <p className="text-sm text-slate-400 mt-1">{fichas.length} ficha(s) registrada(s)</p>
              </div>
              
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {fichas.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">Sin fichas registradas</p>
                    <button
                      onClick={handleNewFicha}
                      className="mt-4 text-violet-500 hover:text-violet-600 text-sm font-medium"
                    >
                      + Crear primera ficha
                    </button>
                  </div>
                ) : (
                  fichas.map((ficha, index) => (
                    <button
                      key={ficha.id_ficha}
                      onClick={() => handleSelectFicha(ficha)}
                      className={`w-full px-5 py-4 text-left transition-all hover:bg-slate-50 ${
                        selectedFicha?.id_ficha === ficha.id_ficha && !showForm
                          ? 'bg-violet-50 border-l-4 border-violet-500'
                          : ''
                      } animate-fade-in-up`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            ficha.estado === 'ABIERTA'
                              ? 'bg-gradient-to-br from-emerald-100 to-teal-100'
                              : 'bg-slate-100'
                          }`}>
                            <span className={`text-sm font-bold ${
                              ficha.estado === 'ABIERTA' ? 'text-emerald-600' : 'text-slate-500'
                            }`}>{ficha.pieza_dental}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Pieza {ficha.pieza_dental}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(ficha.fecha_creacion).toLocaleDateString('es-EC')}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          ficha.estado === 'ABIERTA'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {ficha.estado}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm animate-fade-in-right">
              {/* Header del formulario */}
              <div className="px-6 py-4 bg-gradient-to-r from-violet-500 to-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {showForm ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {showForm ? 'Nueva Ficha' : selectedFicha ? `Ficha Pieza ${selectedFicha.pieza_dental}` : 'Seleccione o cree una ficha'}
                      </h2>
                      <p className="text-sm text-violet-100">
                        {showForm ? 'Complete los datos del tratamiento' : selectedFicha ? `Creada: ${new Date(selectedFicha.fecha_creacion).toLocaleDateString('es-EC')}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  {selectedFicha && !showForm && selectedFicha.estado === 'ABIERTA' && (
                    <button
                      onClick={handleCerrarFicha}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-all"
                    >
                      Cerrar Ficha
                    </button>
                  )}
                </div>
              </div>

              {/* Contenido */}
              {(showForm || selectedFicha) ? (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Pieza dental */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pieza Dental <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.pieza_dental}
                      onChange={e => setFormData(prev => ({ ...prev, pieza_dental: e.target.value }))}
                      disabled={!showForm && selectedFicha !== null}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                        formErrors.pieza_dental
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                      } disabled:bg-slate-50 disabled:text-slate-500`}
                    >
                      <option value="">Seleccionar pieza</option>
                      <optgroup label="Adulto - Superior Derecho">
                        {['18', '17', '16', '15', '14', '13', '12', '11'].map(p => (
                          <option key={p} value={p}>Pieza {p}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Adulto - Superior Izquierdo">
                        {['21', '22', '23', '24', '25', '26', '27', '28'].map(p => (
                          <option key={p} value={p}>Pieza {p}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Adulto - Inferior Izquierdo">
                        {['31', '32', '33', '34', '35', '36', '37', '38'].map(p => (
                          <option key={p} value={p}>Pieza {p}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Adulto - Inferior Derecho">
                        {['48', '47', '46', '45', '44', '43', '42', '41'].map(p => (
                          <option key={p} value={p}>Pieza {p}</option>
                        ))}
                      </optgroup>
                    </select>
                    {formErrors.pieza_dental && (
                      <p className="text-red-500 text-xs mt-1.5">{formErrors.pieza_dental}</p>
                    )}
                  </div>

                  {/* Motivo consulta */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Motivo de Consulta <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.motivo_consulta}
                      onChange={e => setFormData(prev => ({ ...prev, motivo_consulta: e.target.value }))}
                      rows={3}
                      placeholder="Describa el motivo de consulta del paciente..."
                      className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all resize-none ${
                        formErrors.motivo_consulta
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                      }`}
                    />
                    {formErrors.motivo_consulta && (
                      <p className="text-red-500 text-xs mt-1.5">{formErrors.motivo_consulta}</p>
                    )}
                  </div>

                  {/* Diagnósticos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Diagnóstico Pulpar <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.diagnostico_pulpar}
                        onChange={e => setFormData(prev => ({ ...prev, diagnostico_pulpar: e.target.value }))}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                          formErrors.diagnostico_pulpar
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                        }`}
                      >
                        <option value="">Seleccionar</option>
                        {DIAGNOSTICOS_PULPARES.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {formErrors.diagnostico_pulpar && (
                        <p className="text-red-500 text-xs mt-1.5">{formErrors.diagnostico_pulpar}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Diagnóstico Periapical <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.diagnostico_periapical}
                        onChange={e => setFormData(prev => ({ ...prev, diagnostico_periapical: e.target.value }))}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                          formErrors.diagnostico_periapical
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            : 'border-slate-200 focus:border-violet-400 focus:ring-violet-100'
                        }`}
                      >
                        <option value="">Seleccionar</option>
                        {DIAGNOSTICOS_PERIAPICALES.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {formErrors.diagnostico_periapical && (
                        <p className="text-red-500 text-xs mt-1.5">{formErrors.diagnostico_periapical}</p>
                      )}
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observaciones}
                      onChange={e => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                      rows={4}
                      placeholder="Observaciones adicionales, plan de tratamiento, notas..."
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all resize-none"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (showForm) {
                          setShowForm(false);
                          if (fichas.length > 0) {
                            handleSelectFicha(fichas[0]);
                          }
                        } else {
                          onClose();
                        }
                      }}
                      className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all"
                    >
                      {showForm ? 'Cancelar' : 'Cerrar'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all"
                    >
                      {showForm ? 'Guardar Ficha' : 'Actualizar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Sin fichas registradas</h3>
                  <p className="text-slate-400 mb-6">Cree una nueva ficha endodóntica para este paciente</p>
                  <button
                    onClick={handleNewFicha}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Crear Primera Ficha
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FichaEndonova;
