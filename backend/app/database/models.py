from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    university = Column(String(150), nullable=True)
    year_of_study = Column(String(50), nullable=True)
    role = Column(String(30), default='USER')  # SUPER_ADMIN, ADMIN, RESEARCHER, USER
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessments = relationship('Assessment', back_populates='user', cascade='all, delete-orphan')
    feedbacks = relationship('Feedback', back_populates='user', cascade='all, delete-orphan')

class Assessment(Base):
    __tablename__ = 'assessments'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Section A Inputs
    gender = Column(String(20))
    age = Column(String(20))
    study_year = Column(String(50))
    screen_time = Column(String(50))
    device = Column(String(50))
    blue_light = Column(String(20))
    screen_distance = Column(String(20))
    rule_20_20_20 = Column(String(20))
    dark_room = Column(String(20))
    poor_posture = Column(String(20))
    glasses = Column(String(10))
    continuous_use = Column(String(50))
    
    # Section B Symptoms (Optional Data Collection / Validation)
    blurred_vision = Column(Integer, nullable=True)
    dryness = Column(Integer, nullable=True)
    burning = Column(Integer, nullable=True)
    redness = Column(Integer, nullable=True)
    double_vision = Column(Integer, nullable=True)
    headache = Column(Integer, nullable=True)
    neck_shoulder_pain = Column(Integer, nullable=True)
    self_reported_des = Column(String(10), nullable=True)

    # Model Output
    des_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    contributing_factors = Column(Text) # JSON string
    recommendations = Column(Text)      # JSON string
    model_version = Column(String(50), default='1.0.0')
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='assessments')

class Feedback(Base):
    __tablename__ = 'feedback'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    rating = Column(Integer, nullable=False)
    helpful = Column(String(10), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='feedbacks')

class ModelVersion(Base):
    __tablename__ = 'model_versions'

    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(50), unique=True, nullable=False)
    model_name = Column(String(100), nullable=False)
    mae = Column(Float)
    rmse = Column(Float)
    r2 = Column(Float)
    accuracy = Column(Float)
    dataset_size = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
