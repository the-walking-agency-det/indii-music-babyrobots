from typing import Optional, List
from uuid import UUID
from datetime import datetime
from ..models.user import User, UserCreate, UserResponse
from ..utils.auth import get_password_hash

# Temporary in-memory storage
users_db: dict[UUID, User] = {}

class UserService:
    @staticmethod
    async def create_user(user: UserCreate) -> UserResponse:
        user_dict = user.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        user_dict["id"] = UUID(int=len(users_db) + 1)
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = datetime.utcnow()
        
        db_user = User(**user_dict)
        users_db[db_user.id] = db_user
        return UserResponse(**db_user.model_dump())

    @staticmethod
    async def get_user(user_id: UUID) -> Optional[User]:
        return users_db.get(user_id)

    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        for user in users_db.values():
            if user.email == email:
                return user
        return None

    @staticmethod
    async def list_users() -> List[UserResponse]:
        return [UserResponse(**user.model_dump()) for user in users_db.values()]

    @staticmethod
    async def update_user(user_id: UUID, user_data: dict) -> Optional[UserResponse]:
        if user_id not in users_db:
            return None
        
        db_user = users_db[user_id]
        update_data = user_data.copy()
        
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        update_data["updated_at"] = datetime.utcnow()
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        users_db[user_id] = db_user
        return UserResponse(**db_user.model_dump())

    @staticmethod
    async def delete_user(user_id: UUID) -> bool:
        if user_id not in users_db:
            return False
        del users_db[user_id]
        return True
