from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Servicio Clínico - Fichas Endodónticas, Presupuestos y Pagos")

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
    return {"service": "clinical-service", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


# ============ FICHAS ENDODONTICAS ============

@app.post("/fichas/", response_model=schemas.FichaResponse)
def crear_ficha(ficha: schemas.FichaCreate, db: Session = Depends(database.get_db)):
    nueva_ficha = models.FichaEndodontica(**ficha.model_dump())
    db.add(nueva_ficha)
    db.commit()
    db.refresh(nueva_ficha)
    return nueva_ficha


@app.get("/fichas/{paciente_id}", response_model=List[schemas.FichaResponse])
def listar_fichas_paciente(paciente_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.FichaEndodontica).filter(
        models.FichaEndodontica.id_paciente == paciente_id
    ).all()


@app.get("/fichas/detalle/{id_ficha}", response_model=schemas.FichaResponse)
def obtener_ficha(id_ficha: int, db: Session = Depends(database.get_db)):
    ficha = db.query(models.FichaEndodontica).filter(
        models.FichaEndodontica.id_ficha == id_ficha
    ).first()
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha no encontrada")
    return ficha


@app.put("/fichas/{id_ficha}", response_model=schemas.FichaResponse)
def actualizar_ficha(id_ficha: int, ficha_update: schemas.FichaUpdate, db: Session = Depends(database.get_db)):
    ficha = db.query(models.FichaEndodontica).filter(
        models.FichaEndodontica.id_ficha == id_ficha
    ).first()
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha no encontrada")
    
    # Solo actualizar campos que no sean None
    update_data = ficha_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(ficha, key, value)
    
    db.commit()
    db.refresh(ficha)
    return ficha


@app.delete("/fichas/{id_ficha}")
def eliminar_ficha(id_ficha: int, db: Session = Depends(database.get_db)):
    ficha = db.query(models.FichaEndodontica).filter(
        models.FichaEndodontica.id_ficha == id_ficha
    ).first()
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha no encontrada")
    
    db.delete(ficha)
    db.commit()
    return {"message": "Ficha eliminada"}


# ============ PRESUPUESTOS ============

@app.post("/presupuestos/", response_model=schemas.PresupuestoResponse)
def crear_presupuesto(presupuesto: schemas.PresupuestoCreate, db: Session = Depends(database.get_db)):
    # Verificar que la ficha existe
    ficha = db.query(models.FichaEndodontica).filter(
        models.FichaEndodontica.id_ficha == presupuesto.id_ficha
    ).first()
    if not ficha:
        raise HTTPException(status_code=404, detail="Ficha no encontrada")
    
    # Verificar que no exista presupuesto para esta ficha
    existente = db.query(models.Presupuesto).filter(
        models.Presupuesto.id_ficha == presupuesto.id_ficha
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un presupuesto para esta ficha")
    
    # Crear presupuesto
    nuevo_presupuesto = models.Presupuesto(
        id_ficha=presupuesto.id_ficha,
        total_estimado=0.0
    )
    db.add(nuevo_presupuesto)
    db.commit()
    db.refresh(nuevo_presupuesto)
    
    # Agregar detalles si existen
    total = 0.0
    for det in presupuesto.detalles:
        subtotal = det.costo_unitario * det.cantidad
        total += subtotal
        nuevo_detalle = models.PresupuestoDetalle(
            id_presupuesto=nuevo_presupuesto.id_presupuesto,
            actividad=det.actividad,
            costo_unitario=det.costo_unitario,
            cantidad=det.cantidad,
            subtotal=subtotal
        )
        db.add(nuevo_detalle)
    
    nuevo_presupuesto.total_estimado = total
    db.commit()
    db.refresh(nuevo_presupuesto)
    
    return nuevo_presupuesto


@app.get("/presupuestos/ficha/{id_ficha}", response_model=schemas.PresupuestoResponse)
def obtener_presupuesto_por_ficha(id_ficha: int, db: Session = Depends(database.get_db)):
    presupuesto = db.query(models.Presupuesto).filter(
        models.Presupuesto.id_ficha == id_ficha
    ).first()
    if not presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    return presupuesto


@app.post("/presupuestos/{id_presupuesto}/detalles/", response_model=schemas.PresupuestoDetalleResponse)
def agregar_detalle_presupuesto(
    id_presupuesto: int, 
    detalle: schemas.PresupuestoDetalleCreate, 
    db: Session = Depends(database.get_db)
):
    presupuesto = db.query(models.Presupuesto).filter(
        models.Presupuesto.id_presupuesto == id_presupuesto
    ).first()
    if not presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    subtotal = detalle.costo_unitario * detalle.cantidad
    nuevo_detalle = models.PresupuestoDetalle(
        id_presupuesto=id_presupuesto,
        actividad=detalle.actividad,
        costo_unitario=detalle.costo_unitario,
        cantidad=detalle.cantidad,
        subtotal=subtotal
    )
    db.add(nuevo_detalle)
    
    # Actualizar total
    presupuesto.total_estimado += subtotal
    
    db.commit()
    db.refresh(nuevo_detalle)
    return nuevo_detalle


@app.delete("/presupuestos/detalles/{id_detalle}")
def eliminar_detalle_presupuesto(id_detalle: int, db: Session = Depends(database.get_db)):
    detalle = db.query(models.PresupuestoDetalle).filter(
        models.PresupuestoDetalle.id_detalle == id_detalle
    ).first()
    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")
    
    # Actualizar total del presupuesto
    presupuesto = db.query(models.Presupuesto).filter(
        models.Presupuesto.id_presupuesto == detalle.id_presupuesto
    ).first()
    if presupuesto:
        presupuesto.total_estimado -= detalle.subtotal
    
    db.delete(detalle)
    db.commit()
    return {"message": "Detalle eliminado"}


# ============ PAGOS ============

@app.post("/pagos/", response_model=schemas.PagoResponse)
def registrar_pago(pago: schemas.PagoCreate, db: Session = Depends(database.get_db)):
    presupuesto = db.query(models.Presupuesto).filter(
        models.Presupuesto.id_presupuesto == pago.id_presupuesto
    ).first()
    if not presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    nuevo_pago = models.Pago(
        id_presupuesto=pago.id_presupuesto,
        valor=pago.valor,
        metodo=pago.metodo,
        referencia=pago.referencia
    )
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)
    return nuevo_pago


@app.get("/pagos/presupuesto/{id_presupuesto}", response_model=List[schemas.PagoResponse])
def listar_pagos_presupuesto(id_presupuesto: int, db: Session = Depends(database.get_db)):
    return db.query(models.Pago).filter(
        models.Pago.id_presupuesto == id_presupuesto
    ).all()


@app.get("/pagos/saldo/{id_presupuesto}")
def calcular_saldo(id_presupuesto: int, db: Session = Depends(database.get_db)):
    presupuesto = db.query(models.Presupuesto).filter(
        models.Presupuesto.id_presupuesto == id_presupuesto
    ).first()
    if not presupuesto:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    # Calcular suma de pagos
    pagos = db.query(models.Pago).filter(
        models.Pago.id_presupuesto == id_presupuesto
    ).all()
    total_pagado = sum(p.valor for p in pagos)
    saldo = presupuesto.total_estimado - total_pagado
    
    return {
        "id_presupuesto": id_presupuesto,
        "total_estimado": presupuesto.total_estimado,
        "total_pagado": total_pagado,
        "saldo": saldo
    }