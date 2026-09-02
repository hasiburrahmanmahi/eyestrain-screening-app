"""
Script to seed fixed Super Admin user and import original training dataset into Supabase.
Requires environment variables:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
"""
import os
import sys
import pandas as pd
from supabase import create_client, Client

SUPER_ADMIN_EMAIL = "help.eyestrain@gmail.com"
SUPER_ADMIN_PASSWORD = "EyeStrain123#"
DATASET_PATH = r"d:\Defense Documents\APK\ml\data\real_research_dataset.csv"

def seed_admin_and_dataset():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_service_key:
        print("[Error] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")
        print("Please export or pass them in your environment before running this script.")
        sys.exit(1)

    print(f"Connecting to Supabase at {supabase_url}...")
    supabase: Client = create_client(supabase_url, supabase_service_key)

    # 1. Create or verify Super Admin user
    print(f"Creating Super Admin account: {SUPER_ADMIN_EMAIL}...")
    try:
        # Check if user already exists
        users_resp = supabase.auth.admin.list_users()
        existing_user = None
        for u in users_resp:
            if u.email.lower() == SUPER_ADMIN_EMAIL.lower():
                existing_user = u
                break
        
        if not existing_user:
            admin_user = supabase.auth.admin.create_user({
                "email": SUPER_ADMIN_EMAIL,
                "password": SUPER_ADMIN_PASSWORD,
                "email_confirm": True,
                "user_metadata": {"role": "super_admin"}
            })
            admin_id = admin_user.user.id
            print(f"[Success] Super Admin created with ID: {admin_id}")
        else:
            admin_id = existing_user.id
            print(f"[Info] Super Admin already exists with ID: {admin_id}")

        # Update profile to super_admin
        supabase.table("profiles").upsert({
            "id": admin_id,
            "email": SUPER_ADMIN_EMAIL,
            "role": "super_admin",
            "is_active": True
        }).execute()
        print("[Success] Profile updated to super_admin.")

    except Exception as e:
        print(f"[Warning/Error] Admin creation step: {e}")

    # 2. Upload dataset CSV to dataset_rows table
    if os.path.exists(DATASET_PATH):
        print(f"Loading dataset CSV from {DATASET_PATH}...")
        df = pd.read_csv(DATASET_PATH)
        df = df.where(pd.notnull(df), None) # convert NaN to None for JSON
        rows = df.to_dict(orient="records")

        print(f"Uploading {len(rows)} rows to 'dataset_rows' table...")
        # Check if table already has rows
        existing_count = supabase.table("dataset_rows").select("id", count="exact").execute()
        if existing_count.count and existing_count.count > 0:
            print(f"[Info] 'dataset_rows' already contains {existing_count.count} rows. Skipping upload.")
        else:
            # Batch upload 100 rows at a time
            batch_size = 100
            for i in range(0, len(rows), batch_size):
                batch = rows[i:i + batch_size]
                supabase.table("dataset_rows").insert(batch).execute()
                print(f"  Uploaded rows {i+1} to {min(i+batch_size, len(rows))}...")
            print("[Success] Training dataset uploaded successfully.")
    else:
        print(f"[Warning] Dataset file not found at {DATASET_PATH}")

if __name__ == "__main__":
    seed_admin_and_dataset()
