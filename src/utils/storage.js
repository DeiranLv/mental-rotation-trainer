const KEYS = {
  USER_ID: 'mrt_user_id',
  RESEARCH_CONSENT: 'mrt_research_consent',
  EXPERIMENT_DONE: 'mrt_experiment_done',
  INTERACTIVE_FEEDBACK_DONE: 'mrt_interactive_feedback_done',
  SESSION_NUMBER: 'mrt_session_number',
};

// Firebase anonymous auth sets mrt_user_id on app load.
// This is a synchronous fallback for components that need it before auth resolves.
export function getUserId() {
  return localStorage.getItem(KEYS.USER_ID);
}

export function getResearchConsent() {
  return localStorage.getItem(KEYS.RESEARCH_CONSENT) === 'true';
}

export function setResearchConsent(value) {
  localStorage.setItem(KEYS.RESEARCH_CONSENT, String(value));
}

export function isExperimentDone() {
  return localStorage.getItem(KEYS.EXPERIMENT_DONE) === 'true';
}

export function setExperimentDone() {
  localStorage.setItem(KEYS.EXPERIMENT_DONE, 'true');
}

export function isInteractiveFeedbackDone() {
  return localStorage.getItem(KEYS.INTERACTIVE_FEEDBACK_DONE) === 'true';
}

export function setInteractiveFeedbackDone() {
  localStorage.setItem(KEYS.INTERACTIVE_FEEDBACK_DONE, 'true');
}

// Returns the last saved session number (0 if none yet).
export function getSessionNumber() {
  return parseInt(localStorage.getItem(KEYS.SESSION_NUMBER) || '0', 10);
}

// Increments and saves the session number, returns the new value.
export function incrementSessionNumber() {
  const next = getSessionNumber() + 1;
  localStorage.setItem(KEYS.SESSION_NUMBER, String(next));
  return next;
}
