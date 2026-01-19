"""
API Routes cho Bulk Import
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
from models.student import StudentModel
from models.grade import GradeModel
import csv
import io

router = APIRouter(prefix="/import", tags=["import"])

@router.post("/students")
async def import_students(file: UploadFile = File(...)):
    """Import học sinh từ CSV/Excel"""
    try:
        contents = await file.read()
        stream = io.StringIO(contents.decode("utf-8"))
        reader = csv.DictReader(stream)
        
        count = 0
        for row in reader:
            result = StudentModel.create(
                student_code=row.get("student_code"),
                student_name=row.get("student_name"),
                dob=row.get("date_of_birth") or None,
                email=row.get("email") or None,
                phone=row.get("phone") or None,
                address=row.get("address") or None,
                class_id=int(row.get("class_id", 1))
            )
            if "error" not in result:
                count += 1
        
        return {"status": "success", "message": f"Import {count} học sinh thành công"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/grades")
async def import_grades(file: UploadFile = File(...)):
    """Import điểm từ CSV/Excel"""
    try:
        contents = await file.read()
        stream = io.StringIO(contents.decode("utf-8"))
        reader = csv.DictReader(stream)
        
        count = 0
        for row in reader:
            result = GradeModel.create(
                student_id=int(row.get("student_id")),
                subject_id=int(row.get("subject_id")),
                semester=int(row.get("semester")),
                year=int(row.get("year")),
                continuous=float(row.get("continuous_grade", 0)),
                midterm=float(row.get("midterm_grade", 0)),
                final=float(row.get("final_grade", 0))
            )
            if "error" not in result:
                count += 1
        
        return {"status": "success", "message": f"Import {count} bản ghi điểm thành công"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
