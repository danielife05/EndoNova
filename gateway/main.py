from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="API Gateway - Sistema Odontológico")

# Configurar CORS para permitir el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# URLs de tus microservicios (Puertos que ya configuraste)
SERVICES = {
    "auth": "http://auth-service:8000",
    "patients": "http://patient-service:8000",
    "clinical": "http://clinical-service:8000",
    "odontogram": "http://odontogram-service:8000"
}

# Para desarrollo local (cuando no se usa Docker)
SERVICES_LOCAL = {
    "auth": "http://localhost:8001",
    "patients": "http://localhost:8002",
    "clinical": "http://localhost:8003",
    "odontogram": "http://localhost:8004"
}


@app.get("/")
def root():
    return {"service": "api-gateway", "status": "ok", "services": list(SERVICES.keys())}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service: str, path: str, request: Request):
    if service not in SERVICES:
        raise HTTPException(
            status_code=404, 
            detail=f"Servicio '{service}' no encontrado. Servicios disponibles: {list(SERVICES.keys())}"
        )
    
    url = f"{SERVICES[service]}/{path}"
    
    # Preparar headers (excluir host para evitar conflictos)
    headers = {k: v for k, v in request.headers.items() 
               if k.lower() not in ['host', 'content-length']}
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Reenviar la petición al microservicio correspondiente
            response = await client.request(
                method=request.method,
                url=url,
                params=request.query_params,
                content=await request.body(),
                headers=headers
            )
            
            # Intentar devolver JSON, si no, devolver texto
            try:
                return response.json()
            except Exception:
                return {"status": "ok", "data": response.text}
                
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"No se puede conectar al servicio '{service}'. Verifica que esté ejecutándose."
        )
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail=f"Timeout al conectar con el servicio '{service}'."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en gateway: {str(e)}"
        )