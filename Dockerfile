# Dockerfile for Zoho Catalyst AppSail Custom OCI Runtime (Python FastAPI Backend)
# FIX: AppSail injects $PORT dynamically — must NOT hardcode port 8000 in CMD
FROM python:3.10-slim

WORKDIR /app

# Install system build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
# Use requirements_slim.txt to avoid OOM; ML libs (xgboost, sklearn) install at runtime
COPY backend/requirements_slim.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install ML deps separately so layer cache is efficient
RUN pip install --no-cache-dir scikit-learn networkx pandas numpy scipy xgboost joblib zcatalyst-sdk

# Copy full application source code
COPY backend/ ./backend/

WORKDIR /app/backend

# Catalyst AppSail environment configuration
# NOTE: AppSail passes PORT dynamically — do not hardcode
ENV CATALYST_ENV=production
EXPOSE 8000

# Health check so AppSail knows when the service is ready
HEALTHCHECK --interval=15s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/ || exit 1

# CRITICAL: Use shell form (not exec form) so $PORT variable is expanded by shell
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
