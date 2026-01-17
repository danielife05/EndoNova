import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import type { EstadoDiente, OdontogramaResponse } from '../types';

interface OdontogramProps {
  idPaciente: number;
  onClose?: () => void;
}

// Estados disponibles
const ESTADOS: EstadoDiente[] = ['SANO', 'CARIES', 'RESTAURACION', 'ENDODONCIA', 'AUSENTE', 'OTRO'];

// Colores profesionales por estado
const ESTADO_CONFIG: Record<EstadoDiente, { color: string; bg: string; label: string }> = {
  'SANO': { color: '#16a34a', bg: '#dcfce7', label: 'Sano' },
  'CARIES': { color: '#dc2626', bg: '#fecaca', label: 'Caries' },
  'RESTAURACION': { color: '#2563eb', bg: '#dbeafe', label: 'Restauración' },
  'ENDODONCIA': { color: '#9333ea', bg: '#f3e8ff', label: 'Endodoncia' },
  'AUSENTE': { color: '#6b7280', bg: '#e5e7eb', label: 'Ausente' },
  'OTRO': { color: '#f59e0b', bg: '#fef3c7', label: 'Otro' }
};

// Dientes permanentes
const DIENTES_SUPERIORES_DER = [18, 17, 16, 15, 14, 13, 12, 11];
const DIENTES_SUPERIORES_IZQ = [21, 22, 23, 24, 25, 26, 27, 28];
const DIENTES_INFERIORES_DER = [48, 47, 46, 45, 44, 43, 42, 41];
const DIENTES_INFERIORES_IZQ = [31, 32, 33, 34, 35, 36, 37, 38];

// Dientes deciduos (temporales)
const DECIDUOS_SUPERIORES_DER = [55, 54, 53, 52, 51];
const DECIDUOS_SUPERIORES_IZQ = [61, 62, 63, 64, 65];
const DECIDUOS_INFERIORES_DER = [85, 84, 83, 82, 81];
const DECIDUOS_INFERIORES_IZQ = [71, 72, 73, 74, 75];

// Componente de diente individual
const ToothButton: React.FC<{
  numero: number;
  estado: EstadoDiente;
  onClick: (numero: number) => void;
  isDeciduo?: boolean;
}> = ({ numero, estado, onClick, isDeciduo }) => {
  // Usar SANO como valor por defecto si el estado es undefined o inválido
  const estadoValido = estado && ESTADO_CONFIG[estado] ? estado : 'SANO';
  const config = ESTADO_CONFIG[estadoValido];
  
  return (
    <button
      onClick={() => onClick(numero)}
      className={`
        flex flex-col items-center justify-center rounded-full transition-all duration-200
        hover:scale-110 hover:shadow-lg border-2
        ${isDeciduo ? 'w-10 h-10' : 'w-12 h-12'}
      `}
      style={{
        borderColor: config.color,
        backgroundColor: config.bg,
      }}
      title={`Pieza ${numero}: ${config.label}`}
    >
      <span className="text-xs font-bold text-blue-900">{numero}</span>
      <span className="text-[9px]" style={{ color: config.color }}>
        {config.label.slice(0, 3)}
      </span>
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
}> = ({ dientes, estados, onToothClick, label, isDeciduo }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-slate-500 mb-2">{label}</span>
    <div className="flex gap-1">
      {dientes.map(num => (
        <ToothButton
          key={num}
          numero={num}
          estado={estados[num] || 'SANO'}
          onClick={onToothClick}
          isDeciduo={isDeciduo}
        />
      ))}
    </div>
  </div>
);

const Odontogram: React.FC<OdontogramProps> = ({ idPaciente, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState<Record<number, EstadoDiente>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; pieza: number } | null>(null);
  const [historial, setHistorial] = useState<OdontogramaResponse[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [odontogramaActual, setOdontogramaActual] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchHistorial = useCallback(async () => {
    try {
      const response = await api.get<OdontogramaResponse[]>(`/odontogram/odontogramas/paciente/${idPaciente}`);
      setHistorial(response.data || []);
      
      // Cargar el último odontograma
      if (response.data && response.data.length > 0) {
        const ultimo = response.data[0];
        cargarOdontograma(ultimo);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  }, [idPaciente]);

  useEffect(() => {
    fetchHistorial();
  }, [fetchHistorial]);

  // Cerrar menú contextual al hacer click fuera
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const cargarOdontograma = (odontograma: OdontogramaResponse) => {
    const nuevosEstados: Record<number, EstadoDiente> = {};
    odontograma.dientes.forEach(d => {
      nuevosEstados[d.pieza_dental] = d.estado;
    });
    setEstados(nuevosEstados);
    setOdontogramaActual(odontograma.id_odontograma);
    setShowHistorial(false);
    setHasChanges(false);
  };

  const handleToothClick = (numero: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, pieza: numero });
    } else {
      // Click simple - ciclar estados
      const currentIndex = ESTADOS.indexOf(estados[numero] || 'SANO');
      const nextIndex = (currentIndex + 1) % ESTADOS.length;
      setEstados(prev => ({ ...prev, [numero]: ESTADOS[nextIndex] }));
      setHasChanges(true);
    }
  };

  const handleEstadoSelect = (estado: EstadoDiente) => {
    if (contextMenu) {
      setEstados(prev => ({ ...prev, [contextMenu.pieza]: estado }));
      setContextMenu(null);
      setHasChanges(true);
    }
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const dientes = Object.entries(estados)
        .filter(([, estado]) => estado !== 'SANO')
        .map(([numero, estado]) => ({
          pieza_dental: parseInt(numero),
          estado,
          observacion: ''
        }));

      await api.post('/odontogram/odontogramas/', {
        id_paciente: idPaciente,
        dientes
      });

      setHasChanges(false);
      fetchHistorial();
      alert('Odontograma guardado exitosamente');
    } catch (error) {
      console.error('Error guardando odontograma:', error);
      alert('Error al guardar el odontograma');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setEstados({});
    setOdontogramaActual(null);
    setHasChanges(false);
    setShowHistorial(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Odontograma</h1>
              <p className="text-slate-500 text-sm mt-1">
                Paciente #{idPaciente}
                {odontogramaActual && <span className="ml-2 text-blue-600">• Registro #{odontogramaActual}</span>}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNuevo}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 
                  hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                Nuevo
              </button>
              <button
                onClick={() => setShowHistorial(!showHistorial)}
                className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 
                  hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                {showHistorial ? 'Ver Actual' : `Historial (${historial.length})`}
              </button>
              <button
                onClick={handleGuardar}
                disabled={loading || !hasChanges}
                className="px-6 py-2 bg-blue-600 rounded-lg text-white font-medium
                  hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-red-300 rounded-lg text-red-600 
                    hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {ESTADOS.map(estado => (
              <div key={estado} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border-2"
                  style={{ 
                    borderColor: ESTADO_CONFIG[estado].color,
                    backgroundColor: ESTADO_CONFIG[estado].bg
                  }}
                />
                <span className="text-sm text-slate-600">{ESTADO_CONFIG[estado].label}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-blue-600 animate-pulse font-medium">Cargando...</div>
          </div>
        ) : showHistorial ? (
          /* Historial */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Historial de Odontogramas</h2>
            {historial.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No hay registros anteriores</p>
            ) : (
              <div className="grid gap-3">
                {historial.map((h, idx) => (
                  <button
                    key={h.id_odontograma}
                    onClick={() => cargarOdontograma(h)}
                    className="flex justify-between items-center p-4 border border-slate-200 
                      rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div>
                      <span className="font-medium text-slate-800">
                        Registro #{idx + 1}
                      </span>
                      <span className="text-slate-500 text-sm ml-3">
                        {new Date(h.fecha).toLocaleDateString('es-EC', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">
                        {h.dientes.filter(d => d.estado !== 'SANO').length} piezas con alteración
                      </span>
                      <span className="text-blue-600">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Odontograma Visual */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
            {/* Dentición Permanente */}
            <div>
              <h3 className="text-center text-slate-700 font-semibold mb-6">
                Dentición Permanente
              </h3>
              
              {/* Arcada Superior */}
              <div className="flex justify-center gap-8 mb-4">
                <DentalRow 
                  dientes={DIENTES_SUPERIORES_DER}
                  estados={estados}
                  onToothClick={handleToothClick}
                  label="Cuadrante 1"
                />
                <div className="w-px bg-slate-300" />
                <DentalRow 
                  dientes={DIENTES_SUPERIORES_IZQ}
                  estados={estados}
                  onToothClick={handleToothClick}
                  label="Cuadrante 2"
                />
              </div>

              {/* Línea divisoria */}
              <div className="flex items-center justify-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <span className="px-4 text-xs text-slate-400">Línea media</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              </div>

              {/* Arcada Inferior */}
              <div className="flex justify-center gap-8">
                <DentalRow 
                  dientes={DIENTES_INFERIORES_DER}
                  estados={estados}
                  onToothClick={handleToothClick}
                  label="Cuadrante 4"
                />
                <div className="w-px bg-slate-300" />
                <DentalRow 
                  dientes={DIENTES_INFERIORES_IZQ}
                  estados={estados}
                  onToothClick={handleToothClick}
                  label="Cuadrante 3"
                />
              </div>
            </div>

            {/* Dentición Decidua */}
            <div className="pt-8 border-t border-slate-200">
              <h3 className="text-center text-slate-700 font-semibold mb-6">
                Dentición Decidua (Temporal)
              </h3>
              
              {/* Arcada Superior Decidua */}
              <div className="flex justify-center gap-8 mb-4">
                <DentalRow 
                  dientes={DECIDUOS_SUPERIORES_DER}
                  estados={estados}
                  onToothClick={handleToothClick}
                  isDeciduo
                  label="Cuadrante 5"
                />
                <div className="w-px bg-slate-300" />
                <DentalRow 
                  dientes={DECIDUOS_SUPERIORES_IZQ}
                  estados={estados}
                  onToothClick={handleToothClick}
                  isDeciduo
                  label="Cuadrante 6"
                />
              </div>

              {/* Línea divisoria */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent my-4" />

              {/* Arcada Inferior Decidua */}
              <div className="flex justify-center gap-8">
                <DentalRow 
                  dientes={DECIDUOS_INFERIORES_DER}
                  estados={estados}
                  onToothClick={handleToothClick}
                  isDeciduo
                  label="Cuadrante 8"
                />
                <div className="w-px bg-slate-300" />
                <DentalRow 
                  dientes={DECIDUOS_INFERIORES_IZQ}
                  estados={estados}
                  onToothClick={handleToothClick}
                  isDeciduo
                  label="Cuadrante 7"
                />
              </div>
            </div>

            {/* Instrucciones */}
            <div className="text-center text-slate-500 text-sm mt-6 pt-4 border-t border-slate-100">
              <p>Haz clic en un diente para cambiar su estado • Los cambios deben guardarse manualmente</p>
            </div>
          </div>
        )}

        {/* Menú contextual */}
        {contextMenu && (
          <div
            className="fixed bg-white rounded-lg border border-slate-200 shadow-xl p-2 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-slate-700 text-sm font-medium mb-2 px-2 pb-2 border-b border-slate-100">
              Pieza {contextMenu.pieza}
            </p>
            {ESTADOS.map(estado => (
              <button
                key={estado}
                onClick={() => handleEstadoSelect(estado)}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm 
                  rounded hover:bg-slate-100 transition-colors"
              >
                <div 
                  className="w-3 h-3 rounded border-2"
                  style={{ 
                    borderColor: ESTADO_CONFIG[estado].color,
                    backgroundColor: ESTADO_CONFIG[estado].bg
                  }}
                />
                <span style={{ color: ESTADO_CONFIG[estado].color }}>
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
