import { useMemo, useState } from 'react';
import { Input } from './screens/Input';
import { Result } from './screens/Result';
import { BrewInputs, EngineResponse } from './types';
import { requestEngine } from './api/engine';

const optimisticFromInput = (input: BrewInputs): EngineResponse => ({
  issuedAt: new Date().toISOString(),
  flavorProjection: `${input.tasteNote || '균형'} · 예상 농도 ${input.tds.toFixed(1)}%`,
  topAdjustments: [
    { name: '분쇄도 미세 조정', priority: 1 },
    { name: '도징 ±0.3g', priority: 2 },
    { name: '추출 시간 1초 조정', priority: 3 },
  ],
  valueTweaks: [
    { field: 'dose', change: '+0.2g', reason: '단맛 확보' },
    { field: 'yield', change: '-1g', reason: '농도 유지' },
  ],
  contextualHints: ['엔진 응답이 도착하면 자동으로 업데이트됩니다.'],
  feedbackSchema: {
    rule: '즉시 미리보기',
    reasoning: '입력값을 기반으로 한 가벼운 프리뷰입니다.',
  },
  echo: input,
  advisoryNote: '스켈레톤은 1초 미만만 표시되고, 이후에는 미리보기로 전환됩니다.',
});

export function App() {
  const [lastInput, setLastInput] = useState<BrewInputs | undefined>();
  const [response, setResponse] = useState<EngineResponse | undefined>();
  const [optimistic, setOptimistic] = useState<EngineResponse | undefined>();
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (input: BrewInputs) => {
    setLastInput(input);
    setLoading(true);
    setShowSkeleton(true);
    setError(undefined);
    setOptimistic(optimisticFromInput(input));
    setResponse(undefined);

    const skeletonTimeout = window.setTimeout(() => setShowSkeleton(false), 800);

    try {
      const result = await requestEngine(input);
      setResponse(result);
    } catch (err) {
      setError('엔진 호출에 실패했습니다. 네트워크 상태를 확인해주세요.');
    } finally {
      setLoading(false);
      window.clearTimeout(skeletonTimeout);
      setShowSkeleton(false);
    }
  };

  const canShowResult = useMemo(() => Boolean(response || optimistic), [response, optimistic]);

  return (
    <main className="app-shell">
      <section className="panel active">
        <header className="hero">
          <p className="eyebrow">BeanStation AI</p>
          <h1>추출 변수를 입력하고 엔진을 호출하세요</h1>
          <p className="lede">숫자와 단위 검증을 통과해야 합니다. 엔진 응답은 1초 내 미리보기를 제공합니다.</p>
        </header>

        <div className="layout">
          <div className="layout__column">
            <Input defaultValues={lastInput} onSubmit={handleSubmit} submitting={loading} />
          </div>

          <div className="layout__column">
            {canShowResult ? (
              <Result
                data={response}
                optimistic={optimistic}
                loading={loading}
                showSkeleton={showSkeleton}
                error={error}
                onBack={() => setLastInput(undefined)}
              />
            ) : (
              <div className="placeholder">
                <p>엔진 응답이 이 영역에 표시됩니다.</p>
                <p className="muted">입력 후 최대 1초 이내에 미리보기를 확인하세요.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
