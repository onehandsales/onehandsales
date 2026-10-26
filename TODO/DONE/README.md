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

- [VIEW_HEADER_FRONTEND_INTEGRATION_PLAN](VIEW_HEADER_FRONTEND_INTEGRATION_PLAN/README.md): 공통 헤더·View 목록/선택·읽기 별표·업무목록 경로 연결 완료. 단위 41건·고유 E2E 20건과 정적/빌드·G99 검증. 타입별 본문·생성/저장은 후속 범위
- [OBJECT_LIST_VIEW_LIST_API_PLAN](OBJECT_LIST_VIEW_LIST_API_PLAN/README.md): Object/List 소속 View 목록 Backend API 두 개와 G99 검토 완료. 전체 58 suites/341 tests 통과. FE 연결·생성/저장은 후속 범위
- [VIEW_HEADER_DETAIL_API_PLAN](VIEW_HEADER_DETAIL_API_PLAN/README.md): Object/List 클릭 시 초기 View 헤더 조회 Backend API 구현·검증·G99 완료. 전체 53 suites/267 tests 통과. Frontend·View 목록·생성/저장은 후속 범위
- `SIDEBAR_VIEW_FAVORITES_PLAN`: 개인 View 즐겨찾기 조회 GET API와 공통 User Web 사이드바 표시 연결 완료. 실제 DB 격리·정렬 테스트는 로컬 테스트 DB 미가동으로 확인하지 못한 상태를 기록
- `SIDEBAR_WORK_LISTS_UX_PARITY_PLAN`: 업무 목록의 로딩·빈 목록·조회 실패·행 스타일을 현재 관리 항목과 통일. 업무 목록 전용 안내·재시도 UI 제거
- `SIDEBAR_WORK_LISTS_FRONTEND_PLAN`: 업무 목록 조회 API의 User Web 사이드바 표시·상태·Workspace 전환 연결 완료. 기존 생성 모달 E2E 2건의 불일치는 검증 기록에 분리
- `LIST_DEFINITION_SIDEBAR_LISTS_PLAN`: Workspace 멤버십 기반 사이드바 업무 목록 조회 Backend API와 계약·검증 완료. Frontend 연결은 후속 범위
- `ACCOUNT_SETTINGS_MODAL_PLAN`: 계정 설정 모달 이관, `/app/settings` 사용자-facing route 제거, `/app?account=settings` modal-open 흐름 정리
- `MVP-STARTER_PLAN`: G00-G36 MVP starter 계획과 공통 계약 문서
- `AUTH_FE_INTEGRATION_PLAN`: Auth/User Backend API와 User/Admin Web 인증/설정 FE 연동
- `COMPANY_DOMAIN_PLAN`: Company Backend API와 User Web 회사 목록/생성/분야/지역/export 화면
- `CONTACT_DOMAIN_PLAN`: Contact Backend API와 User Web 담당자 목록/상세/메모/export 화면
- `PRODUCT_DOMAIN_PLAN`: Product Backend API와 User Web 제품 목록/상세/메모/export 화면
- `DEAL_DOMAIN_PLAN`: Deal Backend API와 User Web 딜 목록/상세/로그/export 화면
- `SCHEDULE_DOMAIN_PLAN`: Schedule Backend API와 User Web 월간/주간 일정 화면, 생성/수정/삭제, 딜 연결
- `MEETING_NOTE_MANUAL_PLAN`: MeetingNote 수동 Backend API와 User Web 회의록 목록/상세/생성/수정 화면
- `INTEGRATED_SEARCH_PLAN`: Backend `GET /api/search`와 User Web GlobalSearch 연결, 일정 상세 이동, loading/empty/error 상태 처리
- `MEETING_NOTE_AI_STT_PLAN`: MeetingNote AI/STT 초안 Backend API, User Web draft UI, 저장 후 딜 추가 연동
- `BUSINESS_CARD_OCR_PLAN`: BusinessCard OCR Backend API, `BusinessCardScanLog`, User Web 명함 스캔/명함스캔 화면
- `USER_WEB_UXUI_COMMON_QA_PLAN`: User Web UX/UI 공통 QA G01~G06, 1440px/1280px/768px/125% 기준 화면 품질 정리
- `USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`: User Web 출시 전 follow-up QA G01~G07, 모바일/브라우저/보안/DB/bugfix closeout와 deferred BE/API backlog split
- `ADDITIONAL_WORK_PLAN`: count, linked list, xlsx export, dealCount, product dealCount sort 추가 유지보수 범위
- `USER_TIMEZONE_FOUNDATION_PLAN`: User.timeZone DB/API와 User Web timezone 설정 기반
- `ONBOARDING_JOB_SELECTION_PLAN`: 첫 로그인 직업 선택 온보딩 완료와 OWNER Workspace bootstrap
- `BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN.md`: Backend Agent rule recheck 완료 포인터 문서
- `BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN`: Backend Agent rule recheck G01~G08과 G99 최종 검토 완료
- `PRESENTATION_CONTRACT_TYPE_BOUNDARY_PLAN`: presentation repository port 타입 의존 G01~G02 정리와 G99 최종 검토 완료
- `API_SPEC_TEMPLATE_NORMALIZATION_PLAN`: API-SPEC 템플릿 정규화 G01~G06과 G99 최종 검토 완료
- `OBJECT_DEFINITION_CREATE_PLAN`: ObjectDefinition 생성 API 계약, Backend 생성 유스케이스, User Web 생성 연동, DB unique index 검증 완료
- `RECORD_DEFINITION_CREATE_PLAN`: RecordDefinition 빈 row 생성 API 계약과 Backend 생성 유스케이스 구현 완료
