from fastapi import HTTPException, Depends, Request
from firebase_admin import auth, credentials, initialize_app
from typing import Optional, List
import os
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase Admin
try:
    # Use service account if available
    if hasattr(settings, 'FIREBASE_SERVICE_ACCOUNT') and settings.FIREBASE_SERVICE_ACCOUNT:
        cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT)
    else:
        # Use default credentials
        cred = credentials.ApplicationDefault()
    
    initialize_app(cred)
except Exception as e:
    logger.warning(f"Firebase Admin initialization failed: {e}")

# Admin email whitelist
ADMIN_EMAILS = [
    "admin@ytsbyai.com",
    "founder@ytsbyai.com", 
    "growth@ytsbyai.com",
    "analytics@ytsbyai.com"
]

# Optional: Load from environment
if os.getenv("ADMIN_EMAILS"):
    ADMIN_EMAILS.extend(os.getenv("ADMIN_EMAILS").split(","))

def verify_admin_token(request: Request) -> dict:
    """Verify Firebase token and check if user is admin"""
    try:
        # Get Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = auth_header.split("Bearer ")[1]
        
        # Verify Firebase token
        decoded_token = auth.verify_id_token(token)
        
        # Check if user email is in admin whitelist
        user_email = decoded_token.get("email")
        if not user_email or user_email not in ADMIN_EMAILS:
            raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
        
        # Check if email is verified
        if not decoded_token.get("email_verified", False):
            raise HTTPException(status_code=403, detail="Email must be verified for admin access.")
        
        return {
            "uid": decoded_token.get("uid"),
            "email": user_email,
            "role": "admin"
        }
        
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token expired")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token revoked")
    except Exception as e:
        logger.error(f"Admin auth error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

def get_admin_user(current_admin: dict = Depends(verify_admin_token)) -> dict:
    """Dependency to get current admin user"""
    return current_admin

def is_admin(email: str) -> bool:
    """Check if email is in admin whitelist"""
    return email in ADMIN_EMAILS

def get_admin_emails() -> List[str]:
    """Get list of admin emails"""
    return ADMIN_EMAILS.copy() 