# Standard library imports.
from collections.abc import Generator
from os import environ
from typing import Annotated

# Third-party imports.
from fastapi import Depends
from sqlalchemy import URL
from sqlmodel import Session, create_engine


def get_database_url() -> URL:
    """Build the database URL from the Postgres environment."""
    return URL.create(
        drivername="postgresql+psycopg2",
        username=environ["PGUSER"],
        password=environ["PGPASSWORD"],
        host=environ["PGHOST"],
        port=int(environ["PGPORT"]),
        database=environ["PGDATABASE"],
    )


engine = create_engine(get_database_url(), pool_pre_ping=True)


def get_session() -> Generator[Session]:
    """Provide a database session for one request."""
    with Session(engine) as session:
        yield session


SessionDependency = Annotated[Session, Depends(get_session)]
