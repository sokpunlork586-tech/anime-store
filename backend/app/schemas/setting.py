from typing import Optional, Dict, Any
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
    email: Optional[str] = "contact@animestore.com"
    phone: Optional[str] = "+1 (555) 000-1234"
    address: Optional[str] = "100 Otaku Boulevard"
    city: Optional[str] = "Los Angeles, CA 90001"
    country: Optional[str] = "United States"
    currency: Optional[str] = "USD"
    currency_symbol: Optional[str] = "$"
    tax_rate: Optional[float] = 9.0
    free_shipping_threshold: Optional[float] = 50.0
    standard_rate: Optional[float] = 5.99
    express_rate: Optional[float] = 12.99
    social_media: Optional[Dict[str, str]] = {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "youtube": ""
    }
