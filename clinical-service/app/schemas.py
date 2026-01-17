from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ============ ENUMS ============
class NaturalezaDolor(str, Enum):
    SIN_DOLOR = "SIN_DOLOR"
    LEVE = "LEVE"
    MODERADO = "MODERADO"
    INTENSO = "INTENSO"

class CalidadDolor(str, Enum):
    SORDO = "SORDO"
    AGUDO = "AGUDO"
    PULSATIL = "PULSATIL"
    CONTINUO = "CONTINUO"

class LocalizacionDolor(str, Enum):
    LOCALIZADO = "LOCALIZADO"
    DIFUSO = "DIFUSO"
    REFERIDO = "REFERIDO"
    IRRADIADO = "IRRADIADO"

class DuracionDolor(str, Enum):
    SEGUNDOS = "SEGUNDOS"
    MINUTOS = "MINUTOS"
    HORAS = "HORAS"
    PERSISTENTE = "PERSISTENTE"

class EstadoCamara(str, Enum):
    NORMAL = "NORMAL"
    ESTRECHA = "ESTRECHA"
    AMPLIA = "AMPLIA"
    CALCIFICADA = "CALCIFICADA"
    NODULOS = "NODULOS"

class Movilidad(str, Enum):
    CERO = "0"
    UNO = "1"
    DOS = "2"
    TRES = "3"

class EstadoFicha(str, Enum):
    ABIERTA = "ABIERTA"
    CERRADA = "CERRADA"

class EstadoPresupuesto(str, Enum):
    PENDIENTE = "PENDIENTE"
    APROBADO = "APROBADO"
    CERRADO = "CERRADO"

class MetodoPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"
    TARJETA = "TARJETA"
    OTRO = "OTRO"

# ============ FICHA ENDODONTICA ============
class FichaCreate(BaseModel):
    id_paciente: int
    id_odontologo: Optional[int] = None
    pieza_dental: str
    motivo_consulta: Optional[str] = None
    antecedentes_enfermedad_actual: Optional[str] = None
    observaciones_generales: Optional[str] = None
    causas: Optional[str] = None
    # Dolor
    dolor_naturaleza: Optional[str] = None
    dolor_calidad: Optional[str] = None
    dolor_localizacion: Optional[str] = None
    dolor_duracion: Optional[str] = None
    dolor_iniciado_por: Optional[str] = None
    # Zona Periapical
    tumefaccion: Optional[bool] = False
    fistula: Optional[bool] = False
    flemon: Optional[bool] = False
    # Examen Periodontal
    profundidad_bolsa: Optional[float] = 0.0
    movilidad: Optional[str] = "0"
    supuracion: Optional[bool] = False
    # Evaluación Radiográfica
    camara_estado: Optional[str] = "NORMAL"
    reabsorcion_interna: Optional[bool] = False
    reabsorcion_externa: Optional[bool] = False

class FichaUpdate(FichaCreate):
    """Schema para actualización de ficha, incluye estado"""
    estado: Optional[str] = None

class FichaResponse(FichaCreate):
    id_ficha: int
    estado: Optional[str] = "ABIERTA"
    fecha_atencion: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

# ============ PRESUPUESTO ============
class PresupuestoDetalleCreate(BaseModel):
    actividad: str
    costo_unitario: float
    cantidad: int = 1

class PresupuestoDetalleResponse(PresupuestoDetalleCreate):
    id_detalle: int
    subtotal: float
    class Config:
        from_attributes = True

class PresupuestoCreate(BaseModel):
    id_ficha: int
    detalles: List[PresupuestoDetalleCreate] = []

class PresupuestoResponse(BaseModel):
    id_presupuesto: int
    id_ficha: int
    total_estimado: float
    estado: str = "PENDIENTE"
    detalles: List[PresupuestoDetalleResponse] = []
    created_at: datetime
    class Config:
        from_attributes = True

# ============ PAGO ============
class PagoCreate(BaseModel):
    id_presupuesto: int
    valor: float
    metodo: str = "EFECTIVO"
    referencia: Optional[str] = None

class PagoResponse(PagoCreate):
    id_pago: int
    fecha: datetime
    registrado_por: Optional[int] = None
    class Config:
        from_attributes = True