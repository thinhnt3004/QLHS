"""
Cấu hình ứng dụng
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # SQL Server
    SQL_SERVER: str = "LAPTOP-RQL701VS"
    DATABASE: str = "SchoolManagement"
    USERNAME: str = "LAPTOP-RQL701VS\\HP"
    PASSWORD: str = ""
    
    # API
    API_TITLE: str = "School Management API"
    API_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
