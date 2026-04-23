import { v4 as uuidv4 } from 'uuid';

const KEYS = {
  USER_ID: 'mrt_user_id',
  RESEARCH_CONSENT: 'mrt_research_consent',
};

export function getOrCreateUserId() {
  let id = localStorage.getItem(KEYS.USER_ID);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(KEYS.USER_ID, id);
  }
  return id;
}

export function getResearchConsent() {
  return localStorage.getItem(KEYS.RESEARCH_CONSENT) === 'true';
}

export function setResearchConsent(value) {
  localStorage.setItem(KEYS.RESEARCH_CONSENT, String(value));
}
