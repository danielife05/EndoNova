from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, database

# Crea las tablas en la BD al iniciar (Para el MVP)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Servicio de Pacientes")

@app.post("/patients/", response_model=schemas.PatientResponse)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(database.get_db)):
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.get("/patients/", response_model=List[schemas.PatientResponse])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Patient).offset(skip).limit(limit).all()

@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse)
def read_patient(patient_id: int, db: Session = Depends(database.get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id_paciente == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return db_patient

@app.put("/patients/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: int, patient: schemas.PatientCreate, db: Session = Depends(database.get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id_paciente == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    # Actualizar todos los campos
    patient_data = patient.model_dump(exclude_unset=True)
    for key, value in patient_data.items():
        setattr(db_patient, key, value)
    
    db.commit()
    db.refresh(db_patient)
    return db_patient

@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(database.get_db)):
    db_patient = db.query(models.Patient).filter(models.Patient.id_paciente == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    db.delete(db_patient)
    db.commit()
    return {"message": "Paciente eliminado correctamente"}