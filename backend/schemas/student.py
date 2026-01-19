"""
Schema Pydantic cho Học sinh
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class StudentBase(BaseModel):
    student_code: str
    student_name: str
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    class_id: int
    status: str = "Đang học"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    student_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None

class StudentResponse(StudentBase):
    student_id: int
    class_name: str
    
    class Config:
        from_attributes = True
