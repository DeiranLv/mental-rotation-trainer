# Mental Rotation Trainer — Data Analysis

Analysis scripts and data for the empirical study component of the Master's thesis.

**Platform:** https://mental-rotation-trainer.vercel.app

---

## Structure

```
analysis/
├── data/
│   ├── sessions_clean.csv      # Anonymized session data (exclusions applied)
│   ├── trials_clean.csv        # Anonymized trial data (exclusions applied)
│   ├── participants.csv        # One row per participant — platform + survey merged
│   ├── questionpro_raw.csv     # Survey export (email, IP, country removed)
│   └── feedback_raw.csv        # Interactive mode ratings and comments
│
├── scripts/
│   ├── 01_export_firebase.py   # Export Firestore → CSV (requires service account key)
│   ├── 02_clean.py             # Apply exclusion criteria, merge QP survey data
│   ├── 03_analyse.py           # Statistical tests: H1, H2, H3
│   └── 04_visualise.py         # Generate all thesis figures
│
├── results/
│   ├── tables/                 # CSV result tables from 03_analyse.py
│   └── figures/                # PNG figures from 04_visualise.py
│
└── requirements.txt
```

> All `userId` values have been replaced with anonymous codes (`id-1`, `id-2`, …).  
> Raw Firebase exports (`sessions_raw.csv`, `trials_raw.csv`) are not included in the repository.

---

## Setup & reproduction

```bash
python -m pip install -r requirements.txt

# 1. Export from Firebase (requires service account key — do not commit)
python scripts/01_export_firebase.py --key path/to/serviceAccountKey.json

# 2. Place questionpro_raw.csv in data/

# 3. Clean and merge
python scripts/02_clean.py

# 4. Statistical analysis
python scripts/03_analyse.py

# 5. Figures
python scripts/04_visualise.py
```

> Sessions before **2026-05-05** are automatically excluded (development/test data).

---

## Results summary (n=43 platform, n=34 matched with QP)

| Hypothesis | Test | Result |
|---|---|---|
| H1: RT increases with rotation angle | Linear regression | b=11.9 ms/°, R²=0.22, p=.239 — n.s. |
| H2: Platform accuracy ~ QP MRT score | Spearman ρ | ρ=0.48, p=.004 — significant |
| H3a: Spatial self-rating ~ accuracy | Spearman ρ | ρ=0.50, p=.002 — significant |
| H3b: 3D gaming frequency ~ accuracy | Spearman ρ | ρ=0.19, p=.281 — n.s. |
| H3c: 3D modelling experience ~ accuracy | Spearman ρ | ρ=0.08, p=.645 — n.s. |

---

## Author

Jevgēnijs Locs · University of Latvia · Master's Thesis · 2025/2026
