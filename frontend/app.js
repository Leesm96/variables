const API_ENDPOINT = '/advice/quick';
const DEFAULT_ISSUE = 'bitter';

const homeScreen = document.getElementById('home-screen');
const resultScreen = document.getElementById('result-screen');
const resultIssue = document.getElementById('result-issue');
const resultAdvice = document.getElementById('result-advice');
const backButton = document.getElementById('back-button');
const buttons = Array.from(document.querySelectorAll('.issue-button'));

function showHome() {
  homeScreen.classList.add('active');
  resultScreen.classList.remove('active');
}

function showResult() {
  homeScreen.classList.remove('active');
  resultScreen.classList.add('active');
}

async function fetchAdvice(issue) {
  const response = await fetch(`${API_ENDPOINT}?issue=${encodeURIComponent(issue)}`);
  if (!response.ok) {
    throw new Error('조언을 불러오지 못했습니다.');
  }
  return response.json();
}

async function handleIssueSelection(issue) {
  const chosenIssue = issue || DEFAULT_ISSUE;
  resultIssue.textContent = `상태: ${chosenIssue}`;
  resultAdvice.textContent = '조언을 불러오는 중입니다...';
  showResult();

  try {
    const payload = await fetchAdvice(chosenIssue);
    resultIssue.textContent = `상태: ${payload.issue}`;
    resultAdvice.textContent = payload.advice;
  } catch (error) {
    resultAdvice.textContent = `${error.message} (기본 안내: 천천히 심호흡 해 보세요.)`;
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const issue = button.dataset.issue;
    handleIssueSelection(issue);
  });
});

backButton.addEventListener('click', showHome);

// 노출된 상태가 없을 때도 바로 사용 가능하도록 초기 상태 설정
if (buttons.length > 0) {
  handleIssueSelection(DEFAULT_ISSUE);
}
