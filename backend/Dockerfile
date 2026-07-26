# Python Dockerfile for Zoho Catalyst AppSail Custom OCI Runtime
FROM python:3.10-slim

WORKDIR /app

# Install system build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt-lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code & database
COPY . .

# Catalyst AppSail environment configuration
ENV PORT=8000
ENV CATALYST_ENV=production
EXPOSE 8000

# Start Uvicorn ASGI server
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
