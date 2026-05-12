"""
04_visualise.py
───────────────
Generates all thesis figures from clean data.
Figures saved as PNG to analysis/results/figures/.

Input  (analysis/data/):
  sessions_clean.csv
  trials_clean.csv
  participants.csv

Output (analysis/results/figures/):
  fig_h1_shepard.png              — RT vs angle with regression line
  fig_h1_accuracy_by_tier.png     — bar chart accuracy per difficulty tier
  fig_h2_platform_vs_qp.png       — scatter: platform accuracy vs QP MRT score
  fig_h3_selfassessment.png       — scatter grid: experience/rating vs accuracy
  fig_rt_histogram.png            — RT distribution (sanity check)

Usage:
  python scripts/04_visualise.py
"""

from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from scipy import stats

DATA_DIR    = Path(__file__).parent.parent / "data"
TABLE_DIR   = Path(__file__).parent.parent / "results" / "tables"
FIG_DIR     = Path(__file__).parent.parent / "results" / "figures"
FIG_DIR.mkdir(parents=True, exist_ok=True)

ACCENT  = "#6366f1"   # matches platform UI
PALETTE = [ACCENT, "#22c55e", "#ef4444", "#f59e0b"]

TIER_BINS   = [0, 60, 120, 180]
TIER_LABELS = ["Viegls\n(0–60°)", "Vidējs\n(61–120°)", "Grūts\n(121–180°)"]

plt.rcParams.update({
    "figure.dpi": 150,
    "font.family": "sans-serif",
    "axes.spines.top": False,
    "axes.spines.right": False,
})


def save(name: str) -> None:
    path = FIG_DIR / name
    plt.savefig(path, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {name}")


# ── Fig 1: Shepard slope (RT vs angle, experiment, no outliers) ──────────────

def fig_h1_shepard(trials: pd.DataFrame) -> None:
    df = trials[(trials["mode"] == "experiment") & (~trials["isOutlier"])].copy()

    angle_rt = (
        df.groupby("rotationAngle")["reactionTime"]
        .agg(["mean", "sem"])
        .reset_index()
        .rename(columns={"mean": "RT_mean", "sem": "RT_sem"})
    )

    slope, intercept, *_ = stats.linregress(angle_rt["rotationAngle"], angle_rt["RT_mean"])
    x_line = np.linspace(angle_rt["rotationAngle"].min(), angle_rt["rotationAngle"].max(), 200)
    y_line = slope * x_line + intercept

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.errorbar(
        angle_rt["rotationAngle"], angle_rt["RT_mean"],
        yerr=angle_rt["RT_sem"],
        fmt="o", color=ACCENT, capsize=4, label="Vidējais RT (±SEM)"
    )
    ax.plot(x_line, y_line, "--", color="#374151", linewidth=1.2,
            label=f"Regresija: {slope:.1f} ms/°")
    ax.set_xlabel("Rotācijas leņķis (°)")
    ax.set_ylabel("Reakcijas laiks (ms)")
    ax.set_title("H1: Reakcijas laiks pēc rotācijas leņķa")
    ax.legend(fontsize=9)
    save("fig_h1_shepard.png")


# ── Fig 2: Accuracy by difficulty tier ───────────────────────────────────────

def fig_h1_accuracy_by_tier(trials: pd.DataFrame) -> None:
    df = trials[trials["mode"] == "experiment"].copy()
    df["tier"] = pd.cut(df["rotationAngle"], bins=TIER_BINS,
                        labels=TIER_LABELS, include_lowest=True)

    tier_acc = df.groupby("tier", observed=True)["isCorrect"].agg(["mean", "sem"]).reset_index()

    fig, ax = plt.subplots(figsize=(5, 4))
    bars = ax.bar(tier_acc["tier"], tier_acc["mean"] * 100,
                  color=PALETTE[:3], width=0.55, zorder=2)
    ax.errorbar(tier_acc["tier"], tier_acc["mean"] * 100,
                yerr=tier_acc["sem"] * 100, fmt="none", color="#374151", capsize=5, zorder=3)
    ax.set_ylim(0, 110)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0f}%"))
    ax.set_xlabel("Grūtības pakāpe")
    ax.set_ylabel("Precizitāte (%)")
    ax.set_title("H1: Precizitāte pēc grūtības pakāpes")
    ax.axhline(50, color="#9ca3af", linewidth=0.8, linestyle=":", zorder=1)
    ax.text(2.45, 51.5, "Uzminēšana", color="#9ca3af", fontsize=7)
    ax.grid(axis="y", alpha=0.3, zorder=0)
    save("fig_h1_accuracy_by_tier.png")


# ── Fig 3: Platform vs QP MRT score (H2) ─────────────────────────────────────

QP_MRT_COL = "qp_mrt_score"


def fig_h2_platform_vs_qp(participants: pd.DataFrame) -> None:
    if QP_MRT_COL not in participants.columns:
        print("  H2 figure skipped — qp_mrt_score column not found.")
        return

    df = participants[["baseline_accuracy", QP_MRT_COL]].dropna()
    if len(df) < 5:
        print("  H2 figure skipped — not enough overlapping data yet.")
        return

    rho, p = stats.spearmanr(df[QP_MRT_COL], df["baseline_accuracy"])

    # Trend line via linregress (visual only — correlation is Spearman)
    slope, intercept, *_ = stats.linregress(df[QP_MRT_COL], df["baseline_accuracy"])
    x_line = np.linspace(df[QP_MRT_COL].min(), df[QP_MRT_COL].max(), 100)

    fig, ax = plt.subplots(figsize=(5, 4))
    ax.scatter(df[QP_MRT_COL], df["baseline_accuracy"] * 100,
               color=ACCENT, alpha=0.7, edgecolors="white", linewidths=0.5, s=60)
    ax.plot(x_line, (slope * x_line + intercept) * 100, "--", color="#374151",
            linewidth=1.2, label=f"Spīrmens ρ = {rho:.2f},  p = {p:.3f}")
    ax.set_xlabel("QP MRT rezultāts (0–48)")
    ax.set_ylabel("Platformas precizitāte (%)")
    ax.set_title("H2: Platforma vs aprobētais MRT tests")
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0f}%"))
    ax.legend(fontsize=9)
    save("fig_h2_platform_vs_qp.png")


# ── Fig 5: Self-assessment / experience vs accuracy (H3) ─────────────────────

QP_COLS = {
    "qp_spatial_rating": "Telpiskais pašvērtējums\n(1–5)",
    "qp_gaming_freq":    "3D spēļu biežums\n(1–4)",
    "qp_3d_experience":  "3D modelēšanas pieredze\n(1–4)",
}


def fig_h3_selfassessment(participants: pd.DataFrame) -> None:
    available = {col: lbl for col, lbl in QP_COLS.items() if col in participants.columns}
    if not available:
        print("  H3 figure skipped — QP columns not found.")
        return

    n_cols = len(available)
    fig, axes = plt.subplots(1, n_cols, figsize=(4 * n_cols, 4), sharey=True)
    if n_cols == 1:
        axes = [axes]

    for ax, (col, label) in zip(axes, available.items()):
        df = participants[[col, "baseline_accuracy"]].dropna()
        if len(df) < 5:
            ax.set_title(label + "\n(nav datu)")
            continue
        rho, p = stats.spearmanr(df[col], df["baseline_accuracy"])

        # Jitter x slightly for readability
        jitter = np.random.default_rng(42).uniform(-0.12, 0.12, len(df))
        ax.scatter(df[col] + jitter, df["baseline_accuracy"] * 100,
                   color=ACCENT, alpha=0.65, edgecolors="white", linewidths=0.4, s=50)

        # Means per x-value
        means = df.groupby(col)["baseline_accuracy"].mean() * 100
        ax.plot(means.index, means.values, "o--", color="#374151",
                linewidth=1.2, markersize=5)

        ax.set_xlabel(label)
        ax.set_title(f"ρ = {rho:.2f}  p = {p:.3f}", fontsize=9)

    axes[0].set_ylabel("Platformas precizitāte (%)")
    axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f"{v:.0f}%"))
    fig.suptitle("H3: Pašvērtējums / pieredze vs precizitāte", y=1.02)
    fig.tight_layout()
    save("fig_h3_selfassessment.png")


# ── Fig 6: RT histogram (sanity / authenticity check) ────────────────────────

def fig_rt_histogram(trials: pd.DataFrame) -> None:
    df = trials[
        (trials["mode"] == "experiment") &
        (~trials["isOutlier"])
    ].copy()

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.hist(df["reactionTime"], bins=60, color=ACCENT, edgecolor="white",
            linewidth=0.3, alpha=0.85)
    ax.set_xlabel("Reakcijas laiks (ms)")
    ax.set_ylabel("Skaits")
    ax.set_title("RT sadalījums (eksperimenta sesijas, bez izlecējiem)")
    save("fig_rt_histogram.png")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    print("Loading data ...")
    sessions     = pd.read_csv(DATA_DIR / "sessions_clean.csv")  # noqa: F841
    trials       = pd.read_csv(DATA_DIR / "trials_clean.csv")
    participants = pd.read_csv(DATA_DIR / "participants.csv")

    print("Generating figures ...")
    fig_h1_shepard(trials)
    fig_h1_accuracy_by_tier(trials)
    fig_h2_platform_vs_qp(participants)
    fig_h3_selfassessment(participants)
    fig_rt_histogram(trials)

    print(f"\n✓ All figures saved to: {FIG_DIR.resolve()}")


if __name__ == "__main__":
    main()

