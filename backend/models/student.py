"""
Model Học sinh
"""
from database import execute_query

class StudentModel:
    @staticmethod
    def get_all():
        """Lấy danh sách tất cả học sinh"""
        query = """
        SELECT 
            s.StudentID, s.StudentCode, s.StudentName, 
            s.DateOfBirth, s.Email, s.Phone, 
            c.ClassName, s.Status
        FROM Students s
        JOIN Classes c ON s.ClassID = c.ClassID
        ORDER BY s.StudentName
        """
        return execute_query(query)
    
    @staticmethod
    def get_by_id(student_id: int):
        """Lấy thông tin học sinh theo ID"""
        query = """
        SELECT 
            s.StudentID, s.StudentCode, s.StudentName, 
            s.DateOfBirth, s.Email, s.Phone, s.Address,
            c.ClassName, s.Status, s.CreatedDate
        FROM Students s
        JOIN Classes c ON s.ClassID = c.ClassID
        WHERE s.StudentID = ?
        """
        return execute_query(query, (student_id,))
    
    @staticmethod
    def get_by_class(class_id: int):
        """Lấy danh sách học sinh theo lớp"""
        query = """
        SELECT 
            s.StudentID, s.StudentCode, s.StudentName, 
            s.Email, s.Phone, s.Status
        FROM Students s
        WHERE s.ClassID = ?
        ORDER BY s.StudentName
        """
        return execute_query(query, (class_id,))
    
    @staticmethod
    def create(student_code: str, student_name: str, dob, email: str, 
               phone: str, address: str, class_id: int):
        """Tạo học sinh mới"""
        query = """
        INSERT INTO Students 
        (StudentCode, StudentName, DateOfBirth, Email, Phone, Address, ClassID, Status)
        VALUES (?, ?, ?, ?, ?, ?, ?, N'Đang học')
        """
        params = (student_code, student_name, dob, email, phone, address, class_id)
        return execute_query(query, params, fetch=False)
    
    @staticmethod
    def update(student_id: int, **kwargs):
        """Cập nhật thông tin học sinh"""
        allowed_fields = ['StudentName', 'Email', 'Phone', 'Address', 'Status']
        updates = []
        params = []
        
        for key, value in kwargs.items():
            if key in allowed_fields:
                updates.append(f"{key} = ?")
                params.append(value)
        
        if not updates:
            return {"error": "Không có trường để cập nhật"}
        
        params.append(student_id)
        query = f"UPDATE Students SET {', '.join(updates)} WHERE StudentID = ?"
        
        return execute_query(query, tuple(params), fetch=False)
    
    @staticmethod
    def delete(student_id: int):
        """Xóa học sinh (soft delete)"""
        query = "UPDATE Students SET Status = N'Đã tốt nghiệp' WHERE StudentID = ?"
        return execute_query(query, (student_id,), fetch=False)
