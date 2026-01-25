from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# URLs de tus microservicios (nombres de contenedores en Docker)
SERVICES = {
    "auth": "http://auth-service:8000",
    "patients": "http://patient-service:8000",
    "clinical": "http://clinical-service:8000",
    "odontogram": "http://odontogram-service:8000"
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
            
            # ========================================================
            # CORRECCIÓN: Propagar el código de estado HTTP del backend
            # ========================================================
            try:
                response_data = response.json()
            except Exception:
                response_data = {"message": response.text}
            
            # Devolver respuesta con el MISMO código de estado que el microservicio
            return JSONResponse(
                content=response_data,
                status_code=response.status_code
            )
                
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