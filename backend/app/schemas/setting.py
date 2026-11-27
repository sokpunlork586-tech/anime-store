from typing import Optional, Dict
from pydantic import BaseModel


class SettingResponse(BaseModel):
    key: str
    value: str


class SettingUpdate(BaseModel):
    key: str
    value: str


class StoreSettingSchema(BaseModel):
    store_name: Optional[str] = "Anime Store"
    store_description: Optional[str] = "Your ultimate anime merch shop"
    store_tagline: Optional[str] = "Dream • Collect • Enjoy"
    store_logo: Optional[str] = ""
    announcement_text: Optional[str] = "Special Anime Sale - Up to 30% OFF!"
    promo_banner_title: Optional[str] = "Your Favorite Anime, Your Collection"
    promo_banner_subtitle: Optional[str] = "Shop now and bring your anime world to life!"
    hero_banner_image: Optional[str] = "/src/assets/images/hero_anime_universe_1795162308796.jpg"
    promo_banner_image: Optional[str] = "/src/assets/images/promo_cherry_blossom_1795162311099.jpg"
    club_banner_image: Optional[str] = "/src/assets/images/club_anime_hero_1795162306667.jpg"
    email: Optional[str] = "info@animestore.com"
    phone: Optional[str] = "+855 12 345 678"
    address: Optional[str] = "Phnom Penh, Cambodia"
    city: Optional[str] = "Phnom Penh"
    country: Optional[str] = "Cambodia"
    currency: Optional[str] = "USD"
    currency_symbol: Optional[str] = "$"
    tax_rate: Optional[float] = 9.0
    free_shipping_threshold: Optional[float] = 50.0
    standard_rate: Optional[float] = 4.99
    express_rate: Optional[float] = 12.99
    club_discount_percent: Optional[float] = 10.0
    social_media: Optional[Dict[str, str]] = {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "youtube": "",
    }
