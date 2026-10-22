# Third party imports.
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

# Local imports.
from whalefall.database import SessionDependency
from whalefall.models import Item, ItemCreate, ItemRead, ItemUpdate

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


@items_api.patch("/{item_id}", response_model=ItemRead)
def update_item(
    item_id: int, item_update: ItemUpdate, session: SessionDependency
) -> Item:
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    update_data = item_update.model_dump(exclude_unset=True)
    if update_data.get("name") is None and "name" in update_data:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Item name cannot be null",
        )
    item.sqlmodel_update(update_data)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@items_api.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, session: SessionDependency) -> None:
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    session.delete(item)
    session.commit()
