# UX/UI Common QA Scope

## 1. 이번 계획의 QA 범위

이번 계획은 `FE/user-web`의 UX/UI 공통 QA다.

확인 viewport:

- desktop 1440px
- notebook 1280px
- tablet 768px
- browser zoom 125%

390px/360px 모바일 브라우저 전용 QA는 후속 계획으로 분리한다.

## 1A. 전역 UX/UI Reference 범위

이번 QA의 1차 reference는 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`다.

반드시 가져올 기준:

- sidebar 중심 workspace navigation
- page 중심 화면 구조
- database-like table/list view
- row/card를 열 수 있는 record처럼 다루는 구조
- 목록 맥락을 유지하는 오른쪽 detail/create panel
- Company, Contact, Product, Deal, Schedule, MeetingNote를 고정 sales record로 다루는 구조
- record 간 linked context: 회사 <-> 담당자 <-> 제품 <-> 딜 <-> 일정/회의록
- property-first detail, activity-like section, Memo 기록 구분
- hover/inline/compact action처럼 낮은 시각 소음

가져오지 않을 기준:

- Notion/Attio brand, copy, visual asset, pixel-level layout 복제
- custom object/custom field builder 노출
- 모든 필드를 자유 block editor처럼 만드는 것
- Backend에 없는 Notification, generic Export, Admin 운영, 결제/구독 기능 노출
- desktop 딜 기본 화면을 pure Kanban으로 고정하는 것

## 2. 화면 범위

### P0

- `/app`
- `/app/deals`
- AppShell, Sidebar, TopBar, MobileAppHeader, BottomTabBar
- 회사/담당자/제품/딜 생성 흐름

### P1

- `/app/companies`
- `/app/contacts`
- `/app/products`
- `/app/schedules`
- `/app/meeting-notes`
- `/app/business-cards`
- `/app/import`
- `/app/trash`

### P2

- `/app/settings`
- `/app/more`
- 공개/인증 화면의 기본 tone check

## 3. 레이아웃 기준

- 주요 화면이 1440px에서 과하게 비거나 답답하지 않다.
- 1280px에서 sidebar, topbar, 본문, 우측 패널이 겹치지 않는다.
- 768px에서 핵심 정보와 주요 action이 유지된다.
- 125% 확대에서 버튼, 텍스트, 입력창이 겹치지 않는다.
- 긴 회사명/담당자명/제품명/딜이름이 layout을 깨지 않는다.
- 긴 이메일/전화번호/URL이 부모 영역을 뚫지 않는다.
- 카드 안에 카드가 과하게 중첩되지 않는다.
- 페이지 섹션을 불필요한 카드로 감싸지 않는다.

## 4. 정보 구조 기준

`/app` 홈:

- 오늘 일정, 진행 중 딜, 마감 임박 딜, 최근 회의록이 바로 읽힌다.
- 빠른 실행은 실제 주요 업무로 이어진다.
- 장식적 카드보다 오늘 해야 할 일이 먼저 보인다.
- 홈의 각 항목은 연결 record로 이동하거나 관련 record 맥락을 보여준다.

`/app/deals`:

- 딜 단계가 한눈에 보인다.
- 딜명, 회사, 담당자, 금액, 단계, 다음 행동, 마감일이 비교 가능하다.
- 다음 행동이 1급 정보로 보인다.
- 필터/검색/정렬 위치가 예측 가능하다.
- 상세 진입 또는 상세 패널이 자연스럽다.
- 딜 row는 Notion database row처럼 조밀하게 읽히고, Attio deal record처럼 연결 회사/담당자/제품 맥락이 분명하다.

도메인 목록:

- 목록에서 핵심 비교 정보가 보인다.
- 생성 action과 export action이 혼동되지 않는다.
- 상세에서 기본 정보, 연결 정보, 메모/활동이 구분된다.
- 회사/담당자/제품/일정/회의록은 독립 record로 열리고, 관련 딜과 연결 record가 분명히 보인다.

## 5. 입력 UX 기준

대상:

- 회사 생성/수정
- 담당자 생성/수정
- 제품 생성/수정
- 딜 생성/수정
- 일정 생성/수정
- 회의록 작성/수정
- 명함스캔 결과 수정
- Import row 수정

기준:

- 필수 입력이 과하게 무겁게 보이지 않는다.
- 저장 버튼 위치가 예측 가능하다.
- 저장 중 loading/disabled 상태가 보인다.
- validation error가 해당 입력 근처에 보인다.
- 닫기/취소/저장 동작이 명확하다.
- 삭제는 `ConfirmDialog`를 사용한다.
- 브라우저 `window.confirm`은 사용하지 않는다.

## 6. 상태 기준

각 주요 화면에서 아래 상태를 확인한다.

- loading
- empty
- error
- success
- validation error
- unauthorized/session expired
- delete confirm
- restore success/failure
- provider failure: OCR, AI, STT, Import mapping

## 7. UX Writing 기준

`AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`를 따른다.

우선 수정 대상:

- `저장되었습니다` -> `저장했어요`
- `등록되었습니다` -> `등록했어요`
- `삭제되었습니다` -> `삭제했어요`
- `복구되었습니다` -> `복구했어요`
- `없습니다` -> 다음 행동 안내
- `필요합니다` -> `입력해 주세요` 또는 `선택해 주세요`
- `불러오는 중입니다` -> `불러오고 있어요`

## 8. 접근성 기본 기준

- Tab으로 주요 버튼과 입력창 이동이 가능하다.
- focus 위치가 보인다.
- Enter/Escape가 dialog에서 자연스럽다.
- icon-only 버튼에는 `aria-label` 또는 tooltip이 있다.
- 입력 필드에는 label이 있다.
- 에러 메시지는 입력 필드 근처에 있다.
- 색상만으로 상태를 구분하지 않는다.

## 9. 시각 톤 기준

- 개인 영업자를 위한 조용한 실무 도구로 보인다.
- Notion식 sidebar/page/database/detail 구조가 느껴진다.
- Attio식 CRM record 관계, linked record, property-first detail, activity/Memo 맥락이 느껴진다.
- 앱 내부에 마케팅 hero/card-heavy 화면이 없다.
- 베이지/크림, 과한 다크 네이비, 과한 그라데이션이 화면을 지배하지 않는다.
- 블루는 CTA, 선택, 포커스에 절제되어 쓰인다.
- 중요한 숫자와 다음 행동이 낮은 대비로 묻히지 않는다.
