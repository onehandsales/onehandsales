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
- 화면이 과하게 복잡하지 않지만, 업무 판단에 필요한 정보 밀도는 유지한다.

## 외부 UX reference 적용 규칙

외부 제품은 구현 복제 대상이 아니라 패턴 reference로만 사용한다.

| Reference | 참고할 부분 | 복제하지 않을 부분 |
|---|---|---|
| Toss | 단순한 정보 위계, 명확한 CTA, 낮은 시각 소음, 읽기 쉬운 typography | 소비자 금융 앱처럼 너무 sparse한 화면 |
| Pipedrive | 후속 딜 도메인을 다시 열 때 참고할 pipeline 중심성 | foundation 화면을 pipeline처럼 꾸미는 방식 |
| Attio | CRM record, property-first detail, notes/memo 맥락 | 팀 협업 CRM의 과한 custom object 복잡도 |
| Linear | list-first 탐색, 빠른 선택, peek/detail panel, command/search 감각 | 개발 도구 특유의 issue 중심 용어와 단축키 의존 UX |
| Monday/Salesforce | 참고 우선순위 낮음. 복잡한 enterprise CRM의 위험 요소를 피하는 반례 | 화려한 dashboard, 무거운 CRM density, 과한 자동화/설정 노출 |

Reference URL:

- Pipedrive pipeline management: https://www.pipedrive.com/en/features/pipeline-management
- Attio records: https://attio.com/help/reference/attio-101/attios-data-model/understanding-records
- Linear Peek: https://linear.app/docs/peek
- Airtable Interface Designer: https://www.airtable.com/platform/interface-designer

User Web은 `Toss식 정보 위계 + Attio식 CRM record 구조 + Linear식 빠른 탐색`을 조합한다.

Admin Web은 현재 관리자 권한 확인 전용이므로 별도 관리 화면 reference를 적용하지 않는다.

## UI 밀도

중간 밀도로 간다.

- 여유 있는 여백과 명확한 정보 위계를 유지한다.
- 한 화면에서 업무 record를 비교할 수 있는 행 수와 필드는 확보한다.
- 너무 sparse한 소비자 앱 화면은 피한다.
- 너무 촘촘한 ERP/관리자툴 느낌도 피한다.

## 색상 방향

화이트/중립 그레이 중심의 Notion식 작업공간 톤으로 간다.

블루는 서비스의 중심 색이 아니다.

이유:

- 반복해서 보는 업무 화면에서 시각 피로를 줄이기 위해서다.
- 노트북과 모바일에서 탐색 상태를 차분하게 읽히게 하기 위해서다.
- 색을 브랜드 장식보다 인식, 상태, 행동 우선순위 보조에 쓰기 위해서다.
- Notion식 quiet workspace와 더 잘 맞기 때문이다.

사용 원칙:

- 기본 바탕: white/near-white + neutral gray
- hover, selected, sidebar active, active tab의 기본값은 neutral gray로 둔다.
- 주요 CTA는 필요할 때만 하나의 restrained action color를 사용한다.
- 포커스는 접근성을 위해 충분히 보여야 하며, neutral high-contrast ring 또는 절제된 blue ring을 사용할 수 있다.
- 아이콘 컬러는 메뉴/도메인 인식 보조로 허용한다. 모든 아이콘을 무작위로 컬러화하지 않고 도메인별 안정 규칙을 둔다.
- 그린: 긍정/성사/완료
- 앰버: 주의/후속 필요
- 레드: 실패/지연/위험
- Memo 기록: Log/활동 로그와 구분하되 과하게 튀지 않게 표시

중립 팔레트:

- `#FFFFFF`: page/canvas surface
- `#FAFAF8` / `#F7F7F5`: app/sidebar surface
- `#F1F2F0`: subtle hover/surface
- `#E4E2DC`: stronger hover 또는 pressed surface
- `#D3D1CB`: 더 강한 대비가 필요한 selected/active neutral surface
- `#111827`, `#374151`, `#6B7280`, `#9CA3AF`: primary, secondary, muted, icon text
- `#E5E7EB`, `#E6EAF0`: border/divider

피할 것:

- 베이지/크림톤 지배
- 다크 네이비 지배
- 과한 그라데이션
- 너무 많은 accent color
- 파랑/보라/시안 계열이 사실상 새 primary가 되는 것
- 선택 navigation, active tab, focus를 전부 blue로 처리하는 방식
- 아이콘 컬러를 의미 없이 많이 섞어 rainbow sidebar처럼 보이는 것
- 강한 색 채움과 옅은 색 border를 섞어 component 상태를 흐리는 방식

## 글자 크기와 가독성

중간으로 간다.

- 30~50대 사용자가 반복해서 봐도 피로하지 않게 한다.
- 업무 record 비교에 필요한 정보량은 유지한다.
- 너무 작은 ERP형 테이블 폰트는 피한다.
- 너무 큰 소비자 앱형 폰트도 피한다.
- 핵심 식별값, 상태, 다음 행동 같은 업무 판단 정보는 명확하게 보이게 한다.

## 후속 record 리스트 정보 순서

현재 활성 앱 도메인 목록은 없다.

후속 CRM record 목록을 만들 때는 직업별 핵심 식별값과 상태를 먼저 보여준다.

Desktop:

```text
주요 식별값 -> 상태/분류 -> 지역/채널 -> 최근 업데이트
```

Mobile:

```text
주요 식별값
상태 · 분류
최근 업데이트
```

의도:

- record 맥락을 먼저 인지한다.
- 상태와 분류로 빠르게 비교한다.
- 상세 확인과 수정으로 이어진다.

현재 비활성 범위:

- 딜 pipeline
- 담당자/상품/딜 list/detail
- 다음 행동과 가능성 표시

## 채택할 구조

- 좌측 사이드바
- 상단바
- 후속 검색/필터
- 후속 record 리스트/테이블
- 우측 상세 패널
- 오른쪽 문서형 생성 패널
- 상태 badge

## 조정할 부분

- 브랜드는 `한손에 영업 / onehand.sales`.
- `오프더레코드` UI 표현은 사용하지 않는다.
- 현재 앱 foundation 화면은 삭제된 도메인이나 임시 record를 노출하지 않는다.
- 가능성/다음 행동은 후속 API/FE 필드가 열린 뒤 표시한다.
- 베이지/크림 계열이 화면 전체를 지배하지 않게 한다.

## 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/README.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
