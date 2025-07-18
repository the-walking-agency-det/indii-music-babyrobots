from typing import Protocol, Optional
from uuid import UUID
from ..models.user import User

class UserServiceInterface(Protocol):
    @staticmethod
    async def get_user(user_id: UUID) -> Optional[User]: ...
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]: ...

# Global instance that will be set during app startup
user_service: UserServiceInterface = None

def set_user_service(service: UserServiceInterface) -> None:
    global user_service
    user_service = service
