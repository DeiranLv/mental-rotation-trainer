# Mental Rotation Trainer

A web-based interactive platform for training and evaluating mental rotation skills, developed as part of a Master's thesis research project.

## Thesis

**Development of an Interactive Digital Platform and Evaluation of Its Impact on the Improvement of Mental Rotation Skills**  
University of Latvia, Faculty of Science and Technology

## Platform Overview

The platform consists of three modes:

- **Experiment** — fixed 20-trial session, identical for all participants. Used for data collection. Completed once; subsequent visits redirect to mode selection.
- **Repeat** — randomised 20-trial session generated from the full stimulus pool with random angles within Shepard & Metzler difficulty tiers.
- **Interactive** — trackball-based free rotation of both objects simultaneously, for spatial reasoning practice.

After the first experiment session, participants are directed to a QuestionPro survey. All subsequent sessions are voluntary training.

## Stimulus Design

- 13 unique 3-D shapes (unit cubes on a Rubik's cube coordinate grid) + 13 hardcoded mirror counterparts = 26 shapes total.
- Mirrors are exact x-axis reflections, stored statically — no runtime computation.
- Rotation applied via `THREE.Quaternion` around the Y-axis; shapes are centred before rotation is applied.

## Experiment Design

Fixed 20 trials, 50/50 same/different:

| Difficulty tier | Angle range | Trials |
|---|---|---|
| Easy | 0–60° | 7 |
| Medium | 61–120° | 7 |
| Hard | 121–180° | 6 |

Tier boundaries follow Shepard & Metzler (1971) equal 60° thirds.  
Repeat/interactive sessions use random integer angles drawn from within each tier range.

## Data Collection

- Firebase Anonymous Auth — each participant receives a persistent anonymous UID stored in `localStorage`.
- Firestore (EU region) — three collections: `sessions`, `trials`, `interactiveFeedback`.
- Each trial records: `objectId`, `rotationAngle`, `isIdentical`, `userResponse`, `isCorrect`, `reactionTime`, `isOutlier`.
- Outlier threshold: RT < 200 ms or timeout (30 s). Outliers are stored but excluded from average RT calculations.

## Technologies

- React 19 + Vite
- Three.js, @react-three/fiber, @react-three/drei
- Firebase 12 (Firestore + Anonymous Auth)
- Recharts (dashboard)
- JavaScript (no TypeScript)

## Setup and Installation

**Prerequisites:** [Node.js](https://nodejs.org) (LTS)

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

**Firebase:** Copy `.env.example` to `.env` and fill in your Firebase project credentials.

## Deployment

Deployed via Vercel with automatic deploys on push to `main`. Environment variables set in Vercel project settings.

## Repository structure

```
mental-rotation-trainer/
├── src/                    # React application source
│   ├── components/         # Shared 3D and UI components
│   ├── data/               # Stimulus pool, experiment trials, trial generator
│   ├── firebase/           # Firestore service, Firebase config & auth
│   ├── utils/              # Trackball, shape utils, localStorage helpers
│   └── views/              # Route-level view components
├── analysis/               # Data analysis (Python scripts, data, results)
│   ├── scripts/            # 01_export_firebase.py → 04_visualise.py
│   ├── data/               # Raw and clean CSV files (see analysis/README.md)
│   ├── results/            # Generated tables and figures
│   └── README.md           # Full guide: how to reproduce the analysis
├── public/                 # Static assets
├── vercel.json             # SPA rewrite rules (all routes → index.html)
└── .env.example            # Firebase environment variable template
```
The repository contains the application source code, anonymized/processed research data, analysis scripts, and generated result figures/tables used in the thesis.

For data collection methodology, analysis scripts, and results see [`analysis/README.md`](analysis/README.md).

## Author

Jevgēnijs Locs  
University of Latvia · Master's Thesis · 2025/2026
