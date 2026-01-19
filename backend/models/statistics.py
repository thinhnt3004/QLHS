"""
Model Statistics & Reports
"""
from database import execute_query

class StatisticsModel:
    @staticmethod
    def get_dashboard_stats():
        """Lấy thống kê dashboard"""
        # Tổng học sinh
        total_students = execute_query(
            "SELECT COUNT(*) FROM Students"
        )[0][0]
        
        # Tổng giáo viên
        total_teachers = execute_query(
            "SELECT COUNT(*) FROM Teachers"
        )[0][0]
        
        # Tổng lớp
        total_classes = execute_query(
            "SELECT COUNT(*) FROM Classes"
        )[0][0]
        
        # Học sinh xuất sắc
        excellent_students = execute_query(
            "SELECT COUNT(*) FROM StudentGPA WHERE Classification = N'Xuất sắc'"
        )[0][0]
        
        return {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_classes": total_classes,
            "excellent_students": excellent_students
        }
    
    @staticmethod
    def get_gpa_distribution():
        """Phân bố GPA"""
        query = """
        SELECT Classification, COUNT(*) as Count
        FROM StudentGPA
        GROUP BY Classification
        ORDER BY Classification
        """
        result = execute_query(query)
        return [
            {"name": row[0], "value": row[1]}
            for row in result
        ]
    
    @staticmethod
    def get_average_grade_by_subject():
        """Điểm trung bình theo môn"""
        query = """
        SELECT 
            s.SubjectName,
            AVG(g.FinalPoint) as AverageGrade,
            COUNT(g.GradeID) as StudentCount
        FROM Grades g
        JOIN Subjects s ON g.SubjectID = s.SubjectID
        GROUP BY s.SubjectName
        ORDER BY AverageGrade DESC
        """
        result = execute_query(query)
        return [
            {"subject": row[0], "average": round(float(row[1]) if row[1] else 0, 2), "count": row[2]}
            for row in result
        ]
    
    @staticmethod
    def get_class_statistics():
        """Thống kê theo lớp"""
        query = """
        SELECT 
            c.ClassName,
            COUNT(s.StudentID) as StudentCount,
            AVG(sg.GPA) as AverageGPA,
            COUNT(CASE WHEN sg.Classification = N'Xuất sắc' THEN 1 END) as ExcellentCount
        FROM Classes c
        LEFT JOIN Students s ON c.ClassID = s.ClassID
        LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
        GROUP BY c.ClassID, c.ClassName
        ORDER BY c.ClassName
        """
        result = execute_query(query)
        return [
            {
                "class": row[0],
                "students": row[1],
                "avg_gpa": round(float(row[2]) if row[2] else 0, 2),
                "excellent": row[3] or 0
            }
            for row in result
        ]
    
    @staticmethod
    def get_failing_students():
        """Lấy danh sách học sinh có nguy cơ không đạt"""
        query = """
        SELECT 
            s.StudentID,
            s.StudentCode,
            s.StudentName,
            c.ClassName,
            COUNT(g.GradeID) as TotalGrades,
            SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) as FailingGrades,
            AVG(g.FinalPoint) as AverageGrade
        FROM Students s
        JOIN Classes c ON s.ClassID = c.ClassID
        LEFT JOIN Grades g ON s.StudentID = g.StudentID
        GROUP BY s.StudentID, s.StudentCode, s.StudentName, c.ClassID, c.ClassName
        HAVING AVG(g.FinalPoint) < 5.0
        ORDER BY AVG(g.FinalPoint) ASC
        """
        result = execute_query(query)
        return [
            {
                "student_id": row[0],
                "student_code": row[1],
                "student_name": row[2],
                "class": row[3],
                "total": row[4],
                "failing": row[5],
                "avg": round(float(row[6]) if row[6] else 0, 2)
            }
            for row in result
        ]
    
    @staticmethod
    def get_student_report(student_id: int):
        """Báo cáo chi tiết học sinh"""
        query = """
        SELECT 
            s.StudentCode,
            s.StudentName,
            c.ClassName,
            s.Email,
            s.Phone,
            sg.GPA,
            sg.Classification,
            COUNT(g.GradeID) as TotalSubjects,
            SUM(CASE WHEN g.Status = N'Đạt' THEN 1 ELSE 0 END) as PassedCount,
            SUM(CASE WHEN g.Status = N'Không đạt' THEN 1 ELSE 0 END) as FailedCount
        FROM Students s
        JOIN Classes c ON s.ClassID = c.ClassID
        LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
        LEFT JOIN Grades g ON s.StudentID = g.StudentID
        WHERE s.StudentID = ?
        GROUP BY s.StudentID, s.StudentCode, s.StudentName, c.ClassID, c.ClassName, 
                 s.Email, s.Phone, sg.GPA, sg.Classification
        """
        result = execute_query(query, (student_id,))
        if result:
            row = result[0]
            return {
                "student_code": row[0],
                "student_name": row[1],
                "class": row[2],
                "email": row[3],
                "phone": row[4],
                "gpa": round(float(row[5]) if row[5] else 0, 2),
                "classification": row[6],
                "total_subjects": row[7],
                "passed": row[8],
                "failed": row[9]
            }
        return None
