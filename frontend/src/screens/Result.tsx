import { EngineResponse } from '../types';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { ResultSkeleton } from '../components/ResultSkeleton';

interface ResultProps {
  data?: EngineResponse;
  optimistic?: EngineResponse;
  loading?: boolean;
  showSkeleton?: boolean;
  error?: string;
  onBack: () => void;
}

function AdjustmentsList({ title, items }: { title: string; items: EngineResponse['topAdjustments'] }) {
  return (
    <section className="card" aria-label={title}>
      <header className="card__header">
        <div className="pill pill--muted">{title}</div>
        <p className="card__title">우선순위를 확인하세요</p>
      </header>
      <ol className="list">
        {items.map((item) => (
          <li key={`${item.priority}-${item.name}`}>
            <span className="pill pill--ghost">{item.priority}</span>
            <div>
              <p className="list__title">{item.name}</p>
              {item.rationale && <p className="list__desc">{item.rationale}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TweaksList({ tweaks }: { tweaks: EngineResponse['valueTweaks'] }) {
  return (
    <section className="card" aria-label="수치 조정안">
      <header className="card__header">
        <div className="pill pill--muted">수치 조정</div>
        <p className="card__title">바로 적용 가능한 조정안</p>
      </header>
      <ul className="list list--inline">
        {tweaks.map((item) => (
          <li key={`${item.field}-${item.change}`}>
            <p className="list__title">{item.field}</p>
            <p className="list__desc">{item.change}</p>
            {item.reason && <p className="list__desc">{item.reason}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ContextualHints({ hints }: { hints: string[] }) {
  return (
    <section className="card" aria-label="환경별 추가 힌트">
      <header className="card__header">
        <div className="pill pill--muted">환경 힌트</div>
        <p className="card__title">조건에 맞춘 주의사항</p>
      </header>
      <ul className="list list--bullets">
        {hints.map((hint) => (
          <li key={hint} className="list__desc">
            {hint}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Result({ data, optimistic, loading, showSkeleton, error, onBack }: ResultProps) {
  const renderBody = () => {
    if (showSkeleton) {
      return (
        <div className="stack">
          <ResultSkeleton />
          <ResultSkeleton />
        </div>
      );
    }

    if (error) {
      return <p className="error">{error}</p>;
    }

    const activeData = data || optimistic;

    if (!activeData) {
      return <p className="muted">아직 데이터를 불러오지 않았습니다.</p>;
    }

    return (
      <div className="stack">
        {loading && optimistic && (
          <div className="notice">엔진 응답을 기다리는 동안 예상 결과를 먼저 보여드려요.</div>
        )}
        <section className="card" aria-label="엔진 요약">
          <header className="card__header">
            <div className="pill">엔진 응답</div>
            <p className="card__title">{activeData.flavorProjection}</p>
            <p className="card__meta">업데이트: {new Date(activeData.issuedAt).toLocaleTimeString()}</p>
          </header>
          {activeData.advisoryNote && <p className="card__body">{activeData.advisoryNote}</p>}
        </section>

        <AdjustmentsList title="우선 조정" items={activeData.topAdjustments} />
        <TweaksList tweaks={activeData.valueTweaks} />
        <ContextualHints hints={activeData.contextualHints} />
        <FeedbackPanel feedback={activeData.feedbackSchema} />
      </div>
    );
  };

  return (
    <section className="panel" aria-live="polite">
      <button className="ghost" onClick={onBack}>
        ← 입력으로 돌아가기
      </button>
      {renderBody()}
    </section>
  );
}
