-- ==========================================
-- BẢNG USERS (Người dùng hệ thống)
-- ==========================================

CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL,  -- Admin, Teacher, Student
    Status NVARCHAR(20) DEFAULT N'Active',  -- Active, Inactive, Banned
    CreatedDate DATETIME DEFAULT GETDATE(),
    UpdatedDate DATETIME DEFAULT GETDATE()
);

-- Index
CREATE INDEX IDX_Users_Username ON Users(Username);
CREATE INDEX IDX_Users_Role ON Users(Role);

-- ==========================================
-- BẢNG PERMISSIONS (Phân quyền)
-- ==========================================

CREATE TABLE Permissions (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    PermissionName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Module NVARCHAR(50)  -- Students, Grades, Reports, etc.
);

-- ==========================================
-- BẢNG ROLE_PERMISSIONS (Liên kết Role-Permission)
-- ==========================================

CREATE TABLE RolePermissions (
    RolePermissionID INT PRIMARY KEY IDENTITY(1,1),
    Role NVARCHAR(20) NOT NULL,
    PermissionID INT NOT NULL,
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID),
    UNIQUE (Role, PermissionID)
);

-- ==========================================
-- AUDIT LOG (Ghi lại các hoạt động)
-- ==========================================

CREATE TABLE AuditLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Action NVARCHAR(100),
    TableName NVARCHAR(50),
    RecordID INT,
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    Timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- ==========================================
-- INSERT DEFAULT PERMISSIONS
-- ==========================================

INSERT INTO Permissions (PermissionName, Description, Module)
VALUES
    (N'VIEW_STUDENTS', N'Xem danh sách học sinh', N'Students'),
    (N'CREATE_STUDENT', N'Tạo học sinh', N'Students'),
    (N'EDIT_STUDENT', N'Sửa thông tin học sinh', N'Students'),
    (N'DELETE_STUDENT', N'Xóa học sinh', N'Students'),
    (N'VIEW_GRADES', N'Xem điểm', N'Grades'),
    (N'INPUT_GRADES', N'Nhập điểm', N'Grades'),
    (N'EDIT_GRADES', N'Sửa điểm', N'Grades'),
    (N'VIEW_REPORTS', N'Xem báo cáo', N'Reports'),
    (N'EXPORT_REPORT', N'Xuất báo cáo', N'Reports'),
    (N'MANAGE_USERS', N'Quản lý user', N'Settings');

-- ==========================================
-- INSERT DEFAULT ROLE-PERMISSIONS
-- ==========================================

-- ADMIN: Toàn quyền
INSERT INTO RolePermissions (Role, PermissionID)
SELECT N'Admin', PermissionID FROM Permissions;

-- TEACHER: Có thể xem/nhập điểm, xem học sinh
INSERT INTO RolePermissions (Role, PermissionID)
SELECT N'Teacher', PermissionID FROM Permissions
WHERE PermissionName IN (N'VIEW_STUDENTS', N'VIEW_GRADES', N'INPUT_GRADES', N'EDIT_GRADES');

-- STUDENT: Chỉ xem điểm của mình
INSERT INTO RolePermissions (Role, PermissionID)
SELECT N'Student', PermissionID FROM Permissions
WHERE PermissionName = N'VIEW_GRADES';
