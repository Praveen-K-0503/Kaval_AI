import os
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

# Secret management
SECRET_KEY = os.getenv("JWT_SECRET", "ksp_secret_operational_key_2026_super_secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Role Hierarchy Definition
ROLES_HIERARCHY = {
    "super_admin": 7,
    "scrb_chief": 6,
    "range_ig": 5,
    "district_sp": 4,
    "sho": 3,
    "analyst": 2,
    "si": 1,
}

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a password using bcrypt."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a JWT access token containing user claims."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes a JWT token and returns claims if valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """FastAPI dependency to extract and verify JWT from request headers."""
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid security token or session expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

class RoleChecker:
    """Role-based access control checking dependency."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)) -> dict:
        user_role = user.get("role")
        if not user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: User role is missing.",
            )
        
        # Check explicit roles or hierarchical permissions
        max_user_rank = ROLES_HIERARCHY.get(user_role, 0)
        required_ranks = [ROLES_HIERARCHY.get(r, 99) for r in self.allowed_roles]
        
        if not any(max_user_rank >= r for r in required_ranks) and user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Insufficient privileges for role '{user_role}'. Allowed roles: {self.allowed_roles}.",
            )
        
        return user
