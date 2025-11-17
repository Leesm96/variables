# MVP 1.0 변수 정의 및 인터페이스

아래 표는 바리스타가 입력하는 변수와 모델이 반환하는 결과값을 정리한 것이다. 모든 필드는 프런트·백엔드에서 동일한 키를 사용하며, 누락 시 `null`을 허용한다.

## 입력 필드

| 키 | 설명 | 형식/단위 | 예시 |
| --- | --- | --- | --- |
| `dose` | 한 번 추출에 사용한 원두의 투입량(도징) | number (g) | `18.5` |
| `yield` | 추출된 최종 음료량 | number (g 또는 mL) | `36` |
| `time` | 추출에 소요된 총 시간 | number (초) | `28` |
| `temperature` | 추출 시 설정한 물 온도 | number (°C) | `93` |
| `taste_note` | 현 시점의 컵 프로파일 또는 맛 상태 요약 | string | `"밸런스 양호, 단맛 부족"` |
| `roast_date` | 로스팅 완료 후 경과일 | string (ISO 날짜) | `"2024-05-01"` |
| `shop_temperature` | 매장 혹은 머신 주변 온도 | number (°C) | `25` |
| `tds` | 추출액의 TDS 측정값 | number (%) | `9.8` |
| `roast_level` | 로스팅 단계(라이트/미디엄/다크 등) | string (enum) | `"Medium"` |

## 출력 필드

| 키 | 설명 | 형식/예시 |
| --- | --- | --- |
| `top_adjustments` | 우선 적용해야 할 TOP3 조정 요소 리스트 | `[{ name: "그라인더 분쇄도", priority: 1 }, ...]` |
| `value_tweaks` | 조정 요소별 권장 수치 변경안 | `[{ field: "dose", change: "+0.5g" }, { field: "yield", change: "-2g" }]` |
| `flavor_projection` | 조정 시 예상되는 맛 변화 요약 | `"단맛+1, 바디-1, 밸런스 유지"` |
| `contextual_hints` | 환경별 추가 팁(날씨, 로스팅일, 머신 상태 등) | `["습도 높을 때 분쇄도 미세 조정", ...]` |
| `feedback_schema` | 모델이 참조한 피드백 구조(근거, 규칙, 출처 등) | `{ rule: "SCA 추출 가이드", reasoning: "TDS 9%로 수율 낮음" }` |

## JSON 계약 예시

프런트엔드와 백엔드가 공통으로 사용하는 요청/응답 스키마 예시는 다음과 같다. 스키마 버전은 `version` 필드로 관리한다.

```json
{
  "version": "1.0",
  "request": {
    "dose": 18.5,
    "yield": 36,
    "time": 28,
    "temperature": 93,
    "taste_note": "밸런스 양호, 단맛 부족",
    "roast_date": "2024-05-01",
    "shop_temperature": 25,
    "tds": 9.8,
    "roast_level": "Medium"
  },
  "response": {
    "top_adjustments": [
      { "name": "그라인더 분쇄도", "priority": 1 },
      { "name": "도징", "priority": 2 },
      { "name": "추출 시간", "priority": 3 }
    ],
    "value_tweaks": [
      { "field": "dose", "change": "+0.5g" },
      { "field": "yield", "change": "-2g" },
      { "field": "time", "change": "+2s" }
    ],
    "flavor_projection": "단맛↑, 바디 약간↓, 과다 추출 리스크 감소",
    "contextual_hints": [
      "습도가 높은 날은 분쇄도를 한 단계 곱게 조정",
      "로스팅 10일 이후에는 추출 온도 +1°C 권장"
    ],
    "feedback_schema": {
      "rule": "SCA 추출 가이드",
      "reasoning": "TDS 9%와 추출량 1:2 비율로 수율이 낮은 편",
      "source": "Barista playbook v1.0"
    }
  }
}
```
