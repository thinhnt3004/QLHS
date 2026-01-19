"""
Schema Pydantic cho Điểm
"""
from pydantic import BaseModel
from typing import Optional

class GradeBase(BaseModel):
    student_id: int
    subject_id: int
    semester: int
    year: int
    continuous_grade: float
    midterm_grade: float
    final_grade: float

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    continuous_grade: Optional[float] = None
    midterm_grade: Optional[float] = None
    final_grade: Optional[float] = None

class GradeResponse(GradeBase):
    grade_id: int
    final_point: float
    status: str
    
    class Config:
        from_attributes = True
