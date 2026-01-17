from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- ESQUEMAS PARA ROLES ---

class RoleBase(BaseModel):
    nombre: str # ADMIN_SISTEMA, ODONTOLOGO_ENDODONCISTA, etc.

class RoleResponse(RoleBase):
    id_rol: int
    class Config:
        from_attributes = True

# --- ESQUEMAS PARA USUARIOS ---

class UserBase(BaseModel):
    username: str
    email: EmailStr
    nombres: str
    apellidos: str

class UserCreate(UserBase):
    password: str # Contraseña en texto plano que luego se encriptará

class UserResponse(UserBase):
    id_usuario: int
    estado: str # ACTIVO/INACTIVO
    roles: List[RoleResponse] = [] # Lista de roles asignados
    
    class Config:
        from_attributes = True

# --- ESQUEMAS PARA AUTENTICACIÓN (LOGIN) ---

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None