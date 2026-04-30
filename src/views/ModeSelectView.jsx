import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';

export default function ModeSelectView() {
  const navigate = useNavigate();

  return (
    <div className="view">
      <h1>{t('modeSelect.title')}</h1>

      <div className="mode-cards">
        <div className="mode-card" role="button" tabIndex={0}
          onClick={() => navigate('/train-interactive')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/train-interactive')}>
          <h2>{t('modeSelect.interactiveTitle')}</h2>
          <p>{t('modeSelect.interactiveDesc')}</p>
        </div>

        <div className="mode-card" role="button" tabIndex={0}
          onClick={() => navigate('/train', { state: { mode: 'repeat' } })}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/train', { state: { mode: 'repeat' } })}>
          <h2>{t('modeSelect.repeatTitle')}</h2>
          <p>{t('modeSelect.repeatDesc')}</p>
        </div>
      </div>
    </div>
  );
}
