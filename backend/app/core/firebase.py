import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.core.config import settings
import os

# Initialize Firebase
def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if already initialized
        firebase_admin.get_app()
        return
    except ValueError:
        pass
    
    # Initialize with service account if available
    if settings.FIREBASE_PRIVATE_KEY:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "client_id": settings.FIREBASE_CLIENT_ID,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": settings.FIREBASE_CLIENT_CERT_URL
        })
        firebase_admin.initialize_app(cred)
    else:
        # Use default credentials (for development)
        firebase_admin.initialize_app()

# Get Firestore client
def get_firestore_client():
    """Get Firestore database client"""
    return firestore.client()

# User management
async def create_user_record(uid: str, email: str, device_id: str = None):
    """Create user record in Firestore"""
    db = get_firestore_client()
    user_data = {
        "uid": uid,
        "email": email,
        "created_at": firestore.SERVER_TIMESTAMP,
        "device_id": device_id,
        "subscription_status": "trial",
        "trial_start": firestore.SERVER_TIMESTAMP,
        "trial_end": firestore.SERVER_TIMESTAMP,
        "usage_count": 0
    }
    
    db.collection("users").document(uid).set(user_data)
    return user_data

async def get_user_record(uid: str):
    """Get user record from Firestore"""
    db = get_firestore_client()
    doc = db.collection("users").document(uid).get()
    return doc.to_dict() if doc.exists else None

async def update_user_subscription(uid: str, subscription_data: dict):
    """Update user subscription status"""
    db = get_firestore_client()
    db.collection("users").document(uid).update({
        "subscription_status": subscription_data.get("status"),
        "stripe_customer_id": subscription_data.get("customer_id"),
        "subscription_id": subscription_data.get("subscription_id"),
        "updated_at": firestore.SERVER_TIMESTAMP
    })

async def save_summary(uid: str, summary_data: dict):
    """Save summary to user's history"""
    db = get_firestore_client()
    summary_data.update({
        "user_id": uid,
        "created_at": firestore.SERVER_TIMESTAMP
    })
    
    db.collection("summaries").add(summary_data)
    
    # Update user usage count
    user_ref = db.collection("users").document(uid)
    user_ref.update({
        "usage_count": firestore.Increment(1),
        "last_used": firestore.SERVER_TIMESTAMP
    })

async def get_user_summaries(uid: str, limit: int = 10):
    """Get user's summary history"""
    db = get_firestore_client()
    summaries = db.collection("summaries").where("user_id", "==", uid).order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
    
    return [{"id": doc.id, **doc.to_dict()} for doc in summaries] 