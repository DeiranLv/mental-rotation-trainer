"""
03_analyse.py
─────────────
Statistical analysis for all three hypotheses.
Writes result tables to analysis/results/tables/.

Input  (analysis/data/):
  sessions_clean.csv
  trials_clean.csv
  participants.csv        — includes merged QuestionPro columns (see 02_clean.py)

Output (analysis/results/tables/):
  descriptives_by_tier.csv
  descriptives_by_mode.csv
  h1_group_regression.csv
  h1_shepard_regression.csv   — per-participant Shepard slopes
  h2_platform_vs_qp.csv       — correlation: platform accuracy vs QP MRT score
  h3_selfassessment.csv       — correlations: self-assessment / experience vs accuracy

QuestionPro column names expected in participants.csv after merge in 02_clean.py:
  qp_mrt_score        — number of correct answers on the approved 48-item MRT
  qp_spatial_rating   — self-rated spatial ability (1–5 Likert)
  qp_gaming_freq      — 3D gaming frequency (1–4 ordinal)
  qp_3d_experience    — 3D modelling experience (1–4 ordinal)

If QuestionPro data is not yet available, H2/H3 tests are skipped gracefully.

Bonferroni correction: 3 hypotheses → α = 0.05 / 3 = 0.0167
"""

from pathlib import Path
import numpy as np
import pandas as pd
from scipy import stats

DATA_DIR    = Path(__file__).parent.parent / "data"
RESULTS_DIR = Path(__file__).parent.parent / "results" / "tables"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

ALPHA        = 0.05
N_HYPOTHESES = 3
ALPHA_BONF   = ALPHA / N_HYPOTHESES   # 0.0167

TIER_BINS   = [0, 60, 120, 180]
TIER_LABELS = ["Easy (0–60°)", "Medium (61–120°)", "Hard (121–180°)"]

# QuestionPro column names — adjust if CSV headers differ after QP export
QP_MRT_COL     = "qp_mrt_score"      # int, 0–48
QP_SPATIAL_COL = "qp_spatial_rating" # int, 1–5
QP_GAMING_COL  = "qp_gaming_freq"    # int, 1–4
QP_3D_COL      = "qp_3d_experience"  # int, 1–4


# ─── helpers ──────────────────────────────────────────────────────────────────

def spearman_row(label: str, x: pd.Series, y: pd.Series) -> dict:
    mask = x.notna() & y.notna()
    x, y = x[mask], y[mask]
    if len(x) < 5:
        return {"comparison": label, "n": len(x), "rho": None, "p": None,
                "significant_bonf": "insufficient data"}
    rho, p = stats.spearmanr(x, y)
    return {
        "comparison": label,
        "n": len(x),
        "rho": round(rho, 4),
        "p": round(p, 5),
        "significant_bonf": significance_label(p),
    }


def significance_label(p: float, alpha: float = ALPHA_BONF) -> str:
    return "sig" if p < alpha else "n.s."


# ─── H1: Angle (Shepard) effect ───────────────────────────────────────────────

def h1_shepard(trials: pd.DataFrame) -> None:
    print("\n── H1: Angle effect (Shepard slope) ──")

    df = trials[
        (trials["mode"] == "experiment") &
        (~trials["isOutlier"])
    ].copy()

    # Group-level regression: mean RT per angle bin
    group_rt = df.groupby("rotationAngle")["reactionTime"].mean().reset_index()
    slope, intercept, r, p, se = stats.linregress(
        group_rt["rotationAngle"], group_rt["reactionTime"]
    )
    r2 = r ** 2
    print(f"  Group regression: slope={slope:.2f} ms/°  R²={r2:.3f}  p={p:.4f}  {significance_label(p)}")

    group_result = pd.DataFrame([{
        "level": "group",
        "slope_ms_per_deg": round(slope, 3),
        "intercept_ms": round(intercept, 1),
        "R2": round(r2, 4),
        "r": round(r, 4),
        "p": round(p, 5),
        "n_angle_bins": len(group_rt),
        "significant_bonf": significance_label(p),
    }])

    # Per-participant slopes
    rows = []
    for uid, grp in df.groupby("userId"):
        if grp["rotationAngle"].nunique() < 4:
            continue
        s, b, r_, p_, _ = stats.linregress(grp["rotationAngle"], grp["reactionTime"])
        rows.append({
            "userId": uid,
            "slope_ms_per_deg": round(s, 3),
            "intercept_ms": round(b, 1),
            "R2": round(r_ ** 2, 4),
            "p": round(p_, 5),
            "n_trials": len(grp),
        })
    per_participant = pd.DataFrame(rows)
    if not per_participant.empty:
        print(f"  Per-participant: M={per_participant['slope_ms_per_deg'].mean():.2f} "
              f"SD={per_participant['slope_ms_per_deg'].std():.2f} ms/°  n={len(per_participant)}")

    # Spearman: angle vs accuracy (monotone relationship)
    angle_acc = df.groupby("rotationAngle")["isCorrect"].mean().reset_index()
    rho, p_rho = stats.spearmanr(angle_acc["rotationAngle"], angle_acc["isCorrect"])
    print(f"  Spearman (angle ~ accuracy): ρ={rho:.3f}  p={p_rho:.4f}  {significance_label(p_rho)}")

    group_result.to_csv(RESULTS_DIR / "h1_group_regression.csv", index=False)
    per_participant.to_csv(RESULTS_DIR / "h1_shepard_regression.csv", index=False)
    print("  Saved: h1_group_regression.csv, h1_shepard_regression.csv")


# ─── H2: Platform accuracy vs QP approved MRT score ──────────────────────────

def h2_platform_vs_qp(participants: pd.DataFrame) -> None:
    print("\n── H2: Platform accuracy vs approved QP MRT score ──")

    if QP_MRT_COL not in participants.columns:
        print(f"  SKIPPED — column '{QP_MRT_COL}' not found. "
              "Add QuestionPro data to participants.csv and re-run.")
        return

    df = participants[["userId", "baseline_accuracy", QP_MRT_COL]].dropna(
        subset=["baseline_accuracy", QP_MRT_COL]
    )
    n = len(df)
    print(f"  n={n} participants with both platform and QP data")

    if n < 5:
        print("  SKIPPED — insufficient overlapping data.")
        return

    # Choose Pearson vs Spearman based on normality
    _, p_plat = stats.shapiro(df["baseline_accuracy"]) if n >= 3 else (None, 0)
    _, p_qp   = stats.shapiro(df[QP_MRT_COL])         if n >= 3 else (None, 0)

    if p_plat > 0.05 and p_qp > 0.05:
        r, p = stats.pearsonr(df["baseline_accuracy"], df[QP_MRT_COL])
        test_name = "Pearson r"
    else:
        r, p = stats.spearmanr(df["baseline_accuracy"], df[QP_MRT_COL])
        test_name = "Spearman ρ"

    print(f"  {test_name}={r:.3f}  p={p:.4f}  {significance_label(p)}")

    result = pd.DataFrame([{
        "n": n,
        "test": test_name,
        "r_or_rho": round(r, 4),
        "p": round(p, 5),
        "significant_bonf": significance_label(p),
        "platform_accuracy_M": round(df["baseline_accuracy"].mean(), 4),
        "qp_mrt_score_M": round(df[QP_MRT_COL].mean(), 2),
    }])
    result.to_csv(RESULTS_DIR / "h2_platform_vs_qp.csv", index=False)
    print("  Saved: h2_platform_vs_qp.csv")


# ─── H3: Self-assessment & experience vs platform accuracy ────────────────────

def h3_selfassessment(participants: pd.DataFrame) -> None:
    print("\n── H3: Self-assessment / experience vs platform accuracy ──")

    qp_cols = {
        QP_SPATIAL_COL: "Telpiskais pašvērtējums (1–5)",
        QP_GAMING_COL:  "3D spēļu biežums (1–4)",
        QP_3D_COL:      "3D modelēšanas pieredze (1–4)",
    }

    missing = [c for c in qp_cols if c not in participants.columns]
    if missing:
        print(f"  SKIPPED — columns not found: {missing}. "
              "Add QuestionPro data to participants.csv and re-run.")
        return

    rows = []
    for col, label in qp_cols.items():
        row = spearman_row(label, participants[col], participants["baseline_accuracy"])
        rows.append(row)
        if row["rho"] is not None:
            print(f"  {label}: ρ={row['rho']}  p={row['p']}  {row['significant_bonf']}")

    result = pd.DataFrame(rows)
    result.to_csv(RESULTS_DIR / "h3_selfassessment.csv", index=False)
    print("  Saved: h3_selfassessment.csv")


# ─── Descriptives ─────────────────────────────────────────────────────────────

def descriptives(sessions: pd.DataFrame, trials: pd.DataFrame,
                 participants: pd.DataFrame) -> None:
    print("\n── Descriptives ──")

    non_outlier = trials[~trials["isOutlier"]].copy()
    non_outlier["tier"] = pd.cut(non_outlier["rotationAngle"],
                                 bins=TIER_BINS, labels=TIER_LABELS,
                                 include_lowest=True)

    tier_stats = (
        non_outlier[non_outlier["mode"] == "experiment"]
        .groupby("tier", observed=True)
        .agg(
            n_trials=("reactionTime", "count"),
            mean_RT=("reactionTime", "mean"),
            sd_RT=("reactionTime", "std"),
            mean_acc=("isCorrect", "mean"),
        )
        .round(2)
        .reset_index()
    )
    print(tier_stats.to_string(index=False))
    tier_stats.to_csv(RESULTS_DIR / "descriptives_by_tier.csv", index=False)

    mode_stats = (
        sessions.groupby("mode")
        .agg(
            n_sessions=("accuracy", "count"),
            mean_acc=("accuracy", "mean"),
            sd_acc=("accuracy", "std"),
            mean_RT=("avgReactionTime", "mean"),
            sd_RT=("avgReactionTime", "std"),
        )
        .round(3)
        .reset_index()
    )
    mode_stats.to_csv(RESULTS_DIR / "descriptives_by_mode.csv", index=False)

    # Demographics summary if available
    demo_cols = ["gender", "age_group", "education", "field"]
    available = [c for c in demo_cols if c in participants.columns]
    if available:
        for col in available:
            print(f"\n  {col}:")
            print(participants[col].value_counts().to_string())

    print(f"\n  Participants: {participants['userId'].nunique()}")
    print(f"  Total sessions: {len(sessions)}")
    print(f"  Outlier trials: {trials['isOutlier'].sum()} "
          f"({trials['isOutlier'].mean()*100:.1f}%)")
    print("  Saved: descriptives_by_tier.csv, descriptives_by_mode.csv")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print("Loading clean data ...")
    sessions     = pd.read_csv(DATA_DIR / "sessions_clean.csv")
    trials       = pd.read_csv(DATA_DIR / "trials_clean.csv")
    participants = pd.read_csv(DATA_DIR / "participants.csv")

    print(f"  {participants['userId'].nunique()} participants, "
          f"{len(sessions)} sessions, {len(trials)} trials")
    print(f"\nBonferroni α = {ALPHA_BONF:.4f} (3 hypotheses)")

    h1_shepard(trials)
    h2_platform_vs_qp(participants)
    h3_selfassessment(participants)
    descriptives(sessions, trials, participants)

    print("\n✓ Analysis complete. Tables saved to:", RESULTS_DIR.resolve())


if __name__ == "__main__":
    main()

