import json
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import get_password_hash
from app.schemas.setting import StoreSettingSchema
from app.models.user import User
from app.models.customer import Customer
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.inventory import Inventory
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.review import Review
from app.models.site_setting import SiteSetting

logger = logging.getLogger("anime_store")


async def init_db(db: AsyncSession) -> None:
    # 1. Seed Admin
    stmt = select(User).where(User.email == settings.FIRST_ADMIN_EMAIL.lower())
    res = await db.execute(stmt)
    admin = res.scalar_one_or_none()
    if not admin:
        admin = User(
            email=settings.FIRST_ADMIN_EMAIL.lower(),
            hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            full_name=settings.FIRST_ADMIN_NAME,
            role="admin",
            is_active=True,
            club_member=True,
            phone="+1 (555) 000-0000",
            address="Anime Store Headquarters",
            city="Tokyo",
        )
        db.add(admin)
        await db.flush()
        logger.info(f"Created default admin: {settings.FIRST_ADMIN_EMAIL}")

    # 2. Seed Customer
    stmt_cust = select(User).where(User.email == "john.doe@email.com")
    res_cust = await db.execute(stmt_cust)
    cust = res_cust.scalar_one_or_none()
    if not cust:
        cust = User(
            email="john.doe@email.com",
            hashed_password=get_password_hash("Password123!"),
            full_name="John Doe",
            role="customer",
            is_active=True,
            club_member=True,
            phone="+1 (555) 123-4567",
            address="123 Maple Street",
            city="New York",
        )
        db.add(cust)
        await db.flush()

    # 3. Seed Categories
    categories_seed = [
        {"name": "Figures & Statues", "slug": "figures-statues", "short_name": "Figures", "description": "High-quality anime figures and collectible statues.", "image": "", "icon_key": "Box", "accent_bg": "#FFEFEA"},
        {"name": "Manga & Light Novels", "slug": "manga-light-novels", "short_name": "Manga", "description": "Latest manga volumes and light novel releases.", "image": "", "icon_key": "BookOpen", "accent_bg": "#EFF6FF"},
        {"name": "Posters & Wall Art", "slug": "posters-wall-art", "short_name": "Posters", "description": "Premium anime posters, wall scrolls, and art prints.", "image": "", "icon_key": "Image", "accent_bg": "#FEF3C7"},
        {"name": "Accessories", "slug": "accessories", "short_name": "Accessories", "description": "Anime keychains, pins, bags, and phone cases.", "image": "", "icon_key": "Sparkles", "accent_bg": "#F3E8FF"},
        {"name": "Clothing & Apparel", "slug": "clothing-apparel", "short_name": "Apparel", "description": "Anime-themed hoodies, t-shirts, and cosplay items.", "image": "", "icon_key": "Shirt", "accent_bg": "#ECFDF5"},
        {"name": "Collectibles", "slug": "collectibles", "short_name": "Collectibles", "description": "Rare and limited edition anime collectibles.", "image": "", "icon_key": "Gem", "accent_bg": "#FDF2F8"},
    ]

    cat_map = {}
    for c in categories_seed:
        stmt = select(Category).where(Category.slug == c["slug"])
        res = await db.execute(stmt)
        cat = res.scalar_one_or_none()
        if not cat:
            cat = Category(**c, status="active")
            db.add(cat)
            await db.flush()
        cat_map[c["name"]] = cat.id

    # 4. Seed Products
    products_seed = [
        {
            "sku": "FIG-001",
            "name": "Goku Super Saiyan Figure",
            "slug": "goku-super-saiyan-figure",
            "series": "Dragon Ball Z",
            "category_name": "Figures & Statues",
            "price": 49.99,
            "original_price": 69.99,
            "rating": 4.8,
            "review_count": 124,
            "units_sold": 458,
            "stock_quantity": 45,
            "image_url": "/images/products/prod_warrior_figure_1795162308415.jpg",
            "status": "active",
            "badge": "Best Seller",
            "featured": True,
            "is_new_arrival": False,
            "description": "Premium Dragon Ball Z Goku Super Saiyan transformation figure with energy aura effects base.",
            "specifications": {"Height": "28cm", "Material": "PVC / ABS", "Manufacturer": "Bandai Spirits"},
            "variants": ["Standard Edition", "Metallic Finish"],
            "tags": ["dragon ball", "goku", "figure"],
        },
        {
            "sku": "FIG-002",
            "name": "Nezuko Kamado Figure",
            "slug": "nezuko-kamado-figure",
            "series": "Demon Slayer",
            "category_name": "Figures & Statues",
            "price": 39.99,
            "original_price": None,
            "rating": 4.9,
            "review_count": 98,
            "units_sold": 392,
            "stock_quantity": 32,
            "image_url": "/images/products/prod_kimono_figure_1795162305963.jpg",
            "status": "active",
            "badge": "Hot",
            "featured": True,
            "is_new_arrival": True,
            "description": "Demon Slayer Nezuko Kamado collectible figure with bamboo muzzle and pink kimono pattern.",
            "specifications": {"Height": "22cm", "Material": "PVC", "Manufacturer": "Aniplex"},
            "variants": ["Box Included"],
            "tags": ["demon slayer", "nezuko", "figure"],
        },
        {
            "sku": "FIG-003",
            "name": "Naruto Uzumaki Figure",
            "slug": "naruto-uzumaki-figure",
            "series": "Naruto Shippuden",
            "category_name": "Figures & Statues",
            "price": 44.99,
            "original_price": 59.99,
            "rating": 4.7,
            "review_count": 86,
            "units_sold": 370,
            "stock_quantity": 28,
            "image_url": "/images/products/prod_ninja_figure_1795162308489.jpg",
            "status": "active",
            "badge": "Best Seller",
            "featured": True,
            "is_new_arrival": False,
            "description": "Naruto Shippuden Sage Mode Naruto Uzumaki with interchangeable hands and Rasengan.",
            "specifications": {"Height": "25cm", "Material": "PVC", "Manufacturer": "Megahouse"},
            "variants": ["Standard"],
            "tags": ["naruto", "figure", "sage mode"],
        },
        {
            "sku": "FIG-004",
            "name": "Luffy Gear 5 Figure",
            "slug": "luffy-gear-5-figure",
            "series": "One Piece",
            "category_name": "Figures & Statues",
            "price": 54.99,
            "original_price": None,
            "rating": 4.9,
            "review_count": 112,
            "units_sold": 341,
            "stock_quantity": 15,
            "image_url": "/images/products/prod_captain_figure_1795162307219.jpg",
            "status": "active",
            "badge": "New Arrival",
            "featured": True,
            "is_new_arrival": True,
            "description": "One Piece Monkey D. Luffy Gear 5 Sun God Nika transformation figure with cloud base.",
            "specifications": {"Height": "30cm", "Material": "PVC / Resin", "Manufacturer": "Banpresto"},
            "variants": ["Special Effect Base"],
            "tags": ["one piece", "luffy", "gear 5"],
        },
        {
            "sku": "MNG-001",
            "name": "One Piece Box Set Vol 1-23",
            "slug": "one-piece-box-set-vol-1-23",
            "series": "One Piece",
            "category_name": "Manga & Light Novels",
            "price": 149.99,
            "original_price": 189.99,
            "rating": 4.9,
            "review_count": 156,
            "units_sold": 234,
            "stock_quantity": 20,
            "image_url": "/images/products/prod_manga_collection_1795162321332.jpg",
            "status": "active",
            "badge": "Limited",
            "featured": True,
            "is_new_arrival": False,
            "description": "Complete One Piece East Blue and Baroque Works sagas in a premium collector box with exclusive poster.",
            "specifications": {"Format": "Paperback", "Publisher": "VIZ Media", "Language": "English"},
            "variants": ["English Edition"],
            "tags": ["one piece", "manga", "box set"],
        },
        {
            "sku": "CLT-001",
            "name": "Anime Cat Hoodie",
            "slug": "anime-cat-hoodie",
            "series": "Original Art",
            "category_name": "Clothing & Apparel",
            "price": 39.99,
            "original_price": 49.99,
            "rating": 4.7,
            "review_count": 73,
            "units_sold": 198,
            "stock_quantity": 35,
            "image_url": "/images/products/prod_hoodie_streetwear_1795178529403.jpg",
            "status": "active",
            "badge": "Hot",
            "featured": False,
            "is_new_arrival": True,
            "description": "Ultra-soft cotton blend oversized hoodie featuring kawaii cat ear hood and embroidered artwork.",
            "specifications": {"Material": "80% Cotton 20% Polyester", "Care": "Machine wash cold"},
            "variants": ["M", "L", "XL", "XXL"],
            "tags": ["hoodie", "cat", "clothing"],
        },
    ]

    for p in products_seed:
        stmt = select(Product).where(Product.sku == p["sku"])
        res = await db.execute(stmt)
        prod = res.scalar_one_or_none()
        if not prod:
            cat_id = cat_map.get(p["category_name"], list(cat_map.values())[0])
            p_data = {k: v for k, v in p.items() if k != "category_name"}
            prod = Product(**p_data, category_id=cat_id)
            db.add(prod)
            await db.flush()

            # Add inventory
            inv = Inventory(
                product_id=prod.id,
                current_stock=prod.stock_quantity,
                min_stock=10,
                max_stock=100,
                status="in_stock" if prod.stock_quantity > 10 else "low_stock" if prod.stock_quantity > 0 else "out_of_stock",
            )
            db.add(inv)
        elif not prod.image_url and p.get("image_url"):
            prod.image_url = p["image_url"]

    # 5. Seed Initial Orders (only once, tracked via SiteSetting)
    ord_seeded_res = await db.execute(select(SiteSetting).where(SiteSetting.key == "orders_seeded"))
    if not ord_seeded_res.scalar_one_or_none():
        stmt_ord = select(Order)
        res_ord = await db.execute(stmt_ord)
        if not res_ord.first():
            order1 = Order(
                order_number="#ORD-1001",
                user_id=cust.id if cust else None,
                customer_name="John Doe",
                customer_email="john.doe@email.com",
                customer_phone="+1 (555) 123-4567",
                shipping_address="123 Maple Street",
                city="New York",
                payment_method="Credit Card",
                subtotal=49.99,
                shipping_fee=0.0,
                discount=0.0,
                tax=4.50,
                total_amount=54.49,
                status="Completed",
                payment_status="paid",
                notes="Please leave at the front door",
            )
            db.add(order1)
            await db.flush()

            item1 = OrderItem(
                order_id=order1.id,
                product_id=1,
                product_name="Goku Super Saiyan Figure",
                series="Dragon Ball Z",
                price=49.99,
                quantity=1,
                variant="Standard Edition",
                total=49.99,
            )
            db.add(item1)
        db.add(SiteSetting(key="orders_seeded", value="true"))

    # 6. Seed Initial Customers (only once, tracked via SiteSetting)
    seeded_res = await db.execute(select(SiteSetting).where(SiteSetting.key == "customers_seeded"))
    if not seeded_res.scalar_one_or_none():
        existing_cust = await db.execute(select(Customer).limit(1))
        if not existing_cust.first():
            customers_seed = [
                {"name": "John Doe", "email": "john.doe@email.com", "phone": "+1 (555) 123-4567", "address": "123 Maple Street", "city": "New York", "country": "USA", "total_orders": 12, "total_spent": 589.88, "status": "active", "club_member": True},
                {"name": "Alice Smith", "email": "alice.smith@email.com", "phone": "+1 (555) 234-5678", "address": "456 Oak Avenue", "city": "Los Angeles", "country": "USA", "total_orders": 8, "total_spent": 342.50, "status": "active", "club_member": True},
                {"name": "David Kim", "email": "david.kim@email.com", "phone": "+1 (555) 345-6789", "address": "789 Pine Road", "city": "Chicago", "country": "USA", "total_orders": 5, "total_spent": 219.95, "status": "active", "club_member": False},
                {"name": "Sarah Chen", "email": "sarah.chen@email.com", "phone": "+1 (555) 456-7890", "address": "321 Cedar Lane", "city": "San Francisco", "country": "USA", "total_orders": 15, "total_spent": 892.45, "status": "active", "club_member": True},
                {"name": "Mike Wilson", "email": "mike.wilson@email.com", "phone": "+1 (555) 567-8901", "address": "654 Birch Drive", "city": "Seattle", "country": "USA", "total_orders": 3, "total_spent": 142.00, "status": "active", "club_member": False},
                {"name": "Emma Johnson", "email": "emma.j@email.com", "phone": "+1 (555) 678-9012", "address": "987 Elm Court", "city": "Boston", "country": "USA", "total_orders": 7, "total_spent": 456.93, "status": "active", "club_member": True},
                {"name": "Takeshi Yamada", "email": "takeshi.y@email.com", "phone": "+81 90-1234-5678", "address": "12-3 Shibuya", "city": "Tokyo", "country": "Japan", "total_orders": 20, "total_spent": 1245.80, "status": "active", "club_member": True},
                {"name": "Lisa Park", "email": "lisa.park@email.com", "phone": "+1 (555) 789-0123", "address": "741 Willow Way", "city": "Miami", "country": "USA", "total_orders": 2, "total_spent": 89.98, "status": "inactive", "club_member": False},
                {"name": "Carlos Rivera", "email": "carlos.r@email.com", "phone": "+1 (555) 890-1234", "address": "852 Spruce Street", "city": "Austin", "country": "USA", "total_orders": 6, "total_spent": 378.94, "status": "active", "club_member": True},
                {"name": "Yuki Tanaka", "email": "yuki.t@email.com", "phone": "+81 80-9876-5432", "address": "45-6 Akihabara", "city": "Tokyo", "country": "Japan", "total_orders": 11, "total_spent": 756.89, "status": "active", "club_member": True},
            ]
            now = datetime.now(timezone.utc)
            for c_data in customers_seed:
                db.add(Customer(**c_data, joined_at=now, last_order_at=now))
        db.add(SiteSetting(key="customers_seeded", value="true"))

    # 7. Seed Default Store Settings (only keys missing in PostgreSQL site_settings)
    default_settings = StoreSettingSchema().model_dump()
    existing_settings_res = await db.execute(select(SiteSetting.key))
    existing_keys = set(existing_settings_res.scalars().all())
    for k, v in default_settings.items():
        if k not in existing_keys and v is not None:
            val_str = json.dumps(v) if isinstance(v, (dict, list)) else str(v)
            db.add(SiteSetting(key=k, value=val_str))

    await db.commit()
    logger.info("Database seed initialized successfully.")
