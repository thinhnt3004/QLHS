"""
API Routes cho Authentication
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import timedelta
from schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from models.user import UserModel
from utils.security import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    """Đăng ký user mới"""
    # Kiểm tra user đã tồn tại
    existing = UserModel.get_by_username(user.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username đã tồn tại")
    
    result = UserModel.create(
        username=user.username,
        email=user.email,
        password=user.password,
        full_name=user.full_name,
        role=user.role
    )
    
    if "error" not in result:
        # Lấy user vừa tạo
        user_data = UserModel.get_by_username(user.username)
        if user_data:
            row = user_data[0]
            return {
                "user_id": row[0],
                "username": row[1],
                "email": row[2],
                "full_name": row[4],
                "role": row[5],
                "status": row[6]
            }
    
    raise HTTPException(status_code=400, detail=result.get("error", "Lỗi tạo user"))

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    """Đăng nhập"""
    user_data = UserModel.get_by_username(credentials.username)
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Username hoặc password sai")
    
    row = user_data[0]
    user_id = row[0]
    username = row[1]
    email = row[2]
    password_hash = row[3]
    full_name = row[4]
    role = row[5]
    status = row[6]
    
    # Kiểm tra mật khẩu
    if not UserModel.verify_password(credentials.password, password_hash):
        raise HTTPException(status_code=401, detail="Username hoặc password sai")
    
    if status != "Active":
        raise HTTPException(status_code=403, detail="User bị khóa")
    
    # Tạo token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": username, "user_id": user_id, "role": role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user_id,
            "username": username,
            "email": email,
            "full_name": full_name,
            "role": role,
            "status": status
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: str = Header(None)):
    """Lấy thông tin user hiện tại"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Không có token")
    
    try:
        token = authorization.split(" ")[1]
        payload = verify_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        
        user_id = payload.get("user_id")
        user_data = UserModel.get_by_id(user_id)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User không tồn tại")
        
        row = user_data[0]
        return {
            "user_id": row[0],
            "username": row[1],
            "email": row[2],
            "full_name": row[3],
            "role": row[4],
            "status": row[5]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
def logout():
    """Đăng xuất (client sẽ xóa token)"""
    return {"message": "Đăng xuất thành công"}
