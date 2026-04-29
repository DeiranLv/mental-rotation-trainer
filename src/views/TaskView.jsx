import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { t } from '../i18n/i18n';
import MRScene from '../components/MRScene';
import { experimentTrials, getShapeCubes } from '../data/experimentTrials';
import { generateTrials } from '../data/trialGenerator';
import { mirrorCubes } from '../utils/shapeUtils';
import { getUserId } from '../utils/storage';

const ITI_MS = 500;
const TIMEOUT_MS = 30000;
const MIN_RT_MS = 200;

function buildCubes(trial) {
  const base = getShapeCubes(trial.objectId);
  const right = trial.isIdentical ? base : mirrorCubes(base);
  const angle = (trial.rotationAngle * Math.PI) / 180;
  const rotated = right.map(({ x, y, z }) => ({
    x: x * Math.cos(angle) - z * Math.sin(angle),
    y,
    z: x * Math.sin(angle) + z * Math.cos(angle),
  }));
  return { leftCubes: base, rightCubes: rotated };
}

export default function TaskView() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode ?? 'experiment';

  const [trials] = useState(() =>
    mode === 'experiment' ? experimentTrials : generateTrials()
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('iti'); // 'iti' | 'task'
  const [results, setResults] = useState([]);

  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);
  const answered = useRef(false);

  const trial = trials[index];
  const { leftCubes, rightCubes } = buildCubes(trial);
  const userId = getUserId();

  // ITI → task transition
  useEffect(() => {
    setPhase('iti');
    answered.current = false;
    const itiTimer = setTimeout(() => setPhase('task'), ITI_MS);
    return () => clearTimeout(itiTimer);
  }, [index]);

  // Start rAF timer when stimulus becomes visible
  useEffect(() => {
    if (phase !== 'task') return;
    rafRef.current = requestAnimationFrame(() => {
      startTimeRef.current = performance.now();
      timeoutRef.current = setTimeout(() => {
        if (!answered.current) recordAnswer(null);
      }, TIMEOUT_MS);
    });
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [phase, index]); // eslint-disable-line react-hooks/exhaustive-deps

  const recordAnswer = useCallback((response) => {
    if (answered.current) return;
    answered.current = true;
    clearTimeout(timeoutRef.current);

    const rt = response !== null
      ? Math.round(performance.now() - startTimeRef.current)
      : TIMEOUT_MS;

    const isCorrect = response !== null
      ? (response === 'same') === trial.isIdentical
      : false;

    const trialResult = {
      sessionId: null,
      userId,
      mode,
      isPractice: false,
      trialOrder: trial.trialOrder,
      objectId: trial.objectId,
      rotationAngle: trial.rotationAngle,
      isIdentical: trial.isIdentical,
      userResponse: response,
      isCorrect,
      reactionTime: rt,
      isOutlier: rt < MIN_RT_MS || rt >= TIMEOUT_MS,
      timestamp: Date.now(),
    };

    const newResults = [...results, trialResult];
    setResults(newResults);

    if (index + 1 < trials.length) {
      setIndex((i) => i + 1);
    } else {
      navigate('/session-result', { state: { results: newResults, mode } });
    }
  }, [answered, trial, results, index, trials, mode, userId, navigate]);

  // Keyboard: ← Same, → Different
  useEffect(() => {
    const onKey = (e) => {
      if (phase !== 'task') return;
      if (e.key === 'ArrowLeft') recordAnswer('different');
      if (e.key === 'ArrowRight') recordAnswer('same');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, recordAnswer]);

  return (
    <div className="view task-view">
      <p className="task-counter">
        {t('task.counter', { current: index + 1, total: trials.length })}
      </p>

      <div
        className="scene-container"
        style={{ opacity: phase === 'task' ? 1 : 0 }}
      >
        <MRScene leftCubes={leftCubes} rightCubes={rightCubes} />
      </div>

      <div
        className="answer-buttons"
        style={{
          opacity: phase === 'task' ? 1 : 0,
          pointerEvents: phase === 'task' ? 'auto' : 'none',
        }}
      >
        <button className="btn-different" onClick={() => recordAnswer('different')}>
          {t('task.differentButton')}
        </button>
        <button className="btn-same" onClick={() => recordAnswer('same')}>
          {t('task.sameButton')}
        </button>
      </div>
    </div>
  );
}
