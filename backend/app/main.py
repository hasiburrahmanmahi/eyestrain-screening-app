import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure app package is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import engine, Base, SessionLocal
from app.database.models import User
from app.auth.auth import hash_password
from app.api.auth_routes import router as auth_router
from app.api.prediction_routes import router as prediction_router
from app.api.admin_routes import router as admin_router
from app.services.prediction_service import prediction_service


# Initialize Database Tables
Base.metadata.create_all(bind=engine)

def seed_super_admin():
    db = SessionLocal()
    try:
        admins = [
            ("help.eyestrain@gmail.com", "EyeStrain123#", "Super Administrator"),
            ("mahi22205101151@diu.edu", "admin123", "Mahi Admin")
        ]
        for super_email, super_pass, full_name in admins:
            admin_user = db.query(User).filter(User.email == super_email).first()
            if not admin_user:
                new_super_admin = User(
                    full_name=full_name,
                    email=super_email,
                    hashed_password=hash_password(super_pass),
                    university="Daffodil International University",
                    year_of_study="Faculty / Admin",
                    role="SUPER_ADMIN",
                    is_admin=True
                )
                db.add(new_super_admin)
                db.commit()
                print(f"[Startup] Super Admin created: {super_email}")
            else:
                admin_user.role = "SUPER_ADMIN"
                admin_user.is_admin = True
                admin_user.hashed_password = hash_password(super_pass)
                db.commit()
                print(f"[Startup] Super Admin verified: {super_email}")
    except Exception as e:
        print(f"[Startup] Error seeding Super Admin: {e}")
    finally:
        db.close()


seed_super_admin()

app = FastAPI(
    title="Digital Eye Strain (DES) Risk Prediction Platform",
    description="Research prototype API for assessing digital eye strain factors among university students.",
    version="1.0.0"
)

# Enable CORS for Web UI and Android APK WebView
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router)
app.include_router(prediction_router)
app.include_router(admin_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Digital Eye Strain Prediction Platform API",
        "version": "1.0.0"
    }

@app.post("/predict")
def predict_direct(input_data: dict):
    return prediction_service.predict(input_data)

# Mount Frontend Static Directory if available
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend'))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

