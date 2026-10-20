# Third party imports.
from fastapi import APIRouter

# Local imports.
from whalefall.routes.health import health_api
from whalefall.routes.items import items_api

router = APIRouter()
router.include_router(health_api)
router.include_router(items_api)
