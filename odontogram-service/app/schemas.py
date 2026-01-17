from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DienteBase(BaseModel):
    pieza_dental: int
    estado: str
    observacion: Optional[str] = None

class DienteCreate(DienteBase):
    pass

class OdontogramaCreate(BaseModel):
    id_paciente: int
    dientes: List[DienteCreate]

class DienteResponse(DienteBase):
    id_detalle: int
    class Config:
        from_attributes = True

class OdontogramaResponse(BaseModel):
    id_odontograma: int
    id_paciente: int
    fecha: datetime
    dientes: List[DienteResponse]
    class Config:
        from_attributes = True