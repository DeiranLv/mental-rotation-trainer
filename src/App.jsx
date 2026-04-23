import { BrowserRouter, useRoutes } from 'react-router-dom';
import routes from './routes/routes';
import Navbar from './components/Navbar';
import './App.css';

function AppRoutes() {
  return useRoutes(routes);
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <AppRoutes />
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
