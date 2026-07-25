import traceback
from fastapi.responses import JSONResponse

try:
    from main import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    error_detail = traceback.format_exc()
    @app.get("/{path:path}")
    @app.post("/{path:path}")
    @app.patch("/{path:path}")
    def catch_all(path: str):
        return JSONResponse(status_code=500, content={"error": error_detail})
