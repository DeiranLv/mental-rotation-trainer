"""
01_export_firebase.py
─────────────────────
Exports raw data from Firestore to CSV files.

Requirements:
  - Firebase Admin SDK service account key (see README)
  - pip install firebase-admin pandas

Usage:
  python scripts/01_export_firebase.py --key path/to/serviceAccountKey.json

Output (written to analysis/data/):
  sessions_raw.csv
  trials_raw.csv
  feedback_raw.csv
"""

import argparse
import sys
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

OUT_DIR = Path(__file__).parent.parent / "data"
OUT_DIR.mkdir(exist_ok=True)


def main(key_path: str) -> None:
    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    print("Exporting sessions ...")
    sessions = [doc.to_dict() | {"doc_id": doc.id} for doc in db.collection("sessions").stream()]
    df_sessions = pd.DataFrame(sessions)
    df_sessions.to_csv(OUT_DIR / "sessions_raw.csv", index=False)
    print(f"  {len(df_sessions)} sessions exported.")

    print("Exporting trials ...")
    trials = [doc.to_dict() | {"doc_id": doc.id} for doc in db.collection("trials").stream()]
    df_trials = pd.DataFrame(trials)
    df_trials.to_csv(OUT_DIR / "trials_raw.csv", index=False)
    print(f"  {len(df_trials)} trials exported.")

    print("Exporting interactiveFeedback ...")
    feedback = [doc.to_dict() | {"doc_id": doc.id} for doc in db.collection("interactiveFeedback").stream()]
    df_fb = pd.DataFrame(feedback)
    df_fb.to_csv(OUT_DIR / "feedback_raw.csv", index=False)
    print(f"  {len(df_fb)} feedback records exported.")

    print(f"\nDone. Files saved to: {OUT_DIR.resolve()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export Firestore collections to CSV.")
    parser.add_argument("--key", required=True, help="Path to Firebase service account JSON key.")
    args = parser.parse_args()
    main(args.key)
