"""
Model Điểm
"""
from database import execute_query

class GradeModel:
    @staticmethod
    def get_by_student(student_id: int, semester: int = None, year: int = None):
        """Lấy danh sách điểm của học sinh"""
        if semester and year:
            query = """
            SELECT 
                g.GradeID, s.SubjectName, g.ContinuousGrade, 
                g.MidtermGrade, g.FinalGrade, g.FinalPoint, g.Status
            FROM Grades g
            JOIN Subjects s ON g.SubjectID = s.SubjectID
            WHERE g.StudentID = ? AND g.Semester = ? AND g.Year = ?
            ORDER BY s.SubjectName
            """
            return execute_query(query, (student_id, semester, year))
        else:
            query = """
            SELECT 
                g.GradeID, s.SubjectName, g.Semester, g.Year,
                g.ContinuousGrade, g.MidtermGrade, g.FinalGrade, 
                g.FinalPoint, g.Status
            FROM Grades g
            JOIN Subjects s ON g.SubjectID = s.SubjectID
            WHERE g.StudentID = ?
            ORDER BY g.Year DESC, g.Semester DESC
            """
            return execute_query(query, (student_id,))
    
    @staticmethod
    def get_class_grades(class_id: int, subject_id: int, semester: int, year: int):
        """Lấy bảng điểm lớp học"""
        query = """
        SELECT 
            s.StudentID, s.StudentCode, s.StudentName,
            g.ContinuousGrade, g.MidtermGrade, g.FinalGrade, g.FinalPoint, g.Status
        FROM Students s
        LEFT JOIN Grades g ON s.StudentID = g.StudentID 
            AND g.SubjectID = ? AND g.Semester = ? AND g.Year = ?
        WHERE s.ClassID = ?
        ORDER BY s.StudentName
        """
        return execute_query(query, (subject_id, semester, year, class_id))
    
    @staticmethod
    def create(student_id: int, subject_id: int, semester: int, year: int,
               continuous: float, midterm: float, final: float):
        """Nhập điểm học sinh"""
        # Tính điểm bộ môn = (QT*0.2 + GK*0.3 + CK*0.5)
        final_point = (continuous * 0.2) + (midterm * 0.3) + (final * 0.5)
        status = 'Đạt' if final_point >= 5.0 else 'Không đạt'
        
        query = """
        INSERT INTO Grades 
        (StudentID, SubjectID, Semester, Year, ContinuousGrade, MidtermGrade, FinalGrade, FinalPoint, Status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (student_id, subject_id, semester, year, continuous, midterm, final, final_point, status)
        return execute_query(query, params, fetch=False)
    
    @staticmethod
    def update(grade_id: int, continuous: float = None, midterm: float = None, final: float = None):
        """Cập nhật điểm"""
        query = """
        UPDATE Grades 
        SET ContinuousGrade = COALESCE(?, ContinuousGrade),
            MidtermGrade = COALESCE(?, MidtermGrade),
            FinalGrade = COALESCE(?, FinalGrade),
            FinalPoint = (COALESCE(?, ContinuousGrade) * 0.2 + 
                         COALESCE(?, MidtermGrade) * 0.3 + 
                         COALESCE(?, FinalGrade) * 0.5),
            Status = CASE WHEN (COALESCE(?, ContinuousGrade) * 0.2 + 
                              COALESCE(?, MidtermGrade) * 0.3 + 
                              COALESCE(?, FinalGrade) * 0.5) >= 5.0 
                     THEN N'Đạt' ELSE N'Không đạt' END,
            UpdatedDate = GETDATE()
        WHERE GradeID = ?
        """
        params = (continuous, midterm, final, continuous, midterm, final, 
                 continuous, midterm, final, grade_id)
        return execute_query(query, params, fetch=False)
