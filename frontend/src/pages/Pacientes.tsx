import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast, ConfirmModal } from '../components/Toast';
import type { Paciente } from '../types';

interface PacienteForm {
  identificacion: string;
  nombres: string;
  apellidos: string;
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO' | '';
  fecha_nacimiento: string;
  telefono: string;
  correo: string;
  domicilio: string;
  antecedentes: string;
}

const emptyPacienteForm: PacienteForm = {
  identificacion: '',
  nombres: '',
  apellidos: '',
  genero: '',
  fecha_nacimiento: '',
  telefono: '',
  correo: '',
  domicilio: '',
  antecedentes: ''
};

const Pacientes: React.FC = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<PacienteForm>(emptyPacienteForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PacienteForm, string>>>({});

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get<Paciente[]>('/patients/patients/');
      setPacientes(response.data);
    } catch {
      console.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPacientes(); }, []);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PacienteForm, string>> = {};
    
    if (!formData.identificacion.trim()) {
      errors.identificacion = 'La identificación es requerida';
    } else if (!/^[0-9]{10,13}$/.test(formData.identificacion.trim())) {
      errors.identificacion = 'Ingrese una identificación válida (10-13 dígitos)';
    }
    
    if (!formData.nombres.trim()) {
      errors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.trim().length < 2) {
      errors.nombres = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.trim().length < 2) {
      errors.apellidos = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (formData.telefono && !/^[0-9]{7,15}$/.test(formData.telefono.trim())) {
      errors.telefono = 'Ingrese un teléfono válido (7-15 dígitos)';
    }
    
    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
      errors.correo = 'Ingrese un correo electrónico válido';
    }
    
    if (formData.fecha_nacimiento) {
      const fecha = new Date(formData.fecha_nacimiento);
      const hoy = new Date();
      if (fecha > hoy) {
        errors.fecha_nacimiento = 'La fecha no puede ser futura';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      setFormData({
        identificacion: paciente.identificacion,
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        genero: (paciente.genero as 'MASCULINO' | 'FEMENINO' | 'OTRO') || '',
        fecha_nacimiento: paciente.fecha_nacimiento || '',
        telefono: paciente.telefono || '',
        correo: paciente.correo || '',
        domicilio: paciente.domicilio || '',
        antecedentes: paciente.antecedentes || ''
      });
    } else {
      setEditingPaciente(null);
      setFormData(emptyPacienteForm);
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmitPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const dataToSend = {
        ...formData,
        genero: formData.genero || undefined
      };

      if (editingPaciente) {
        await api.put(`/patients/patients/${editingPaciente.id_paciente}`, dataToSend);
        showSuccess('Paciente actualizado correctamente');
      } else {
        await api.post('/patients/patients/', dataToSend);
        showSuccess('Paciente creado correctamente');
      }
      
      setShowModal(false);
      setFormData(emptyPacienteForm);
      setEditingPaciente(null);
      fetchPacientes();
    } catch {
      showError('Error al guardar paciente');
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{open: boolean; id: number | null}>({open: false, id: null});
  const { showSuccess, showError, showWarning } = useToast();

  const handleDeletePaciente = (id: number) => {
    setConfirmDelete({open: true, id});
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/patients/patients/${confirmDelete.id}`);
      showSuccess('Paciente eliminado correctamente');
      fetchPacientes();
    } catch {
      showError('Error al eliminar paciente');
    } finally {
      setConfirmDelete({open: false, id: null});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const filteredPacientes = pacientes.filter(p => 
    `${p.nombres} ${p.apellidos} ${p.identificacion}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-blue-900">EndoNova</h1>
                <p className="text-xs text-slate-500">Sistema Odontológico</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-2">
              <span>Cerrar sesión</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-blue-900">Pacientes</h2>
            <p className="text-slate-500 text-sm">{pacientes.length} registrados</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Paciente
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-slate-500">Cargando...</div>
          </div>
        )}

        {/* Patients Grid */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredPacientes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 mb-4">No hay pacientes registrados</p>
                <button onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Agregar primer paciente
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Identificación</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Teléfono</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPacientes.map((p) => (
                    <tr key={p.id_paciente} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {p.nombres.charAt(0)}{p.apellidos.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-blue-900">{p.nombres} {p.apellidos}</p>
                            <p className="text-sm text-slate-500 md:hidden">{p.identificacion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-blue-900 hidden md:table-cell">{p.identificacion}</td>
                      <td className="px-6 py-4 text-blue-900 hidden lg:table-cell">{p.telefono || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => navigate(`/pacientes/${p.id_paciente}/ficha`)}
                            className="px-3 py-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            Ficha
                          </button>
                          <button onClick={() => navigate(`/pacientes/${p.id_paciente}/odontograma`)}
                            className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            Odontograma
                          </button>
                          <button onClick={async () => {
                            try {
                              const response = await api.get<{id_ficha: number; pieza_dental: string; created_at: string}[]>(`/clinical/fichas/${p.id_paciente}`);
                              const fichas = Array.isArray(response.data) ? response.data : [];
                              if (fichas.length === 0) {
                                showWarning('Este paciente no tiene fichas. Cree una ficha primero.');
                                return;
                              } else if (fichas.length === 1) {
                                navigate(`/pacientes/${p.id_paciente}/ficha/${fichas[0].id_ficha}/pagos`);
                              } else {
                                navigate(`/pacientes/${p.id_paciente}/pagos`);
                              }
                            } catch {
                              showError('Error cargando fichas');
                            }
                          }}
                            className="px-3 py-1.5 text-sm font-bold text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            Pagos
                          </button>
                          <button onClick={() => handleOpenModal(p)}
                            className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                            Editar
                          </button>
                          <button onClick={() => handleDeletePaciente(p.id_paciente)}
                            className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Modal Crear/Editar Paciente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
            </div>
            <form onSubmit={handleSubmitPaciente} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Identificación *</label>
                  <input
                    type="text"
                    value={formData.identificacion}
                    onChange={e => setFormData(prev => ({ ...prev, identificacion: e.target.value.replace(/\D/g, '') }))}
                    placeholder="Cédula o pasaporte"
                    maxLength={13}
                    className={`w-full px-3 py-2 border rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.identificacion ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {formErrors.identificacion && <p className="text-red-500 text-xs mt-1">{formErrors.identificacion}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Género</label>
                  <select
                    value={formData.genero}
                    onChange={e => setFormData(prev => ({ ...prev, genero: e.target.value as 'MASCULINO' | 'FEMENINO' | 'OTRO' | '' }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={e => setFormData(prev => ({ ...prev, nombres: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.nombres ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {formErrors.nombres && <p className="text-red-500 text-xs mt-1">{formErrors.nombres}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={e => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.apellidos ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {formErrors.apellidos && <p className="text-red-500 text-xs mt-1">{formErrors.apellidos}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={e => setFormData(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.fecha_nacimiento ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {formErrors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1">{formErrors.fecha_nacimiento}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={e => setFormData(prev => ({ ...prev, telefono: e.target.value.replace(/\D/g, '') }))}
                    maxLength={15}
                    className={`w-full px-3 py-2 border rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.telefono ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {formErrors.telefono && <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.correo}
                  onChange={e => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.correo ? 'border-red-500' : 'border-slate-300'}`}
                />
                {formErrors.correo && <p className="text-red-500 text-xs mt-1">{formErrors.correo}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Domicilio</label>
                <input
                  type="text"
                  value={formData.domicilio}
                  onChange={e => setFormData(prev => ({ ...prev, domicilio: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Antecedentes del Paciente</label>
                <textarea
                  value={formData.antecedentes}
                  onChange={e => setFormData(prev => ({ ...prev, antecedentes: e.target.value }))}
                  rows={4}
                  placeholder="Ingrese antecedentes médicos, alergias, medicamentos, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingPaciente(null); }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingPaciente ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmDelete.open}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({open: false, id: null})}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Pacientes;
