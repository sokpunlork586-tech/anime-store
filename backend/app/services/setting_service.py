import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.site_setting import SiteSetting
from app.schemas.setting import StoreSettingSchema

VALID_KEYS = set(StoreSettingSchema.model_fields.keys())


class SettingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_settings(self) -> StoreSettingSchema:
        stmt = select(SiteSetting)
        res = await self.db.execute(stmt)
        settings_rows = res.scalars().all()
        data = {}
        for r in settings_rows:
            if r.key not in VALID_KEYS:
                continue
            if r.key == "social_media":
                try:
                    data[r.key] = json.loads(r.value)
                except Exception:
                    pass
            else:
                data[r.key] = r.value
        return StoreSettingSchema(**data) if data else StoreSettingSchema()

    async def update_settings(self, req: StoreSettingSchema) -> StoreSettingSchema:
        dict_data = req.model_dump(exclude_unset=True)
        for k, v in dict_data.items():
            if v is None:
                continue
            val_str = json.dumps(v) if isinstance(v, (dict, list)) else str(v)
            stmt = select(SiteSetting).where(SiteSetting.key == k)
            res = await self.db.execute(stmt)
            setting_row = res.scalar_one_or_none()
            if setting_row:
                setting_row.value = val_str
            else:
                setting_row = SiteSetting(key=k, value=val_str)
                self.db.add(setting_row)
        await self.db.flush()
        await self.db.commit()
        return await self.get_settings()
