import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';
import { getResearchConsent, setResearchConsent, isExperimentDone } from '../utils/storage';


export default function HomeView() {
  const navigate = useNavigate();
  // Read stored consent ONCE — controls whether checkbox is shown at all.
  // Changing the checkbox does NOT touch localStorage until Start is clicked.
  const alreadyConsented = getResearchConsent();
  const [checked, setChecked] = useState(false);

  const canStart = alreadyConsented || checked;

  function handleStart() {
    setResearchConsent(true); // only saved here, on deliberate click
    if (isExperimentDone()) {
      navigate('/mode-select');
    } else {
      navigate('/instructions');
    }
  }

  return (
    <div className="view home-view">
      <div className="home-hero">
        <h1>{t('home.title')}</h1>
        <p className="home-subtitle">{t('home.subtitle')}</p>
      </div>
      {!alreadyConsented && (
        <label className="consent-label">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          {t('home.consent')}
        </label>
      )}
      <button onClick={handleStart} disabled={!canStart}>{t('home.startButton')}</button>
    </div>
  );
}

