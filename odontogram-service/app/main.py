from typing import List

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from . import models, schemas, database

# Reutiliza el código de database.py que creamos antes
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Servicio de Odontograma")


@app.get("/")
def root():
    return {"service": "odontogram-service", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/odontogramas/", response_model=schemas.OdontogramaResponse)
def crear_odontograma(obj: schemas.OdontogramaCreate, db: Session = Depends(database.get_db)):
    # 1. Crear la cabecera del odontograma
    nuevo_odontograma = models.Odontograma(id_paciente=obj.id_paciente)
    db.add(nuevo_odontograma)
    db.commit()
    db.refresh(nuevo_odontograma)
    
    # 2. Crear el estado de cada diente enviado
    for d in obj.dientes:
        nuevo_diente = models.OdontogramaDiente(
            id_odontograma=nuevo_odontograma.id_odontograma,
            **d.model_dump()
        )
        db.add(nuevo_diente)
    
    db.commit()
    db.refresh(nuevo_odontograma)
    return nuevo_odontograma

@app.get("/odontogramas/paciente/{id_paciente}", response_model=List[schemas.OdontogramaResponse])
def obtener_historial_odontogramas(id_paciente: int, db: Session = Depends(database.get_db)):
    return db.query(models.Odontograma).filter(models.Odontograma.id_paciente == id_paciente).all()