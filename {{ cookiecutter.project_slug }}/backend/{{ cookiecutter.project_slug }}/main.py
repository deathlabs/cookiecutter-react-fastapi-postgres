# Standard library imports.
from os import getenv

# Third library imports.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Local imports.
from {{ cookiecutter.project_slug }}.routes import router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[getenv("FRONTEND_HOST", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")
