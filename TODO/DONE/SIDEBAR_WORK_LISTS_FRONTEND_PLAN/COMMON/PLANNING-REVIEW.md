# 업무 목록 Frontend 기획 검토

- 일자: 2026-10-24
- 판정: 통과 — 구현 착수 가능
- 대상: 계획 README, 기존 Backend API 계약, Frontend 사용 계약, FE-TODO, 실제 AppShell/SidebarNav
- 기준: Front Agent 엔지니어링 리뷰 체크리스트와 UXUI reference, PM 기획 검토 기준

사용자가 합의한 목록 표시 범위를 구현하며 기존 관리 항목과 같은 UI 규격을 사용한다. API에는 없는 기록·View·선택 상태를 생성하지 않는다. 기본 View를 여는 전체 UX는 후속 작업임을 구분했다.

단수형 feature 내부 API/타입/Query factory, 공통 UI 재사용, apiClient 인증 경계와 사용자/Workspace 캐시 분리가 구체화됐다. 로딩/빈 목록/오류/성공/재시도와 한국어·영어를 다룬다. 신규 API·DB·mutation은 없으므로 별도 트랜잭션이나 API 확정 질문이 필요 없다.

오래된 Front Agent overview의 CRM 미구현 설명은 현재 실제 Object/Workspace 코드와 구현된 Backend 계약보다 우선하지 않는다. 해당 문서의 feature·인증·테스트·주석 규칙은 유지한다.

## 구현 완료 검토

- 판정: 요청 범위 통과 / 추가 실행한 기존 생성 모달 테스트 2건은 불일치 잔존
- 단수형 crm-list feature의 타입/API/Query Key/Hook/export, 공통 apiClient와 IconValueGlyph 사용을 확인했다.
- 사용자/Workspace Key 분리와 현재 Workspace 조회, 서버 순서 유지, 30px 행·14px 글자, 기본 아이콘, 접힘/펼침, 상태 처리를 확인했다.
- 새 E2E 4건으로 정상·로딩·빈 목록·오류 재시도·Workspace 전환을 검증했고 기존 헤더 E2E도 통과했다. 헤더 테스트의 화면 캡처로 두 사이드바 영역의 표시를 확인했다.
- typecheck/lint/단위 테스트 33개/build가 통과했다. 최초 콜백 의존성 lint 경고는 수정됐다. 기존 빌드 chunk 크기 경고는 남는다.
- 기존 관리 항목 생성 E2E는 제거된 속성 입력 단계를 기대하고, Workspace 생성 E2E는 현재 파란색 제목을 회색으로 기대해 실패했다. 해당 코드·테스트는 이번에 수정하지 않았고 HEAD 구현과 동일하다. API 목록 연동에서 이 화면을 변경해 테스트에 맞추지 않았다.
- Backend 코드·schema·migration·Admin Web·인증 client·route·의존성 파일 변경은 없다. 최초 구현 완료 당시에는 커밋하지 않았으며, 이후 사용자의 명시적 커밋 요청에 따라 관련 변경만 커밋한다.
- 실제 Backend와 별도 실연동 smoke는 실행하지 않았다. 테스트 API Mock과 실제 User Web 화면으로 검증했다.
