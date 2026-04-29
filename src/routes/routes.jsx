import HomeView from '../views/HomeView';
import InstructionView from '../views/InstructionView';
import PracticeView from '../views/PracticeView';
import TaskView from '../views/TaskView';
import InteractiveTaskView from '../views/InteractiveTaskView';
import SessionSummaryView from '../views/SessionSummaryView';
import ModeSelectView from '../views/ModeSelectView';
import DashboardView from '../views/DashboardView';

const routes = [
  { path: '/', element: <HomeView /> },
  { path: '/instructions', element: <InstructionView /> },
  { path: '/practice', element: <PracticeView /> },
  { path: '/train', element: <TaskView /> },
  { path: '/train-interactive', element: <InteractiveTaskView /> },
  { path: '/session-result', element: <SessionSummaryView /> },
  { path: '/mode-select', element: <ModeSelectView /> },
  { path: '/dashboard', element: <DashboardView /> },
];

export default routes;
