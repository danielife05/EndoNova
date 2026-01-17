# Usamos una imagen ligera de Python
FROM python:3.11-slim

# Directorio de trabajo
WORKDIR /app

# Instalamos dependencias del sistema para psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copiamos y instalamos requerimientos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código de la aplicación
COPY . .

# Comando para iniciar el servicio (el puerto cambiará según el servicio)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]