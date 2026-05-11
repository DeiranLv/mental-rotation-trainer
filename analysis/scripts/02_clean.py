"""
02_clean.py
───────────
Loads raw CSVs, merges QuestionPro survey data, applies exclusion criteria,
and writes clean analysis-ready files.

Input  (analysis/data/):
  sessions_raw.csv      — from 01_export_firebase.py
  trials_raw.csv        — from 01_export_firebase.py
  questionpro_raw.csv   — downloaded manually from QuestionPro as CSV

Output (analysis/data/):
  sessions_clean.csv
  trials_clean.csv
  participants.csv      — one row per participant (merged platform + survey)

Usage:
  python scripts/02_clean.py

Exclusion criteria applied:
  1. Sessions before DATA_COLLECTION_START (test/development data)
  2. Test / researcher sessions (EXCLUDE_UIDS list below)
  3. Incomplete sessions (totalTrials < 20)
  4. Participants with experiment-mode accuracy < 0.55 (chance level)
  5. Outlier trials (isOutlier == True) flagged — NOT dropped, handled per analysis
"""

import re
from pathlib import Path
import pandas as pd

DATA_DIR = Path(__file__).parent.parent / "data"
RESULTS_DIR = Path(__file__).parent.parent / "results" / "tables"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# ── Data collection start date — sessions BEFORE this date are test data ────
# Formal data collection began on 2026-05-05. All sessions before this
# date are development/test runs and must be excluded regardless of UID.
DATA_COLLECTION_START = "2026-05-05"

# ── Add your own Firebase UIDs here to exclude test/researcher sessions ──────
EXCLUDE_UIDS: list[str] = [
    # e.g. "abcdef1234567890abcdef1234567890"
]

CHANCE_ACCURACY = 0.55   # participants below this threshold are excluded
MIN_TRIALS      = 20


def _load_qp(path: Path) -> pd.DataFrame:
    """Parse QuestionPro CSV export (3 metadata rows, then header, then data).
    Use the 'codes' export (Display Answer Codes/Index) so values are numeric.
    Rename to short analysis column names, drop PII and item-level MRT columns.
    """
    # QuestionPro adds 3 metadata rows before the real header
    df = pd.read_csv(path, skiprows=3, dtype=str)

    # ── Filter to completed responses before anything else ───────────────────
    if "Response Status" in df.columns:
        df = df[df["Response Status"] == "Completed"].copy()

    # ── Helper: find first column containing a substring (case-insensitive) ──
    def col(sub: str) -> str | None:
        hits = [c for c in df.columns if sub.lower() in c.lower()]
        return hits[0] if hits else None

    # ── Rename key columns ───────────────────────────────────────────────────
    rename = {}
    if "userid" in df.columns:               rename["userid"]      = "userId"
    if "Rezultats" in df.columns:            rename["Rezultats"]   = "qp_mrt_score"
    if "Dzimums" in df.columns:              rename["Dzimums"]     = "qp_gender"
    for sub, name in [
        ("vecuma grupu",          "qp_age_group"),
        ("izglītību",             "qp_education"),
        ("studiju vai darba jomu", "qp_field"),
        ("TELPISK",               "qp_spatial_rating"),
        ("3D videospēles",        "qp_gaming_freq"),
        ("3D modelēšanu",          "qp_3d_experience"),
        ("grūti Jums šķita",       "qp_difficulty"),
        ("noguris pēc",            "qp_fatigue"),
        ("stratēģiju",             "qp_strategy"),
    ]:
        c = col(sub)
        if c and c not in rename:
            rename[c] = name
    df = df.rename(columns=rename)

    # ── Drop PII columns ─────────────────────────────────────────────────────
    pii = ["email", "ip address", "ip_address", "country code",
           "dalībnieka identifikators", "region"]
    df = df.drop(columns=[c for c in df.columns
                           if any(p in c.lower() for p in pii)],
                 errors="ignore")

    # ── Drop MRT item-level columns (numeric codes like 1_0, 1_0_R …) ────────
    mrt_items = [c for c in df.columns if re.match(r'^\d+_\d+', c)]
    df = df.drop(columns=mrt_items)

    # ── Drop QuestionPro metadata and instruction-text columns ───────────────
    drop_meta = ["Response ID", "Response Status", "Timestamp (mm/dd/yyyy)",
                 "Duplicate", "Time Taken to Complete (Seconds)",
                 "Seq. Number", "External Reference", "Weight"]
    df = df.drop(columns=[c for c in drop_meta if c in df.columns])
    instr_keywords = ["sveicīnāti", "jums tiks parādīti", "atbilde:",
                      "izmēģinājuma uzdevumi", "tagad sāksies"]
    df = df.drop(columns=[c for c in df.columns
                           if any(k in c.lower() for k in instr_keywords)],
                 errors="ignore")
    # Drop fully-empty columns (artifact of QuestionPro's wide CSV format)
    df = df.dropna(axis=1, how="all")
    # Drop any remaining Unnamed columns (empty MRT item columns after merge)
    df = df[[c for c in df.columns if not str(c).startswith("Unnamed:")]]

    # ── Convert numeric analysis columns ─────────────────────────────────────
    for c in ["qp_mrt_score", "qp_spatial_rating", "qp_gaming_freq",
              "qp_3d_experience", "qp_difficulty", "qp_fatigue"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    print(f"QuestionPro: {len(df)} completed responses | "
          f"columns: {[c for c in df.columns if not c.startswith('Unnamed')]}")
    return df


def load_raw() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    sessions = pd.read_csv(DATA_DIR / "sessions_raw.csv")
    trials   = pd.read_csv(DATA_DIR / "trials_raw.csv")

    qp_path = DATA_DIR / "questionpro_raw.csv"
    if qp_path.exists():
        survey = _load_qp(qp_path)
    else:
        print("WARNING: questionpro_raw.csv not found — survey columns will be missing.")
        survey = pd.DataFrame(columns=["userId"])

    return sessions, trials, survey


def clean(sessions: pd.DataFrame, trials: pd.DataFrame, survey: pd.DataFrame):
    # ── 1. Exclude pre-collection test data (before 2026-05-05) ─────────────
    sessions["completedAt"] = pd.to_datetime(sessions["completedAt"], utc=True, errors="coerce")
    cutoff = pd.Timestamp(DATA_COLLECTION_START, tz="UTC")
    before = sessions["completedAt"] < cutoff
    print(f"Excluded (before {DATA_COLLECTION_START}): {before.sum()} sessions")
    sessions = sessions[~before].copy()
    valid_session_ids_after_cutoff = set(sessions["doc_id"])
    trials = trials[trials["sessionId"].isin(valid_session_ids_after_cutoff)].copy()

    # ── 2. Remove researcher / test sessions by UID ──────────────────────────
    sessions = sessions[~sessions["userId"].isin(EXCLUDE_UIDS)].copy()
    trials   = trials[~trials["userId"].isin(EXCLUDE_UIDS)].copy()

    # ── 3. Keep only complete sessions ────────────────────────────────────────
    sessions = sessions[sessions["totalTrials"] >= MIN_TRIALS].copy()
    valid_session_ids = set(sessions["doc_id"])
    trials = trials[trials["sessionId"].isin(valid_session_ids)].copy()

    # ── 4. Experiment-mode accuracy filter (per participant) ─────────────────
    exp_sessions = sessions[sessions["mode"] == "experiment"].copy()
    participant_acc = exp_sessions.groupby("userId")["accuracy"].mean()
    included_uids = participant_acc[participant_acc >= CHANCE_ACCURACY].index
    sessions = sessions[sessions["userId"].isin(included_uids)].copy()
    trials   = trials[trials["userId"].isin(included_uids)].copy()

    print(f"Participants included: {included_uids.nunique()}")
    print(f"Sessions retained:     {len(sessions)}")
    print(f"Trials retained:       {len(trials)}")
    print(f"Outlier trials:        {trials['isOutlier'].sum()} "
          f"({trials['isOutlier'].mean()*100:.1f}%)")

    # ── 5. Build participants table (one row per userId) ─────────────────────
    # Keep only first experiment session per participant for baseline stats
    first_exp = (
        exp_sessions[exp_sessions["userId"].isin(included_uids)]
        .sort_values("completedAt")
        .groupby("userId")
        .first()
        .reset_index()
        [["userId", "accuracy", "avgReactionTime"]]
        .rename(columns={"accuracy": "baseline_accuracy",
                         "avgReactionTime": "baseline_avgRT"})
    )

    # Session counts
    session_counts = sessions.groupby("userId").size().reset_index(name="total_sessions")

    participants = first_exp.merge(session_counts, on="userId", how="left")

    # Merge survey data if available
    if not survey.empty and "userId" in survey.columns:
        participants = participants.merge(survey, on="userId", how="left")

    return sessions, trials, participants


def main() -> None:
    sessions, trials, survey = load_raw()
    sessions, trials, participants = clean(sessions, trials, survey)

    sessions.to_csv(DATA_DIR / "sessions_clean.csv", index=False)
    trials.to_csv(DATA_DIR / "trials_clean.csv", index=False)
    participants.to_csv(DATA_DIR / "participants.csv", index=False)

    print(f"\nClean files saved to {DATA_DIR.resolve()}")


if __name__ == "__main__":
    main()
