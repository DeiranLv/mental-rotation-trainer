import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { t } from '../i18n/i18n';
import MRScene from '../components/MRScene';
import { generateTrials } from '../data/trialGenerator';
import { getShapeCubes } from '../data/experimentTrials';
import { getUserId, isInteractiveFeedbackDone } from '../utils/storage';
import { createTrackball } from '../utils/trackball';
import FeedbackDialog from '../components/FeedbackDialog';

const ITI_MS = 350; // brief inter-trial blank so the new trial reads as new

const Y_AXIS = new THREE.Vector3(0, 1, 0);

function buildCubes(trial) {
  const base = getShapeCubes(trial.objectId);
  const right = trial.isIdentical ? base : getShapeCubes(trial.objectId + '_mirror');
  const angle = (trial.rotationAngle * Math.PI) / 180;
  const rightInitialQ = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, angle);
  return { leftCubes: base, rightCubes: right, rightInitialQ };
}

export default function InteractiveTaskView() {
  const navigate = useNavigate();
  const userId = getUserId();

  const [trials] = useState(() => generateTrials());
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('task'); // 'iti' | 'task'

  // Left object: pure user-drag quaternion
  const quaternionRef = useRef(new THREE.Quaternion());
  // Right object: user-drag composed with the trial's initial Y-rotation offset.
  // Using a ref so the stale setQ closure (captured once by the trackball)
  // always reads the CURRENT initial offset, not the one from mount time.
  const rightQuaternionRef = useRef(new THREE.Quaternion());
  const rightInitialQRef = useRef(new THREE.Quaternion());

  const [dragging, setDragging] = useState(false);
  const sceneRef = useRef(null);
  const startTimeRef = useRef(performance.now());

  // Feedback dialog — shown after last trial if not yet done
  const [showFeedback, setShowFeedback] = useState(false);

  const trial = trials[index];
  const { leftCubes, rightCubes, rightInitialQ } = buildCubes(trial);

  // Synchronously update refs during render when trial changes so there is
  // never a frame where the right object shows at the wrong orientation.
  // (useEffect fires after paint — too late, causes a visible 1-frame jump.)
  const lastIndexRef = useRef(-1);
  if (lastIndexRef.current !== index) {
    lastIndexRef.current = index;
    quaternionRef.current = new THREE.Quaternion();
    rightInitialQRef.current = rightInitialQ.clone();
    rightQuaternionRef.current = rightInitialQ.clone();
  }

  // Trackball instance
  const tbRef = useRef(null);

  function getQ() { return quaternionRef.current; }
  function setQ(q) {
    // Left: pure drag quaternion
    quaternionRef.current = q;
    // Right: drag composed with the current trial's initial offset.
    // Reads rightInitialQRef (not a closed-over value) so this works correctly
    // even though the trackball captured this function once on mount.
    rightQuaternionRef.current = q.clone().multiply(rightInitialQRef.current);
  }

  // Create trackball once scene div is mounted
  const setSceneEl = useCallback((el) => {
    sceneRef.current = el;
    if (!el) return;
    tbRef.current = createTrackball(getQ, setQ);
  }, []);

  // Global pointer events — drag works anywhere on screen
  useEffect(() => {
    function onMove(e) { tbRef.current?.onPointerMove(e); }
    function onUp() {
      tbRef.current?.onPointerUp();
      setDragging(false);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  function handlePointerDown(e) {
    tbRef.current?.onPointerDown(e);
    setDragging(true);
  }

  // Reset rotation for next trial — restore right to its initial offset
  function handleReset() {
    quaternionRef.current = new THREE.Quaternion();
    rightQuaternionRef.current = rightInitialQRef.current.clone();
  }

  const recordAnswer = useCallback((response) => {
    if (phase !== 'task') return;
    const reactionTime = Math.round(performance.now() - startTimeRef.current);
    const isCorrect = (response === 'same') === trial.isIdentical;

    const trialResult = {
      sessionId: null,
      userId,
      mode: 'interactive',
      isPractice: false,
      trialOrder: trial.trialOrder,
      objectId: trial.objectId,
      rotationAngle: trial.rotationAngle,
      isIdentical: trial.isIdentical,
      userResponse: response,
      isCorrect,
      reactionTime,
      isOutlier: false,
      timestamp: Date.now(),
    };

    const newResults = [...results, trialResult];
    setResults(newResults);

    // Reset rotation for next trial
    handleReset();

    if (index + 1 < trials.length) {
      setPhase('iti');
      setTimeout(() => {
        setIndex((i) => i + 1);
        setPhase('task');
      }, ITI_MS);
    } else {
      // Session done — check if feedback needed
      if (!isInteractiveFeedbackDone()) {
        setShowFeedback(true);
      } else {
        navigate('/session-result', { state: { results: newResults, mode: 'interactive' } });
      }
    }
  }, [phase, trial, results, index, trials, userId, navigate]);

  // Reset RT timer whenever a new trial actually becomes active
  useEffect(() => {
    if (phase === 'task') startTimeRef.current = performance.now();
  }, [index, phase]);

  useEffect(() => {
    const onKey = (e) => {
      if (showFeedback || phase !== 'task') return;
      if (e.key === 'ArrowLeft') recordAnswer('different');
      if (e.key === 'ArrowRight') recordAnswer('same');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recordAnswer, showFeedback, phase]);

  function handleFeedbackDone() {
    setShowFeedback(false);
    navigate('/session-result', { state: { results, mode: 'interactive' } });
  }

  return (
    <div className="view task-view">
      <p className="task-counter">
        {t('interactive.counter', { current: index + 1, total: trials.length })}
      </p>

      <p className="interactive-hint">{t('interactive.hint')}</p>

      {/* Scene — only pointerdown here; move/up are on window */}
      <div
        ref={setSceneEl}
        className="scene-container"
        style={{
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          opacity: phase === 'task' ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
        onPointerDown={handlePointerDown}
      >
        <MRScene
          leftCubes={leftCubes}
          rightCubes={rightCubes}
          quaternionRef={quaternionRef}
          rightQuaternionRef={rightQuaternionRef}
          highlight={dragging}
        />
      </div>

      <div
        className="interactive-controls"
        style={{
          opacity: phase === 'task' ? 1 : 0,
          pointerEvents: phase === 'task' ? 'auto' : 'none',
          transition: 'opacity 0.15s',
        }}
      >
        <div className="answer-buttons">
          <button className="btn-different" onClick={() => recordAnswer('different')}>
            {t('interactive.differentButton')}
          </button>
          <button className="btn-same" onClick={() => recordAnswer('same')}>
            {t('interactive.sameButton')}
          </button>
        </div>
        <button className="btn-reset" onClick={handleReset}>
          {t('interactive.resetButton')}
        </button>
      </div>

      {showFeedback && <FeedbackDialog userId={userId} onDone={handleFeedbackDone} />}
    </div>
  );
}
