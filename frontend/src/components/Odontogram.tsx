import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { EstadoDiente, OdontogramaResponse } from '../types';

interface OdontogramProps {
  idPaciente: number;
  onClose?: () => void;
}

const ESTADOS: EstadoDiente[] = ['SANO', 'CARIES', 'RESTAURACION', 'ENDODONCIA', 'AUSENTE', 'OTRO'];

const ESTADO_CONFIG: Record<EstadoDiente, { color: string; bg: string; label: string; gradient: string }> = {
  'SANO': { color: '#10b981', bg: '#d1fae5', label: 'Sano', gradient: 'from-emerald-400 to-emerald-600' },
  'CARIES': { color: '#ef4444', bg: '#fee2e2', label: 'Caries', gradient: 'from-red-400 to-red-600' },
  'RESTAURACION': { color: '#3b82f6', bg: '#dbeafe', label: 'Restauración', gradient: 'from-blue-400 to-blue-600' },
  'ENDODONCIA': { color: '#8b5cf6', bg: '#ede9fe', label: 'Endodoncia', gradient: 'from-violet-400 to-violet-600' },
  'AUSENTE': { color: '#6b7280', bg: '#e5e7eb', label: 'Ausente', gradient: 'from-gray-400 to-gray-600' },
  'OTRO': { color: '#f59e0b', bg: '#fef3c7', label: 'Otro', gradient: 'from-amber-400 to-amber-600' }
};

const DIENTES_SUPERIORES_DER = [18, 17, 16, 15, 14, 13, 12, 11];
const DIENTES_SUPERIORES_IZQ = [21, 22, 23, 24, 25, 26, 27, 28];
const DIENTES_INFERIORES_DER = [48, 47, 46, 45, 44, 43, 42, 41];
const DIENTES_INFERIORES_IZQ = [31, 32, 33, 34, 35, 36, 37, 38];
const DECIDUOS_SUPERIORES_DER = [55, 54, 53, 52, 51];
const DECIDUOS_SUPERIORES_IZQ = [61, 62, 63, 64, 65];
const DECIDUOS_INFERIORES_DER = [85, 84, 83, 82, 81];
const DECIDUOS_INFERIORES_IZQ = [71, 72, 73, 74, 75];

// Fondo animado
const AnimatedBackground: React.FC = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50" />
    <div className="absolute inset-0 pattern-dots opacity-30" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-drift" />
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-float-slow" />
    
    <svg className="absolute top-20 right-[10%] w-10 h-10 text-cyan-200/50 animate-float-slow" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
    <svg className="absolute bottom-32 left-[5%] w-8 h-8 text-blue-200/40 animate-float-medium" viewBox="0 0 100 120" fill="currentColor">
      <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
    </svg>
  </div>
);

// Botón de diente
const ToothButton: React.FC<{
  numero: number;
  estado: EstadoDiente;
  onClick: (numero: number) => void;
  isDeciduo?: boolean;
  index: number;
}> = ({ numero, estado, onClick, isDeciduo, index }) => {
  const estadoValido = estado && ESTADO_CONFIG[estado] ? estado : 'SANO';
  const config = ESTADO_CONFIG[estadoValido];
  
  return (
    <button
      onClick={() => onClick(numero)}
      className={`
        flex flex-col items-center justify-center rounded-2xl transition-all duration-300
        hover:scale-110 hover:shadow-xl border-2 relative group animate-fade-in-up
        ${isDeciduo ? 'w-11 h-11' : 'w-14 h-14'}
      `}
      style={{
        borderColor: config.color,
        backgroundColor: config.bg,
        animationDelay: `${index * 30}ms`
      }}
      title={`Pieza ${numero}: ${config.label}`}
    >
      {/* Efecto de brillo en hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
      
      <span className="text-xs font-bold text-slate-700 relative z-10">{numero}</span>
      <span className="text-[9px] font-medium relative z-10" style={{ color: config.color }}>
        {config.label.slice(0, 3)}
      </span>
      
      {/* Indicador visual del estado */}
      <div 
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: config.color }}
      />
    </button>
  );
};

// Fila de dientes
const DentalRow: React.FC<{
  dientes: number[];
  estados: Record<number, EstadoDiente>;
  onToothClick: (numero: number) => void;
  label: string;
  isDeciduo?: boolean;
  startIndex: number;
}> = ({ dientes, estados, onToothClick, label, isDeciduo, startIndex }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs font-semibold text-slate-500 mb-3 px-3 py-1 bg-white/50 rounded-full">{label}</span>
    <div className="flex gap-1.5">
      {dientes.map((num, idx) => (
        <ToothButton
          key={num}
          numero={num}
          estado={estados[num] || 'SANO'}
          onClick={onToothClick}
          isDeciduo={isDeciduo}
          index={startIndex + idx}
        />
      ))}
    </div>
  </div>
);

const Odontogram: React.FC<OdontogramProps> = ({ idPaciente, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<Record<number, EstadoDiente>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; pieza: number } | null>(null);
  const [historial, setHistorial] = useState<OdontogramaResponse[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [odontogramaActual, setOdontogramaActual] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchHistorial = useCallback(async () => {
    try {
      const response = await api.get<OdontogramaResponse[]>(`/odontogram/odontogramas/paciente/${idPaciente}`);
      setHistorial(response.data || []);
      if (response.data && response.data.length > 0) {
        cargarOdontograma(response.data[0]);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  }, [idPaciente]);

  useEffect(() => { fetchHistorial(); }, [fetchHistorial]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const cargarOdontograma = (odontograma: OdontogramaResponse) => {
    const nuevosEstados: Record<number, EstadoDiente> = {};
    odontograma.dientes.forEach(d => { nuevosEstados[d.pieza_dental] = d.estado; });
    setEstados(nuevosEstados);
    setOdontogramaActual(odontograma.id_odontograma);
    setShowHistorial(false);
    setHasChanges(false);
  };

  const handleToothClick = (numero: number) => {
    const currentIndex = ESTADOS.indexOf(estados[numero] || 'SANO');
    const nextIndex = (currentIndex + 1) % ESTADOS.length;
    setEstados(prev => ({ ...prev, [numero]: ESTADOS[nextIndex] }));
    setHasChanges(true);
  };

  const handleEstadoSelect = (estado: EstadoDiente) => {
    if (contextMenu) {
      setEstados(prev => ({ ...prev, [contextMenu.pieza]: estado }));
      setContextMenu(null);
      setHasChanges(true);
    }
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const dientes = Object.entries(estados)
        .filter(([, estado]) => estado !== 'SANO')
        .map(([numero, estado]) => ({ pieza_dental: parseInt(numero), estado, observacion: '' }));

      await api.post('/odontogram/odontogramas/', { id_paciente: idPaciente, dientes });
      setHasChanges(false);
      fetchHistorial();
      alert('Odontograma guardado exitosamente');
    } catch (error) {
      console.error('Error guardando odontograma:', error);
      alert('Error al guardar el odontograma');
    } finally {
      setSaving(false);
    }
  };

  const handleNuevo = () => {
    setEstados({});
    setOdontogramaActual(null);
    setHasChanges(false);
    setShowHistorial(false);
  };

  const handleClose = () => {
    if (onClose) onClose();
    else navigate('/pacientes');
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 mb-6 animate-fade-in-down">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <svg className="w-8 h-9 text-white" viewBox="0 0 100 120" fill="currentColor">
                  <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Odontograma</h1>
                <p className="text-slate-500">
                  Paciente #{idPaciente}
                  {odontogramaActual && <span className="ml-2 text-cyan-600 font-medium">• Registro #{odontogramaActual}</span>}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button onClick={handleNuevo}
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all">
                Nuevo
              </button>
              <button onClick={() => setShowHistorial(!showHistorial)}
                className="px-4 py-2.5 border-2 border-cyan-200 rounded-xl text-cyan-600 font-medium hover:bg-cyan-50 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historial
              </button>
              <button onClick={handleGuardar} disabled={!hasChanges || saving}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                {saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={handleClose}
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
                Cerrar
              </button>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-4 mb-6 animate-fade-in-up">
          <div className="flex flex-wrap gap-3 justify-center">
            {ESTADOS.map(estado => (
              <div key={estado} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-lg border-2 shadow-sm"
                  style={{ borderColor: ESTADO_CONFIG[estado].color, backgroundColor: ESTADO_CONFIG[estado].bg }}
                />
                <span className="text-sm font-medium text-slate-600">{ESTADO_CONFIG[estado].label}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-subtle">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-slate-500 mt-4 font-medium">Cargando odontograma...</p>
          </div>
        ) : showHistorial ? (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial de Odontogramas
            </h2>
            {historial.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-500">No hay registros anteriores</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {historial.map((h, idx) => (
                  <button
                    key={h.id_odontograma}
                    onClick={() => cargarOdontograma(h)}
                    className="flex justify-between items-center p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-cyan-200 hover:bg-cyan-50/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-cyan-200 group-hover:to-blue-200 transition-colors">
                        <span className="text-cyan-600 font-bold">#{idx + 1}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 group-hover:text-cyan-600 transition-colors">
                          {new Date(h.fecha).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <p className="text-slate-500 text-sm">{h.dientes.filter(d => d.estado !== 'SANO').length} piezas con alteración</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 space-y-8 animate-fade-in-up">
            {/* Dentición Permanente */}
            <div>
              <h3 className="text-center text-slate-700 font-bold mb-6 flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 100 120" fill="currentColor">
                    <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
                  </svg>
                </div>
                Dentición Permanente
              </h3>
              
              <div className="flex justify-center gap-8 mb-4 flex-wrap">
                <DentalRow dientes={DIENTES_SUPERIORES_DER} estados={estados} onToothClick={handleToothClick} label="Cuadrante 1" startIndex={0} />
                <div className="w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent self-stretch hidden md:block" />
                <DentalRow dientes={DIENTES_SUPERIORES_IZQ} estados={estados} onToothClick={handleToothClick} label="Cuadrante 2" startIndex={8} />
              </div>

              <div className="flex items-center justify-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <span className="px-4 py-1 text-xs font-medium text-slate-400 bg-white rounded-full border border-slate-200">Línea media</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              </div>

              <div className="flex justify-center gap-8 flex-wrap">
                <DentalRow dientes={DIENTES_INFERIORES_DER} estados={estados} onToothClick={handleToothClick} label="Cuadrante 4" startIndex={16} />
                <div className="w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent self-stretch hidden md:block" />
                <DentalRow dientes={DIENTES_INFERIORES_IZQ} estados={estados} onToothClick={handleToothClick} label="Cuadrante 3" startIndex={24} />
              </div>
            </div>

            {/* Dentición Decidua */}
            <div className="pt-8 border-t-2 border-dashed border-slate-200">
              <h3 className="text-center text-slate-700 font-bold mb-6 flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-pink-600" viewBox="0 0 100 120" fill="currentColor">
                    <path d="M50 8 C68 8, 82 18, 86 35 C90 52, 82 62, 78 72 L74 105 C72 112, 68 112, 66 105 L62 82 C60 78, 54 78, 52 82 L50 82 C48 78, 42 78, 40 82 L36 105 C34 112, 30 112, 28 105 L24 72 C20 62, 12 52, 16 35 C20 18, 34 8, 50 8Z"/>
                  </svg>
                </div>
                Dentición Decidua (Temporal)
              </h3>
              
              <div className="flex justify-center gap-8 mb-4 flex-wrap">
                <DentalRow dientes={DECIDUOS_SUPERIORES_DER} estados={estados} onToothClick={handleToothClick} isDeciduo label="Cuadrante 5" startIndex={32} />
                <div className="w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent self-stretch hidden md:block" />
                <DentalRow dientes={DECIDUOS_SUPERIORES_IZQ} estados={estados} onToothClick={handleToothClick} isDeciduo label="Cuadrante 6" startIndex={37} />
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent my-4" />

              <div className="flex justify-center gap-8 flex-wrap">
                <DentalRow dientes={DECIDUOS_INFERIORES_DER} estados={estados} onToothClick={handleToothClick} isDeciduo label="Cuadrante 8" startIndex={42} />
                <div className="w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent self-stretch hidden md:block" />
                <DentalRow dientes={DECIDUOS_INFERIORES_IZQ} estados={estados} onToothClick={handleToothClick} isDeciduo label="Cuadrante 7" startIndex={47} />
              </div>
            </div>

            {/* Instrucciones */}
            <div className="text-center text-slate-500 text-sm mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Haz clic en un diente para cambiar su estado • Los cambios deben guardarse manualmente
            </div>
          </div>
        )}

        {/* Menú contextual */}
        {contextMenu && (
          <div
            className="fixed bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 min-w-[180px] animate-scale-in"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-slate-700 text-sm font-semibold mb-2 px-3 pb-2 border-b border-slate-100">
              Pieza {contextMenu.pieza}
            </p>
            {ESTADOS.map(estado => (
              <button
                key={estado}
                onClick={() => handleEstadoSelect(estado)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div 
                  className="w-4 h-4 rounded-lg border-2"
                  style={{ borderColor: ESTADO_CONFIG[estado].color, backgroundColor: ESTADO_CONFIG[estado].bg }}
                />
                <span style={{ color: ESTADO_CONFIG[estado].color }} className="font-medium">
                  {ESTADO_CONFIG[estado].label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Odontogram;
