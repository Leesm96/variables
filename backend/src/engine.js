const DEFAULT_ISSUE = 'bitter';

const ADVICE_LIBRARY = {
  bitter:
    '쓴맛이 강하게 느껴진다면 한 모금의 물로 입맛을 정리하고, 부드러운 맛을 먼저 시도해 보세요.',
  stress:
    '스트레스가 높을 땐 심호흡을 하고, 짧은 산책으로 마음을 가볍게 만들어 보세요.',
  focus:
    '집중이 안 될 때는 할 일을 작게 쪼개고, 25분 집중 후 5분 휴식을 반복해 보세요.',
  calm: '긴장이 된다면 등을 펴고 깊은 호흡을 두 번 한 뒤 천천히 말해 보세요.',
  energy: '에너지가 부족하면 가벼운 스트레칭과 물 한 컵으로 몸을 깨워 보세요.',
};

function normalizeIssue(issue) {
  return (issue || '').toString().trim().toLowerCase();
}

function fetchQuickAdvice(issueValue) {
  const normalizedIssue = normalizeIssue(issueValue) || DEFAULT_ISSUE;
  const advice =
    ADVICE_LIBRARY[normalizedIssue] ||
    `지금 느끼는 '${normalizedIssue}' 상태를 차분히 바라보고, 몸을 편안하게 하는 짧은 호흡부터 시작해 보세요.`;

  return { issue: normalizedIssue, advice };
}

module.exports = { DEFAULT_ISSUE, fetchQuickAdvice };
