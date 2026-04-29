import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { t } from '../i18n/i18n';
import MRScene from '../components/MRScene';
import { generatePracticeTrials } from '../data/trialGenerator';
import { getShapeCubes } from '../data/experimentTrials';
import { mirrorCubes } from '../utils/shapeUtils';


function buildCubes(trial) {
  const base = getShapeCubes(trial.objectId);
  const right = trial.isIdentical ? base : mirrorCubes(base);
  // Apply the stimulus rotation angle to the right object's initial display
  const angle = (trial.rotationAngle * Math.PI) / 180;
  const rotated = right.map(({ x, y, z }) => ({
    x: x * Math.cos(angle) - z * Math.sin(angle),
    y,
    z: x * Math.sin(angle) + z * Math.cos(angle),
  }));
  return { leftCubes: base, rightCubes: rotated };
}

export default function PracticeView() {
  const navigate = useNavigate();
  const [trials] = useState(() => generatePracticeTrials());
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('task'); // 'task' | 'feedback' | 'demo'
  const [result, setResult] = useState(null);    // { isCorrect, correctAnswer }
  const [leftDemoQ, setLeftDemoQ] = useState(null);  // quaternion applied to left object during demo
  const [rightDemoQ, setRightDemoQ] = useState(null); // quaternion applied to right object during demo
  const answered = useRef(false);
  const demoFrame = useRef(null);

  const trial = trials[index];
  const { leftCubes, rightCubes } = buildCubes(trial);
  const total = trials.length;

  const handleAnswer = useCallback((response) => {
    if (answered.current || phase !== 'task') return;
    answered.current = true;

    const isCorrect = (response === 'same') === trial.isIdentical;
    const correctAnswer = trial.isIdentical
      ? t('practice.same')
      : t('practice.different');

    setResult({ isCorrect, correctAnswer });
    setPhase('feedback');
  }, [phase, trial]);

  // Keyboard handler
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') handleAnswer('different');
      if (e.key === 'ArrowRight') handleAnswer('same');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAnswer]);

  // Demo: both objects spin one full Y rotation together.
  // The right object simultaneously corrects its baked-in rotation angle
  // so that both land visually at 0° (aligned) and hold there.
  function startDemo() {
    setPhase('demo');
    const Y = new THREE.Vector3(0, 1, 0);
    // Right object cubes are pre-baked at +rotationAngle.
    // Applying this correction makes the group look at 0° (same as left).
    const correction = -(trial.rotationAngle * Math.PI) / 180;
    const FULL_SPIN = Math.PI * 2;
    const STEP = 0.03; // ~1.7° per frame at 60 fps
    let spin = 0;

    function animate() {
      spin = Math.min(spin + STEP, FULL_SPIN);
      const progress = spin / FULL_SPIN; // 0 → 1

      // Left spins from 0 → 2π → back to identity
      const lQ = new THREE.Quaternion().setFromAxisAngle(Y, spin);
      // Right spins the same, plus gradually applies correction so it lands aligned
      const rQ = new THREE.Quaternion().setFromAxisAngle(Y, spin + correction * progress);

      setLeftDemoQ(lQ);
      setRightDemoQ(rQ);

      if (spin < FULL_SPIN) {
        demoFrame.current = requestAnimationFrame(animate);
      } else {
        // Hold at final aligned position
        setPhase('done');
      }
    }
    demoFrame.current = requestAnimationFrame(animate);
  }

  useEffect(() => () => cancelAnimationFrame(demoFrame.current), []);

  function handleNext() {
    answered.current = false;
    setResult(null);
    setLeftDemoQ(null);
    setRightDemoQ(null);
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setPhase('task');
    } else {
      navigate('/train', { state: { mode: 'experiment' } });
    }
  }

  return (
    <div className="view task-view">
      <p className="task-counter">
        {t('practice.counter', { current: index + 1, total })}
      </p>

      <div className="scene-container">
        <MRScene
          leftCubes={leftCubes}
          rightCubes={rightCubes}
          quaternion={phase === 'demo' || phase === 'done' ? leftDemoQ : null}
          rightQuaternion={phase === 'demo' || phase === 'done' ? rightDemoQ : undefined}
        />
      </div>

      {/* Fixed-height bottom area prevents layout shifts between phases */}
      <div className="practice-bottom">
        {phase === 'task' && (
          <div className="answer-buttons">
            <button className="btn-different" onClick={() => handleAnswer('different')}>
              {t('task.differentButton')}
            </button>
            <button className="btn-same" onClick={() => handleAnswer('same')}>
              {t('task.sameButton')}
            </button>
          </div>
        )}

        {phase === 'feedback' && result && (
          <div className={`feedback-box ${result.isCorrect ? 'correct' : 'incorrect'}`}>
            <p>{result.isCorrect ? t('practice.correct') : t('practice.incorrect')}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {t('practice.correctAnswer', { answer: result.correctAnswer })}
            </p>
            <button onClick={startDemo} style={{ marginTop: '0.75rem' }}>
              {t('practice.nextButton')}
            </button>
          </div>
        )}

        {phase === 'demo' && (
          <p className="demo-note">{t('practice.demoNote')}</p>
        )}

        {phase === 'done' && (
          <div className="feedback-box correct">
            <button onClick={handleNext}>
              {index + 1 < total ? t('practice.nextButton') : t('practice.startExperiment')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
