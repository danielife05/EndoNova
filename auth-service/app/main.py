from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from . import models, schemas, database, auth_utils

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="Auth Service")

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if db.query(models.Usuario).filter(models.Usuario.email == user.email).first():
        raise HTTPException(status_code=409, detail="Email ya registrado")
    if db.query(models.Usuario).filter(models.Usuario.username == user.username).first():
        raise HTTPException(status_code=409, detail="Username ya registrado")

    hashed_pwd = auth_utils.get_password_hash(user.password)
    db_user = models.Usuario(
        username=user.username,
        password_hash=hashed_pwd,
        nombres=user.nombres,
        apellidos=user.apellidos,
        email=user.email
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email o username ya registrado")

    return {"id_usuario": db_user.id_usuario, "message": "Usuario creado con éxito"}


@app.post("/auth/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = (
        db.query(models.Usuario)
        .filter(models.Usuario.username == user_credentials.username)
        .first()
    )

    if not user or not auth_utils.verify_password(
        user_credentials.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credenciales incorrectas"
        )

    access_token = auth_utils.create_access_token(
        data={"sub": user.username}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
