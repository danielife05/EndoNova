import React, { useState, useEffect, useCallback } from 'react';
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

const METODOS_PAGO: { value: MetodoPago; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'OTRO', label: 'Otro' }
];

const ACTIVIDADES_SUGERIDAS = [
  'Consulta general',
  'Diagnóstico',
  'Radiografía periapical',
  'Radiografía panorámica',
  'Limpieza dental',
  'Obturación simple',
  'Obturación compuesta',
  'Endodoncia unirradicular',
  'Endodoncia birradicular',
  'Endodoncia multirradicular',
  'Extracción simple',
  'Extracción quirúrgica',
  'Corona provisional',
  'Corona definitiva',
  'Blanqueamiento dental',
  'Ortodoncia (mensualidad)',
  'Otros'
];

const PresupuestoPagos: React.FC<PresupuestoPagosProps> = ({ idFicha, idPaciente, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [presupuesto, setPresupuesto] = useState<PresupuestoResponse | null>(null);
  const [detalles, setDetalles] = useState<PresupuestoDetalleResponse[]>([]);
  const [pagos, setPagos] = useState<PagoResponse[]>([]);

  // Nuevo detalle
  const [nuevoDetalle, setNuevoDetalle] = useState<PresupuestoDetalleCreate>({
    actividad: '',
    costo_unitario: 0,
    cantidad: 1
  });

  // Nuevo pago
  const [nuevoPago, setNuevoPago] = useState<PagoCreate>({
    id_presupuesto: 0,
    valor: 0,
    metodo: 'EFECTIVO',
    referencia: ''
  });

  const [showAddDetalle, setShowAddDetalle] = useState(false);
  const [showAddPago, setShowAddPago] = useState(false);

  // Cálculos - usar Array.isArray para evitar errores
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
        
        const pagosResponse = await api.get<PagoResponse[]>(
          `/clinical/pagos/presupuesto/${response.data.id_presupuesto}`
        );
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const agregarDetalle = async () => {
    if (!nuevoDetalle.actividad || nuevoDetalle.costo_unitario <= 0) {
      alert('Complete todos los campos del detalle');
      return;
    }

    try {
      const presupuestoId = presupuesto?.id_presupuesto;
      if (!presupuestoId) {
        const response = await api.post<PresupuestoResponse>('/clinical/presupuestos/', {
          id_ficha: idFicha,
          detalles: [nuevoDetalle]
        });
        setPresupuesto(response.data);
        setDetalles(response.data.detalles || []);
        setNuevoPago(prev => ({ ...prev, id_presupuesto: response.data.id_presupuesto }));
      } else {
        const response = await api.post<PresupuestoDetalleResponse>(
          `/clinical/presupuestos/${presupuestoId}/detalles/`,
          nuevoDetalle
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

    if (nuevoPago.valor > saldo) {
      if (!confirm(`El pago ($${nuevoPago.valor}) excede el saldo pendiente ($${saldo.toFixed(2)}). ¿Continuar?`)) {
        return;
      }
    }

    try {
      const response = await api.post<PagoResponse>('/clinical/pagos/', {
        ...nuevoPago,
        id_presupuesto: presupuesto.id_presupuesto
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-blue-600 animate-pulse font-medium">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Presupuesto y Pagos</h1>
              <p className="text-slate-500 text-sm mt-1">
                Ficha #{idFicha} • Paciente #{idPaciente}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Indicador de estado */}
              <div className={`px-4 py-2 rounded-lg font-medium text-sm ${
                saldo <= 0 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {saldo <= 0 ? '✓ Pagado' : `Saldo: ${formatMoney(saldo)}`}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 
                    hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          {totalEstimado > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progreso de pago</span>
                <span>{porcentajePagado.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    porcentajePagado >= 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sección Presupuesto */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Detalle del Presupuesto
            </h2>
            
            {/* Tabla de detalles */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 text-slate-600 font-medium">Actividad</th>
                    <th className="text-right py-3 text-slate-600 font-medium">Unit.</th>
                    <th className="text-center py-3 text-slate-600 font-medium">Cant.</th>
                    <th className="text-right py-3 text-slate-600 font-medium">Subtotal</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No hay items registrados
                      </td>
                    </tr>
                  ) : (
                    detalles.map((d, idx) => (
                      <tr key={d.id_detalle || idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 text-slate-700">{d.actividad}</td>
                        <td className="py-3 text-right text-slate-600">{formatMoney(d.costo_unitario)}</td>
                        <td className="py-3 text-center text-slate-600">{d.cantidad}</td>
                        <td className="py-3 text-right text-slate-800 font-medium">
                          {formatMoney(d.costo_unitario * d.cantidad)}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => eliminarDetalle(d.id_detalle)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300">
                    <td colSpan={3} className="py-4 text-right text-slate-700 font-semibold">
                      Total Presupuesto:
                    </td>
                    <td className="py-4 text-right text-blue-600 font-bold text-lg">
                      {formatMoney(totalEstimado)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Agregar detalle */}
            {showAddDetalle ? (
              <div className="mt-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 className="text-slate-700 font-medium mb-3">Nueva Actividad</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-600 text-sm mb-1 block">Actividad</label>
                    <select
                      value={nuevoDetalle.actividad}
                      onChange={e => setNuevoDetalle(prev => ({ ...prev, actividad: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-700 
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Seleccionar actividad</option>
                      {ACTIVIDADES_SUGERIDAS.map(act => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 text-sm mb-1 block">Costo Unitario</label>
                      <input
                        type="number"
                        value={nuevoDetalle.costo_unitario || ''}
                        onChange={e => setNuevoDetalle(prev => ({ 
                          ...prev, 
                          costo_unitario: parseFloat(e.target.value) || 0 
                        }))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-700 
                          focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-sm mb-1 block">Cantidad</label>
                      <input
                        type="number"
                        value={nuevoDetalle.cantidad}
                        onChange={e => setNuevoDetalle(prev => ({ 
                          ...prev, 
                          cantidad: parseInt(e.target.value) || 1 
                        }))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-700 
                          focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={agregarDetalle}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 
                        transition-colors font-medium"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setShowAddDetalle(false)}
                      className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 
                        hover:bg-slate-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddDetalle(true)}
                className="mt-4 w-full border-2 border-dashed border-slate-300 py-3 rounded-lg
                  hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-500 hover:text-blue-600"
              >
                + Agregar Actividad
              </button>
            )}
          </div>

          {/* Sección Pagos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Registro de Pagos
            </h2>
            
            {/* Lista de pagos */}
            <div className="space-y-2 mb-4">
              {pagos.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No hay pagos registrados
                </div>
              ) : (
                pagos.map((p, idx) => (
                  <div 
                    key={p.id_pago || idx}
                    className="flex justify-between items-center p-3 bg-slate-50 
                      rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-green-600 font-bold">{formatMoney(p.valor)}</span>
                        <div className="text-slate-500 text-xs">
                          {p.metodo}
                          {p.referencia && <span className="ml-2">• Ref: {p.referencia}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400 text-xs">
                      {new Date(p.fecha).toLocaleDateString('es-EC')}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Resumen */}
            <div className="border-t border-slate-200 pt-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Presupuesto:</span>
                <span className="text-slate-700">{formatMoney(totalEstimado)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Pagado:</span>
                <span className="text-green-600 font-medium">{formatMoney(totalPagado)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3 mt-2">
                <span className={saldo > 0 ? 'text-amber-600' : 'text-green-600'}>
                  Saldo Pendiente:
                </span>
                <span className={saldo > 0 ? 'text-amber-600' : 'text-green-600'}>
                  {formatMoney(saldo)}
                </span>
              </div>
              {saldo <= 0 && (
                <div className="text-center py-2 bg-green-50 border border-green-200 rounded-lg text-green-600 font-medium mt-2">
                  ✓ Pagado Completamente
                </div>
              )}
            </div>

            {/* Agregar pago */}
            {showAddPago ? (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h4 className="text-slate-700 font-medium mb-3">Registrar Pago</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-600 text-sm mb-1 block">Valor ($)</label>
                    <input
                      type="number"
                      value={nuevoPago.valor || ''}
                      onChange={e => setNuevoPago(prev => ({ 
                        ...prev, 
                        valor: parseFloat(e.target.value) || 0 
                      }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-700 
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-sm mb-1 block">Método de Pago</label>
                    <select
                      value={nuevoPago.metodo}
                      onChange={e => setNuevoPago(prev => ({ ...prev, metodo: e.target.value as MetodoPago }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-700 
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {METODOS_PAGO.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 text-sm mb-1 block">Referencia (opcional)</label>
                    <input
                      type="text"
                      value={nuevoPago.referencia || ''}
                      onChange={e => setNuevoPago(prev => ({ ...prev, referencia: e.target.value }))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-700 
                        focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      placeholder="N° transferencia, voucher, etc."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={agregarPago}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 
                        transition-colors font-medium"
                    >
                      Registrar Pago
                    </button>
                    <button
                      onClick={() => setShowAddPago(false)}
                      className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 
                        hover:bg-slate-100 transition-colors"
                    >
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
                className="w-full border-2 border-dashed border-green-300 py-3 rounded-lg
                  hover:border-green-500 hover:bg-green-50 transition-all text-green-600
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Registrar Pago
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresupuestoPagos;
