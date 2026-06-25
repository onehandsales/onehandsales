# UX/UI Reference Style Decision

## 결정

`example.html`은 UX/UI 방향 참고용으로 사용한다.

구현 기준은 `AGENT` 문서이며, `example.html`을 그대로 복제하지 않는다.

## 선호 방향

사용자는 토스 UX/UI처럼 심플하고 깔끔한 스타일을 선호한다.

이 프로젝트에서는 이를 다음처럼 해석한다.

- 정보 위계가 명확하다.
- 필요한 정보가 먼저 보인다.
- 액션 버튼이 명확하다.
- 장식보다 업무 흐름이 우선이다.
- 텍스트와 상태 표시가 읽기 쉽다.
- 화면이 과하게 복잡하지 않지만, 딜 비교에 필요한 정보 밀도는 유지한다.

## 외부 UX reference 적용 규칙

외부 제품은 구현 복제 대상이 아니라 패턴 reference로만 사용한다.

| Reference | 참고할 부분 | 복제하지 않을 부분 |
|---|---|---|
| Toss | 단순한 정보 위계, 명확한 CTA, 낮은 시각 소음, 읽기 쉬운 typography | 소비자 금융 앱처럼 너무 sparse한 화면 |
| Pipedrive | 영업 pipeline 중심성, 딜 단계 인식, next action 중심 흐름 | desktop 기본 화면을 pure Kanban으로 고정하는 방식 |
| Attio | 회사/사람/딜 record 관계, activity timeline, linked record detail | 팀 협업 CRM의 과한 custom object 복잡도 |
| Linear | list-first 탐색, 빠른 선택, peek/detail panel, command/search 감각 | 개발 도구 특유의 issue 중심 용어와 단축키 의존 UX |
| Google Calendar | 월간 calendar 기본값, 주간 view 전환, 일정 밀도 | Google 제품 brand/copy/visual asset |
| Airtable Interface Designer | Admin의 table/filter/detail panel 운영 콘솔 구조 | no-code builder처럼 사용자가 화면 자체를 구성하는 UX |
| Monday/Salesforce | 참고 우선순위 낮음. 복잡한 enterprise CRM의 위험 요소를 피하는 반례 | 화려한 dashboard, 무거운 CRM density, 과한 자동화/설정 노출 |

Reference URL:

- Pipedrive pipeline management: https://www.pipedrive.com/en/features/pipeline-management
- Attio records: https://attio.com/help/reference/attio-101/attios-data-model/understanding-records
- Linear Peek: https://linear.app/docs/peek
- Airtable Interface Designer: https://www.airtable.com/platform/interface-designer

User Web은 `Toss식 정보 위계 + Pipedrive/Attio식 영업 record 구조 + Linear식 빠른 탐색`을 조합한다.

Admin Web은 `Airtable식 table/filter/detail panel 운영 콘솔`을 참고하되, 민감정보 masking, reason dialog, audit trail을 우선한다.

## UI 밀도

중간 밀도로 간다.

- 여유 있는 여백과 명확한 정보 위계를 유지한다.
- 한 화면에서 딜을 비교할 수 있는 행 수와 필드는 확보한다.
- 너무 sparse한 소비자 앱 화면은 피한다.
- 너무 촘촘한 ERP/관리자툴 느낌도 피한다.

## 색상 방향

화이트/그레이 기반에 블루 중심으로 간다.

이유:

- 신뢰감을 주기 위해서다.
- 주요 액션을 명확하게 만들기 위해서다.
- 토스식 심플함과 잘 맞는다.

사용 원칙:

- 서비스 주 색상: `#1F4EF5`, `#4880EE`, `#83B4F9`
- `#1F4EF5`: 강한 primary, 주요 CTA, 선택 상태, 활성 탭
- `#4880EE`: 기본 primary action, 포커스, 중요 링크, 확인/완료 피드백
- `#83B4F9`: 보조 blue, hover, 낮은 강조 accent
- 블루 계열 채움형 UI는 테두리도 채움색과 동일한 단색으로 맞춘다.
- 그린: 긍정/성사/완료
- 앰버: 주의/후속 필요
- 레드: 실패/지연/위험
- Memo 기록: Log/활동 로그와 구분하되 과하게 튀지 않게 표시

피할 것:

- 베이지/크림톤 지배
- 다크 네이비 지배
- 과한 그라데이션
- 너무 많은 accent color
- 임의의 다른 primary blue/purple 계열 추가
- primary UI에서 강한 blue 채움색과 옅은 blue 테두리를 섞는 방식

## 글자 크기와 가독성

중간으로 간다.

- 30~50대 사용자가 반복해서 봐도 피로하지 않게 한다.
- 딜 비교에 필요한 정보량은 유지한다.
- 너무 작은 ERP형 테이블 폰트는 피한다.
- 너무 큰 소비자 앱형 폰트도 피한다.
- 금액, 단계, 다음 행동 같은 핵심 정보는 명확하게 보이게 한다.

## 딜 리스트 정보 순서

Desktop:

```text
딜명 -> 회사/담당자 -> 단계 -> 금액 -> 가능성 -> 다음 행동 -> 마감일
```

Mobile:

```text
딜명
회사/담당자
단계 · 금액 · 가능성
다음 행동
마감일
```

의도:

- 딜 맥락을 먼저 인지한다.
- 상태와 금액을 비교한다.
- 다음 행동으로 이어진다.

모바일 파이프라인:

- 단계 탭 + 카드형 리스트
- 테이블 기본값 금지
- 가로 칸반 기본값 금지
- 다음 행동과 마감일을 카드에서 즉시 확인 가능하게 표시

## 채택할 구조

- 좌측 사이드바
- 상단바
- 단계 탭
- 검색/필터
- 딜 리스트/테이블
- 우측 상세 패널
- 모달 기반 빠른 등록
- 상태 badge

## 조정할 부분

- 브랜드는 `한손에 영업 / onehand.sales`.
- `오프더레코드` UI 표현은 사용하지 않는다.
- 도메인별 주관 메모는 `Memo 기록`이라고 부른다.
- 가능성 기본 표시는 `긍정 / 중립 / 부정`.
- 숫자 퍼센트 가능성은 고급 옵션으로만 둔다.
- 베이지/크림 계열이 화면 전체를 지배하지 않게 한다.

## 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`


