# R05 소비 범위 보완 결과

상태: G23 소비 분석 수행. R05 전체 완료 아님.

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
