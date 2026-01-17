from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Odontograma(Base):
    __tablename__ = "odontogramas"
    id_odontograma = Column(Integer, primary_key=True, index=True)
    id_paciente = Column(Integer, index=True) # Relación lógica
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    dientes = relationship("OdontogramaDiente", back_populates="odontograma")

class OdontogramaDiente(Base):
    __tablename__ = "odontograma_dientes"
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_odontograma = Column(Integer, ForeignKey("odontogramas.id_odontograma"))
    pieza_dental = Column(Integer) # Ej: 18, 41, 55 [cite: 13, 14, 15]
    estado = Column(String(50)) # SANO, CARIES, OBTURACION, etc.
    observacion = Column(String(255), nullable=True)
    
    odontograma = relationship("Odontograma", back_populates="dientes")