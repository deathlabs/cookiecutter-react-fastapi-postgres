# Third party imports.
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from whalefall.database import SessionDependency

health_api = APIRouter(prefix="/health", tags=["health"])


@health_api.get("/")
def health(session: SessionDependency) -> dict[str, str]:
    try:
        session.exec(text("SELECT 1"))
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable",
        ) from error
    return {"status": "healthy"}
