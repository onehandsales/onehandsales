# TODO DONE

## 1. 목적

이 폴더는 완료된 `TODO` 계획과 완료된 `/goal` 작업 문서를 보관한다.

`TODO` 바로 아래에는 앞으로 실행할 계획만 남기고, 구현과 검증이 끝난 계획은 이 폴더로 이동한다. 완료 이력 자체는 `TODO_LOG`에도 계속 보관한다.

## 2. 보관 규칙

- 계획 전체가 완료되면 `TODO/DONE/<PLAN_NAME>`으로 옮긴다.
- 독립된 goal 폴더만 완료된 경우에는 `TODO/DONE/<PLAN_NAME>/<GOAL_KEY>_<TASK_NAME>`으로 옮긴다.
- 이동 후 활성 TODO, 다음 계획, AGENT 문서의 참조 경로를 갱신한다.
- 완료 보관 문서는 후속 구현의 활성 작업 목록이 아니다.
- 후속 작업이 필요하면 새 활성 계획 폴더를 만들거나 기존 활성 계획에 `/goal` 단위로 추가한다.

## 3. 현재 보관 목록

- `MVP-STARTER_PLAN`: G00-G36 MVP starter 계획과 공통 계약 문서
- `AUTH_FE_INTEGRATION_PLAN`: Auth/User Backend API와 User/Admin Web 인증/설정 FE 연동
- `COMPANY_DOMAIN_PLAN`: Company Backend API와 User Web 회사 목록/상세/메모/export 화면
- `CONTACT_DOMAIN_PLAN`: Contact Backend API와 User Web 담당자 목록/상세/메모/export 화면
- `PRODUCT_DOMAIN_PLAN`: Product Backend API와 User Web 제품 목록/상세/메모/export 화면
- `DEAL_DOMAIN_PLAN`: Deal Backend API와 User Web 딜 목록/상세/로그/export 화면
- `SCHEDULE_DOMAIN_PLAN`: Schedule Backend API와 User Web 월간/주간 일정 화면, 생성/수정/삭제, 딜 연결
- `MEETING_NOTE_MANUAL_PLAN`: MeetingNote 수동 Backend API와 User Web 회의록 목록/상세/생성/수정 화면
- `INTEGRATED_SEARCH_PLAN`: Backend `GET /api/search`와 User Web GlobalSearch 연결, 일정 상세 이동, loading/empty/error 상태 처리
- `MEETING_NOTE_AI_STT_PLAN`: MeetingNote AI/STT 초안 Backend API, User Web draft UI, 저장 후 딜 추가 연동
- `BUSINESS_CARD_OCR_PLAN`: BusinessCard OCR Backend API, `BusinessCardScanLog`, User Web 명함 스캔/명함스캔 화면
- `USER_WEB_UXUI_COMMON_QA_PLAN`: User Web UX/UI 공통 QA G01~G06, 1440px/1280px/768px/125% 기준 화면 품질 정리
- `ADDITIONAL_WORK_PLAN`: count, linked list, xlsx export, dealCount, product dealCount sort 추가 유지보수 범위
- `USER_TIMEZONE_FOUNDATION_PLAN`: User.timeZone DB/API와 User Web timezone 설정 기반
