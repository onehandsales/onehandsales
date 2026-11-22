# R05 소비 범위 보완 결과

상태: G23/G24 소비 분석 수행. R05 전체 완료 아님.

## G23 소비 보완 — 단계 이동·태그

신규 MCP3flow16screen, 세 ANALYSIS4/5/8절과 PNG16개 직접 확인. App bonsai-web c1026782-09a7-45fb-b2d0-7cc1909bf1f4, Latest/2146은 G18 앱 조회 기록 재사용. 실행21~22일, 촬영일/서비스 빌드/viewport·DPR 미확인. 신규 응답·단계 Screen ID는 `/tmp/onehandsales-g18-g27/G23/mcp-sources.json`.

- 상태 `ac1750e4-906b-47f6-ad41-18c1861d4f71`4장: New Lead→메뉴5단계→Proposal Sent. 문서 빈 상태/금액0 유지. 마지막 메뉴의 New Lead는 되돌림 조작 없이 다른 snapshot이다. Preview as Client/Collaborator, Mark Completed, Archive, Delete의 실행 결과는 미수록.
- 이동 `c5e982aa-007d-4e20-8c8b-1fe3c276acc8`3장: Consulting/Sample 카드가 In Progress에서 Contract Signed로, 양쪽 건수1→0/0→1. 실제 계약 서명은 관찰되지 않음. 같은 열 순서·실패·키보드·자동 스크롤은 미확인.
- 태그 `3aa597f9-f613-46dd-bd8c-45686e423865`9장: 카드…→Tags/Mark Completed/Archive Project/Delete Project. Tags 빈모달→Add Tag→Select/Type to create a tag→Create "Sample"→Sample/Edit/성공 안내→카드/보드 반영. Save버튼 없음, 성공이 모달 닫기 전 발생. 비어 있는 것은 프로젝트 연결이며 전체 태그0개 근거가 아니다.

목 정책: 단계 변경은 프로젝트 stage와 순서만 갱신한다. 문서·결제·서명·활동 생성 이벤트를 가짜로 만들지 않는다. 드롭은 저장 성공 후 카드/양쪽 개수 원자 반영, 실패 원위치와 Retry/Cancel. 키보드 이동 폼은 원본에 없는 접근성 보완. 같은 열은 beforeId 또는 마지막 위치로 저장, 타 workspace/잘못된 대상/오래된 revision 거부. 빠른 연속 단계 선택은 이전 요청 취소 후 마지막 의도를 적용한다. 이탈/취소/세션·workspace 변경/Reset 뒤 늦은 응답 폐기.

태그 정의 ID/revision과 프로젝트 tagIds를 분리. 생성+해당 프로젝트 연결은 원자 저장, 기존 태그는 ID로 선택. 공백 정리/대소문자 무시 동일명은 기존 정의 재사용, 1~60자 이름 한도는 목 가정. Edit는 명시적 이름 수정(같은 workspace의 모든 연결에 전파)/프로젝트 연결 해제/추가 선택으로 보완한다. 이름 충돌은 오류/초안 유지. 전역 태그 삭제·색 편집은 근거 없어 추가하지 않는다. 고객 태그/샘플 고객/문서 상태와 분리. 태그 저장은 즉시 반영이며 모달 닫기로 이미 저장한 값을 되돌리지 않고 미제출 초안만 폐기한다.

G22의 미수록 완료/보관/삭제/열설정 실행은 이번에도 실제 완료로 쓰지 않는다. 관찰 메뉴와 명확한 미제공 안내/복귀를 유지하고 R05/G24에서 lifecycle 추가 범위 배정을 검토한다. 개인/공유 저장뷰·예산/원가·수익성과 실제 포털/문서 접근 영향은 R 후속 대기다. 서버/API/DB를 조사 완료 조건으로 삼지 않는다.

### G23 검토·구현 연결

[G23 결과](G23_RESULT.md)에 단계/태그 목 구현, 초기 결함 수정, 단위74·개발/빌드11개씩 현재 검증과16상태 비교를 기록했다. lifecycle 결과/미리보기·예산·원가·수익성 및 R05 전체는 대기다.

## G24 소비 보완 — 상세·이름·설정

시작 HEAD `cef07f2f` G23, 변경 없음. 신규 MCP 3 flow/14 screen과 연결 ANALYSIS 4·5·8절, PNG 14개를 직접 확인했다. App/채택 카탈로그는 G23과 동일하며 Latest/2146은 G18 조회 기록 재사용이다. 촬영일/서비스 빌드/원본 viewport·DPR은 미확인. 신규 응답과 Screen ID는 `/tmp/onehandsales-g18-g27/G24/mcp-sources.json`.

- 상세 `669a7507-38b3-41aa-89a2-146530c42240` 01~06: 보드/빈 개요/Tasks/Time Tracking/Team/Settings. 보드의 Studio와 상세 초기 이름, 작업 수와 활동은 서로 다른 snapshot이다. 같은 ID의 실시간 상태 불일치로 구현하지 않는다.
- 이름 `436bff56-c6be-434a-97e4-1fa7b2526a91` 01~04: 연필→입력+Save→Studio 추가→제목/성공 안내. 과거 생성 문구는 원래 이름을 유지한다. 편집 진입으로 작업이 보관되거나 집계가 바뀐다는 인과관계는 없다.
- 설정 `bca79d2d-7b8e-4f84-b35d-18adaec2cd06` 01~04: Title, Hourly Rate/US$20.00/USD, 빈 선택 Description/Markdown·외부 가시성 안내, Start Feb6/End 없음→Feb21+지우기, reminder 체크, Save Changes→Overview/성공 안내. 마지막 화면에서 종료일 값은 확인되지 않아 목 구현에서 재진입으로 별도 검증한다.
- 시간의 7초/1시간과 두 행의 $20.00, 합계1.00Hours/$20.04는 별개 표시다. 표시된 소수시간으로 초를 역산하지 않고 원본 초·기록 당시 요율·표시 합계를 분리한다. 과거 기록은 설정 변경에 소급 적용하지 않는 목 정책을 쓴다. 실제 청구/반올림 정책은 확정하지 않는다.
- Team의 멤버와 협업자 제한 문구를 확인했다. G17/G18의 가입 완료 멤버/배정 ID를 조회하고 기존 협업자에게 설정·재무·문서 권한을 확장하지 않는다. 미수록 팀 추가/제거 실행은 별도 안내 또는 기존 팀 초대 경로로 인계한다.

추가 MCP lifecycle 검색 `project archive delete confirmation completed project`는 동일 앱 안에서 관련도 완화 결과4개(고객 포털/랜딩/CRM/초대)를 반환했다. 로컬 Screen ID 분류와 대조했으며 프로젝트 lifecycle 실행 근거로 채택하지 않았다. 새 결과 이미지를 이번에 직접 확인했다고 쓰지 않는다. 검색 응답은 `lifecycle-search.json`. 이는 전체 카탈로그에 화면이 없다는 확정이 아니다. G23의 완료/보관/삭제 실행은 미확인/별도 후속 구현 배정 대기를 유지하며 G24에서 관찰되지 않은 성공을 꾸미지 않는다.

G24 목 선택: 이름1~200자/동명 허용, description0~4000자/문자열 보존, USD Hourly Rate만 관찰 선택지로 제공하고 미확인 결제유형·통화는 확장하지 않는다. 요율은 음수/소수3자리/비숫자를 거부하고 minor-unit으로 저장한다. 시작/종료일은 선택적 ISO 업무일, 같은 날 허용·종료<시작 거부. Save Changes는 제목·요율·설명·기간·reminder를 원자 저장 후 Overview로 이동한다. 날짜 지우기 후 저장/재진입도 검증한다. 저장 전 탭/경로 이탈과 Escape 취소는 미저장 초안 폐기, 실패는 입력 유지, 오래된 revision은 덮어쓰지 않고 재검토를 요구한다. 생성 활동 snapshot은 수정하지 않는다.

Overview/Tasks/Time Tracking/Team/Settings는 같은 projectId와 URL tab으로 연결한다. Tasks 실제 보드·생성은 G25, 댓글/활동은 G27에서 연결한다. G24에서는 해당 탭의 문맥 인계만 제공하고 완료로 기록하지 않는다. 시간 조회는 관찰된 고정 로컬 예시이며 추가/수정/청구는 G32~G34/G59 인계다. 문서/메일/자동화/미수록 lifecycle은 안내/복귀와 후속 메모로 남긴다. R05 전체 완료 아님.

### G24 검토·구현 연결

[G24 결과](G24_RESULT.md): 단위77·개발/빌드16개씩, 원본14상태 비교(작업은 인계 화면), 초기 중복key/저장 직후 오래된 초안 결함 수정과 실패 기록 보존. 작업/활동 통합·lifecycle·원본/시각/환경 대기 및 R05 전체 미완료를 유지한다.
