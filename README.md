# 🦷 EndoNova - Sistema de Gestión Odontológica

Sistema integral de gestión para clínicas odontológicas especializado en endodoncia. Desarrollado con arquitectura de microservicios.

## 📋 Características

- **Gestión de Pacientes**: CRUD completo con información personal y antecedentes médicos
- **Fichas Endodónticas**: Registro detallado de tratamientos endodónticos con estados (ABIERTA/CERRADA)
- **Odontograma**: Visualización gráfica del estado dental del paciente
- **Presupuestos y Pagos**: Control financiero de tratamientos
- **Autenticación**: Sistema seguro de login con JWT

## 🏗️ Arquitectura

El sistema utiliza una arquitectura de microservicios:

```
┌─────────────────┐
│    Frontend     │  React + TypeScript + Tailwind CSS
│   (Vite)        │
└────────┬────────┘
         │
┌────────▼────────┐
│     Gateway     │  FastAPI - API Gateway
└────────┬────────┘
         │
    ┌────┼────┬────────────┐
    │    │    │            │
┌───▼──┐ │ ┌──▼───┐ ┌─────▼─────┐ ┌──────────┐
│Auth  │ │ │Patient│ │ Clinical  │ │Odontogram│
│Svc   │ │ │ Svc   │ │   Svc     │ │   Svc    │
└──────┘ │ └───────┘ └───────────┘ └──────────┘
         │
    ┌────▼────┐
    │PostgreSQL│
    └─────────┘
```

## 🛠️ Tecnologías

### Backend
- **FastAPI** - Framework web de alto rendimiento
- **SQLAlchemy** - ORM para Python
- **PostgreSQL** - Base de datos relacional
- **Docker** - Contenedorización

### Frontend
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool

## 🚀 Instalación

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo frontend)
- Git

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/EndoNova.git
cd EndoNova
```

2. **Iniciar servicios con Docker**
```bash
docker-compose up -d --build
```

3. **Instalar dependencias del frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- Gateway API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Estructura del Proyecto

```
EndoNova/
├── auth-service/          # Servicio de autenticación
├── patient-service/       # Servicio de pacientes
├── clinical-service/      # Servicio de fichas y pagos
├── odontogram-service/    # Servicio de odontograma
├── gateway/               # API Gateway
├── frontend/              # Aplicación React
└── docker-compose.yml     # Orquestación de servicios
```

## 🔧 Variables de Entorno

Crear un archivo `.env` en la raíz:

```env
POSTGRES_USER=user_admin
POSTGRES_PASSWORD=admin_password
POSTGRES_DB=dental_db
JWT_SECRET=tu_secreto_jwt
```

## 📝 API Endpoints

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Gateway | 8000 | API Gateway principal |
| Auth | 8004 | Autenticación y JWT |
| Patients | 8001 | Gestión de pacientes |
| Clinical | 8002 | Fichas y pagos |
| Odontogram | 8003 | Odontograma |

## 👥 Autores

- Daniel - Desarrollo Full Stack

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
