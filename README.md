# EndoNova - Sistema de Gestión Odontológica (Endodoncia)

EndoNova es un sistema para gestión de pacientes, fichas endodónticas, odontograma y pagos. Está construido con arquitectura de microservicios (FastAPI) y un frontend web (React).

## Arquitectura

* Frontend (React + Vite) consume un API Gateway.
* El Gateway enruta a microservicios (auth, patient, clinical, odontogram).
* PostgreSQL centraliza persistencia.

Servicios:

* auth-service: registro, login, JWT
* patient-service: pacientes
* clinical-service: fichas endodónticas, presupuestos, pagos
* odontogram-service: odontograma y estados dentales
* gateway: punto único de entrada para el frontend
* db: PostgreSQL 15

Puertos (host -> contenedor):

* Frontend: 5173
* Gateway: 8000
* Auth: 8004
* Patient: 8001
* Clinical: 8002
* Odontogram: 8003
* PostgreSQL: 5444 -> 5432

## Requisitos

* Docker Desktop (con Docker Compose)
* Node.js 18+ (recomendado) para desarrollo del frontend
* Git

## Quick start (Docker)

En la raíz del repo:

```bash
docker compose up -d --build
docker compose ps
```

Verifica salud de la base:

```bash
docker compose ps
```

El servicio `db` debe aparecer como `(healthy)`.

## Frontend (modo desarrollo)

```bash
cd frontend
npm install
npm run dev
```

Abrir:

* Frontend: [http://localhost:5173](http://localhost:5173/)

## Documentación API (Swagger)

* Auth: [http://localhost:8004/docs](http://localhost:8004/docs)
* Gateway: [http://localhost:8000/docs](http://localhost:8000/docs)
* Patient: [http://localhost:8001/docs](http://localhost:8001/docs)
* Clinical: [http://localhost:8002/docs](http://localhost:8002/docs)
* Odontogram: [http://localhost:8003/docs](http://localhost:8003/docs)

## Acceso a la base de datos

### DBeaver (recomendado)

Crear conexión PostgreSQL con:

* Host: localhost
* Port: 5444
* Database: dental_db
* Username: user_admin
* Password: admin_password

Tablas esperadas (pueden estar vacías al inicio):

* usuarios: se llena al registrar usuarios
* pacientes: se llena al crear pacientes
* fichas_endodonticas: se llena al crear fichas
* odontogramas / odontograma_dientes: se llenan al guardar odontograma
* tablas de pagos/presupuestos: se llenan al registrar pagos y actividades

### psql dentro del contenedor

```bash
docker compose exec db psql -U user_admin -d dental_db
```

Ejemplos:

```sql
SELECT * FROM usuarios ORDER BY id_usuario DESC;
SELECT * FROM pacientes ORDER BY id_paciente DESC;
SELECT * FROM fichas_endodonticas ORDER BY id_ficha DESC;
```

### Puerto ocupado

Edita el puerto en `docker-compose.yml` o cierra el proceso que lo usa.

### Reset completo de la base (borra datos)

```bash
docker compose down -v
docker compose up -d --build
```

## Estructura del repositorio

```
EndoNova/
  auth-service/
  patient-service/
  clinical-service/
  odontogram-service/
  gateway/
  frontend/
  docker-compose.yml
  README.md
```
