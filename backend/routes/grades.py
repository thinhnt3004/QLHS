"""
API Routes cho Điểm
"""
from fastapi import APIRouter, HTTPException
from schemas.grade import GradeCreate, GradeUpdate
from models.grade import GradeModel
from utils.gpa_calculator import GPACalculator

router = APIRouter(prefix="/grades", tags=["grades"])

@router.get("/student/{student_id}")
def get_student_grades(student_id: int, semester: int = None, year: int = None):
    """Lấy danh sách điểm của học sinh"""
    result = GradeModel.get_by_student(student_id, semester, year)
    if result:
        return {
            "status": "success",
            "data": [
                {
                    "grade_id": row[0],
                    "subject_name": row[1],
                    "continuous_grade": row[2],
                    "midterm_grade": row[3],
                    "final_grade": row[4],
                    "final_point": row[5],
                    "status": row[6]
                }
                for row in result
            ]
        }
    raise HTTPException(status_code=404, detail="Không tìm thấy điểm")

@router.get("/class/{class_id}/subject/{subject_id}")
def get_class_grades(class_id: int, subject_id: int, semester: int, year: int):
    """Lấy bảng điểm lớp học theo môn học"""
    result = GradeModel.get_class_grades(class_id, subject_id, semester, year)
    if result:
        return {
            "status": "success",
            "data": [
                {
                    "student_id": row[0],
                    "student_code": row[1],
                    "student_name": row[2],
                    "continuous_grade": row[3],
                    "midterm_grade": row[4],
                    "final_grade": row[5],
                    "final_point": row[6],
                    "status": row[7]
                }
                for row in result
            ]
        }
    raise HTTPException(status_code=404, detail="Không tìm thấy điểm lớp")

@router.post("/")
def create_grade(grade: GradeCreate):
    """Nhập điểm học sinh"""
    result = GradeModel.create(
        student_id=grade.student_id,
        subject_id=grade.subject_id,
        semester=grade.semester,
        year=grade.year,
        continuous=grade.continuous_grade,
        midterm=grade.midterm_grade,
        final=grade.final_grade
    )
    
    if "error" not in result:
        # Cập nhật GPA sau khi nhập điểm
        GPACalculator.update_student_gpa(grade.student_id)
        return {"status": "success", "message": "Điểm được nhập thành công"}
    raise HTTPException(status_code=400, detail=result.get("error"))

@router.put("/{grade_id}")
def update_grade(grade_id: int, grade: GradeUpdate):
    """Cập nhật điểm"""
    result = GradeModel.update(
        grade_id,
        continuous=grade.continuous_grade,
        midterm=grade.midterm_grade,
        final=grade.final_grade
    )
    
    if "error" not in result:
        return {"status": "success", "message": "Cập nhật điểm thành công"}
    raise HTTPException(status_code=400, detail=result.get("error"))

@router.get("/ranking/class/{class_id}")
def get_class_ranking(class_id: int):
    """Xếp hạng học sinh trong lớp theo GPA"""
    result = GPACalculator.get_class_ranking(class_id)
    if result:
        return {
            "status": "success",
            "data": [
                {
                    "ranking": row[0],
                    "student_code": row[1],
                    "student_name": row[2],
                    "gpa": row[3],
                    "classification": row[4]
                }
                for row in result
            ]
        }
    raise HTTPException(status_code=404, detail="Không tìm thấy dữ liệu xếp hạng")
