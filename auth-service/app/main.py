from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, database, auth_utils

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Auth Service")

@app.post("/auth/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    hashed_pwd = auth_utils.get_password_hash(user.password)
    db_user = models.Usuario(
        username=user.username,
        password_hash=hashed_pwd,
        nombres=user.nombres,
        apellidos=user.apellidos,
        email=user.email
    )
    db.add(db_user)
    db.commit()
    return {"message": "Usuario creado con éxito"}

@app.post("/auth/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.username == user_credentials.username).first()
    if not user or not auth_utils.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    access_token = auth_utils.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}