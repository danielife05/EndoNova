from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# Tabla intermedia para la relación N-M entre Usuario y Rol
usuario_rol = Table(
    "usuario_rol",
    Base.metadata,
    Column("id_usuario", ForeignKey("usuarios.id_usuario"), primary_key=True),
    Column("id_rol", ForeignKey("roles.id_rol"), primary_key=True)
)

class Rol(Base):
    __tablename__ = "roles"
    id_rol = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True) # ADMIN_SISTEMA, ODONTOLOGO_ENDODONCISTA, etc.

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    nombres = Column(String)
    apellidos = Column(String)
    email = Column(String, unique=True)
    estado = Column(String, default="ACTIVO")
    roles = relationship("Rol", secondary=usuario_rol)