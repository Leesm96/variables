import { BrewInputs, EngineResponse } from '../types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const deriveFlavorProjection = (input: BrewInputs) => {
  const notes: string[] = [];
  if (input.tds < 9) notes.push('바디 보완');
  if (input.tds > 10.5) notes.push('과다 추출 주의');
  if (input.temperature > 93.5) notes.push('쓴맛 상승 여지');
  if (input.tasteNote) notes.push(`컵 노트: ${input.tasteNote}`);
  return notes.length > 0 ? notes.join(' · ') : '균형 유지, 작은 조정만 필요';
};

const inferAdjustments = (input: BrewInputs) => {
  const adjustments = [
    {
      name: input.tds > 10 ? '추출량 감소 또는 분쇄도 완화' : '분쇄도 조정',
      priority: 1,
      rationale:
        input.tds > 10
          ? 'TDS가 높아 농도가 짙습니다. 추출 비율을 1:2.1 이하로 유지해 보세요.'
          : 'TDS가 낮아 농도가 약할 수 있습니다. 분쇄도를 조금 더 곱게 조정해 보세요.',
    },
    {
      name: input.temperature >= 94 ? '물 온도 0.5~1°C 하향' : '온도 유지',
      priority: 2,
      rationale:
        input.temperature >= 94
          ? '쓴맛을 줄이기 위해 온도를 살짝 낮춰보세요.'
          : '현재 온도가 안정적이라면 일관성을 유지하세요.',
    },
    {
      name: input.time > 30 ? '추출 시간 단축' : '추출 시간 소폭 연장',
      priority: 3,
      rationale:
        input.time > 30
          ? '길어진 추출 시간으로 바디가 무거울 수 있습니다. 1~2초 줄여보세요.'
          : '바디 확보를 위해 1~2초 늘려보는 것도 좋습니다.',
    },
  ];

  return adjustments.sort((a, b) => a.priority - b.priority);
};

const craftValueTweaks = (input: BrewInputs) => {
  const tweaks = [];
  tweaks.push({ field: 'dose', change: '+0.3g', reason: '단맛 레이어를 조금 더 확보' });
  tweaks.push({ field: 'yield', change: input.yieldUnit === 'g' ? '-1.5g' : '-1.5mL', reason: '농도 유지' });
  tweaks.push({ field: 'time', change: input.time > 30 ? '-1s' : '+1s', reason: '균형 잡힌 바디' });
  return tweaks;
};

export async function requestEngine(input: BrewInputs): Promise<EngineResponse> {
  const simulatedLatency = 420 + Math.random() * 320; // up to ~0.74s
  await wait(simulatedLatency);

  return {
    issuedAt: new Date().toISOString(),
    flavorProjection: deriveFlavorProjection(input),
    topAdjustments: inferAdjustments(input),
    valueTweaks: craftValueTweaks(input),
    contextualHints: [
      '습도가 높은 날은 분쇄도를 한 단계 곱게 조정하세요.',
      input.roastDate ? `로스팅 후 경과일 ${input.roastDate} 기준으로 추출 온도 체크` : '로스팅일을 확인해 주세요.',
      `매장 온도 ${input.shopTemperature}°C 기준으로 예열 시간을 일정하게 유지하세요.`,
    ],
    feedbackSchema: {
      rule: 'SCA 추출 가이드',
      reasoning: 'TDS, 추출 시간, 온도 데이터를 기준으로 우선순위를 산정했습니다.',
      source: 'Barista playbook v1.0',
    },
    echo: input,
    advisoryNote: '엔진 응답을 받는 즉시 최신값으로 자동 새로고침됩니다.',
  };
}
