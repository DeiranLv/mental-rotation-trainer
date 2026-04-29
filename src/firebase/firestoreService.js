import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

/**
 * Saves one session document and all its trials to Firestore atomically-ish.
 * Returns { sessionId, accuracy, avgReactionTime, correctCount, totalTrials }.
 *
 * results – array of trialResult objects from TaskView (isPractice=false)
 * Practice trials are filtered out here, not expected in the array for classic mode,
 * but guarded just in case.
 */
export async function saveSessionWithTrials({ userId, mode, sessionNumber, results }) {
  const taskResults = results.filter((r) => !r.isPractice);

  const totalTrials = taskResults.length;
  const correctCount = taskResults.filter((r) => r.isCorrect).length;
  const accuracy = totalTrials > 0 ? correctCount / totalTrials : 0;

  // Average RT excludes outliers
  const validRT = taskResults.filter((r) => !r.isOutlier);
  const avgReactionTime =
    validRT.length > 0
      ? Math.round(validRT.reduce((s, r) => s + r.reactionTime, 0) / validRT.length)
      : 0;

  // Create session document first to get its auto-generated ID
  const sessionRef = await addDoc(collection(db, 'sessions'), {
    userId,
    mode,
    sessionNumber,
    isPractice: false,
    startedAt: taskResults[0]
      ? new Date(taskResults[0].timestamp)
      : serverTimestamp(),
    completedAt: serverTimestamp(),
    totalTrials,
    correctCount,
    accuracy,
    avgReactionTime,
  });

  // Save all trials in parallel with sessionId backfilled
  await Promise.all(
    taskResults.map((r) =>
      addDoc(collection(db, 'trials'), {
        sessionId: sessionRef.id,
        userId: r.userId,
        mode: r.mode,
        isPractice: false,
        trialOrder: r.trialOrder,
        objectId: r.objectId,
        rotationAngle: r.rotationAngle,
        isIdentical: r.isIdentical,
        userResponse: r.userResponse,
        isCorrect: r.isCorrect,
        reactionTime: r.reactionTime,
        isOutlier: r.isOutlier,
        timestamp: new Date(r.timestamp),
      })
    )
  );

  return { sessionId: sessionRef.id, accuracy, avgReactionTime, correctCount, totalTrials };
}

/**
 * Saves one-time interactive feedback to Firestore.
 */
export async function saveFeedback({ userId, rating, comment }) {
  await addDoc(collection(db, 'interactiveFeedback'), {
    userId,
    rating,
    comment: comment ?? '',
    submittedAt: serverTimestamp(),
  });
}

/**
 * Fetches all sessions for a user, ordered by completedAt ascending.
 * Returns plain objects with JS Date fields.
 */
export async function fetchUserSessions(userId) {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side — avoids needing a composite Firestore index
  return docs.sort((a, b) => {
    const ta = a.completedAt?.toMillis?.() ?? 0;
    const tb = b.completedAt?.toMillis?.() ?? 0;
    return ta - tb;
  });
}

/**
 * Fetches all trials for a user.
 */
export async function fetchUserTrials(userId) {
  const q = query(
    collection(db, 'trials'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
