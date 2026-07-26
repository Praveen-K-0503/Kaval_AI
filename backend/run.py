import os
import sys
import logging

# Set up logging to stdout
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    import uvicorn
except ImportError as e:
    logger.error(f"Uvicorn import failed: {e}. Attempting to run uvicorn as module.")
    sys.exit(1)

if __name__ == "__main__":
    # Catalyst passes the port in X_ZOHO_CATALYST_LISTEN_PORT or PORT
    port_str = os.getenv("X_ZOHO_CATALYST_LISTEN_PORT") or os.getenv("PORT") or "9000"
    try:
        port = int(port_str)
    except ValueError:
        logger.warning(f"Invalid port string '{port_str}', defaulting to 9000")
        port = 9000

    logger.info(f"Starting KaavalAI KSP Backend via run.py on port {port}...")
    
    # Run uvicorn programmatically
    try:
        uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info", reload=False)
    except Exception as e:
        logger.critical(f"Server crashed during run: {e}")
        sys.exit(1)
