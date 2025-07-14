from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    uid: Optional[str] = None

class UserCreate(UserBase):
    device_id: Optional[str] = None

class User(UserBase):
    id: str
    subscription_status: str
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    usage_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

class SummaryBase(BaseModel):
    video_id: Optional[str] = None
    video_title: Optional[str] = None
    summary: str
    tone: str
    cta: str
    transcript_length: Optional[int] = None

class SummaryCreate(SummaryBase):
    pass

class Summary(SummaryBase):
    id: str
    user_id: str
    created_at: datetime

class SubscriptionStatus(BaseModel):
    status: str
    trial_end: Optional[datetime] = None
    subscription_end: Optional[datetime] = None
    usage_count: int = 0
    device_id: Optional[str] = None

class TrialToken(BaseModel):
    trial_token: str
    device_id: str
    expires_at: datetime

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

class SuccessResponse(BaseModel):
    message: str
    data: Optional[dict] = None 