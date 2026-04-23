import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';
import { getOrCreateUserId, setResearchConsent } from '../utils/storage';

export default function HomeView() {
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    getOrCreateUserId();
  }, []);

  function handleStart() {
    setResearchConsent(consent);
    navigate('/train');
  }

  return (
    <div className="view">
      <h1>{t('home.title')}</h1>
      <label className="consent-label">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        {t('home.consent')}
      </label>
      <button onClick={handleStart}>{t('home.startButton')}</button>
    </div>
  );
}
