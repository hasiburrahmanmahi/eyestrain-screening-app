# Digital Eye Strain (DES) Risk Screening App

Full-stack web and installable mobile application that screens university students for Digital Eye Strain risk based on the research project *"Predicting Digital Eye Strain Factors: A Cross-Sectional Study based on Behavioral and Ergonomic Data"* (Daffodil International University).

---

## 🛠️ Tech Stack (100% Free Tier)

- **Frontend**: Expo (React Native + React Native Web) — Single codebase running as a web app (Vercel / Netlify) and installable Android APK / iOS app.
- **Backend / ML Service**: Python FastAPI deployed on Render free web service. Loads pre-trained `.joblib` model and preprocessor.
- **Database & Auth**: Supabase (Postgres + Supabase Auth), free tier.
- **Dataset Storage**: Supabase Postgres `dataset_rows` table / Supabase Storage.

---

## 🚀 Step-by-Step Free Tier Deployment Guide

### 1. Supabase Database & Auth Setup

1. Create a free account and project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Paste and execute the contents of [`database/schema.sql`](./database/schema.sql). This will create:
   - `profiles` table (with `role` column: `'user'` or `'super_admin'`).
   - `predictions` table (with RLS isolating student data).
   - `dataset_rows` table (storing original 982 research rows).
   - `handle_new_user()` Postgres trigger to automatically create profile rows on signup.
   - Row Level Security (RLS) policies.
4. Copy your project **API Credentials** from `Project Settings` -> `API`:
   - `Project URL`
   - `anon public key`
   - `service_role secret key`

---

### 2. Seed Fixed Super Admin & Training Dataset

Run the Python seed script to create the super admin account and upload the 982-row dataset:

```bash
# Set environment variables
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Execute seed script
python scripts/seed_admin_and_dataset.py
```

**Fixed Super Admin Credentials:**
- **Email:** `help.eyestrain@gmail.com`
- **Password:** `EyeStrain123#`
- **Role:** `super_admin`

---

### 3. Deploy FastAPI Backend on Render (Free Web Service)

1. Create a free account on [Render](https://render.com).
2. Click **New +** -> **Web Service** and connect your Git repository.
3. Configure the service parameters:
   - **Name:** `des-eye-strain-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
4. Click **Deploy Web Service**.
5. Once deployed, test your API endpoints:
   - `https://your-render-app.onrender.com/health`
   - `https://your-render-app.onrender.com/docs` (Interactive Swagger UI)

---

### 4. Deploy Frontend Web App (Vercel / Expo Hosting)

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` or set environment variables:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   EXPO_PUBLIC_BACKEND_API_URL=https://your-render-app.onrender.com
   ```

3. Export web bundle for static hosting:
   ```bash
   npm run build:web
   ```

4. Deploy the generated `dist` or `web-build` folder to **Vercel** or **Netlify**:
   - Vercel CLI: `npx vercel`
   - Or push to GitHub and connect repository to Vercel for continuous deployment.

---

### 5. Build Installable Android APK & iOS App (EAS Build)

1. Install Expo Application Services (EAS) CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Configure EAS project:
   ```bash
   eas build:configure
   ```

3. Build standalone Android APK:
   ```bash
   eas build --platform android --profile preview
   ```
   *EAS will compile the APK in the cloud and provide a direct download link to install on Android devices.*

---

## 📋 The 12 Predictor Questions Reference

1. **Gender**: Male / Female
2. **Age**: Number input (e.g. 21)
3. **Current Year of Study**: 1st year / 2nd year / 3rd year / 4th year
4. **Daily Screen Time**: Less than 4 hours / 4 to 7 hours / More than 7 hours
5. **Primary Device**: Smartphone / Laptop / Tablet / Desktop
6. **Blue-light Filter**: Never / Sometimes / Always
7. **Screen Distance (>=20 inches)**: Never / Sometimes / Always
8. **20-20-20 Rule**: Never / Sometimes / Always
9. **Dark Room Usage**: Never / Sometimes / Always
10. **Poor Posture / Lying Down**: Never / Sometimes / Always
11. **Glasses / Contact Lenses**: Yes / No
12. **Continuous Use Without Break**: <30 min / 30–60 min / 1–2 hrs / 2+ hrs

---

## 🛡️ Security & Privacy

- All user authentication passwords are standard bcrypt/argon2 hashed by Supabase Auth — no plaintext passwords are ever stored.
- Row-Level Security (RLS) ensures regular students can only read and write their own assessment history.
- Super Admin accounts are authorized via the database `profiles` role policy.
