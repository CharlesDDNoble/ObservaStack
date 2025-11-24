"""
ObservaStack API Server - Main Entry Point

This is the entry point for the FastAPI application.
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)