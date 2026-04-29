import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '../i18n/i18n';
import { getUserId, isExperimentDone, setExperimentDone, incrementSessionNumber } from '../utils/storage';
import { saveSessionWithTrials } from '../firebase/firestoreService';

// QuestionPro survey URL. The participant's Firebase UID is appended as
// ?userid=... so responses can be matched to Firestore data in analysis.
//
// When to redirect:
//   - ONLY after the FIRST completed experiment session (isFirstExperiment = true).
//   - A button is shown on this results screen; clicking it opens QP in a new tab
//     and then navigates the user to /dashboard.
//   - The button never appears again on subsequent visits because isExperimentDone()
//     returns true and isFirstExperiment becomes false.
const SURVEY_BASE_URL = 'https://latvia.questionpro.com/t/AbvhLZ8fpv';

export default function SessionSummaryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { results = [], mode = 'experiment' } = location.state ?? {};

  const userId = getUserId();
  // Snapshot ONCE at mount — the const must not be recomputed on later
  // renders, otherwise after setExperimentDone() flips localStorage the
  // survey button would disappear before the user could click it.
  const [isFirstExperiment] = useState(
    () => mode === 'experiment' && !isExperimentDone()
  );

  const [saving, setSaving] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [stats, setStats] = useState(null);
  const [savedToast, setSavedToast] = useState(false);
  const savedRef = useRef(false); // guard against StrictMode double-invoke

  useEffect(() => {
    if (savedRef.current || results.length === 0) {
      setSaving(false);
      return;
    }
    savedRef.current = true;

    const sessionNumber = incrementSessionNumber();

    saveSessionWithTrials({ userId, mode, sessionNumber, results })
      .then(({ accuracy, avgReactionTime, correctCount, totalTrials }) => {
        setStats({ accuracy, avgReactionTime, correctCount, totalTrials });
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
        // Mark experiment done on successful save, not on survey click.
        // This ensures the user is routed correctly on all future visits,
        // even if they never click the survey button.
        if (isFirstExperiment) setExperimentDone();
      })
      .catch((err) => {
        console.error('Firestore save failed:', err);
        setSaveError(err.message);
        // Still compute stats locally so user isn't stuck
        const taskResults = results.filter((r) => !r.isPractice);
        const totalTrials = taskResults.length;
        const correctCount = taskResults.filter((r) => r.isCorrect).length;
        const validRT = taskResults.filter((r) => !r.isOutlier);
        const avgReactionTime =
          validRT.length > 0
            ? Math.round(validRT.reduce((s, r) => s + r.reactionTime, 0) / validRT.length)
            : 0;
        setStats({ accuracy: correctCount / (totalTrials || 1), avgReactionTime, correctCount, totalTrials });
      })
      .finally(() => setSaving(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [surveyDone, setSurveyDone] = useState(false);

  function handleSurvey() {
    setExperimentDone(); // mark done so button never appears again on return visits
    const url = `${SURVEY_BASE_URL}?userid=${encodeURIComponent(userId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSurveyDone(true); // hide button immediately
  }

  if (saving) {
    return (
      <div className="view">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saglabā rezultātus…</p>
      </div>
    );
  }

  return (
    <div className="view">
      <h1>{t('summary.title')}</h1>

      {savedToast && (
        <div className="toast toast-success">
          ✓ Dati saglabāti
        </div>
      )}

      {saveError && (
        <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>
          Saglabāšana neizdevās: {saveError}
        </p>
      )}

      {stats && (
        <div className="summary-stats">
          <div className="stat-card">
            <span className="stat-label">{t('summary.accuracy')}</span>
            <span className="stat-value">{Math.round(stats.accuracy * 100)}%</span>
            <span className="stat-sub">{stats.correctCount} / {stats.totalTrials}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t('summary.avgRT')}</span>
            <span className="stat-value">{stats.avgReactionTime}</span>
            <span className="stat-sub">{t('summary.ms')}</span>
          </div>
        </div>
      )}

      <div className="summary-actions">
        {isFirstExperiment && !surveyDone ? (
          // First experiment: force the user through the survey before
          // they can leave this screen — hide the dashboard button until
          // they've clicked through to QuestionPro.
          <button onClick={handleSurvey}>{t('summary.surveyButton')}</button>
        ) : (
          <button
            className="btn-outline"
            onClick={() => navigate('/dashboard')}
          >
            {t('summary.dashboardButton')}
          </button>
        )}
      </div>
    </div>
  );
}

