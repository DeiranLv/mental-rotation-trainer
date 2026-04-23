import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';
import { getResearchConsent, getOrCreateUserId } from '../utils/storage';

const SURVEY_BASE_URL = 'https://www.questionpro.com/t/your-survey-id';

export default function SessionSummaryView() {
  const navigate = useNavigate();
  const hasConsent = getResearchConsent();
  const userId = getOrCreateUserId();

  function handleSurvey() {
    const url = `${SURVEY_BASE_URL}?uid=${encodeURIComponent(userId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    navigate('/dashboard');
  }

  return (
    <div className="view">
      <h1>{t('summary.title')}</h1>
      <div className="results-placeholder">
        {/* Session results will be displayed here */}
      </div>
      {hasConsent ? (
        <button onClick={handleSurvey}>{t('summary.surveyButton')}</button>
      ) : (
        <button onClick={() => navigate('/dashboard')}>
          {t('summary.dashboardButton')}
        </button>
      )}
    </div>
  );
}
