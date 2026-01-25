import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type {
  PresupuestoDetalleCreate,
  PresupuestoDetalleResponse,
  PresupuestoResponse,
  PagoCreate,
  PagoResponse,
  MetodoPago
} from '../types';

interface PresupuestoPagosProps {
  idFicha: number;
  idPaciente: number;
  onClose?: () => void;
}

const METODOS_PAGO: { value: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  )},
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )},
  { value: 'TARJETA', label: 'Tarjeta', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )},
  { value: 'OTRO', label: 'Otro', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  )}
];

const ACTIVIDADES_SUGERIDAS = [
  'Consulta general', 'Diagnóstico', 'Radiografía periapical', 'Radiografía panorámica',
  'Limpieza dental', 'Obturación simple', 'Obturación compuesta', 'Endodoncia unirradicular',
  'Endodoncia birradicular', 'Endodoncia multirradicular', 'Extracción simple',
  'Extracción quirúrgica', 'Corona provisional', 'Corona definitiva', 'Blanqueamiento dental',
  'Ortodoncia (mensualidad)', 'Otros'
];

// Fondo animado
const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
    <div className="absolute inset-0 pattern-dots opacity-30" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-drift" />
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-float-slow" />
    
    <svg className="absolute top-20 right-[10%] w-10 h-10 text-emerald-200/50 animate-float-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
);

const PresupuestoPagos: React.FC<PresupuestoPagosProps> = ({ idFicha, idPaciente, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [presupuesto, setPresupuesto] = useState<PresupuestoResponse | null>(null);
  const [detalles, setDetalles] = useState<PresupuestoDetalleResponse[]>([]);
  const [pagos, setPagos] = useState<PagoResponse[]>([]);

  const [nuevoDetalle, setNuevoDetalle] = useState<PresupuestoDetalleCreate>({
    actividad: '', costo_unitario: 0, cantidad: 1
  });
  const [nuevoPago, setNuevoPago] = useState<PagoCreate>({
    id_presupuesto: 0, valor: 0, metodo: 'EFECTIVO', referencia: ''
  });

  const [showAddDetalle, setShowAddDetalle] = useState(false);
  const [showAddPago, setShowAddPago] = useState(false);

  const totalEstimado = Array.isArray(detalles) ? detalles.reduce((acc, d) => acc + (d.costo_unitario * d.cantidad), 0) : 0;
  const totalPagado = Array.isArray(pagos) ? pagos.reduce((acc, p) => acc + p.valor, 0) : 0;
  const saldo = totalEstimado - totalPagado;
  const porcentajePagado = totalEstimado > 0 ? (totalPagado / totalEstimado) * 100 : 0;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<PresupuestoResponse>(`/clinical/presupuestos/ficha/${idFicha}`);
      if (response.data) {
        setPresupuesto(response.data);
        setDetalles(Array.isArray(response.data.detalles) ? response.data.detalles : []);
        setNuevoPago(prev => ({ ...prev, id_presupuesto: response.data.id_presupuesto }));
        const pagosResponse = await api.get<PagoResponse[]>(`/clinical/pagos/presupuesto/${response.data.id_presupuesto}`);
        setPagos(Array.isArray(pagosResponse.data) ? pagosResponse.data : []);
      }
    } catch {
      console.log('No hay presupuesto existente');
      setDetalles([]);
      setPagos([]);
    } finally {
      setLoading(false);
    }
  }, [idFicha]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const agregarDetalle = async () => {
    if (!nuevoDetalle.actividad || nuevoDetalle.costo_unitario <= 0) {
      alert('Complete todos los campos del detalle');
      return;
    }
    try {
      const presupuestoId = presupuesto?.id_presupuesto;
      if (!presupuestoId) {
        const response = await api.post<PresupuestoResponse>('/clinical/presupuestos/', {
          id_ficha: idFicha, detalles: [nuevoDetalle]
        });
        setPresupuesto(response.data);
        setDetalles(response.data.detalles || []);
        setNuevoPago(prev => ({ ...prev, id_presupuesto: response.data.id_presupuesto }));
      } else {
        const response = await api.post<PresupuestoDetalleResponse>(
          `/clinical/presupuestos/${presupuestoId}/detalles/`, nuevoDetalle
        );
        setDetalles(prev => [...prev, response.data]);
      }
      setNuevoDetalle({ actividad: '', costo_unitario: 0, cantidad: 1 });
      setShowAddDetalle(false);
    } catch (error) {
      console.error('Error agregando detalle:', error);
      alert('Error al agregar detalle');
    }
  };

  const eliminarDetalle = async (idDetalle: number) => {
    if (!confirm('¿Eliminar este item del presupuesto?')) return;
    try {
      await api.delete(`/clinical/presupuestos/detalles/${idDetalle}`);
      setDetalles(prev => prev.filter(d => d.id_detalle !== idDetalle));
    } catch (error) {
      console.error('Error eliminando detalle:', error);
      alert('Error al eliminar');
    }
  };

  const agregarPago = async () => {
    if (!presupuesto) {
      alert('Primero agregue al menos una actividad al presupuesto');
      return;
    }
    if (nuevoPago.valor <= 0) {
      alert('Ingrese un valor válido');
      return;
    }
    if (nuevoPago.valor > saldo && !confirm(`El pago ($${nuevoPago.valor}) excede el saldo pendiente ($${saldo.toFixed(2)}). ¿Continuar?`)) {
      return;
    }
    try {
      const response = await api.post<PagoResponse>('/clinical/pagos/', {
        ...nuevoPago, id_presupuesto: presupuesto.id_presupuesto
      });
      setPagos(prev => [...prev, response.data]);
      setNuevoPago(prev => ({ ...prev, valor: 0, referencia: '' }));
      setShowAddPago(false);
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error al registrar pago');
    }
  };

  const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/pacientes');
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-subtle">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-slate-500 mt-4 font-medium">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 mb-6 animate-fade-in-down">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Presupuesto y Pagos</h1>
                <p className="text-slate-500">Ficha #{idFicha} • Paciente #{idPaciente}</p>
              </div>
            </div>
            <button onClick={handleClose}
              className="px-5 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cerrar
            </button>
          </div>
        </div>

        {/* Resumen Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-5 animate-fade-in-up delay-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Presupuesto</p>
                <p className="text-2xl font-bold text-slate-800">{formatMoney(totalEstimado)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-5 animate-fade-in-up delay-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Pagado</p>
                <p className="text-2xl font-bold text-emerald-600">{formatMoney(totalPagado)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-5 animate-fade-in-up delay-300">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${saldo > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                <svg className={`w-6 h-6 ${saldo > 0 ? 'text-amber-600' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Saldo Pendiente</p>
                <p className={`text-2xl font-bold ${saldo > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{formatMoney(saldo)}</p>
              </div>
            </div>
            {/* Barra de progreso */}
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${porcentajePagado >= 100 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                  style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-right">{porcentajePagado.toFixed(0)}% pagado</p>
            </div>
          </div>
        </div>

        {saldo <= 0 && totalEstimado > 0 && (
          <div className="mb-6 animate-scale-in">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-emerald-500/30">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">¡Pagado Completamente!</p>
                <p className="text-emerald-100 text-sm">El tratamiento ha sido cubierto en su totalidad</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sección Presupuesto */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in-left">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Detalle del Presupuesto
              </h2>
            </div>
            
            <div className="p-6">
              {/* Lista de detalles */}
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {detalles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-medium">Sin actividades registradas</p>
                    <p className="text-slate-400 text-sm">Agrega la primera actividad</p>
                  </div>
                ) : (
                  detalles.map((d, idx) => (
                    <div 
                      key={d.id_detalle || idx}
                      className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50/50 transition-all animate-fade-in-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                          {d.cantidad}x
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">{d.actividad}</span>
                          <p className="text-slate-400 text-sm">{formatMoney(d.costo_unitario)} c/u</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">{formatMoney(d.costo_unitario * d.cantidad)}</span>
                        <button
                          onClick={() => eliminarDetalle(d.id_detalle)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Agregar detalle */}
              {showAddDetalle ? (
                <div className="border-2 border-blue-200 rounded-2xl p-4 bg-blue-50/50 animate-scale-in">
                  <h4 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva Actividad
                  </h4>
                  <div className="space-y-3">
                    <select
                      value={nuevoDetalle.actividad}
                      onChange={e => setNuevoDetalle(prev => ({ ...prev, actividad: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                    >
                      <option value="">Seleccionar actividad</option>
                      {ACTIVIDADES_SUGERIDAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 text-sm font-medium mb-1 block">Precio ($)</label>
                        <input
                          type="number"
                          value={nuevoDetalle.costo_unitario || ''}
                          onChange={e => setNuevoDetalle(prev => ({ ...prev, costo_unitario: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 text-sm font-medium mb-1 block">Cantidad</label>
                        <input
                          type="number"
                          value={nuevoDetalle.cantidad}
                          onChange={e => setNuevoDetalle(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={agregarDetalle}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/30">
                        Agregar
                      </button>
                      <button onClick={() => setShowAddDetalle(false)}
                        className="px-5 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddDetalle(true)}
                  className="w-full border-2 border-dashed border-slate-300 py-4 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Actividad
                </button>
              )}
            </div>
          </div>

          {/* Sección Pagos */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-fade-in-right">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Registro de Pagos
              </h2>
            </div>
            
            <div className="p-6">
              {/* Lista de pagos */}
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {pagos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-medium">Sin pagos registrados</p>
                    <p className="text-slate-400 text-sm">Registra el primer pago</p>
                  </div>
                ) : (
                  pagos.map((p, idx) => (
                    <div 
                      key={p.id_pago || idx}
                      className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-fade-in-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-emerald-600 text-lg">{formatMoney(p.valor)}</span>
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-xs font-medium">{p.metodo}</span>
                            {p.referencia && <span>• {p.referencia}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {new Date(p.fecha).toLocaleDateString('es-EC')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Agregar pago */}
              {showAddPago ? (
                <div className="border-2 border-emerald-200 rounded-2xl p-4 bg-emerald-50/50 animate-scale-in">
                  <h4 className="text-slate-700 font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nuevo Pago
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-600 text-sm font-medium mb-1 block">Valor ($)</label>
                      <input
                        type="number"
                        value={nuevoPago.valor || ''}
                        onChange={e => setNuevoPago(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-sm font-medium mb-1 block">Método</label>
                      <div className="grid grid-cols-2 gap-2">
                        {METODOS_PAGO.map(m => (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setNuevoPago(prev => ({ ...prev, metodo: m.value }))}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                              nuevoPago.metodo === m.value 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {m.icon}
                            <span className="text-sm font-medium">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-600 text-sm font-medium mb-1 block">Referencia (opcional)</label>
                      <input
                        type="text"
                        value={nuevoPago.referencia || ''}
                        onChange={e => setNuevoPago(prev => ({ ...prev, referencia: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                        placeholder="N° transferencia, voucher..."
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={agregarPago}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/30">
                        Registrar Pago
                      </button>
                      <button onClick={() => setShowAddPago(false)}
                        className="px-5 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-all">
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!presupuesto && detalles.length === 0) {
                      alert('Primero agregue al menos una actividad al presupuesto');
                      return;
                    }
                    setShowAddPago(true);
                  }}
                  disabled={totalEstimado === 0}
                  className="w-full border-2 border-dashed border-emerald-300 py-4 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-emerald-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Registrar Pago
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresupuestoPagos;
