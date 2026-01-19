# School Management System - Hệ thống Quản lý Trường Học

## 📋 Giới thiệu
Hệ thống quản lý trường học và học sinh hoàn chỉnh với các tính năng:
- **Quản lý Học sinh**: CRUD, lọc theo lớp
- **Quản lý Điểm số**: Nhập, cập nhật điểm với công thức tính bộ môn
- **Tính toán GPA**: Tự động tính GPA dựa trên điểm các môn học
- **Xếp loại học tập**: Xuất sắc, Giỏi, Khá, Trung bình, Yếu
- **Xếp hạng lớp**: Ranking học sinh theo GPA
- **Phát hiện nguy cơ**: Cảnh báo học sinh có nguy cơ không đạt

---

## 🏗️ Kiến trúc

### Backend (Python + FastAPI)
```
backend/
├── main.py                 # FastAPI server
├── config.py              # Cấu hình ứng dụng
├── database.py            # Kết nối SQL Server
├── requirements.txt       # Python dependencies
├── models/
│   ├── student.py         # Model học sinh (CRUD)
│   └── grade.py           # Model điểm
├── routes/
│   ├── students.py        # API endpoint học sinh
│   └── grades.py          # API endpoint điểm
├── schemas/
│   ├── student.py         # Pydantic schema
│   └── grade.py           # Pydantic schema
└── utils/
    └── gpa_calculator.py  # Tính GPA & xếp loại
```

### Frontend (Next.js + TypeScript + Tailwind CSS)
```
frontend/
├── app/
│   ├── page.tsx           # Trang chủ
│   ├── layout.tsx         # Layout chung
│   ├── students/          # Quản lý học sinh
│   ├── grades/            # Quản lý điểm
│   └── ranking/           # Xếp hạng & GPA
├── lib/
│   └── api.ts             # API client
├── tailwind.config.ts     # Tailwind config
├── tsconfig.json          # TypeScript config
└── package.json
```

### Database (SQL Server)
- 10 bảng chính
- Triggers tự động cập nhật GPA
- Stored Procedures tính toán
- Views để truy vấn dữ liệu

---

## 🚀 Cài đặt & Chạy

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Cấu hình file .env
cp .env.example .env
# Sửa SQL Server connection string trong .env

# Chạy FastAPI server
python main.py
# Server chạy tại http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Cấu hình API endpoint trong .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Chạy Next.js dev server
npm run dev
# Client chạy tại http://localhost:3000
```

### 3. Database Setup
```sql
-- Chạy script tạo bảng từ schema SQL Server
-- Chạy gpa_calculation.sql để tạo triggers, procedures, views
EXEC sp_CalculateAllStudentGPA;
```

---

## 📊 Công thức Tính GPA

**Điểm bộ môn:**
```
FinalPoint = (ContinuousGrade × 0.2) + (MidtermGrade × 0.3) + (FinalGrade × 0.5)
```

**GPA:**
```
GPA = Σ(FinalPoint × Credits) / Σ Credits
```

**Xếp loại:**
- **Xuất sắc**: GPA ≥ 3.6
- **Giỏi**: 3.2 ≤ GPA < 3.6
- **Khá**: 2.5 ≤ GPA < 3.2
- **Trung bình**: 2.0 ≤ GPA < 2.5
- **Yếu**: GPA < 2.0

---

## 📡 API Endpoints

### Students
- `GET /students/` - Lấy danh sách học sinh
- `GET /students/{id}` - Lấy chi tiết học sinh
- `GET /students/class/{classId}` - Lấy học sinh theo lớp
- `POST /students/` - Tạo học sinh mới
- `PUT /students/{id}` - Cập nhật học sinh
- `DELETE /students/{id}` - Xóa học sinh

### Grades
- `GET /grades/student/{studentId}` - Lấy điểm của học sinh
- `GET /grades/class/{classId}/subject/{subjectId}` - Bảng điểm lớp
- `POST /grades/` - Nhập điểm mới
- `PUT /grades/{id}` - Cập nhật điểm
- `GET /grades/ranking/class/{classId}` - Xếp hạng lớp

---

## 🎯 Tính năng chính

### 1. Quản lý Học sinh
- Thêm/sửa/xóa học sinh
- Tìm kiếm theo tên/mã
- Xem danh sách học sinh theo lớp

### 2. Quản lý Điểm
- Nhập điểm: Quá trình (QT), Giữa kỳ (GK), Cuối kỳ (CK)
- Tự động tính điểm bộ môn
- Cập nhật điểm

### 3. Tính Toán GPA
- Tự động cập nhật GPA khi nhập/sửa điểm (Trigger)
- Xếp loại học sinh tự động
- Xem GPA và xếp loại

### 4. Xếp Hạng
- Xếp hạng học sinh trong lớp
- Biểu đồ phân bố xếp loại
- Thống kê GPA trung bình

### 5. Cảnh báo Nguy cơ
- Phát hiện học sinh có nguy cơ không đạt
- Liệt kê các môn học có điểm thấp
- Tỷ lệ các môn không đạt

---

## 🔒 Bảo mật & Best Practices

- ✅ Unicode (N'...') cho dữ liệu Tiếng Việt
- ✅ Prepared statements chống SQL injection
- ✅ Soft delete (không xóa vật lý)
- ✅ Audit trail (ghi log thay đổi)
- ✅ CORS configured
- ✅ Input validation (Pydantic schemas)

---

## 📝 Lưu ý

1. **Database**: Cần SQL Server 2019+ với ODBC Driver 17
2. **Environment**: Sửa file `.env` với connection string của bạn
3. **Migrations**: Chạy script SQL để tạo schema
4. **API Testing**: Sử dụng Swagger UI tại `http://localhost:8000/docs`

---

## 📞 Hỗ trợ

Liên hệ với team kỹ thuật để báo cáo lỗi hoặc yêu cầu tính năng mới.

---

**Made with ❤️ by Data Architect Team**
