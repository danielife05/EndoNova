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

const emptyForm: PacienteForm = {
  identificacion: '', nombres: '', apellidos: '', genero: '',
  fecha_nacimiento: '', telefono: '', correo: '', domicilio: '', antecedentes: ''
};

// Fondo animado
const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/30" />
    <div className="absolute inset-0 pattern-dots opacity-30" />
    
    {/* Blur orbs */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-drift" />
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-float-slow" />
    <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-float-medium" />
    
    {/* Elementos dentales sutiles */}
    <svg className="absolute top-20 right-[10%] w-12 h-12 text-blue-200/50 animate-float-slow" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    <svg className="absolute bottom-32 left-[5%] w-8 h-8 text-cyan-200/40 animate-float-medium" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    
    {/* Brackets */}
    <svg className="absolute top-[40%] right-[3%] w-16 h-6 text-blue-200/30 animate-drift" viewBox="0 0 120 40" fill="currentColor">
      <rect x="5" y="15" width="20" height="10" rx="2"/>
      <rect x="35" y="15" width="20" height="10" rx="2"/>
      <rect x="65" y="15" width="20" height="10" rx="2"/>
      <rect x="95" y="15" width="20" height="10" rx="2"/>
      <line x1="0" y1="20" x2="120" y2="20" stroke="currentColor" strokeWidth="2"/>
    </svg>
  </div>
);

// Header con navegación
const Header: React.FC<{ onLogout: () => void; navigate: (path: string) => void }> = ({ onLogout, navigate }) => (
  <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
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
        
        {/* Nav */}
        <nav className="flex items-center gap-2">
          <button onClick={() => navigate('/dashboard')} 
            className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
            Dashboard
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl">
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

// Tarjeta de paciente individual
const PatientCard: React.FC<{
  paciente: Paciente;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onFicha: () => void;
  onOdontograma: () => void;
  onPagos: () => void;
}> = ({ paciente, index, onEdit, onDelete, onFicha, onOdontograma, onPagos }) => {
  const getInitials = () => {
    return `${paciente.nombres.charAt(0)}${paciente.apellidos.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = () => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-cyan-400 to-cyan-600',
      'from-teal-400 to-teal-600',
      'from-emerald-400 to-emerald-600',
      'from-violet-400 to-violet-600',
      'from-pink-400 to-pink-600',
    ];
    return colors[paciente.id_paciente % colors.length];
  };

  const calcularEdad = () => {
    if (!paciente.fecha_nacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(paciente.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const edad = calcularEdad();

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 overflow-hidden group animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Barra superior con gradiente */}
      <div className={`h-1.5 bg-gradient-to-r ${getAvatarColor()}`} />
      
      <div className="p-5">
        {/* Info principal */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarColor()} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
            <span className="text-white font-bold text-lg">{getInitials()}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-lg truncate group-hover:text-blue-600 transition-colors">
              {paciente.nombres} {paciente.apellidos}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                {paciente.identificacion}
              </span>
              {edad !== null && (
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                  {edad} años
                </span>
              )}
            </div>
          </div>
          
          {/* Menú de opciones */}
          <div className="relative">
            <button 
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
              title="Editar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Detalles de contacto */}
        <div className="space-y-2 mb-4">
          {paciente.telefono && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span>{paciente.telefono}</span>
            </div>
          )}
          {paciente.correo && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="truncate">{paciente.correo}</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button 
            onClick={onFicha}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ficha
          </button>
          <button 
            onClick={onOdontograma}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 font-medium text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 100 120" fill="currentColor">
              <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
            </svg>
            Odontograma
          </button>
          <button 
            onClick={onPagos}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pagos
          </button>
          <button 
            onClick={onDelete}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const Pacientes: React.FC = () => {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<PacienteForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PacienteForm, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState<{open: boolean; id: number | null}>({open: false, id: null});
  const { showSuccess, showError } = useToast();

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get<Paciente[]>('/patients/patients/');
      setPacientes(response.data);
    } catch { console.error("Error de conexión"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPacientes(); }, []);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PacienteForm, string>> = {};
    if (!formData.identificacion.trim()) errors.identificacion = 'Requerido';
    else if (!/^[0-9]{10,13}$/.test(formData.identificacion.trim())) errors.identificacion = '10-13 dígitos';
    if (!formData.nombres.trim()) errors.nombres = 'Requerido';
    if (!formData.apellidos.trim()) errors.apellidos = 'Requerido';
    if (formData.telefono && !/^[0-9]{7,15}$/.test(formData.telefono.trim())) errors.telefono = 'Inválido';
    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) errors.correo = 'Inválido';
    if (formData.fecha_nacimiento && new Date(formData.fecha_nacimiento) > new Date()) errors.fecha_nacimiento = 'Fecha futura';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      setFormData({
        identificacion: paciente.identificacion, nombres: paciente.nombres, apellidos: paciente.apellidos,
        genero: (paciente.genero as 'MASCULINO' | 'FEMENINO' | 'OTRO') || '',
        fecha_nacimiento: paciente.fecha_nacimiento || '', telefono: paciente.telefono || '',
        correo: paciente.correo || '', domicilio: paciente.domicilio || '', antecedentes: paciente.antecedentes || ''
      });
    } else { setEditingPaciente(null); setFormData(emptyForm); }
    setFormErrors({}); setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const data = { ...formData, genero: formData.genero || undefined };
      if (editingPaciente) {
        await api.put(`/patients/patients/${editingPaciente.id_paciente}`, data);
        showSuccess('Paciente actualizado exitosamente');
      } else {
        await api.post('/patients/patients/', data);
        showSuccess('Paciente registrado exitosamente');
      }
      setShowModal(false); setFormData(emptyForm); setEditingPaciente(null); fetchPacientes();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
        if (axiosError.response?.status === 409) {
          showError('La identificación ya está registrada');
          setFormErrors(prev => ({ ...prev, identificacion: 'Ya existe' }));
        } else showError(axiosError.response?.data?.detail || 'Error al guardar');
      } else showError('Error de conexión');
    }
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/patients/patients/${confirmDelete.id}`);
      showSuccess('Paciente eliminado'); fetchPacientes();
    } catch { showError('Error al eliminar'); }
    finally { setConfirmDelete({open: false, id: null}); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); window.location.href = '/'; };

  const filtered = pacientes.filter(p => 
    `${p.nombres} ${p.apellidos} ${p.identificacion}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Header onLogout={handleLogout} navigate={navigate} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Gestión de Pacientes
            </h1>
            <p className="text-slate-500 mt-1 ml-15">Administra la información de tus pacientes</p>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Paciente
          </button>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 animate-fade-in-up">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>
          
          {/* Stats */}
          <div className="flex gap-3">
            <div className="px-5 py-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pacientes.length}</p>
                <p className="text-xs text-slate-500">Total pacientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de pacientes */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-bounce-subtle">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-slate-500 mt-4 font-medium">Cargando pacientes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-500 mb-2 font-medium">
              {searchTerm ? 'No se encontraron pacientes' : 'Aún no hay pacientes registrados'}
            </p>
            <p className="text-slate-400 text-sm mb-4">
              {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando tu primer paciente'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Paciente
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((paciente, index) => (
              <PatientCard
                key={paciente.id_paciente}
                paciente={paciente}
                index={index}
                onEdit={() => handleOpenModal(paciente)}
                onDelete={() => setConfirmDelete({open: true, id: paciente.id_paciente})}
                onFicha={() => navigate(`/pacientes/${paciente.id_paciente}/ficha`)}
                onOdontograma={() => navigate(`/pacientes/${paciente.id_paciente}/odontograma`)}
                onPagos={() => navigate(`/pacientes/${paciente.id_paciente}/pagos`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl modal-animation">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingPaciente ? 'Editar Paciente' : 'Nuevo Paciente'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {editingPaciente ? 'Actualiza la información' : 'Completa los datos del paciente'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowModal(false); setEditingPaciente(null); setFormErrors({}); }}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
              {/* Row 1 - ID y Género */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Identificación <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.identificacion}
                    onChange={e => { setFormData(p => ({...p, identificacion: e.target.value.replace(/\D/g, '')})); setFormErrors(p => ({...p, identificacion: undefined})); }}
                    maxLength={13} 
                    placeholder="Cédula o RUC"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                      formErrors.identificacion 
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50' 
                        : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.identificacion && <p className="text-red-500 text-xs mt-1.5">{formErrors.identificacion}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Género</label>
                  <select 
                    value={formData.genero} 
                    onChange={e => setFormData(p => ({...p, genero: e.target.value as typeof formData.genero}))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all bg-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              {/* Row 2 - Nombres */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.nombres}
                    onChange={e => setFormData(p => ({...p, nombres: e.target.value}))}
                    placeholder="Nombres completos"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                      formErrors.nombres ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.nombres && <p className="text-red-500 text-xs mt-1.5">{formErrors.nombres}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.apellidos}
                    onChange={e => setFormData(p => ({...p, apellidos: e.target.value}))}
                    placeholder="Apellidos completos"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                      formErrors.apellidos ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.apellidos && <p className="text-red-500 text-xs mt-1.5">{formErrors.apellidos}</p>}
                </div>
              </div>

              {/* Row 3 - Fecha y Teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Nacimiento</label>
                  <input 
                    type="date" 
                    value={formData.fecha_nacimiento}
                    onChange={e => setFormData(p => ({...p, fecha_nacimiento: e.target.value}))}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                      formErrors.fecha_nacimiento ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.fecha_nacimiento && <p className="text-red-500 text-xs mt-1.5">{formErrors.fecha_nacimiento}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.telefono}
                    onChange={e => setFormData(p => ({...p, telefono: e.target.value.replace(/\D/g, '')}))}
                    maxLength={15}
                    placeholder="0999999999"
                    className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                      formErrors.telefono ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors.telefono && <p className="text-red-500 text-xs mt-1.5">{formErrors.telefono}</p>}
                </div>
              </div>

              {/* Row 4 - Correo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={formData.correo}
                  onChange={e => setFormData(p => ({...p, correo: e.target.value}))}
                  placeholder="correo@ejemplo.com"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-slate-700 focus:outline-none focus:ring-4 transition-all ${
                    formErrors.correo ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'
                  }`}
                />
                {formErrors.correo && <p className="text-red-500 text-xs mt-1.5">{formErrors.correo}</p>}
              </div>

              {/* Row 5 - Domicilio */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Domicilio</label>
                <input 
                  type="text" 
                  value={formData.domicilio}
                  onChange={e => setFormData(p => ({...p, domicilio: e.target.value}))}
                  placeholder="Dirección completa"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Row 6 - Antecedentes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Antecedentes Médicos</label>
                <textarea 
                  value={formData.antecedentes}
                  onChange={e => setFormData(p => ({...p, antecedentes: e.target.value}))}
                  rows={3} 
                  placeholder="Alergias, medicamentos, condiciones médicas..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
            </form>

            {/* Footer del modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button 
                type="button" 
                onClick={() => { setShowModal(false); setEditingPaciente(null); setFormErrors({}); }}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
              >
                {editingPaciente ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmDelete.open} 
        title="Eliminar Paciente"
        message="¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer."
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
