# Third party imports.
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

# Local imports.
from whalefall.database import SessionDependency
from whalefall.models import Item, ItemCreate, ItemRead

items_api = APIRouter(prefix="/items", tags=["items"])


@items_api.post("/", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate, session: SessionDependency) -> Item:
    database_item = Item.model_validate(item)
    session.add(database_item)
    session.commit()
    session.refresh(database_item)
    return database_item


@items_api.get("/", response_model=list[ItemRead])
def read_items(session: SessionDependency) -> list[Item]:
    return list(session.exec(select(Item).order_by(Item.id)))


@items_api.get("/{item_id}", response_model=ItemRead)
def read_item(item_id: int, session: SessionDependency) -> Item:
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return item
