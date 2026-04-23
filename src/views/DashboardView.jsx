import { t } from '../i18n/i18n';

export default function DashboardView() {
  return (
    <div className="view">
      <h1>{t('dashboard.title')}</h1>
      <div className="progress-placeholder">
        {/* User progress charts and history will be displayed here */}
      </div>
    </div>
  );
}
