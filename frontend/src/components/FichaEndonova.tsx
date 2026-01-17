import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useToast, ConfirmModal } from './Toast';
import type {
  FichaEndodonticaCreate,
  FichaEndodonticaResponse,
  IntensidadDolor,
  CalidadDolor,
  LocalizacionDolor,
  InicioDolor,
  Movilidad,
  NumConductos
} from '../types';

interface FichaEndodonovaProps {
  idPaciente: number;
  idFicha?: number;
  onClose?: () => void;
  onSave?: (ficha: FichaEndodonticaResponse) => void;
}

// Opciones actualizadas según requerimientos
const INTENSIDAD_OPTIONS: { value: IntensidadDolor; label: string }[] = [
  { value: 'ASINTOMATICO', label: 'Asintomático' },
  { value: 'LEVE', label: 'Leve' },
  { value: 'MODERADO', label: 'Moderado' },
  { value: 'SEVERO', label: 'Severo' }
];

const CALIDAD_OPTIONS: { value: CalidadDolor; label: string }[] = [
  { value: 'AGUDO', label: 'Agudo' },
  { value: 'PULSATIL', label: 'Pulsátil' },
  { value: 'CONTINUO', label: 'Continuo' }
];

const LOCALIZACION_OPTIONS: { value: LocalizacionDolor; label: string }[] = [
  { value: 'LOCALIZADO', label: 'Localizado' },
  { value: 'DIFUSO', label: 'Difuso' },
  { value: 'REFERIDO', label: 'Referido' },
  { value: 'IRRADIADO', label: 'Irradiado' }
];

const INICIO_OPTIONS: { value: InicioDolor; label: string }[] = [
  { value: 'DIAS', label: 'Días' },
  { value: 'SEMANAS', label: 'Semanas' },
  { value: 'MESES', label: 'Meses' }
];

const CONDUCTOS_OPTIONS: { value: NumConductos; label: string }[] = [
  { value: '1', label: '1 conducto' },
  { value: '2', label: '2 conductos' },
  { value: '3', label: '3 conductos' },
  { value: '4', label: '4 conductos' },
  { value: '5', label: '5 conductos' }
];

const MOVILIDAD_OPTIONS: { value: Movilidad; label: string }[] = [
  { value: '0', label: 'Grado 0' },
  { value: '1', label: 'Grado 1' },
  { value: '2', label: 'Grado 2' },
  { value: '3', label: 'Grado 3' }
];

const CAUSAS_OPTIONS = ['Caries', 'Traumatismo', 'Fractura', 'Retratamiento'];
const ESTIMULOS_OPTIONS = ['Frío', 'Calor', 'Diurno', 'Nocturno', 'Masticación', 'Espontáneo', 'Posición'];
const CAUSAS_FRACASO_OPTIONS = ['Perforación', 'Instrumento fracturado', 'Subobturación', 'Sobreobturación', 'Conducto no tratado', 'Filtración coronal', 'Otro'];

const FichaEndonova: React.FC<FichaEndodonovaProps> = ({ idPaciente, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fichas, setFichas] = useState<FichaEndodonticaResponse[]>([]);
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFicha, setSelectedFicha] = useState<FichaEndodonticaResponse | null>(null);

  const emptyForm: FichaEndodonticaCreate = {
    id_paciente: idPaciente,
    dr_referidor: '',
    pieza_dental: '',
    motivo_consulta: '',
    antecedentes_enfermedad_actual: '',
    observaciones_generales: '',
    causas: '',
    causas_fracaso: '',
    dolor_intensidad: undefined,
    dolor_calidad: undefined,
    dolor_localizacion: undefined,
    dolor_inicio: undefined,
    dolor_estimulos: '',
    tumefaccion: false,
    fistula: false,
    edema: false,
    periodontitis_apical: false,
    profundidad_bolsa: 0,
    movilidad: '0',
    supuracion: false,
    num_conductos: undefined,
    reabsorcion: false
  };

  const [formData, setFormData] = useState<FichaEndodonticaCreate>(emptyForm);
  const [selectedCausas, setSelectedCausas] = useState<string[]>([]);
  const [selectedEstimulos, setSelectedEstimulos] = useState<string[]>([]);
  const [selectedCausasFracaso, setSelectedCausasFracaso] = useState<string[]>([]);

  const fetchFichas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<FichaEndodonticaResponse[]>(`/clinical/fichas/${idPaciente}`);
      setFichas(Array.isArray(response.data) ? response.data : []);
    } catch {
      console.error('Error cargando fichas');
      setFichas([]);
    } finally {
      setLoading(false);
    }
  }, [idPaciente]);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, causas: selectedCausas.join(', ') }));
  }, [selectedCausas]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, dolor_estimulos: selectedEstimulos.join(', ') }));
  }, [selectedEstimulos]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, causas_fracaso: selectedCausasFracaso.join(', ') }));
  }, [selectedCausasFracaso]);

  const handleCreate = () => {
    setFormData(emptyForm);
    setSelectedCausas([]);
    setSelectedEstimulos([]);
    setSelectedCausasFracaso([]);
    setEditingId(null);
    setView('form');
  };

  const handleEdit = (ficha: FichaEndodonticaResponse) => {
    const fichaData = ficha as unknown as Record<string, unknown>;
    setFormData({
      id_paciente: ficha.id_paciente,
      dr_referidor: (fichaData.dr_referidor as string) || '',
      pieza_dental: ficha.pieza_dental,
      motivo_consulta: ficha.motivo_consulta || '',
      antecedentes_enfermedad_actual: ficha.antecedentes_enfermedad_actual || '',
      observaciones_generales: ficha.observaciones_generales || '',
      causas: ficha.causas || '',
      causas_fracaso: (fichaData.causas_fracaso as string) || '',
      dolor_intensidad: (fichaData.dolor_intensidad as IntensidadDolor) || undefined,
      dolor_calidad: ficha.dolor_calidad as CalidadDolor,
      dolor_localizacion: ficha.dolor_localizacion as LocalizacionDolor,
      dolor_inicio: (fichaData.dolor_inicio as InicioDolor) || undefined,
      dolor_estimulos: (fichaData.dolor_estimulos as string) || '',
      tumefaccion: ficha.tumefaccion,
      fistula: ficha.fistula,
      edema: (fichaData.edema as boolean) || false,
      periodontitis_apical: (fichaData.periodontitis_apical as boolean) || false,
      profundidad_bolsa: ficha.profundidad_bolsa,
      movilidad: ficha.movilidad as Movilidad,
      supuracion: ficha.supuracion,
      num_conductos: (fichaData.num_conductos as NumConductos) || undefined,
      reabsorcion: (fichaData.reabsorcion as boolean) || false
    });
    setSelectedCausas(ficha.causas ? ficha.causas.split(', ').filter(Boolean) : []);
    setSelectedEstimulos((fichaData.dolor_estimulos as string) ? (fichaData.dolor_estimulos as string).split(', ').filter(Boolean) : []);
    setSelectedCausasFracaso((fichaData.causas_fracaso as string) ? (fichaData.causas_fracaso as string).split(', ').filter(Boolean) : []);
    setEditingId(ficha.id_ficha);
    setView('form');
  };

  const handleView = (ficha: FichaEndodonticaResponse) => {
    setSelectedFicha(ficha);
    setView('detail');
  };

  const [confirmDelete, setConfirmDelete] = useState<{open: boolean; id: number | null}>({open: false, id: null});
  const { showSuccess, showError, showWarning } = useToast();

  const handleDelete = async (id: number) => {
    setConfirmDelete({open: true, id});
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/clinical/fichas/${confirmDelete.id}`);
      showSuccess('Ficha eliminada correctamente');
      fetchFichas();
    } catch {
      showError('Error al eliminar la ficha');
    } finally {
      setConfirmDelete({open: false, id: null});
    }
  };

  const handleToggleEstado = async (ficha: FichaEndodonticaResponse) => {
    const nuevoEstado = ficha.estado === 'CERRADA' ? 'ABIERTA' : 'CERRADA';
    try {
      await api.put(`/clinical/fichas/${ficha.id_ficha}`, { ...ficha, estado: nuevoEstado });
      showSuccess(`Ficha ${nuevoEstado === 'CERRADA' ? 'cerrada' : 'reabierta'} correctamente`);
      fetchFichas();
      if (selectedFicha?.id_ficha === ficha.id_ficha) {
        setSelectedFicha({ ...selectedFicha, estado: nuevoEstado });
      }
    } catch {
      showError('Error al cambiar el estado de la ficha');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.pieza_dental.trim()) {
      showWarning('Ingrese la pieza dental');
      return false;
    }
    if (formData.pieza_dental.length > 10) {
      showWarning('La pieza dental no puede tener más de 10 caracteres');
      return false;
    }
    if (formData.profundidad_bolsa !== undefined && formData.profundidad_bolsa < 0) {
      showWarning('La profundidad de bolsa no puede ser negativa');
      return false;
    }
    if (!formData.motivo_consulta?.trim()) {
      showWarning('Ingrese el motivo de consulta');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      let response: { data: FichaEndodonticaResponse };
      
      if (editingId) {
        response = await api.put(`/clinical/fichas/${editingId}`, formData);
      } else {
        response = await api.post('/clinical/fichas/', formData);
      }
      
      fetchFichas();
      setView('list');
      showSuccess(editingId ? 'Ficha actualizada correctamente' : 'Ficha creada correctamente');
      
      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Error guardando ficha:', error);
      showError('Error al guardar la ficha');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  // Vista de detalle
  if (view === 'detail' && selectedFicha) {
    const fichaData = selectedFicha as unknown as Record<string, unknown>;
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-white">Ficha Endodóntica</h1>
                <p className="text-slate-300 text-sm">Pieza {selectedFicha.pieza_dental}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggleEstado(selectedFicha)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFicha.estado === 'CERRADA'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}>
                  {selectedFicha.estado === 'CERRADA' ? 'Reabrir' : 'Cerrar Ficha'}
                </button>
                <button onClick={() => handleEdit(selectedFicha)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Editar
                </button>
                <button onClick={() => setView('list')}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm">
                  Volver
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Info general */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Fecha</p>
                  <p className="font-medium text-blue-900">
                    {new Date(selectedFicha.created_at).toLocaleDateString('es-EC')}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Estado</p>
                  <p className="font-medium text-blue-900">{selectedFicha.estado || 'Abierta'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Pieza</p>
                  <p className="font-medium text-blue-900">{selectedFicha.pieza_dental}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Dr. Referidor</p>
                  <p className="font-medium text-blue-900">{(fichaData.dr_referidor as string) || 'N/A'}</p>
                </div>
              </div>

              {/* Motivo */}
              {selectedFicha.motivo_consulta && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Motivo de Consulta</h3>
                  <p className="text-blue-900 bg-slate-50 p-3 rounded-lg">{selectedFicha.motivo_consulta}</p>
                </div>
              )}

              {/* Dolor */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Evaluación del Dolor</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Intensidad</p>
                    <p className="font-medium text-blue-900">{(fichaData.dolor_intensidad as string) || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Calidad</p>
                    <p className="font-medium text-blue-900">{selectedFicha.dolor_calidad || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Localización</p>
                    <p className="font-medium text-blue-900">{selectedFicha.dolor_localizacion || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Inicio</p>
                    <p className="font-medium text-blue-900">{(fichaData.dolor_inicio as string) || 'N/A'}</p>
                  </div>
                </div>
                {(fichaData.dolor_estimulos as string) && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Estímulos</p>
                    <p className="font-medium text-blue-900">{fichaData.dolor_estimulos as string}</p>
                  </div>
                )}
              </div>

              {/* Signos clínicos */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Signos Clínicos</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedFicha.tumefaccion && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Tumefacción</span>}
                  {selectedFicha.fistula && <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Fístula</span>}
                  {(fichaData.edema as boolean) && <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Edema</span>}
                  {(fichaData.periodontitis_apical as boolean) && <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Periodontitis Apical</span>}
                  {selectedFicha.supuracion && <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Supuración</span>}
                  {(fichaData.reabsorcion as boolean) && <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Reabsorción</span>}
                  {!selectedFicha.tumefaccion && !selectedFicha.fistula && !(fichaData.edema as boolean) && !selectedFicha.supuracion && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Sin signos patológicos</span>
                  )}
                </div>
              </div>

              {/* Examen Clínico */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Conductos</p>
                  <p className="font-medium text-blue-900">{(fichaData.num_conductos as string) || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Movilidad</p>
                  <p className="font-medium text-blue-900">Grado {selectedFicha.movilidad || '0'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Prof. Bolsa (mm)</p>
                  <p className="font-medium text-blue-900">{selectedFicha.profundidad_bolsa || '0'}</p>
                </div>
              </div>

              {/* Observaciones */}
              {selectedFicha.observaciones_generales && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-2">Observaciones</h3>
                  <p className="text-blue-900 bg-slate-50 p-3 rounded-lg">{selectedFicha.observaciones_generales}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de formulario
  if (view === 'form') {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white">
                {editingId ? 'Editar Ficha Endodóntica' : 'Nueva Ficha Endodóntica'}
              </h1>
              <button onClick={() => setView('list')}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm">
                Cancelar
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Datos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pieza Dental *</label>
                  <input
                    type="text"
                    value={formData.pieza_dental}
                    onChange={e => setFormData(p => ({ ...p, pieza_dental: e.target.value }))}
                    placeholder="Ej: 1.6, 2.1"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dr. Referidor</label>
                  <input
                    type="text"
                    value={formData.dr_referidor || ''}
                    onChange={e => setFormData(p => ({ ...p, dr_referidor: e.target.value }))}
                    placeholder="Nombre del doctor que refiere"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Consulta</label>
                  <input
                    type="text"
                    value={formData.motivo_consulta || ''}
                    onChange={e => setFormData(p => ({ ...p, motivo_consulta: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900"
                  />
                </div>
              </div>

              {/* Dolor */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Evaluación del Dolor</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Intensidad</label>
                    <select
                      value={formData.dolor_intensidad || ''}
                      onChange={e => setFormData(p => ({ ...p, dolor_intensidad: e.target.value as IntensidadDolor || undefined }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-blue-900"
                    >
                      <option value="">Seleccionar</option>
                      {INTENSIDAD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Calidad</label>
                    <select
                      value={formData.dolor_calidad || ''}
                      onChange={e => setFormData(p => ({ ...p, dolor_calidad: e.target.value as CalidadDolor || undefined }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-blue-900"
                    >
                      <option value="">Seleccionar</option>
                      {CALIDAD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Localización</label>
                    <select
                      value={formData.dolor_localizacion || ''}
                      onChange={e => setFormData(p => ({ ...p, dolor_localizacion: e.target.value as LocalizacionDolor || undefined }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-blue-900"
                    >
                      <option value="">Seleccionar</option>
                      {LOCALIZACION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Inicio</label>
                    <select
                      value={formData.dolor_inicio || ''}
                      onChange={e => setFormData(p => ({ ...p, dolor_inicio: e.target.value as InicioDolor || undefined }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-blue-900"
                    >
                      <option value="">Seleccionar</option>
                      {INICIO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs text-slate-600 mb-2">Estímulos</label>
                  <div className="flex flex-wrap gap-2">
                    {ESTIMULOS_OPTIONS.map(i => (
                      <button key={i} type="button"
                        onClick={() => setSelectedEstimulos(prev => 
                          prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                        )}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          selectedEstimulos.includes(i) 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Causas */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Causas</h3>
                <div className="flex flex-wrap gap-2">
                  {CAUSAS_OPTIONS.map(c => (
                    <button key={c} type="button"
                      onClick={() => setSelectedCausas(prev => 
                        prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                      )}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedCausas.includes(c) 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Causas del fracaso del tratamiento anterior */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Causas del Fracaso del Tratamiento Anterior</h3>
                <div className="flex flex-wrap gap-2">
                  {CAUSAS_FRACASO_OPTIONS.map(c => (
                    <button key={c} type="button"
                      onClick={() => setSelectedCausasFracaso(prev => 
                        prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                      )}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedCausasFracaso.includes(c) 
                          ? 'bg-orange-600 text-white border-orange-600' 
                          : 'bg-white text-slate-600 border-slate-300 hover:border-orange-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Examen clínico */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Examen Clínico</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Conductos</label>
                    <select
                      value={formData.num_conductos || ''}
                      onChange={e => setFormData(p => ({ ...p, num_conductos: e.target.value as NumConductos || undefined }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-blue-900"
                    >
                      <option value="">Seleccionar</option>
                      {CONDUCTOS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Movilidad</label>
                    <select
                      value={formData.movilidad}
                      onChange={e => setFormData(p => ({ ...p, movilidad: e.target.value as Movilidad }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-blue-900"
                    >
                      {MOVILIDAD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Prof. Bolsa (mm)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.profundidad_bolsa}
                      onChange={e => setFormData(p => ({ ...p, profundidad_bolsa: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-blue-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'tumefaccion', label: 'Tumefacción' },
                    { key: 'fistula', label: 'Fístula' },
                    { key: 'edema', label: 'Edema' },
                    { key: 'periodontitis_apical', label: 'Periodontitis Apical' },
                    { key: 'supuracion', label: 'Supuración' },
                    { key: 'reabsorcion', label: 'Reabsorción' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[item.key as keyof FichaEndodonticaCreate] as boolean}
                        onChange={e => setFormData(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones Generales</label>
                <textarea
                  value={formData.observaciones_generales || ''}
                  onChange={e => setFormData(p => ({ ...p, observaciones_generales: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-blue-900"
                />
              </div>

              {/* Submit */}
              <div className="border-t pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setView('list')}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                  {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Vista de lista
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-white">Fichas Endodónticas</h1>
              <p className="text-slate-300 text-sm">Paciente #{idPaciente}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                + Nueva Ficha
              </button>
              {onClose && (
                <button onClick={onClose}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm">
                  Cerrar
                </button>
              )}
            </div>
          </div>
          
          {/* List */}
          <div className="p-6">
            {fichas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">No hay fichas registradas</p>
                <button onClick={handleCreate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Crear primera ficha
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {fichas.map((ficha) => (
                  <div key={ficha.id_ficha}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-medium text-blue-900">Pieza {ficha.pieza_dental}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            ficha.estado === 'CERRADA' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ficha.estado || 'Abierta'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {new Date(ficha.created_at).toLocaleDateString('es-EC')}
                          {ficha.motivo_consulta && ` • ${ficha.motivo_consulta.substring(0, 50)}...`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleView(ficha)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                          Ver
                        </button>
                        <button onClick={() => handleEdit(ficha)}
                          className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 rounded">
                          Editar
                        </button>
                        <button onClick={() => handleToggleEstado(ficha)}
                          className={`px-3 py-1 text-sm rounded ${
                            ficha.estado === 'CERRADA' 
                              ? 'text-yellow-600 hover:bg-yellow-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}>
                          {ficha.estado === 'CERRADA' ? 'Reabrir' : 'Cerrar'}
                        </button>
                        <button onClick={() => handleDelete(ficha.id_ficha)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmDelete.open}
        title="Eliminar Ficha"
        message="¿Está seguro de eliminar esta ficha endodóntica? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({open: false, id: null})}
        type="danger"
      />
    </div>
  );
};

export default FichaEndonova;
