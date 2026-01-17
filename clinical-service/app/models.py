from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class FichaEndodontica(Base):
    __tablename__ = "fichas_endodonticas"

    id_ficha = Column(Integer, primary_key=True, index=True)
    id_paciente = Column(Integer, index=True)  # Relación lógica con patient-service
    id_odontologo = Column(Integer, nullable=True)  # Relación lógica con auth-service
    pieza_dental = Column(String(10))
    motivo_consulta = Column(Text, nullable=True)
    antecedentes_enfermedad_actual = Column(Text, nullable=True)
    observaciones_generales = Column(Text, nullable=True)
    causas = Column(Text, nullable=True)
    estado = Column(String(20), default="ABIERTA")
    fecha_atencion = Column(DateTime(timezone=True), server_default=func.now())
    
    # Evaluación del Dolor
    dolor_naturaleza = Column(String(50), nullable=True)
    dolor_calidad = Column(String(50), nullable=True)
    dolor_localizacion = Column(String(50), nullable=True)
    dolor_duracion = Column(String(50), nullable=True)
    dolor_iniciado_por = Column(String(200), nullable=True)
    
    # Zona Periapical
    tumefaccion = Column(Boolean, default=False)
    fistula = Column(Boolean, default=False)
    flemon = Column(Boolean, default=False)
    
    # Examen Periodontal
    profundidad_bolsa = Column(Float, default=0.0)
    movilidad = Column(String(10), default="0")
    supuracion = Column(Boolean, default=False)
    
    # Evaluación Radiográfica
    camara_estado = Column(String(50), default="NORMAL")
    reabsorcion_interna = Column(Boolean, default=False)
    reabsorcion_externa = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    presupuesto = relationship("Presupuesto", back_populates="ficha", uselist=False)


class Presupuesto(Base):
    __tablename__ = "presupuestos"
    
    id_presupuesto = Column(Integer, primary_key=True, index=True)
    id_ficha = Column(Integer, ForeignKey("fichas_endodonticas.id_ficha"), unique=True)
    total_estimado = Column(Float, default=0.0)
    estado = Column(String(20), default="PENDIENTE")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    ficha = relationship("FichaEndodontica", back_populates="presupuesto")
    detalles = relationship("PresupuestoDetalle", back_populates="presupuesto", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="presupuesto", cascade="all, delete-orphan")


class PresupuestoDetalle(Base):
    __tablename__ = "presupuesto_detalles"
    
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_presupuesto = Column(Integer, ForeignKey("presupuestos.id_presupuesto"))
    actividad = Column(String(200))
    costo_unitario = Column(Float)
    cantidad = Column(Integer, default=1)
    subtotal = Column(Float)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    presupuesto = relationship("Presupuesto", back_populates="detalles")


class Pago(Base):
    __tablename__ = "pagos"
    
    id_pago = Column(Integer, primary_key=True, index=True)
    id_presupuesto = Column(Integer, ForeignKey("presupuestos.id_presupuesto"))
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    valor = Column(Float)
    metodo = Column(String(50), default="EFECTIVO")
    referencia = Column(String(100), nullable=True)
    registrado_por = Column(Integer, nullable=True)  # FK lógica a USUARIO
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    presupuesto = relationship("Presupuesto", back_populates="pagos")