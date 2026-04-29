import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from './routes/routes';
import Navbar from './components/Navbar';
import { t } from './i18n/i18n';
import './App.css';

function AppRoutes() {
  return useRoutes(routes);
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <AppRoutes />
      <footer className="app-footer">{t('footer.line')}</footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
