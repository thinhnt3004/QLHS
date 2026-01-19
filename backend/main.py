"""
FastAPI Server - Hệ thống Quản lý Trường Học & Học Sinh
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes.auth import router as auth_router
from routes.students import router as students_router
from routes.grades import router as grades_router

# Khởi tạo FastAPI
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="API quản lý trường học, học sinh, điểm số và GPA"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký routes
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(grades_router)

# Root endpoint
@app.get("/")
def read_root():
    """Root API"""
    return {
        "status": "success",
        "message": "Hệ thống Quản lý Trường Học & Học Sinh",
        "version": settings.API_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Kiểm tra sức khỏe API"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
