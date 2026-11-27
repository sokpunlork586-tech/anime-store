from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    customers,
    products,
    categories,
    orders,
    cart,
    wishlist,
    reviews,
    inventory,
    dashboard,
    settings,
    payments,
    financial,
    backups,
    notifications,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(customers.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(orders.router)
api_router.include_router(cart.router)
api_router.include_router(wishlist.router)
api_router.include_router(reviews.router)
api_router.include_router(inventory.router)
api_router.include_router(dashboard.router)
api_router.include_router(settings.router)
api_router.include_router(payments.router)
api_router.include_router(financial.router)
api_router.include_router(backups.router)
api_router.include_router(notifications.router)
