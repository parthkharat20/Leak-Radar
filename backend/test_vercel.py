import sys
import os
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI
import traceback
from fastapi.responses import JSONResponse

app = FastAPI()

try:
    from main import app as main_app
    app.mount("/", main_app)
except Exception as e:
    error_detail = traceback.format_exc()
    @app.api_route("/{path:path}", methods=["GET", "POST", "PATCH", "PUT", "DELETE"])
    def catch_all(path: str):
        return JSONResponse(status_code=500, content={"detail": error_detail})
