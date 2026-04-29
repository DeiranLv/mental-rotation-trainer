import { useState } from 'react';
import { t } from '../i18n/i18n';
import { setInteractiveFeedbackDone } from '../utils/storage';
import { saveFeedback } from '../firebase/firestoreService';

export default function FeedbackDialog({ userId, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await saveFeedback({ userId, rating, comment });
    } catch (e) {
      console.error('Feedback save failed:', e);
    } finally {
      setInteractiveFeedbackDone();
      setSubmitting(false);
      onDone();
    }
  }

  function handleSkip() {
    setInteractiveFeedbackDone();
    onDone();
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2 className="dialog-title">{t('feedback.title')}</h2>

        <div className="dialog-field">
          <label className="dialog-label">{t('feedback.ratingLabel')}</label>
          <div className="rating-row">
            <span className="rating-min">1</span>
            <input
              type="range"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rating-slider"
            />
            <span className="rating-max">10</span>
            <span className="rating-value">{rating}</span>
          </div>
        </div>

        <div className="dialog-field">
          <label className="dialog-label">{t('feedback.commentLabel')}</label>
          <textarea
            className="dialog-textarea"
            rows={4}
            placeholder={t('feedback.commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="dialog-actions">
          <button className="btn-skip" onClick={handleSkip} disabled={submitting}>
            {t('feedback.skipButton')}
          </button>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '…' : t('feedback.submitButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
