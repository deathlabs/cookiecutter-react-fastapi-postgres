"""Create the item table."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c1724fc16062"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "item",
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=1000), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_item_name"), "item", ["name"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_item_name"), table_name="item")
    op.drop_table("item")
