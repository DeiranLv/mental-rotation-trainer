import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';

const TOTAL_TASKS = 10;

export default function TaskView() {
  const navigate = useNavigate();
  const [taskIndex, setTaskIndex] = useState(1);

  function handleNext() {
    if (taskIndex >= TOTAL_TASKS) {
      navigate('/session-result');
    } else {
      setTaskIndex((i) => i + 1);
    }
  }

  return (
    <div className="view">
      <p className="task-counter">
        Task {taskIndex} / {TOTAL_TASKS}
      </p>
      <div className="task-placeholder">
        {/* 3D task scene will be mounted here */}
      </div>
      <button onClick={handleNext}>{t('task.next')}</button>
    </div>
  );
}
