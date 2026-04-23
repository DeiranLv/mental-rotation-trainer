import HomeView from '../views/HomeView';
import TaskView from '../views/TaskView';
import SessionSummaryView from '../views/SessionSummaryView';
import DashboardView from '../views/DashboardView';

const routes = [
  { path: '/', element: <HomeView /> },
  { path: '/train', element: <TaskView /> },
  { path: '/session-result', element: <SessionSummaryView /> },
  { path: '/dashboard', element: <DashboardView /> },
];

export default routes;
