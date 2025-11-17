# Database Schema

변수 프로젝트의 데이터 저장 구조를 정의한다. MVP 1.0 범위의 핵심 테이블에 더해, 1.1에서 도입할 예정인 `recipes`, `brew_sessions` 테이블 초안을 포함한다. 모든 사용자 연속 사용 추적은 비식별 해시 키(`user_hash`)로 처리한다.

## MVP 1.0 테이블

### brew_logs
단일 추출 요청과 모델 응답을 기록한다. 입력·출력 스키마는 `docs/mvp1.0-spec.md`와 동일한 키를 사용한다.

| 컬럼 | 타입 | 설명 | 기타 |
| --- | --- | --- | --- |
| `id` | SERIAL PK | 로그 식별자 |  |
| `user_hash` | VARCHAR(64) | 해시된 사용자 식별자. 같은 디바이스·사용자의 연속 사용 패턴 추적용 | **index** |
| `version` | VARCHAR(10) | 요청/응답 스키마 버전(예: `"1.0"`) |  |
| `dose` | NUMERIC(5,2) | g 단위 도징 | NULL 허용 |
| `yield` | NUMERIC(6,2) | g 또는 mL 단위 추출량 | NULL 허용 |
| `time` | NUMERIC(5,2) | 초 단위 추출 시간 | NULL 허용 |
| `temperature` | NUMERIC(4,1) | °C 추출 온도 | NULL 허용 |
| `taste_note` | TEXT | 컵 프로파일 요약 | NULL 허용 |
| `roast_date` | DATE | 로스팅 완료일 | NULL 허용 |
| `shop_temperature` | NUMERIC(4,1) | °C 매장/머신 주변 온도 | NULL 허용 |
| `tds` | NUMERIC(4,2) | % 단위 TDS 측정값 | NULL 허용 |
| `roast_level` | VARCHAR(32) | 로스팅 단계(enum) | NULL 허용 |
| `top_adjustments` | JSONB | 모델 추천 TOP3 조정 요소 리스트 | NULL 허용 |
| `value_tweaks` | JSONB | 각 변수별 권장 변경안 | NULL 허용 |
| `flavor_projection` | TEXT | 예상 맛 변화 요약 | NULL 허용 |
| `contextual_hints` | JSONB | 환경별 추가 팁 리스트 | NULL 허용 |
| `feedback_schema` | JSONB | 모델이 참조한 피드백 근거 구조 | NULL 허용 |
| `created_at` | TIMESTAMPTZ | 생성 시각 | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | 수정 시각 | DEFAULT now() |

### brew_logs_by_session (옵션)
`brew_logs`의 세션 단위 집계를 위한 뷰 또는 머티리얼라이즈드 뷰 초안이다. `user_hash`로 그룹화하여 반복 사용 패턴을 빠르게 조회할 수 있다.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `user_hash` | VARCHAR(64) | 해시된 사용자 키 |
| `log_count` | BIGINT | 기록 수 |
| `last_brew_at` | TIMESTAMPTZ | 최근 기록 시각 |

## 1.1 초안 테이블

### recipes
반복 추출을 위한 레시피 템플릿. 사용자 해시 단위로 개인화된 기본값을 저장한다.

| 컬럼 | 타입 | 설명 | 기타 |
| --- | --- | --- | --- |
| `id` | SERIAL PK | 레시피 식별자 |  |
| `user_hash` | VARCHAR(64) | 레시피 소유 사용자(비식별) | **index** |
| `name` | VARCHAR(100) | 레시피 이름 | NOT NULL |
| `bean_name` | VARCHAR(100) | 원두 이름 | NULL 허용 |
| `roaster` | VARCHAR(100) | 로스터리 정보 | NULL 허용 |
| `roast_level` | VARCHAR(32) | 로스팅 단계 | NULL 허용 |
| `roast_date` | DATE | 로스팅 완료일 | NULL 허용 |
| `brew_method` | VARCHAR(50) | 예: Espresso/Pour-over | NULL 허용 |
| `dose` | NUMERIC(5,2) | g 단위 기본 도징 | NULL 허용 |
| `yield` | NUMERIC(6,2) | g 또는 mL 단위 목표 추출량 | NULL 허용 |
| `temperature` | NUMERIC(4,1) | °C 기본 추출 온도 | NULL 허용 |
| `target_taste` | TEXT | 목표 맛/프로파일 메모 | NULL 허용 |
| `notes` | TEXT | 추가 메모 | NULL 허용 |
| `created_at` | TIMESTAMPTZ | 생성 시각 | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | 수정 시각 | DEFAULT now() |

### brew_sessions
레시피 기반 혹은 즉석 추출 흐름을 세션 단위로 묶어 이력, 실험 시리즈를 관리한다. 후속 버전에서 `brew_logs`와 연계해 세션별 추천 효과를 추적한다.

| 컬럼 | 타입 | 설명 | 기타 |
| --- | --- | --- | --- |
| `id` | SERIAL PK | 세션 식별자 |  |
| `user_hash` | VARCHAR(64) | 세션 소유 사용자(비식별) | **index** |
| `recipe_id` | INT FK → recipes.id | 기반 레시피 | NULL 허용 |
| `title` | VARCHAR(120) | 세션 제목(예: "게이샤 라이트 프로파일 테스트") | NOT NULL |
| `goal` | TEXT | 세션 목표(맛 방향, 문제 정의 등) | NULL 허용 |
| `environment_context` | JSONB | 세션 공통 환경 정보(기기, 수온, 기압 등) | NULL 허용 |
| `iteration_count` | INT | 세션 내 시도 횟수 캐시 | DEFAULT 0 |
| `best_log_id` | INT | 베스트 컵을 기록한 `brew_logs.id` | NULL 허용 |
| `started_at` | TIMESTAMPTZ | 세션 시작 시각 | DEFAULT now() |
| `ended_at` | TIMESTAMPTZ | 세션 종료 시각 | NULL 허용 |
| `status` | VARCHAR(20) | planned/ongoing/closed 등 | DEFAULT 'ongoing' |

### 예정 관계
- `brew_logs.session_id` 컬럼을 1.1에서 추가해 `brew_sessions`에 매핑(현재 MVP에는 존재하지 않음).
- `brew_sessions.recipe_id`를 통해 동일 레시피 기반 세션을 묶고, `user_hash`로 사용자 단위 집계를 지원.
