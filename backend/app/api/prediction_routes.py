import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.connection import get_db
from app.database.models import User, Assessment, Feedback
from app.schemas.schemas import AssessmentInput, AssessmentResponse, FeedbackInput, FeedbackResponse
from app.auth.auth import get_current_user, get_optional_current_user
from app.services.prediction_service import prediction_service

router = APIRouter(prefix="/api/prediction", tags=["Prediction & Assessment"])

@router.post("/predict", response_model=AssessmentResponse)
def predict_eye_strain(
    input_data: AssessmentInput,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    raw_dict = input_data.model_dump()
    result = prediction_service.predict(raw_dict)

    user_id = current_user.id if current_user else 1

    assessment = Assessment(
        user_id=user_id,
        gender=input_data.gender,
        age=input_data.age,
        study_year=input_data.study_year,
        screen_time=input_data.screen_time,
        device=input_data.device,
        blue_light=input_data.blue_light,
        screen_distance=input_data.screen_distance,
        rule_20_20_20=input_data.rule_20_20_20,
        dark_room=input_data.dark_room,
        poor_posture=input_data.poor_posture,
        glasses=input_data.glasses,
        continuous_use=input_data.continuous_use,
        blurred_vision=input_data.blurred_vision,
        dryness=input_data.dryness,
        burning=input_data.burning,
        redness=input_data.redness,
        double_vision=input_data.double_vision,
        headache=input_data.headache,
        neck_shoulder_pain=input_data.neck_shoulder_pain,
        self_reported_des=input_data.self_reported_des,
        des_score=result['des_score'],
        risk_level=result['risk_level'],
        contributing_factors=json.dumps(result['contributing_factors']),
        recommendations=json.dumps(result['recommendations']),
        model_version=result['model_version']
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)


    return AssessmentResponse(
        id=assessment.id,
        des_score=assessment.des_score,
        risk_level=assessment.risk_level,
        contributing_factors=json.loads(assessment.contributing_factors),
        recommendations=json.loads(assessment.recommendations),
        model_version=assessment.model_version,
        created_at=assessment.created_at
    )

@router.get("/history", response_model=List[AssessmentResponse])
def get_prediction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).order_by(Assessment.created_at.desc()).all()
    
    output = []
    for a in assessments:
        output.append(AssessmentResponse(
            id=a.id,
            des_score=a.des_score,
            risk_level=a.risk_level,
            contributing_factors=json.loads(a.contributing_factors) if a.contributing_factors else [],
            recommendations=json.loads(a.recommendations) if a.recommendations else [],
            model_version=a.model_version,
            created_at=a.created_at
        ))
    return output

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_single_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    a = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assessment record not found.")

    return AssessmentResponse(
        id=a.id,
        des_score=a.des_score,
        risk_level=a.risk_level,
        contributing_factors=json.loads(a.contributing_factors) if a.contributing_factors else [],
        recommendations=json.loads(a.recommendations) if a.recommendations else [],
        model_version=a.model_version,
        created_at=a.created_at
    )

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    fb_input: FeedbackInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fb = Feedback(
        user_id=current_user.id,
        rating=fb_input.rating,
        helpful=fb_input.helpful,
        comment=fb_input.comment
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb
