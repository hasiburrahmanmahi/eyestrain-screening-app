from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PredictionInput(BaseModel):
    gender: str = Field(..., example="Male")
    age: str = Field(..., example="22")
    study_year: str = Field(..., example="3rd year")
    screen_time: str = Field(..., example="More than 7 hours")
    device: str = Field(..., example="Laptop")
    blue_light: str = Field(..., example="Sometimes")
    screen_distance: str = Field(..., example="Never")
    rule_20_20_20: str = Field(..., example="Never")
    dark_room: str = Field(..., example="Always")
    poor_posture: str = Field(..., example="Always")
    glasses: str = Field(..., example="No")
    continuous_use: str = Field(..., example="30–60 min")

class PredictionResponse(BaseModel):
    prediction: str # "DES" or "No DES"
    probability: float # e.g. 0.72
    probability_percentage: int # e.g. 72
    risk_band: str # "Low", "Moderate", "High"
    des_score: float # e.g. 10.1
    personalized_feedback: List[str]
    research_note: str
    raw_answers: Dict[str, Any]
