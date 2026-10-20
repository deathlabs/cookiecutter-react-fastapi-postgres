# Third-party imports.
from sqlmodel import Field, SQLModel


class ItemBase(SQLModel):
    name: str = Field(index=True, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)


class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class ItemCreate(ItemBase):
    pass


class ItemRead(ItemBase):
    id: int
