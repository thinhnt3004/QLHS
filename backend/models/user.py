"""
Model User (Người dùng - Admin/Teacher/Student)
"""
from database import execute_query
import hashlib

class UserModel:
    @staticmethod
    def hash_password(password: str) -> str:
        """Mã hóa mật khẩu"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Kiểm tra mật khẩu"""
        return UserModel.hash_password(password) == hashed
    
    @staticmethod
    def create(username: str, email: str, password: str, full_name: str, role: str):
        """Tạo user mới"""
        hashed_password = UserModel.hash_password(password)
        query = """
        INSERT INTO Users (Username, Email, PasswordHash, FullName, Role, Status)
        VALUES (?, ?, ?, ?, ?, N'Active')
        """
        params = (username, email, hashed_password, full_name, role)
        return execute_query(query, params, fetch=False)
    
    @staticmethod
    def get_by_username(username: str):
        """Lấy user theo username"""
        query = """
        SELECT UserID, Username, Email, PasswordHash, FullName, Role, Status
        FROM Users
        WHERE Username = ?
        """
        return execute_query(query, (username,))
    
    @staticmethod
    def get_by_id(user_id: int):
        """Lấy user theo ID"""
        query = """
        SELECT UserID, Username, Email, FullName, Role, Status
        FROM Users
        WHERE UserID = ?
        """
        return execute_query(query, (user_id,))
    
    @staticmethod
    def get_all_teachers():
        """Lấy danh sách giáo viên"""
        query = """
        SELECT UserID, Username, FullName, Email
        FROM Users
        WHERE Role = N'Teacher' AND Status = N'Active'
        """
        return execute_query(query)
    
    @staticmethod
    def get_all_admins():
        """Lấy danh sách admin"""
        query = """
        SELECT UserID, Username, FullName, Email
        FROM Users
        WHERE Role = N'Admin' AND Status = N'Active'
        """
        return execute_query(query)
