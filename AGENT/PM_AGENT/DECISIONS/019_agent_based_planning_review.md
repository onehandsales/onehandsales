# AGENT 정본 기반 기획 검토 결정

## 1. 결정

TODO 계획 문서, API 명세, DB 스키마, FE-TODO, BE-TODO, GOAL-SPECS를 검토할 때는 `AGENT` 정본 문서의 추상 기준이 구체 구현 계약으로 내려왔는지 반드시 확인한다.

즉, 검토는 문서가 상세한지 여부만 보지 않고 다음을 확인한다.

- PM 제품 범위와 사용자 흐름이 TODO의 goal 순서와 포함/제외 범위로 구체화됐는가?
- UXUI_AGENT의 화면 우선순위, 입력 흐름, 모바일/데스크톱 패턴, Admin 운영 UX가 FE 문서로 구체화됐는가?
- SOFTWARE_AGENT의 Clean Architecture, DDD, 계층 분리, port/adapter, API/DB/테스트 규칙이 BE/API/DB 문서로 구체화됐는가?

## 2. 이유

`AGENT` 문서는 방향성과 원칙을 정하는 상위 정본이다. 반면 `TODO/{PLAN_NAME}` 문서는 실제 구현자가 바로 실행하는 작업 계약이다.

상위 문서와 TODO 문서 사이의 연결이 약하면 다음 문제가 생긴다.

- Backend가 controller 중심 CRUD로 흐르고 domain/application 계층이 약해질 수 있다.
- Prisma, OpenAI, OCR, Calendar 같은 infrastructure 의존성이 domain/application으로 새어 들어갈 수 있다.
- User API와 Admin API 경계가 흐려져 데이터 소유권, masking, audit log가 누락될 수 있다.
- Frontend가 User Web/Admin Web 분리, TanStack Query, form validation, URL state 같은 기준을 놓칠 수 있다.
- UX/UI가 딜 파이프라인 중심 업무 도구가 아니라 장식적 화면이나 단순 CRUD 화면으로 변할 수 있다.

따라서 구현 전 검토는 `AGENT` 정본에서 `TODO` 실행 문서로 내려오는 추적성을 필수로 본다.

## 3. 적용 규칙

- 사용자가 "검토해줘", "구현 들어가도 되는지", "부족한 점이 있는지"라고 요청하면 `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`를 기준으로 검토한다.
- 검토 시 `AGENT 정본 기반 구체화 검토` 섹션을 반드시 적용한다.
- Backend/API/DB 문서는 `SOFTWARE_AGENT`의 Backend Architecture, Backend Convention, API Spec, Testing Architecture와 대조한다.
- FE/UX 문서는 `UXUI_AGENT`의 사용자 흐름, UX/UI Direction, UX Review Checklist와 `SOFTWARE_AGENT`의 Frontend/User Web/Admin Web Architecture와 대조한다.
- 발견 사항은 `Critical`, `Major`, `Minor`, `Question`, `Resolved` 중 하나로 분류한다.
- 명확한 누락은 문서에 반영하고, 제품 판단이 필요한 항목은 임의 확정하지 않고 질문으로 남긴다.

## 4. 관련 문서

- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
