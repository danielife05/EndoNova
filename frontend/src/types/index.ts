// ============================================
// TIPOS PARA SISTEMA DE GESTIÓN ODONTOLÓGICA
// ============================================

// --- AUTENTICACIÓN ---
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// --- PACIENTE ---
export interface Paciente {
  id_paciente: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  genero?: 'MASCULINO' | 'FEMENINO' | 'OTRO';
  telefono: string;
  correo?: string;
  domicilio?: string;
  fecha_nacimiento?: string;
  antecedentes?: string;
  created_at?: string;
  updated_at?: string;
}

// --- ODONTOGRAMA ---
export type EstadoDiente = 'SANO' | 'CARIES' | 'RESTAURACION' | 'ENDODONCIA' | 'AUSENTE' | 'OTRO';

export interface Diente {
  pieza_dental: number;
  estado: EstadoDiente;
  observacion?: string;
}

export interface DienteResponse extends Diente {
  id_detalle: number;
}

export interface OdontogramaCreate {
  id_paciente: number;
  dientes: Diente[];
}

export interface OdontogramaResponse {
  id_odontograma: number;
  id_paciente: number;
  fecha: string;
  dientes: DienteResponse[];
}

// --- FICHA CLÍNICA (ENDODÓNTICA) ---
export type IntensidadDolor = 'ASINTOMATICO' | 'LEVE' | 'MODERADO' | 'SEVERO';
export type CalidadDolor = 'AGUDO' | 'PULSATIL' | 'CONTINUO';
export type LocalizacionDolor = 'LOCALIZADO' | 'DIFUSO' | 'REFERIDO' | 'IRRADIADO';
export type InicioDolor = 'DIAS' | 'SEMANAS' | 'MESES';
export type Movilidad = '0' | '1' | '2' | '3';
export type EstadoFicha = 'ABIERTA' | 'CERRADA';
export type NumConductos = '1' | '2' | '3' | '4' | '5';

export interface FichaEndodonticaCreate {
  id_paciente: number;
  id_odontologo?: number;
  dr_referidor?: string;
  pieza_dental: string;
  motivo_consulta?: string;
  antecedentes_enfermedad_actual?: string;
  observaciones_generales?: string;
  causas?: string;
  causas_fracaso?: string;
  // Dolor
  dolor_intensidad?: IntensidadDolor;
  dolor_calidad?: CalidadDolor;
  dolor_localizacion?: LocalizacionDolor;
  dolor_inicio?: InicioDolor;
  dolor_estimulos?: string;
  // Zona Periapical
  tumefaccion?: boolean;
  fistula?: boolean;
  edema?: boolean;
  periodontitis_apical?: boolean;
  // Examen Periodontal
  profundidad_bolsa?: number;
  movilidad?: Movilidad;
  supuracion?: boolean;
  // Evaluación Radiográfica
  num_conductos?: NumConductos;
  reabsorcion?: boolean;
}

export interface FichaEndodonticaResponse extends FichaEndodonticaCreate {
  id_ficha: number;
  estado: EstadoFicha;
  fecha_atencion?: string;
  created_at: string;
  updated_at?: string;
}

// --- PRESUPUESTO ---
export type EstadoPresupuesto = 'PENDIENTE' | 'APROBADO' | 'CERRADO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';

export interface PresupuestoDetalleCreate {
  actividad: string;
  costo_unitario: number;
  cantidad: number;
}

export interface PresupuestoDetalleResponse extends PresupuestoDetalleCreate {
  id_detalle: number;
  subtotal: number;
}

export interface PresupuestoCreate {
  id_ficha: number;
  detalles: PresupuestoDetalleCreate[];
}

export interface PresupuestoResponse {
  id_presupuesto: number;
  id_ficha: number;
  total_estimado: number;
  estado: EstadoPresupuesto;
  detalles: PresupuestoDetalleResponse[];
  created_at: string;
}

export interface PagoCreate {
  id_presupuesto: number;
  valor: number;
  metodo: MetodoPago;
  referencia?: string;
}

export interface PagoResponse extends PagoCreate {
  id_pago: number;
  fecha: string;
  registrado_por?: number;
}