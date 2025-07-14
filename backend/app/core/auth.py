from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import firebase_admin
from firebase_admin import auth, credentials
from app.core.config import settings
import hashlib
import json

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

def get_device_id(request, user_agent: str = None, ip: str = None):
    """Generate device ID from IP + User Agent + localStorage fallback"""
    if not ip:
        ip = "unknown"
    if not user_agent:
        user_agent = "unknown"
    
    # Create device fingerprint
    device_string = f"{ip}:{user_agent}"
    device_id = hashlib.sha256(device_string.encode()).hexdigest()
    return device_id

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    # Try JWT first
    payload = verify_token(token)
    if payload:
        return payload
    
    # Try Firebase token
    try:
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "auth_type": "firebase"
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def create_trial_token(device_id: str, user_agent: str = None, ip: str = None):
    """Create trial token for device-based trial"""
    trial_data = {
        "device_id": device_id,
        "user_agent": user_agent,
        "ip": ip,
        "trial_start": datetime.utcnow().isoformat(),
        "trial_end": (datetime.utcnow() + timedelta(days=settings.TRIAL_DAYS)).isoformat(),
        "type": "trial"
    }
    return create_access_token(trial_data, timedelta(days=settings.TRIAL_DAYS))

def is_trial_valid(token_data: dict):
    """Check if trial is still valid"""
    if token_data.get("type") != "trial":
        return False
    
    trial_end = datetime.fromisoformat(token_data["trial_end"])
    return datetime.utcnow() < trial_end 