from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    university: Optional[str] = None
    year_of_study: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    university: Optional[str] = None
    year_of_study: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    university: Optional[str] = None
    year_of_study: Optional[str] = None
    role: str = "USER"
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminCreateUser(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "ADMIN"
    university: Optional[str] = None
    year_of_study: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AssessmentInput(BaseModel):
    gender: str
    age: str
    study_year: str
    screen_time: str
    device: str
    blue_light: str
    screen_distance: str
    rule_20_20_20: str
    dark_room: str
    poor_posture: str
    glasses: str
    continuous_use: str
    
    # Optional Section B fields
    blurred_vision: Optional[int] = None
    dryness: Optional[int] = None
    burning: Optional[int] = None
    redness: Optional[int] = None
    double_vision: Optional[int] = None
    headache: Optional[int] = None
    neck_shoulder_pain: Optional[int] = None
    self_reported_des: Optional[str] = None

class AssessmentResponse(BaseModel):
    id: int
    des_score: float
    risk_level: str
    contributing_factors: List[str]
    recommendations: List[str]
    model_version: str
    created_at: datetime

    model_config = {
        "from_attributes": True,
        "protected_namespaces": ()
    }

class FeedbackInput(BaseModel):
    rating: int
    helpful: str
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    rating: int
    helpful: str
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
