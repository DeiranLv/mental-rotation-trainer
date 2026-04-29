import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';

export default function ModeSelectView() {
  const navigate = useNavigate();

  return (
    <div className="view">
      <h1>{t('modeSelect.title')}</h1>

      <div className="mode-cards">
        <div className="mode-card">
          <h2>{t('modeSelect.interactiveTitle')}</h2>
          <p>{t('modeSelect.interactiveDesc')}</p>
          <button onClick={() => navigate('/train-interactive')}>
            {t('modeSelect.interactiveButton')}
          </button>
        </div>

        <div className="mode-card">
          <h2>{t('modeSelect.repeatTitle')}</h2>
          <p>{t('modeSelect.repeatDesc')}</p>
          <button onClick={() => navigate('/train', { state: { mode: 'repeat' } })}>
            {t('modeSelect.repeatButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
