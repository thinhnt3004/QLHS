"""
API Routes cho Học sinh
"""
from fastapi import APIRouter, HTTPException
from schemas.student import StudentCreate, StudentUpdate, StudentResponse
from models.student import StudentModel

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/")
def get_all_students():
    """Lấy danh sách tất cả học sinh"""
    result = StudentModel.get_all()
    if result:
        return {
            "status": "success",
            "data": [
                {
                    "student_id": row[0],
                    "student_code": row[1],
                    "student_name": row[2],
                    "date_of_birth": row[3],
                    "email": row[4],
                    "phone": row[5],
                    "class_name": row[6],
                    "status": row[7]
                }
                for row in result
            ]
        }
    raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")

@router.get("/{student_id}")
def get_student(student_id: int):
    """Lấy thông tin chi tiết học sinh"""
    result = StudentModel.get_by_id(student_id)
    if result:
        row = result[0]
        return {
            "status": "success",
            "data": {
                "student_id": row[0],
                "student_code": row[1],
                "student_name": row[2],
                "date_of_birth": row[3],
                "email": row[4],
                "phone": row[5],
                "address": row[6],
                "class_name": row[7],
                "status": row[8],
                "created_date": row[9]
            }
        }
    raise HTTPException(status_code=404, detail="Học sinh không tồn tại")

@router.post("/")
def create_student(student: StudentCreate):
    """Tạo học sinh mới"""
    result = StudentModel.create(
        student_code=student.student_code,
        student_name=student.student_name,
        dob=student.date_of_birth,
        email=student.email,
        phone=student.phone,
        address=student.address,
        class_id=student.class_id
    )
    if result.get("status") == "success" or "error" not in result:
        return {"status": "success", "message": "Học sinh được tạo thành công"}
    raise HTTPException(status_code=400, detail=result.get("error"))

@router.put("/{student_id}")
def update_student(student_id: int, student: StudentUpdate):
    """Cập nhật thông tin học sinh"""
    update_data = {k: v for k, v in student.dict().items() if v is not None}
    result = StudentModel.update(student_id, **update_data)
    if "error" not in result:
        return {"status": "success", "message": "Cập nhật thành công"}
    raise HTTPException(status_code=400, detail=result.get("error"))

@router.delete("/{student_id}")
def delete_student(student_id: int):
    """Xóa học sinh (soft delete)"""
    result = StudentModel.delete(student_id)
    if "error" not in result:
        return {"status": "success", "message": "Học sinh được xóa thành công"}
    raise HTTPException(status_code=400, detail=result.get("error"))

@router.get("/class/{class_id}")
def get_class_students(class_id: int):
    """Lấy danh sách học sinh theo lớp"""
    result = StudentModel.get_by_class(class_id)
    if result:
        return {
            "status": "success",
            "data": [
                {
                    "student_id": row[0],
                    "student_code": row[1],
                    "student_name": row[2],
                    "email": row[3],
                    "phone": row[4],
                    "status": row[5]
                }
                for row in result
            ]
        }
    raise HTTPException(status_code=404, detail="Không tìm thấy học sinh trong lớp")
