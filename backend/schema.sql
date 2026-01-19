-- ==========================================
-- TẠO DATABASE & BẢNG CHO HỆ THỐNG QUẢN LÝ HỌC SINH
-- ==========================================

-- 1. TẠO DATABASE
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SchoolManagement')
BEGIN
    CREATE DATABASE SchoolManagement;
END
GO

USE SchoolManagement;
GO

-- 2. TẠO BẢNG Users (Người dùng)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserID INT PRIMARY KEY IDENTITY(1,1),
        Username NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Email NVARCHAR(100),
        FullName NVARCHAR(100),
        Role NVARCHAR(20) DEFAULT 'Student', -- Admin, Teacher, Student
        Status NVARCHAR(20) DEFAULT 'Active', -- Active, Inactive
        CreatedDate DATETIME DEFAULT GETDATE(),
        UpdatedDate DATETIME
    );
END
GO

-- 3. TẠO BẢNG Majors (Chuyên ngành/Khối)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Majors')
BEGIN
    CREATE TABLE Majors (
        MajorID INT PRIMARY KEY IDENTITY(1,1),
        MajorName NVARCHAR(100) NOT NULL,
        MajorCode NVARCHAR(20) UNIQUE,
        Description NVARCHAR(255),
        CreatedDate DATETIME DEFAULT GETDATE()
    );
END
GO

-- 4. TẠO BẢNG Classes (Lớp học)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Classes')
BEGIN
    CREATE TABLE Classes (
        ClassID INT PRIMARY KEY IDENTITY(1,1),
        ClassName NVARCHAR(50) NOT NULL UNIQUE,
        MajorID INT,
        Grade INT,
        TeacherID INT,
        MaxStudents INT DEFAULT 40,
        CreatedDate DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (MajorID) REFERENCES Majors(MajorID),
        FOREIGN KEY (TeacherID) REFERENCES Users(UserID)
    );
END
GO

-- 5. TẠO BẢNG Teachers (Giáo viên)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Teachers')
BEGIN
    CREATE TABLE Teachers (
        TeacherID INT PRIMARY KEY FOREIGN KEY REFERENCES Users(UserID),
        Specialization NVARCHAR(100),
        Department NVARCHAR(50),
        YearsOfExperience INT,
        Phone NVARCHAR(20),
        IdentityNumber NVARCHAR(20)
    );
END
GO

-- 6. TẠO BẢNG Students (Học sinh)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Students')
BEGIN
    CREATE TABLE Students (
        StudentID INT PRIMARY KEY FOREIGN KEY REFERENCES Users(UserID),
        StudentCode NVARCHAR(20) NOT NULL UNIQUE,
        ClassID INT NOT NULL,
        DateOfBirth DATE,
        Gender NVARCHAR(10),
        Address NVARCHAR(255),
        Phone NVARCHAR(20),
        ParentPhone NVARCHAR(20),
        IdentityNumber NVARCHAR(20),
        EnrollmentDate DATE DEFAULT CAST(GETDATE() AS DATE),
        GraduationDate DATE,
        CreatedDate DATETIME DEFAULT GETDATE(),
        UpdatedDate DATETIME,
        FOREIGN KEY (ClassID) REFERENCES Classes(ClassID)
    );
END
GO

-- 7. TẠO BẢNG Subjects (Môn học)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Subjects')
BEGIN
    CREATE TABLE Subjects (
        SubjectID INT PRIMARY KEY IDENTITY(1,1),
        SubjectName NVARCHAR(100) NOT NULL,
        SubjectCode NVARCHAR(20) UNIQUE,
        Credits INT DEFAULT 3,
        Description NVARCHAR(255),
        CreatedDate DATETIME DEFAULT GETDATE()
    );
END
GO

-- 8. TẠO BẢNG ClassSubjects (Liên kết Lớp - Môn học)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ClassSubjects')
BEGIN
    CREATE TABLE ClassSubjects (
        ClassSubjectID INT PRIMARY KEY IDENTITY(1,1),
        ClassID INT NOT NULL,
        SubjectID INT NOT NULL,
        Semester INT,
        Year INT,
        TeacherID INT,
        CreatedDate DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (ClassID) REFERENCES Classes(ClassID),
        FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID),
        FOREIGN KEY (TeacherID) REFERENCES Users(UserID)
    );
END
GO

-- 9. TẠO BẢNG Grades (Điểm số)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Grades')
BEGIN
    CREATE TABLE Grades (
        GradeID INT PRIMARY KEY IDENTITY(1,1),
        StudentID INT NOT NULL,
        SubjectID INT NOT NULL,
        Semester INT,
        Year INT,
        ContinuousGrade FLOAT, -- Điểm quá trình
        MidtermGrade FLOAT,    -- Điểm giữa kỳ
        FinalGrade FLOAT,      -- Điểm cuối kỳ
        FinalPoint FLOAT,      -- Điểm bộ môn = (QT*0.2 + GK*0.3 + CK*0.5)
        Status NVARCHAR(20),   -- Đạt / Không đạt
        CreatedDate DATETIME DEFAULT GETDATE(),
        UpdatedDate DATETIME,
        FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
        FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID)
    );
END
GO

-- 10. TẠO BẢNG StudentGPA (GPA học sinh)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StudentGPA')
BEGIN
    CREATE TABLE StudentGPA (
        StudentGPAID INT PRIMARY KEY IDENTITY(1,1),
        StudentID INT NOT NULL UNIQUE,
        TotalCredits INT,
        TotalGradePoints FLOAT,
        GPA FLOAT,
        Classification NVARCHAR(20), -- Xuất sắc, Giỏi, Khá, Trung bình, Yếu
        CreatedDate DATETIME DEFAULT GETDATE(),
        UpdatedDate DATETIME,
        FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
    );
END
GO

-- 11. TẠO BẢNG AuditLogs (Nhật ký hoạt động)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
BEGIN
    CREATE TABLE AuditLogs (
        LogID INT PRIMARY KEY IDENTITY(1,1),
        UserID INT,
        Action NVARCHAR(100),
        TableName NVARCHAR(50),
        RecordID INT,
        OldValue NVARCHAR(MAX),
        NewValue NVARCHAR(MAX),
        CreatedDate DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
END
GO

-- 12. TẠO CÁC INDEX
CREATE INDEX idx_Students_ClassID ON Students(ClassID);
CREATE INDEX idx_Grades_StudentID ON Grades(StudentID);
CREATE INDEX idx_Grades_SubjectID ON Grades(SubjectID);
CREATE INDEX idx_Classes_TeacherID ON Classes(TeacherID);
CREATE INDEX idx_ClassSubjects_ClassID ON ClassSubjects(ClassID);
CREATE INDEX idx_ClassSubjects_SubjectID ON ClassSubjects(SubjectID);
GO

PRINT 'Database và các bảng đã được tạo thành công!';
