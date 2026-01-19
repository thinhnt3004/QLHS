"""
API Routes cho Statistics & Reports
"""
from fastapi import APIRouter, HTTPException
from models.statistics import StatisticsModel

router = APIRouter(prefix="/statistics", tags=["statistics"])

@router.get("/dashboard")
def get_dashboard_stats():
    """Lấy thống kê dashboard"""
    try:
        stats = StatisticsModel.get_dashboard_stats()
        return {"status": "success", "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gpa-distribution")
def get_gpa_distribution():
    """Phân bố GPA"""
    try:
        data = StatisticsModel.get_gpa_distribution()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/average-grade")
def get_average_grade():
    """Điểm trung bình theo môn"""
    try:
        data = StatisticsModel.get_average_grade_by_subject()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/class-stats")
def get_class_stats():
    """Thống kê theo lớp"""
    try:
        data = StatisticsModel.get_class_statistics()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/failing-students")
def get_failing_students():
    """Danh sách học sinh yếu"""
    try:
        data = StatisticsModel.get_failing_students()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/student-report/{student_id}")
def get_student_report(student_id: int):
    """Báo cáo chi tiết học sinh"""
    try:
        data = StatisticsModel.get_student_report(student_id)
        if not data:
            raise HTTPException(status_code=404, detail="Học sinh không tồn tại")
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-warning/{student_id}")
def send_warning_to_student(student_id: int):
    """Gửi cảnh báo cho học sinh yếu"""
    from models.student import StudentModel
    from utils.email_service import EmailService
    
    try:
        student = StudentModel.get_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Học sinh không tồn tại")
        
        row = student[0]
        student_name = row[2]
        email = row[4]
        
        # Lấy điểm trung bình
        report = StatisticsModel.get_student_report(student_id)
        if not report or report["avg"] >= 5.0:
            raise HTTPException(status_code=400, detail="Học sinh không có nguy cơ")
        
        # Gửi email
        success = EmailService.send_warning_to_student(student_name, email, report["avg"])
        
        if success:
            return {"status": "success", "message": "Gửi cảnh báo thành công"}
        else:
            raise HTTPException(status_code=500, detail="Lỗi gửi email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
