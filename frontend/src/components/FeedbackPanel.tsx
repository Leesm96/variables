import { FeedbackSchema } from '../types';

interface FeedbackPanelProps {
  feedback: FeedbackSchema;
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <section className="card feedback-panel" aria-label="엔진 피드백 근거">
      <header className="card__header">
        <div className="pill pill--muted">피드백 근거</div>
        <p className="card__title">{feedback.rule}</p>
      </header>
      <p className="card__body">{feedback.reasoning}</p>
      {feedback.source && <p className="card__footer">출처: {feedback.source}</p>}
    </section>
  );
}
