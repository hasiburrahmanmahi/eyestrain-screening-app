import os
import json
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.database.models import User, Assessment, Feedback
from app.auth.auth import get_current_user, hash_password
from app.schemas.schemas import AdminCreateUser, UserResponse
from app.services.prediction_service import METADATA_PATH

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

def require_admin(current_user: User = Depends(get_current_user)):
    if not (current_user.is_admin or current_user.role in ['SUPER_ADMIN', 'ADMIN', 'RESEARCHER']):
        raise HTTPException(status_code=403, detail="Administrative authorization required.")
    return current_user

def require_super_admin(current_user: User = Depends(get_current_user)):
    if not (current_user.role == 'SUPER_ADMIN' or current_user.email == 'help.eyestrain@gmail.com'):
        raise HTTPException(status_code=403, detail="Super Admin authorization required.")
    return current_user

@router.post("/create-user", response_model=UserResponse)
def create_staff_user(
    data: AdminCreateUser,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")

    assigned_role = data.role.upper()
    if assigned_role not in ['ADMIN', 'RESEARCHER', 'USER', 'SUPER_ADMIN']:
        assigned_role = 'ADMIN'

    # Only Super Admin can assign SUPER_ADMIN role
    if assigned_role == 'SUPER_ADMIN' and admin.email != 'help.eyestrain@gmail.com':
        raise HTTPException(status_code=403, detail="Only the Super Admin can create another Super Admin.")

    is_adm = True if assigned_role in ['SUPER_ADMIN', 'ADMIN'] else False

    new_user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        university=data.university or "Daffodil International University",
        year_of_study=data.year_of_study or "Staff",
        role=assigned_role,
        is_admin=is_adm
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/users")
def list_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    out = []
    for u in users:
        out.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role or "USER",
            "university": u.university,
            "year_of_study": u.year_of_study,
            "created_at": u.created_at
        })
    return out

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: dict,
    super_admin: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    new_role = role_data.get("role", "USER").upper()
    target_user.role = new_role
    target_user.is_admin = True if new_role in ['SUPER_ADMIN', 'ADMIN'] else False
    db.commit()
    db.refresh(target_user)
    return {"message": f"Updated role for {target_user.email} to {new_role}"}

@router.get("/statistics")
def get_admin_statistics(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_assessments = db.query(Assessment).count()
    
    avg_score_res = db.query(func.avg(Assessment.des_score)).scalar()
    avg_score = round(float(avg_score_res), 2) if avg_score_res else 0.0

    low_count = db.query(Assessment).filter(Assessment.risk_level == "Low").count()
    mod_count = db.query(Assessment).filter(Assessment.risk_level == "Moderate").count()
    high_count = db.query(Assessment).filter(Assessment.risk_level == "High").count()

    # Screen time distribution
    screen_time_counts = {
        "Less than 4 hours": db.query(Assessment).filter(Assessment.screen_time == "Less than 4 hours").count(),
        "4 to 7 hours": db.query(Assessment).filter(Assessment.screen_time == "4 to 7 hours").count(),
        "More than 7 hours": db.query(Assessment).filter(Assessment.screen_time == "More than 7 hours").count(),
    }

    # Device distribution
    device_counts = {
        "Smartphone": db.query(Assessment).filter(Assessment.device == "Smartphone").count(),
        "Laptop / Desktop": db.query(Assessment).filter(Assessment.device == "Laptop / Desktop").count(),
        "Tablet": db.query(Assessment).filter(Assessment.device == "Tablet").count(),
    }

    return {
        "total_users": total_users,
        "total_assessments": total_assessments,
        "average_des_score": avg_score,
        "risk_distribution": {
            "Low": low_count,
            "Moderate": mod_count,
            "High": high_count
        },
        "screen_time_distribution": screen_time_counts,
        "device_distribution": device_counts
    }

@router.get("/model-performance")
def get_model_performance(admin: User = Depends(require_admin)):
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, 'r') as f:
            return json.load(f)
    return {
        "model_name": "Demo Baseline Model",
        "version": "1.0.0 (Demo)",
        "is_demo_data": True,
        "evaluation_metrics": {
            "MAE": 1.57,
            "RMSE": 1.93,
            "R2": 0.25,
            "Accuracy": 0.74,
            "F1_Score": 0.73
        }
    }

@router.get("/feedback")
def get_all_feedback(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).all()
    out = []
    for fb in feedbacks:
        user_name = fb.user.full_name if fb.user else "Anonymous"
        out.append({
            "id": fb.id,
            "user_name": user_name,
            "rating": fb.rating,
            "helpful": fb.helpful,
            "comment": fb.comment,
            "created_at": fb.created_at
        })
    return out

@router.post("/import-dataset")
async def import_research_dataset(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    filename = file.filename.lower()
    if not (filename.endswith('.csv') or filename.endswith('.xlsx') or filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV or Excel (.xlsx) file.")

    contents = await file.read()
    temp_save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'data', f'uploaded_{file.filename}'))
    
    with open(temp_save_path, 'wb') as f:
        f.write(contents)

    # Read uploaded file
    try:
        if filename.endswith('.csv'):
            df_raw = pd.read_csv(temp_save_path)
        else:
            df_raw = pd.read_excel(temp_save_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Column Mapping Dictionary for Google Form export
    standard_columns = [
        'gender', 'age', 'study_year', 'screen_time', 'device',
        'blue_light', 'screen_distance', 'rule_20_20_20', 'dark_room',
        'poor_posture', 'glasses', 'continuous_use',
        'blurred_vision', 'dryness', 'burning', 'redness',
        'double_vision', 'headache', 'neck_shoulder_pain', 'self_reported_des'
    ]

    mapped_df = pd.DataFrame()

    # Map by positional index if 20 or 21 columns (ignoring timestamp at index 0)
    if len(df_raw.columns) >= 20:
        col_list = list(df_raw.columns)
        start_idx = 1 if 'timestamp' in str(col_list[0]).lower() else 0
        
        for idx, std_col in enumerate(standard_columns):
            if (start_idx + idx) < len(col_list):
                mapped_df[std_col] = df_raw[col_list[start_idx + idx]]

    mapped_df['is_demo_data'] = False
    
    # Clean values
    mapped_df['gender'] = mapped_df['gender'].astype(str).str.strip()
    mapped_df['age'] = mapped_df['age'].astype(str).str.strip().str.replace('.0', '', regex=False)
    
    clean_csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml', 'data', 'real_research_dataset.csv'))
    mapped_df.to_csv(clean_csv_path, index=False)

    # Trigger ML Retraining
    try:
        from ml.scripts.train import train_and_evaluate
        metadata = train_and_evaluate(data_path=clean_csv_path)
        retrain_msg = f" Model successfully retrained on real dataset! Deployed Model: {metadata['model_name']} (Accuracy: {metadata['evaluation_metrics']['Accuracy']*100:.1f}%, MAE: {metadata['evaluation_metrics']['MAE']})."
    except Exception as e:
        retrain_msg = f" Dataset saved, but retraining failed: {str(e)}"

    return {
        "status": "success",
        "message": f"Successfully imported {len(mapped_df)} real survey records from '{file.filename}'.{retrain_msg}"
    }
