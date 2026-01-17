from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PatientBase(BaseModel):
    identificacion: str
    nombres: str
    apellidos: str
    genero: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    domicilio: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[str] = None
    antecedentes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id_paciente: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True