-- ==========================================
-- HỆ THỐNG TÍNH TOÁN GPA & XẾP LOẠI
-- ==========================================

-- 1. TRIGGER: Tự động cập nhật GPA khi thêm/sửa điểm
CREATE TRIGGER trg_UpdateGPA_OnGradeChange
ON Grades
AFTER INSERT, UPDATE
AS
BEGIN
    DECLARE @StudentID INT;
    
    SELECT DISTINCT @StudentID = StudentID FROM inserted;
    
    -- Tính GPA
    DECLARE @GPA FLOAT;
    DECLARE @TotalCredits INT;
    
    SELECT 
        @GPA = SUM(g.FinalPoint * sb.Credits) / SUM(sb.Credits),
        @TotalCredits = SUM(sb.Credits)
    FROM Grades g
    JOIN Subjects sb ON g.SubjectID = sb.SubjectID
    WHERE g.StudentID = @StudentID AND g.Status = N'Đạt';
    
    -- Xếp loại dựa vào GPA
    DECLARE @Classification NVARCHAR(20);
    SET @Classification = CASE
        WHEN @GPA >= 3.6 THEN N'Xuất sắc'
        WHEN @GPA >= 3.2 THEN N'Giỏi'
        WHEN @GPA >= 2.5 THEN N'Khá'
        WHEN @GPA >= 2.0 THEN N'Trung bình'
        ELSE N'Yếu'
    END;
    
    -- Upsert vào StudentGPA
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

-- 2. STORED PROCEDURE: Tính GPA cho tất cả học sinh
CREATE PROCEDURE sp_CalculateAllStudentGPA
AS
BEGIN
    DECLARE @StudentID INT;
    DECLARE @GPA FLOAT;
    DECLARE @TotalCredits INT;
    DECLARE @Classification NVARCHAR(20);
    
    -- Cursor duyệt qua tất cả học sinh
    DECLARE student_cursor CURSOR FOR
    SELECT DISTINCT StudentID FROM Students;
    
    OPEN student_cursor;
    FETCH NEXT FROM student_cursor INTO @StudentID;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Tính GPA
        SELECT 
            @GPA = SUM(g.FinalPoint * sb.Credits) / NULLIF(SUM(sb.Credits), 0),
            @TotalCredits = SUM(sb.Credits)
        FROM Grades g
        JOIN Subjects sb ON g.SubjectID = sb.SubjectID
        WHERE g.StudentID = @StudentID AND g.Status = N'Đạt';
        
        -- Xếp loại
        SET @Classification = CASE
            WHEN @GPA >= 3.6 THEN N'Xuất sắc'
            WHEN @GPA >= 3.2 THEN N'Giỏi'
            WHEN @GPA >= 2.5 THEN N'Khá'
            WHEN @GPA >= 2.0 THEN N'Trung bình'
            ELSE N'Yếu'
        END;
        
        -- Cập nhật hoặc chèn
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

-- 3. VIEW: Danh sách học sinh với GPA và xếp loại
CREATE VIEW vw_StudentGPARanking
AS
SELECT 
    ROW_NUMBER() OVER (PARTITION BY c.ClassID ORDER BY sg.GPA DESC) as ClassRanking,
    s.StudentCode,
    s.StudentName,
    c.ClassName,
    COUNT(g.GradeID) as TotalSubjects,
    SUM(CASE WHEN g.Status = N'Đạt' THEN 1 ELSE 0 END) as PassedSubjects,
    sg.GPA,
    sg.Classification,
    sg.UpdatedDate
FROM Students s
JOIN Classes c ON s.ClassID = c.ClassID
LEFT JOIN Grades g ON s.StudentID = g.StudentID
LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
GROUP BY s.StudentID, s.StudentCode, s.StudentName, c.ClassID, c.ClassName, sg.GPA, sg.Classification, sg.UpdatedDate;

-- 4. VIEW: Danh sách học sinh có nguy cơ không đạt
CREATE VIEW vw_AtRiskStudents
AS
SELECT 
    s.StudentCode,
    s.StudentName,
    c.ClassName,
    AVG(g.FinalPoint) as AverageGrade,
    SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) as FailedCount,
    CAST(SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeID) AS DECIMAL(5,2)) as FailureRate
FROM Students s
JOIN Classes c ON s.ClassID = c.ClassID
LEFT JOIN Grades g ON s.StudentID = g.StudentID
GROUP BY s.StudentID, s.StudentCode, s.StudentName, c.ClassID, c.ClassName
HAVING AVG(g.FinalPoint) < 5.0;

-- 5. VIEW: Thống kê xếp loại theo lớp
CREATE VIEW vw_ClassificationStats
AS
SELECT 
    c.ClassName,
    sg.Classification,
    COUNT(sg.StudentID) as StudentCount,
    CAST(COUNT(sg.StudentID) * 100.0 / (SELECT COUNT(*) FROM Students WHERE ClassID = c.ClassID) AS DECIMAL(5,2)) as Percentage
FROM Classes c
LEFT JOIN Students s ON c.ClassID = s.ClassID
LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
GROUP BY c.ClassID, c.ClassName, sg.Classification;

-- ==========================================
-- PROCEDURE: Lấy dữ liệu xếp hạng lớp
-- ==========================================
CREATE PROCEDURE sp_GetClassRanking
    @ClassID INT
AS
BEGIN
    SELECT 
        ROW_NUMBER() OVER (ORDER BY sg.GPA DESC) as Ranking,
        s.StudentCode,
        s.StudentName,
        COUNT(g.GradeID) as TotalSubjects,
        AVG(g.FinalPoint) as AverageGrade,
        sg.GPA,
        sg.Classification
    FROM Students s
    LEFT JOIN Grades g ON s.StudentID = g.StudentID
    LEFT JOIN StudentGPA sg ON s.StudentID = sg.StudentID
    WHERE s.ClassID = @ClassID
    GROUP BY s.StudentID, s.StudentCode, s.StudentName, sg.GPA, sg.Classification
    ORDER BY sg.GPA DESC;
END;

-- ==========================================
-- PROCEDURE: Tìm học sinh có nguy cơ không đạt
-- ==========================================
CREATE PROCEDURE sp_GetAtRiskStudents
    @ClassID INT
AS
BEGIN
    SELECT 
        s.StudentCode,
        s.StudentName,
        COUNT(g.GradeID) as TotalSubjects,
        SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) as FailedCount,
        AVG(g.FinalPoint) as AverageGrade,
        CAST(SUM(CASE WHEN g.FinalPoint < 5.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(g.GradeID) AS DECIMAL(5,2)) as FailureRate
    FROM Students s
    LEFT JOIN Grades g ON s.StudentID = g.StudentID
    WHERE s.ClassID = @ClassID AND g.FinalPoint < 5.0
    GROUP BY s.StudentID, s.StudentCode, s.StudentName
    HAVING AVG(g.FinalPoint) < 5.0
    ORDER BY AVG(g.FinalPoint) ASC;
END;

-- ==========================================
-- TEST PROCEDURE
-- ==========================================
-- Chạy để tính GPA cho tất cả học sinh:
-- EXEC sp_CalculateAllStudentGPA;

-- Lấy xếp hạng lớp:
-- EXEC sp_GetClassRanking @ClassID = 1;

-- Lấy danh sách học sinh có nguy cơ:
-- EXEC sp_GetAtRiskStudents @ClassID = 1;
