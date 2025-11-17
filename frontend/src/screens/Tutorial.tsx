import { useMemo, useState } from 'react';
import tutorials from '../data/tutorials.json';

type Tutorial = (typeof tutorials)[number];

export function Tutorial() {
  const [selectedId, setSelectedId] = useState<string>(tutorials[0]?.id ?? '');

  const activeTutorial: Tutorial | undefined = useMemo(
    () => tutorials.find((tutorial) => tutorial.id === selectedId) ?? tutorials[0],
    [selectedId]
  );

  if (!activeTutorial) {
    return null;
  }

  return (
    <main className="app-shell">
      <section className="panel active">
        <header className="hero">
          <p className="eyebrow">BeanStation AI 가이드</p>
          <h1>튜토리얼 카드로 변수 학습하기</h1>
          <p className="lede">
            현장에서 바로 써먹을 수 있는 카드 모음입니다. 리스트에서 카드를 선택하면 세부 단계를 확인할 수
            있습니다.
          </p>
        </header>

        <div className="layout">
          <div className="layout__column">
            <p className="muted">카드를 눌러 디테일을 확인하세요.</p>
            <ul className="list">
              {tutorials.map((tutorial) => (
                <li key={tutorial.id}>
                  <button
                    type="button"
                    className={`card card-button ${tutorial.id === activeTutorial.id ? 'card--active' : ''}`}
                    onClick={() => setSelectedId(tutorial.id)}
                    aria-pressed={tutorial.id === activeTutorial.id}
                  >
                    <div className="card__header">
                      <div className="pill pill--ghost">{tutorial.level}</div>
                      <h3 className="card__title">{tutorial.title}</h3>
                      <p className="card__meta">
                        {tutorial.duration} · {tutorial.tags.join(' · ')}
                      </p>
                    </div>
                    <p className="card__body">{tutorial.summary}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="layout__column">
            <article className="card">
              <div className="card__header">
                <div className="pill pill--ghost">{activeTutorial.level}</div>
                <h2 className="card__title">{activeTutorial.title}</h2>
                <div className="tutorial__meta">
                  <span className="pill pill--muted">{activeTutorial.duration}</span>
                  <div className="tutorial__tags">
                    {activeTutorial.tags.map((tag) => (
                      <span key={tag} className="pill pill--ghost">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="card__body">{activeTutorial.summary}</p>
              <div className="notice">{activeTutorial.spotlight}</div>

              <div className="stack">
                <div>
                  <p className="list__title">학습 목표</p>
                  <ul className="list list--bullets">
                    {activeTutorial.objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div className="stack">
                  <p className="list__title">실습 단계</p>
                  <div className="stack">
                    {activeTutorial.steps.map((step, index) => (
                      <div key={step.title} className="card card--nested">
                        <div className="pill pill--muted">Step {index + 1}</div>
                        <h4 className="card__title">{step.title}</h4>
                        <p className="card__body">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
