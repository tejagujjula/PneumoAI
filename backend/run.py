import sys
from pathlib import Path
import uvicorn

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

if __name__ == "__main__":
    print("==================================================")
    print("  Starting PneumoAI Backend (FastAPI + Uvicorn)   ")
    print("  Documentation: http://127.0.0.1:8000/docs       ")
    print("  Health Check:  http://127.0.0.1:8000/health     ")
    print("==================================================")
    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="info",
    )
