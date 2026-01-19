-- ==========================================
-- HỆ THỐNG TÍNH TOÁN GPA & XẾP LOẠI
-- ==========================================

USE SchoolManagement;
GO

-- 1. TRIGGER: Tự động cập nhật GPA khi thêm/sửa điểm
CREATE OR ALTER TRIGGER trg_UpdateGPA_OnGradeChange
ON Grades
AFTER INSERT, UPDATE
AS
BEGIN
    DECLARE @StudentID INT;
    DECLARE @GPA FLOAT;
    DECLARE @TotalCredits INT;
    DECLARE @Classification NVARCHAR(20);
    
    SELECT DISTINCT @StudentID = StudentID FROM inserted;
    
    SELECT 
        @GPA = SUM(g.FinalPoint * sb.Credits) / NULLIF(SUM(sb.Credits), 0),
        @TotalCredits = SUM(sb.Credits)
    FROM Grades g
    JOIN Subjects sb ON g.SubjectID = sb.SubjectID
    WHERE g.StudentID = @StudentID AND g.Status = N'Đạt';
    
    SET @Classification = CASE
        WHEN @GPA >= 3.6 THEN N'Xuất sắc'
        WHEN @GPA >= 3.2 THEN N'Giỏi'
        WHEN @GPA >= 2.5 THEN N'Khá'
        WHEN @GPA >= 2.0 THEN N'Trung bình'
        ELSE N'Yếu'
    END;
    
    IF EXISTS (SELECT 1 FROM StudentGPA WHERE StudentID = @StudentID)
    BEGIN
        UPDATE StudentGPA
        SET GPA = ISNULL(@GPA, 0),
            TotalCredits = ISNULL(@TotalCredits, 0),
            Classification = @Classification,
            UpdatedDate = GETDATE()
        WHERE StudentID = @StudentID;
    END
    ELSE
    BEGIN
        INSERT INTO StudentGPA (StudentID, TotalCredits, TotalGradePoints, GPA, Classification)
        VALUES (@StudentID, ISNULL(@TotalCredits, 0), ISNULL(@GPA * @TotalCredits, 0), ISNULL(@GPA, 0), @Classification);
    END
END;
GO

-- 2. STORED PROCEDURE: Tính GPA cho tất cả học sinh
CREATE OR ALTER PROCEDURE sp_CalculateAllStudentGPA
AS
BEGIN
    DECLARE @StudentID INT;
    DECLARE @GPA FLOAT;
    DECLARE @TotalCredits INT;
    DECLARE @Classification NVARCHAR(20);
    
    DECLARE student_cursor CURSOR FOR
    SELECT DISTINCT StudentID FROM Students;
    
    OPEN student_cursor;
    FETCH NEXT FROM student_cursor INTO @StudentID;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT 
            @GPA = SUM(g.FinalPoint * sb.Credits) / NULLIF(SUM(sb.Credits), 0),
            @TotalCredits = SUM(sb.Credits)
        FROM Grades g
        JOIN Subjects sb ON g.SubjectID = sb.SubjectID
        WHERE g.StudentID = @StudentID AND g.Status = N'Đạt';
        
        SET @Classification = CASE
            WHEN @GPA >= 3.6 THEN N'Xuất sắc'
            WHEN @GPA >= 3.2 THEN N'Giỏi'
            WHEN @GPA >= 2.5 THEN N'Khá'
            WHEN @GPA >= 2.0 THEN N'Trung bình'
            ELSE N'Yếu'
        END;
        
        IF EXISTS (SELECT 1 FROM StudentGPA WHERE StudentID = @StudentID)
        BEGIN
            UPDATE StudentGPA
            SET GPA = ISNULL(@GPA, 0),
                TotalCredits = ISNULL(@TotalCredits, 0),
                Classification = @Classification,
                UpdatedDate = GETDATE()
            WHERE StudentID = @StudentID;
        END
        ELSE
        BEGIN
            INSERT INTO StudentGPA (StudentID, TotalCredits, TotalGradePoints, GPA, Classification)
            VALUES (@StudentID, ISNULL(@TotalCredits, 0), ISNULL(@GPA * @TotalCredits, 0), ISNULL(@GPA, 0), @Classification);
        END
        
        FETCH NEXT FROM student_cursor INTO @StudentID;
    END
    
    CLOSE student_cursor;
    DEALLOCATE student_cursor;
    
    PRINT N'Cập nhật GPA cho tất cả học sinh thành công!';
END;
GO

-- 3. VIEW: Danh sách học sinh với GPA và xếp loại
CREATE OR ALTER VIEW vw_StudentGPARanking
AS
SELECT 
    ROW_NUMBER() OVER (PARTITION BY c.ClassID ORDER BY sg.GPA DESC) as ClassRanking,
    s.StudentCode,
    u.FullName as StudentName,
    c.ClassName,
    COUNT(g.GradeID) as TotalSubjects,
    SUM(CASE WHEN g.Status = N'Đạt' THEN 1 ELSE 0 END) as PassedSubjects,
    sg.GPA,
    sg.Classification,
    sg.UpdatedDate
FROM Students s
JOIN Users u ON s.StudentID = u.UserID
JOIN Classes c ON s.ClassID = c.ClassID
LEFT JOIN Grades g ON s.StudentID = g.StudentID
LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
GROUP BY s.StudentID, s.StudentCode, u.FullName, c.ClassID, c.ClassName, sg.GPA, sg.Classification, sg.UpdatedDate;
GO

-- 4. VIEW: Danh sách học sinh có nguy cơ không đạt
CREATE OR ALTER VIEW vw_AtRiskStudents
AS
SELECT 
    s.StudentCode,
    u.FullName as StudentName,
    c.ClassName,
    AVG(g.FinalPoint) as AverageGrade,
    SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) as FailedCount,
    CAST(SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(g.GradeID), 0) AS DECIMAL(5,2)) as FailureRate
FROM Students s
JOIN Users u ON s.StudentID = u.UserID
JOIN Classes c ON s.ClassID = c.ClassID
LEFT JOIN Grades g ON s.StudentID = g.StudentID
GROUP BY s.StudentID, s.StudentCode, u.FullName, c.ClassID, c.ClassName
HAVING AVG(g.FinalPoint) < 5.0;
GO

-- 5. VIEW: Thống kê xếp loại theo lớp
CREATE OR ALTER VIEW vw_ClassificationStats
AS
SELECT 
    c.ClassName,
    sg.Classification,
    COUNT(sg.StudentID) as StudentCount,
    CAST(COUNT(sg.StudentID) * 100.0 / NULLIF((SELECT COUNT(*) FROM Students WHERE ClassID = c.ClassID), 0) AS DECIMAL(5,2)) as Percentage
FROM Classes c
LEFT JOIN Students s ON c.ClassID = s.ClassID
LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
GROUP BY c.ClassID, c.ClassName, sg.Classification;
GO

-- 6. PROCEDURE: Lấy xếp hạng lớp
CREATE OR ALTER PROCEDURE sp_GetClassRanking
    @ClassID INT
AS
BEGIN
    SELECT 
        ROW_NUMBER() OVER (ORDER BY sg.GPA DESC) as Ranking,
        s.StudentCode,
        u.FullName as StudentName,
        COUNT(g.GradeID) as TotalSubjects,
        AVG(g.FinalPoint) as AverageGrade,
        sg.GPA,
        sg.Classification
    FROM Students s
    JOIN Users u ON s.StudentID = u.UserID
    LEFT JOIN Grades g ON s.StudentID = g.StudentID
    LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
    WHERE s.ClassID = @ClassID
    GROUP BY s.StudentID, s.StudentCode, u.FullName, sg.GPA, sg.Classification
    ORDER BY sg.GPA DESC;
END;
GO

-- 7. PROCEDURE: Tìm học sinh có nguy cơ không đạt
CREATE OR ALTER PROCEDURE sp_GetAtRiskStudents
    @ClassID INT
AS
BEGIN
    SELECT 
        s.StudentCode,
        u.FullName as StudentName,
        COUNT(g.GradeID) as TotalSubjects,
        SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) as FailedCount,
        AVG(g.FinalPoint) as AverageGrade,
        CAST(SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(g.GradeID), 0) AS DECIMAL(5,2)) as FailureRate
    FROM Students s
    JOIN Users u ON s.StudentID = u.UserID
    LEFT JOIN Grades g ON s.StudentID = g.StudentID
    WHERE s.ClassID = @ClassID AND g.FinalPoint < 5.0
    GROUP BY s.StudentID, s.StudentCode, u.FullName
    HAVING AVG(g.FinalPoint) < 5.0
    ORDER BY AVG(g.FinalPoint) ASC;
END;
GO

PRINT N'GPA calculation system created successfully!';
