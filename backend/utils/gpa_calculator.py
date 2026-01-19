"""
Tính toán GPA và xếp loại học tập
"""
from database import execute_query

class GPACalculator:
    @staticmethod
    def calculate_gpa(student_id: int):
        """
        Tính GPA cho học sinh
        GPA = (Tổng điểm môn × credits) / Tổng credits
        """
        query = """
        SELECT 
            SUM(g.FinalPoint * sb.Credits) as TotalGradePoints,
            SUM(sb.Credits) as TotalCredits
        FROM Grades g
        JOIN Subjects sb ON g.SubjectID = sb.SubjectID
        WHERE g.StudentID = ? AND g.Status = N'Đạt'
        """
        
        result = execute_query(query, (student_id,))
        
        if result and result[0][0] is not None:
            total_points = result[0][0]
            total_credits = result[0][1]
            gpa = total_points / total_credits if total_credits > 0 else 0
            return round(gpa, 2)
        
        return 0.0
    
    @staticmethod
    def classify_student(gpa: float):
        """
        Xếp loại học sinh dựa vào GPA
        - Xuất sắc: >= 3.6
        - Giỏi: 3.2 <= GPA < 3.6
        - Khá: 2.5 <= GPA < 3.2
        - Trung bình: 2.0 <= GPA < 2.5
        - Yếu: < 2.0
        """
        if gpa >= 3.6:
            return N'Xuất sắc'
        elif gpa >= 3.2:
            return N'Giỏi'
        elif gpa >= 2.5:
            return N'Khá'
        elif gpa >= 2.0:
            return N'Trung bình'
        else:
            return N'Yếu'
    
    @staticmethod
    def update_student_gpa(student_id: int):
        """Cập nhật GPA và xếp loại cho học sinh"""
        gpa = GPACalculator.calculate_gpa(student_id)
        classification = GPACalculator.classify_student(gpa)
        
        query = """
        UPDATE StudentGPA 
        SET GPA = ?, Classification = ?, UpdatedDate = GETDATE()
        WHERE StudentID = ?
        """
        return execute_query(query, (gpa, classification, student_id), fetch=False)
    
    @staticmethod
    def get_class_ranking(class_id: int):
        """Xếp hạng học sinh trong lớp theo GPA"""
        query = """
        SELECT 
            ROW_NUMBER() OVER (ORDER BY sg.GPA DESC) as Ranking,
            s.StudentCode, s.StudentName, 
            sg.GPA, sg.Classification
        FROM Students s
        LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
        WHERE s.ClassID = ?
        ORDER BY sg.GPA DESC
        """
        return execute_query(query, (class_id,))
