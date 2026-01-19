"""
Cấu hình ứng dụng
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # SQL Server
    SQL_SERVER: str = "DESKTOP-YOUR-PC"
    DATABASE: str = "SchoolManagement"
    USERNAME: str = "sa"
    PASSWORD: str = "your_password"
    
    # API
    API_TITLE: str = "School Management API"
    API_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
