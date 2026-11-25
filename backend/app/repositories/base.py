from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get(self, id: Any) -> Optional[ModelType]:
        stmt = select(self.model).where(self.model.id == id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        stmt = select(self.model).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count(self) -> int:
        stmt = select(func.count()).select_from(self.model)
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        await self.db.flush()
        await self.db.refresh(obj)
        return obj

    async def update(self, id: Any, **kwargs) -> Optional[ModelType]:
        obj = await self.get(id)
        if obj:
            for key, value in kwargs.items():
                if hasattr(obj, key) and value is not None:
                    setattr(obj, key, value)
            await self.db.flush()
            await self.db.refresh(obj)
        return obj

    async def delete(self, id: Any) -> bool:
        obj = await self.get(id)
        if obj:
            await self.db.delete(obj)
            await self.db.flush()
            return True
        return False
