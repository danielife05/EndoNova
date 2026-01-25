from sqlalchemy.exc import IntegrityError
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, database

# Crea las tablas en la BD al iniciar
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Servicio de Pacientes")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"service": "patient-service", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/patients/", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: schemas.PatientCreate, db: Session = Depends(database.get_db)):
    """Crear un nuevo paciente - con validación de cédula duplicada"""
    db_patient = models.Patient(**patient.model_dump())
    db.add(db_patient)
    try:
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Ya existe un paciente con esa cédula"
        )


@app.get("/patients/", response_model=List[schemas.PatientResponse])
def read_patients(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    """Listar todos los pacientes"""
    return db.query(models.Patient).offset(skip).limit(limit).all()


@app.get("/patients/{patient_id}", response_model=schemas.PatientResponse)
def read_patient(patient_id: int, db: Session = Depends(database.get_db)):
    """Obtener un paciente por ID"""
    db_patient = db.query(models.Patient).filter(models.Patient.id_paciente == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return db_patient


@app.put("/patients/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(patient_id: int, patient: schemas.PatientCreate, db: Session = Depends(database.get_db)):
    """Actualizar un paciente - con validación de cédula duplicada"""
    db_patient = db.query(models.Patient).filter(models.Patient.id_paciente == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    # Actualizar todos los campos
    patient_data = patient.model_dump(exclude_unset=True)
    for key, value in patient_data.items():
        setattr(db_patient, key, value)
    
    try:
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Ya existe un paciente con esa cédula"
        )


@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(database.get_db)):
    """Eliminar un paciente"""
    db_patient = db.query(models.Patient).filter(models.Patient.id_paciente == patient_id).first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    db.delete(db_patient)
    db.commit()
    return {"message": "Paciente eliminado correctamente"}