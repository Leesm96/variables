# variables

BeanStation AI 빠른 조언 프로토타입입니다.

## Backend
- 경로: `backend/src/server.js`
- `/advice/quick?issue=bitter` 엔드포인트에서 이슈 기본값(`bitter`)을 주입한 뒤 간단한 엔진을 호출해 조언을 반환합니다.
- `/feedback` POST 엔드포인트는 사용자 입력 스냅샷, 모델 출력, 유저 행동, 평점/이유를 함께 저장하고 맛 저하 비율 상위 이슈를 즉시 집계합니다.
- 로컬 실행: `cd backend && npm start`
- 헬스체크: `/health`

## Frontend
- 정적 UI가 `frontend/index.html`에 있으며 홈 화면에 5개의 바로가기 버튼이 배치되어 있습니다.
- 각 버튼 클릭 시 결과 화면으로 이동하며, 백엔드 `/advice/quick` API에서 조언을 불러옵니다.
- UI 스냅샷 테스트: `cd frontend && npm test`
