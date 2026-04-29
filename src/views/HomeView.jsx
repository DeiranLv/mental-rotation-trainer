import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../i18n/i18n';
import { setResearchConsent, getUserId } from '../utils/storage';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

// ─── TEMPORARY Firebase connection test — remove before production ───────────
function FirebaseTestPanel() {
  const [status, setStatus] = useState('');
  const userId = getUserId();

  async function handleWrite() {
    try {
      setStatus('Writing...');
      await addDoc(collection(db, 'sessions'), {
        userId,
        mode: 'test',
        sessionNumber: 0,
        isPractice: false,
        startedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        totalTrials: 0,
        correctCount: 0,
        accuracy: 0,
        avgReactionTime: 0,
      });
      setStatus('✓ Write successful');
    } catch (e) {
      setStatus('✗ Write failed: ' + e.message);
    }
  }

  async function handleRead() {
    try {
      setStatus('Reading...');
      const q = query(collection(db, 'sessions'), where('userId', '==', userId));
      const snap = await getDocs(q);
      setStatus(`✓ Read successful — ${snap.size} document(s) found`);
    } catch (e) {
      setStatus('✗ Read failed: ' + e.message);
    }
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed #f90', borderRadius: '8px', maxWidth: '480px', width: '100%', fontSize: '0.8rem' }}>
      <p style={{ color: '#f90', marginBottom: '0.5rem' }}>⚠ Firebase test panel (remove before production)</p>
      <p style={{ color: '#aaa', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
        UID: <code style={{ color: '#4f8ef7' }}>{userId ?? 'not set yet'}</code>
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button onClick={handleWrite} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Write test doc</button>
        <button onClick={handleRead} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Read my docs</button>
      </div>
      {status && <p style={{ color: status.startsWith('✓') ? '#4caf50' : '#f44' }}>{status}</p>}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeView() {
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);

  function handleStart() {
    setResearchConsent(consent);
    navigate('/train');
  }

  return (
    <div className="view">
      <h1>{t('home.title')}</h1>
      <label className="consent-label">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        {t('home.consent')}
      </label>
      <button onClick={handleStart}>{t('home.startButton')}</button>
      <FirebaseTestPanel />
    </div>
  );
}

