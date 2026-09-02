import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any

MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), '..', 'model', 'des_random_forest_model.joblib'))
PREPROCESSOR_PATH = os.getenv("PREPROCESSOR_PATH", os.path.join(os.path.dirname(__file__), '..', 'model', 'des_preprocessor.joblib'))

class PredictionService:
    def __init__(self):
        self.model = None
        self.load_artifacts()

    def load_artifacts(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
                print(f"[PredictionService] Loaded model pipeline from {MODEL_PATH}")
            else:
                print(f"[PredictionService] Warning: Model file not found at {MODEL_PATH}")
        except Exception as e:
            print(f"[PredictionService] Error loading ML model: {e}")

    def prepare_dataframe(self, raw_input: Dict[str, Any]) -> pd.DataFrame:
        """
        Maps user survey inputs to the exact 12 DataFrame columns expected by the trained pipeline.
        """
        # 1. Gender
        gender_raw = str(raw_input.get('gender', 'Male')).strip()
        gender_val = 'Female' if gender_raw.lower() == 'female' else 'Male'

        # 2. Age
        try:
            age_val = int(raw_input.get('age', 22))
        except (ValueError, TypeError):
            age_val = 22

        # 3. Year of study
        y_raw = str(raw_input.get('study_year', '3rd year')).strip()
        if y_raw in ['1st year', '2nd year', '3rd year', '4th year', "Master's"]:
            year_val = y_raw
        else:
            year_val = '3rd year'

        # 4. Screen time
        st_raw = str(raw_input.get('screen_time', '4 to 7 hours')).strip()
        if 'less' in st_raw.lower():
            st_val = 'Less than 4 hours'
        elif 'more' in st_raw.lower() or '>7' in st_raw:
            st_val = 'More than 7 hours'
        else:
            st_val = '4 to 7 hours'

        # 5. Device
        dev_raw = str(raw_input.get('device', 'Laptop')).strip()
        if dev_raw.lower() in ['laptop', 'desktop', 'laptop / desktop']:
            dev_val = 'Laptop / Desktop'
        elif dev_raw.lower() == 'tablet':
            dev_val = 'Tablet'
        else:
            dev_val = 'Smartphone'

        # Helper for Tri-state choices: Always, Never, Sometimes
        def get_tristate(key, default='Sometimes'):
            val = str(raw_input.get(key, default)).strip().capitalize()
            return val if val in ['Always', 'Never', 'Sometimes'] else default

        blue_light_val = get_tristate('blue_light', 'Sometimes')
        screen_distance_val = get_tristate('screen_distance', 'Sometimes')
        rule_20_val = get_tristate('rule_20_20_20', 'Sometimes')
        dark_room_val = get_tristate('dark_room', 'Sometimes')
        poor_posture_val = get_tristate('poor_posture', 'Sometimes')

        # 11. Glasses
        gl_raw = str(raw_input.get('glasses', 'No')).strip().capitalize()
        glasses_val = 'Yes' if gl_raw in ['Yes', 'True', '1'] else 'No'

        # 12. Continuous use
        cu_raw = str(raw_input.get('continuous_use', '30–60 min')).strip().lower()
        if '<30' in cu_raw or 'less than 30' in cu_raw:
            cu_val = 'Less than 30 minutes'
        elif 'more than 60' in cu_raw or '2+' in cu_raw or '1–2' in cu_raw or '1-2' in cu_raw or '60' in cu_raw:
            cu_val = 'More than 60 minutes'
        else:
            cu_val = '30 - 60 minutes'

        row = {
            '1.Gender': gender_val,
            '2. Age': age_val,
            '3. Current Year of Study?': year_val,
            '4. Average Daily Screen Time?': st_val,
            '5. Which device do you use most frequently?': dev_val,
            '6. Blue Light Filter / Night Mode Usage?': blue_light_val,
            '7. Do you maintain at least 20 inches (one arm distance) from the screen?': screen_distance_val,
            '8. Do you follow the 20-20-20 rule? (Looking 20 feet away for 20 seconds every 20 mins)': rule_20_val,
            '9. Do you use your device in a dark room frequently?': dark_room_val,
            '10. Do you use devices while lying down or in a poor posture?': poor_posture_val,
            '11. Do you wear medical glasses or contact lenses?': glasses_val,
            '12. How long do you usually use a digital screen without taking a break?': cu_val,
        }

        return pd.DataFrame([row])

    def generate_personalized_feedback(self, norm_input: Dict[str, Any], risk_band: str) -> list[str]:
        feedback = []

        # Rule 1: Glasses check (Q11 = No but high risk)
        glasses_val = str(norm_input.get('glasses', '')).strip().capitalize()
        if glasses_val == 'No' and risk_band == 'High':
            feedback.append(
                "Corrective Vision Check: You currently do not wear medical glasses or lenses, but your high risk score indicates potential uncorrected eye strain. We strongly recommend scheduling an eye examination with an optometrist."
            )

        # Rule 2: Posture (Q10 = Sometimes or Always)
        posture_val = str(norm_input.get('poor_posture', '')).strip().capitalize()
        if posture_val in ['Sometimes', 'Always']:
            feedback.append(
                "Ergonomic Posture Tip: Avoid using digital devices while lying down or slouching. Sit upright with your back supported, feet flat on the floor, and monitor at or slightly below eye level."
            )

        # Rule 3: 20-20-20 Rule (Q8 = Never)
        rule20_val = str(norm_input.get('rule_20_20_20', '')).strip().capitalize()
        if rule20_val == 'Never':
            feedback.append(
                "Adopt the 20-20-20 Rule: Take a break every 20 minutes by looking at an object 20 feet away for at least 20 seconds. This relaxes your focus mechanism and reduces eye fatigue."
            )

        # Rule 4: Screen Distance (Q7 = Never)
        dist_val = str(norm_input.get('screen_distance', '')).strip().capitalize()
        if dist_val == 'Never':
            feedback.append(
                "Screen Distance Guidance: Keep screens at least 20 inches (approximately one arm's length) away from your eyes to reduce visual strain and focus effort."
            )

        # Rule 5: Dark Room Usage (Q9 = Always)
        dark_val = str(norm_input.get('dark_room', '')).strip().capitalize()
        if dark_val == 'Always':
            feedback.append(
                "Lighting Environment: Avoid using digital screens in complete darkness. Maintain soft ambient room lighting to minimize harsh screen contrast and glare."
            )

        if len(feedback) < 2:
            feedback.append(
                "Hydration & Blinking: Remind yourself to blink regularly while using screens, and keep artificial tear eye drops handy if you experience dryness."
            )

        return feedback

    def predict(self, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        df = self.prepare_dataframe(raw_input)

        if self.model is not None:
            # Model prediction (0 = No DES, 1 = DES)
            pred_class = int(self.model.predict(df)[0])
            if hasattr(self.model, 'predict_proba'):
                proba_arr = self.model.predict_proba(df)[0]
                # Index 1 is probability of DES
                probability = float(round(proba_arr[1], 2))
            else:
                probability = 0.75 if pred_class == 1 else 0.25
        else:
            pred_class = 1
            probability = 0.65

        prob_percent = int(round(probability * 100))
        prediction = "DES" if pred_class == 1 else "No DES"

        # Risk Band
        if probability < 0.35:
            risk_band = "Low"
        elif probability <= 0.65:
            risk_band = "Moderate"
        else:
            risk_band = "High"

        # Equivalent score out of 14 for display metric compatibility
        des_score = round(probability * 14.0, 1)

        feedback = self.generate_personalized_feedback(raw_input, risk_band)

        research_note = (
            "Gender and glasses/contacts use were identified as the two strongest risk factors "
            "in the underlying research study (982 university students). This screening result "
            "is an informative indicator, not a clinical medical diagnosis."
        )

        return {
            "prediction": prediction,
            "probability": probability,
            "probability_percentage": prob_percent,
            "risk_band": risk_band,
            "des_score": des_score,
            "personalized_feedback": feedback,
            "research_note": research_note,
            "raw_answers": raw_input
        }

prediction_service = PredictionService()
