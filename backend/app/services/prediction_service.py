import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join(BASE_DIR, 'model', 'des_random_forest_model.joblib'))
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(BASE_DIR, '..', 'des_random_forest_model.joblib')

METADATA_PATH = os.getenv("MODEL_METADATA_PATH", os.path.join(BASE_DIR, '..', 'ml', 'models', 'model_metadata_v1.json'))

class PredictionService:
    def __init__(self):
        self.model = None
        self.metadata = None
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
                self.is_loaded = True
                print(f"[PredictionService] Successfully loaded model from {MODEL_PATH}")
            else:
                print(f"[PredictionService] Model file not found at {MODEL_PATH}.")
        except Exception as e:
            print(f"[PredictionService] Error loading model: {e}")

    def prepare_dataframe(self, raw_input: dict) -> pd.DataFrame:
        gender_raw = str(raw_input.get('gender', 'Male')).strip()
        gender_val = 'Female' if gender_raw.lower() == 'female' else 'Male'

        try:
            age_val = int(raw_input.get('age', 22))
        except (ValueError, TypeError):
            age_val = 22

        y_raw = str(raw_input.get('study_year', '3rd year')).strip()
        year_val = y_raw if y_raw in ['1st year', '2nd year', '3rd year', '4th year', "Master's"] else '3rd year'

        st_raw = str(raw_input.get('screen_time', '4 to 7 hours')).strip()
        if 'less' in st_raw.lower():
            st_val = 'Less than 4 hours'
        elif 'more' in st_raw.lower() or '>7' in st_raw:
            st_val = 'More than 7 hours'
        else:
            st_val = '4 to 7 hours'

        dev_raw = str(raw_input.get('device', 'Laptop')).strip()
        if dev_raw.lower() in ['laptop', 'desktop', 'laptop / desktop']:
            dev_val = 'Laptop / Desktop'
        elif dev_raw.lower() == 'tablet':
            dev_val = 'Tablet'
        else:
            dev_val = 'Smartphone'

        def get_tristate(key, default='Sometimes'):
            val = str(raw_input.get(key, default)).strip().capitalize()
            return val if val in ['Always', 'Never', 'Sometimes'] else default

        blue_light_val = get_tristate('blue_light', 'Sometimes')
        screen_distance_val = get_tristate('screen_distance', 'Sometimes')
        rule_20_val = get_tristate('rule_20_20_20', 'Sometimes')
        dark_room_val = get_tristate('dark_room', 'Sometimes')
        poor_posture_val = get_tristate('poor_posture', 'Sometimes')

        gl_raw = str(raw_input.get('glasses', 'No')).strip().capitalize()
        glasses_val = 'Yes' if gl_raw in ['Yes', 'True', '1'] else 'No'

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

    def generate_recommendations(self, data: dict) -> tuple[list[str], list[str]]:
        factors = []
        recommendations = []

        if data.get('screen_time') in ['More than 7 hours', '4 to 7 hours']:
            factors.append('High daily screen time')
            recommendations.append('Schedule structured 10-minute non-screen breaks for every 50 minutes of continuous screen work.')

        if data.get('continuous_use') in ['More than 60 minutes', '30 - 60 minutes', '30–60 min']:
            factors.append('Prolonged continuous screen viewing')
            recommendations.append('Avoid continuous screen focus exceeding 45 minutes; stretch and focus on distant objects regularly.')

        if data.get('rule_20_20_20') == 'Never':
            factors.append('Inconsistent application of the 20-20-20 rule')
            recommendations.append('Adopt the 20-20-20 rule: Every 20 minutes, look at an object 20 feet away for at least 20 seconds.')

        if data.get('screen_distance') == 'Never':
            factors.append('Close viewing distance (<20 inches)')
            recommendations.append('Maintain an optimal screen viewing distance of at least 20 to 28 inches from your eyes.')

        if data.get('dark_room') == 'Always':
            factors.append('Frequent device usage in dark environment')
            recommendations.append('Ensure adequate ambient room lighting when using digital screens to reduce glare and contrast strain.')

        if data.get('poor_posture') in ['Always', 'Sometimes']:
            factors.append('Poor posture during screen use')
            recommendations.append('Sit upright with feet flat on the floor, keeping your screen just below eye level.')

        if data.get('glasses') == 'No':
            recommendations.append('Consider scheduling an eye exam with an optometrist to check for uncorrected refractive errors.')

        if not factors:
            factors.append('Good overall habits')
            recommendations.append('Maintain your current healthy digital screen routines!')

        return factors, recommendations

    def predict(self, input_data: dict) -> dict:
        df = self.prepare_dataframe(input_data)
        
        if self.model is not None:
            try:
                pred_class = int(self.model.predict(df)[0])
                if hasattr(self.model, 'predict_proba'):
                    proba_arr = self.model.predict_proba(df)[0]
                    probability = float(round(proba_arr[1], 2))
                else:
                    probability = 0.75 if pred_class == 1 else 0.25
            except Exception as e:
                print(f"[PredictionService] Inference error: {e}")
                probability = 0.65
                pred_class = 1
        else:
            probability = 0.65
            pred_class = 1

        des_score = float(round(probability * 14.0, 1))

        if des_score <= 4.0:
            risk_level = "Low"
        elif des_score <= 9.0:
            risk_level = "Moderate"
        else:
            risk_level = "High"

        factors, recommendations = self.generate_recommendations(input_data)

        return {
            'des_score': des_score,
            'risk_level': risk_level,
            'probability': probability,
            'contributing_factors': factors,
            'recommendations': recommendations,
            'model_version': '1.0.0'
        }

prediction_service = PredictionService()
