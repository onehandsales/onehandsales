# 기획 검토 체크리스트

## 1. 목적

이 문서는 `AGENT`와 `TODO`에 작성된 기획서, 요구사항 문서, API 명세, DB 스키마, FE/BE 작업 문서를 구현 전에 꼼꼼하게 검토하기 위한 기준이다.

AI가 사용자의 의도에 맞춰 문서를 작성했더라도, 바로 구현에 들어가면 누락된 요구사항, FE/BE 책임 불일치, API와 DB 스키마 불일치, 우선순위 오류가 뒤늦게 발견될 수 있다. 따라서 구현 전에는 이 문서를 기준으로 기획 문서 전체를 다시 추적하고, 구현 가능한 수준인지 확인한다.

## 2. 적용 대상

이 검토 기준은 다음 문서에 적용한다.

- `AGENT/PM_AGENT/PLANNING`의 제품 기획 문서
- `AGENT/UXUI_AGENT/PLANNING`의 사용자 흐름과 화면 문서
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE`의 Backend 구현 방향 문서
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE`의 Frontend 구현 방향 문서
- `TODO/{PLAN_NAME}/README.md`
- `TODO/{PLAN_NAME}/COMMON/USER-FLOW.md`
- `TODO/{PLAN_NAME}/COMMON/GOAL-WORK-ORDER.md`
- `TODO/{PLAN_NAME}/COMMON/PLANNING-REVIEW.md`
- `TODO/{PLAN_NAME}/COMMON/API-SPEC/*`
- `TODO/{PLAN_NAME}/COMMON/GOAL-SPECS/*`
- `TODO/{PLAN_NAME}/FE-TODO/*`
- `TODO/{PLAN_NAME}/BE-TODO/*`
- API 명세 문서
- DB 스키마 문서
- 구현 전 우선순위와 완료 기준 문서

## 3. 검토가 필요한 시점

다음 상황에서는 구현 전에 반드시 기획 검토를 수행한다.

- 새로운 `TODO/{PLAN_NAME}` 계획 폴더를 만든 직후
- 사용자가 상세 기획서, API 명세, DB 스키마, FE/BE TODO 작성을 요청한 직후
- `/goal`로 실제 구현을 시작하기 전
- 기존 기획 범위가 바뀌어 FE/BE/API/DB 문서를 수정한 직후
- 문서 구조나 참조 경로를 이동한 직후
- 사용자가 "구현 들어가도 되는지", "부족한 점이 있는지", "검토해줘"라고 요청한 경우
- AI가 큰 범위의 기획 문서를 작성했지만 사용자의 원래 의도를 다시 확인하지 못한 경우

## 4. 검토 원칙

기획 검토는 단순 오탈자 확인이 아니라, 제품 의도부터 구현 가능성까지 연결되는지 확인하는 작업이다.

원칙:

- 사용자의 원래 요구와 문서의 결과물이 같은 문제를 바라보는지 확인한다.
- 기획자 관점에서 사용자 문제, 사용 흐름, 포함 범위, 제외 범위가 충분한지 본다.
- FE와 BE가 같은 요구사항을 바라보되 각자 책임이 명확히 분리됐는지 본다.
- API 명세와 DB 스키마가 화면, 사용자 흐름, 비즈니스 로직을 실제로 지원하는지 확인한다.
- `COMMON/GOAL-WORK-ORDER.md`가 우선순위와 의존성을 기준으로 작게 나뉘었는지 본다.
- `COMMON/GOAL-SPECS`가 각 `/goal`별 화면, API, DB, 테스트 연결을 구현 직전 수준으로 설명하는지 본다.
- TODO 문서가 단순 정리 문서가 아니라 바로 실행 가능한 계획서 수준인지 본다.
- 문서 간 충돌이 있으면 조용히 넘기지 않고, 충돌 위치와 결정 필요 사항을 기록한다.
- 추측으로 채운 부분은 "확정"처럼 쓰지 않고 질문 또는 보류 항목으로 분리한다.
- 구현자가 문서만 보고 다음 작업을 시작할 수 있는 수준인지 확인한다.

## 5. 검토 순서

기획 검토는 아래 순서로 수행한다.

1. 검토 대상 문서 목록을 확정한다.
2. 사용자의 원래 요청과 현재 계획 폴더의 목적을 확인한다.
3. `AGENT` 정본 문서를 먼저 읽고 제품 범위, 용어, 아키텍처 기준을 확인한다.
4. `TODO/{PLAN_NAME}/README.md`에서 계획 목적과 폴더 구조를 확인한다.
5. `COMMON/USER-FLOW.md`에서 사용자가 실제로 어떤 순서로 기능을 사용하는지 확인한다.
6. `FE-TODO`에서 화면, 컴포넌트, 상태, 사용자 입력, 에러 상태가 흐름과 맞는지 확인한다.
7. `COMMON/API-SPEC`에서 API, 비즈니스 로직, 권한, DB 스키마가 FE 요구와 맞는지 확인한다.
8. `BE-TODO`에서 Backend 내부 작업과 DB 스키마가 공통 API 계약을 구현할 수 있는지 확인한다.
9. `COMMON/GOAL-WORK-ORDER.md`에서 우선순위, 의존성, 완료 기준이 누락 없이 나뉘었는지 확인한다.
10. `COMMON/GOAL-SPECS`에서 각 `/goal`별 화면 명세, API 연결, DB 연결이 구현 직전 수준인지 확인한다.
11. TODO 문서가 다음 `/goal`을 바로 실행할 수 있는 계획서 수준인지 확인한다.
12. 문서 간 충돌, 누락, 애매한 표현, 구현 불가능한 요구를 발견한다.
13. 발견 사항을 심각도별로 정리하고, 수정이 가능한 것은 문서에 반영한다.
14. 사용자의 판단이 필요한 사항은 질문 또는 결정 필요 항목으로 남긴다.

## 5.1. AGENT 정본 기반 구체화 검토

TODO 계획 문서를 검토할 때는 단순히 문서 항목이 채워졌는지만 보지 않는다. `AGENT`의 추상적인 제품/UX/소프트웨어 원칙이 TODO의 API, DB, FE, BE, goal 상세 명세로 구체화되었는지 확인한다.

검토 시 반드시 함께 보는 기준 문서:

- Backend 기준: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- User Web 기준: `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- Admin Web 기준: `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- UX/UI 기준: `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`, `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`, `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`, `AGENT/UXUI_AGENT/DECISIONS/*`
- 테스트/위험 흐름 기준: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`

Backend 구체화 검토:

- TODO의 BE 작업이 `domain`, `application`, `infrastructure`, `presentation` 네 계층으로 나뉘는가?
- 비즈니스 규칙은 domain/application 기준으로 설명되고, controller는 application service를 호출하는 얇은 계층으로 남는가?
- repository interface, port, adapter 경계가 드러나며 Prisma는 infrastructure 전용으로 제한되는가?
- User API와 Admin API가 `/api/*`, `/admin/api/*` 경로와 guard 기준으로 분리되는가?
- 사용자 소유권, `userId` 필터, soft delete, restore, audit log, 민감정보 masking이 API와 DB 스키마에 반영되는가?
- 여러 테이블을 함께 쓰거나 감사 로그가 필요한 use case에 transaction 기준이 명시되는가?
- transaction 필요 여부가 `필요`, `없음`, `보류` 중 하나로 API 계약에 적혀 있는가?
- transaction model, rollback 범위, 외부 Provider 호출 위치가 명시되는가?
- mutation, Admin API, 민감정보, 외부 Provider API에 observability 항목이 있는가?
- log event key, audit log 필요 여부, request id, redaction 기준이 문서화되어 있는가?
- OpenAI, OCR, Google Calendar, email/browser push, file parser 같은 외부 의존성이 port/adapter 뒤에 있는가?
- Admin 전용 조회/복구/원문 조회는 User controller의 role 분기가 아니라 admin controller 또는 admin application method로 분리되는가?
- API 명세의 business flow가 도메인 의도를 설명하고, 단순 CRUD 절차나 controller 절차에 머물지 않는가?

Frontend와 UX/UI 구체화 검토:

- User Web은 `FE/user-web`의 Feature-Sliced 구조, TanStack Query, React Hook Form + Zod, URL search params 기준을 따르는가?
- User Web은 `/api/*`만 호출하고 `/admin/api/*`를 호출하지 않는가?
- Admin Web은 `FE/admin-web`의 별도 앱, `adminApiClient`, TanStack Table, 서버 페이지네이션, 데스크톱 전용 운영 콘솔 기준을 따르는가?
- FE 문서는 화면, 컴포넌트, 사용자 입력, loading/empty/error/success/권한 없음 상태, optimistic update rollback 가능 여부를 설명하는가?
- UX/UI 문서는 공개 `/`, 로그인 후 `/app` 홈 대시보드, `/app/deals` 딜 파이프라인의 역할을 구분하고, 딜 목록에서 금액, 단계, 다음 행동, 마감 상태가 빠르게 보이도록 하는가?
- 가능성/likelihood처럼 현재 API에 없는 필드는 후속 범위로 분리되어 있는가?
- 빠른 등록 modal과 inline creation을 포함한다면 전체 상세 form이 아니라 최소 입력 흐름으로 설계되어 있는가?
- 모바일 User Web은 테이블이나 가로 칸반을 기본 UI로 쓰지 않고 카드형/리스트형 흐름을 따르는가?
- Admin UI는 데이터 테이블, 필터, 서버 페이지네이션, 민감정보 마스킹, 원문 조회 사유 dialog를 중심으로 설계되어 있는가?
- 금지 표현인 `Customer`, `상품`, `오프더레코드`가 정본 의도와 다르게 쓰이지 않는가?
- 장식적 hero, card-in-card, 과한 gradient/orb, 베이지/크림 또는 다크 네이비 지배 팔레트 같은 금지된 시각 방향을 전제로 하지 않는가?

심각도 판정:

- Clean Architecture 계층을 무너뜨리는 요구, controller의 Prisma 직접 접근, Domain의 외부 SDK 의존, 사용자 데이터 소유권 누락, Admin 감사 로그 누락은 `Critical` 또는 `Major`로 본다.
- FE가 서버 상태를 TanStack Query가 아닌 임의 fetch/useEffect 중심으로 전제하거나, Admin/User API 경계를 흐리면 `Major`로 본다.
- UX/UI 정본과 충돌하는 화면 우선순위, 모바일 테이블/가로 칸반, 민감정보 원문 노출 흐름 누락은 `Major`로 본다.
- 관련 AGENT 기준 문서 링크 누락, 용어 일부 불일치, 완료 기준 구체성 부족은 `Minor`로 본다.

## 5.2. 활성 TODO 재검토 기준

사용자가 활성 TODO 전체를 다시 봐달라고 요청하면 `TODO/DONE`은 검토 대상에서 제외한다. 완료 보관 문서는 이력 참고용이며, 현재 작업 가능 여부와 남은 Frontend/Backend 범위 판정은 활성 계획 폴더만 기준으로 한다.

검토 대상:

- `TODO/README.md`
- `TODO/{ACTIVE_PLAN}/README.md`
- `TODO/{ACTIVE_PLAN}/COMMON/*`
- `TODO/{ACTIVE_PLAN}/COMMON/API-SPEC/*`
- `TODO/{ACTIVE_PLAN}/FE-TODO/*`
- `TODO/{ACTIVE_PLAN}/BE-TODO/*`

Backend API 구성 여부 확인:

- 실제 Backend controller route가 API 계약의 method/path와 일치하는가?
- application service 또는 use case가 계약의 비즈니스 로직 흐름을 처리하는가?
- repository/Prisma 조회 조건에 `userId` ownership, 검색, 필터, 정렬, pagination 또는 pagination 제외 기준이 반영되어 있는가?
- response DTO 또는 반환 shape가 계약의 response 필드와 일치하는가?
- 파일 다운로드 API는 `Content-Type`, `Content-Disposition`, binary/blob 처리 기준이 문서화되어 있는가?
- API 계약 상태가 실제 구현/검증 상태와 맞는가?

API 명세 완성도 확인:

- request가 path param, query, header, body로 구분되어 있는가?
- response가 success status, body 유무, DTO 이름, 필드 타입, nullable, 예시를 포함하는가?
- 내부 비즈니스 로직이 인증, 권한, ownership, validation, 조회/저장 흐름, transaction, observability, 에러 분기를 포함하는가?
- FE 처리 기준이 성공 후 재조회 범위, blob 다운로드, body 없는 응답 처리, domain error 표시 방식까지 설명하는가?

Frontend 남은 작업 확인:

- 각 FE 작업의 목적이 사용자 행동과 연결되어 있는가?
- 목록 화면은 검색, 필터, 페이지네이션, 정렬, empty/loading/error 상태를 포함하는가?
- 상세 화면은 단건 API와 보조 API를 어떤 정보 우선순위로 보여줄지 적혀 있는가?
- export/download 작업은 현재 목록 검색어와 필터를 넘기고 `page`를 제외한다는 기준을 포함하는가?
- API response에 새로 추가된 필드는 표시 위치와 fallback 기준이 문서화되어 있는가?

재검토 결과는 `TODO/ACTIVE_BACKEND_API_FE_REVIEW.md` 또는 해당 활성 계획 README에 남긴다. 발견한 링크 오류, 상태 불일치, API 계약 누락은 가능한 범위에서 바로 수정한다.

## 6. 심각도 기준

검토 결과는 심각도를 나누어 기록한다.

### Critical

구현을 시작하면 안 되는 수준의 문제다.

예:

- 사용자의 원래 요구와 기획 문서의 방향이 다르다.
- MVP 포함 범위와 제외 범위가 충돌한다.
- 핵심 사용자 흐름이 문서에 없다.
- API 명세가 없거나 request/response/비즈니스 로직/DB 연결이 빠져 있다.
- DB 스키마가 핵심 기능을 저장할 수 없다.
- 사용자별 데이터 분리, 권한, 민감정보 처리 기준이 없다.
- `COMMON/GOAL-WORK-ORDER.md`가 너무 커서 한 번의 `/goal`로 실행하기 어렵다.
- TODO 문서가 실행 계획서가 아니라 추상 목록 수준이라 구현자가 다음 작업을 판단해야 한다.

### Major

구현은 시작할 수 있지만 재작업 가능성이 큰 문제다.

예:

- FE 화면 요구와 BE API 명세가 일부 맞지 않는다.
- API response에 화면에서 필요한 필드가 빠져 있다.
- DB 인덱스, 상태값, soft delete, audit log 같은 운영 기준이 빠져 있다.
- 예외 흐름과 에러 메시지 정책이 부족하다.
- 우선순위 순서가 의존성과 맞지 않는다.

### Minor

구현을 막지는 않지만 문서 품질과 협업 효율을 떨어뜨리는 문제다.

예:

- 관련 문서 링크가 일부 빠져 있다.
- 용어가 정본 용어와 완전히 일치하지 않는다.
- 완료 기준이 더 구체적일 수 있다.
- 문서 제목이나 섹션 순서가 일관되지 않다.

### Question

문서 작성자가 임의로 확정하면 안 되고 사용자의 판단이 필요한 문제다.

예:

- 비즈니스 정책이 여러 방향으로 가능하다.
- 결제, 권한, 운영 정책처럼 제품 리스크가 큰 결정을 해야 한다.
- 사용자가 의도한 MVP 범위인지 확인이 필요하다.
- 외부 Provider나 비용 정책이 정해지지 않았다.

## 7. 공통 검토 체크리스트

모든 기획 문서는 아래 항목을 확인한다.

- 문서가 한국어로 작성됐는가?
- 사용자의 원래 요청과 문서 목적이 일치하는가?
- 이 기능이 필요한 이유가 사용자 문제와 연결되는가?
- 포함 범위와 제외 범위가 분리되어 있는가?
- MVP에서 반드시 해야 할 것과 나중에 해도 되는 것이 구분되는가?
- 정본 용어를 사용하는가?
- 관련 문서 경로가 연결되어 있는가?
- 링크된 관련 문서가 실제로 존재하는가?
- 다른 `AGENT` 또는 `TODO` 문서와 충돌하지 않는가?
- "추후", "나중에", "적절히"처럼 구현자가 다르게 해석할 수 있는 표현이 남아 있지 않은가?
- 완료 기준이 검증 가능한 문장으로 쓰였는가?

TODO 계획 문서는 추가로 아래 항목을 확인한다.

- 문서만 보고 첫 번째 또는 다음 `/goal`을 바로 실행할 수 있는가?
- 각 작업의 실행 순서, 선행 조건, 포함 범위, 제외 범위가 명확한가?
- FE/BE/API/DB/테스트 작업이 서로 연결되어 있는가?
- 완료 기준이 명령 실행, 화면 확인, 테스트 통과, 검토 판정처럼 검증 가능한가?
- 결정되지 않은 항목이 `Question`, `보류`, 또는 선행 결정 goal로 분리되어 있는가?
- 구현자가 순서, 범위, 세부 계약을 추론해야 하는 빈칸이 남아 있지 않은가?

## 8. 사용자 흐름 검토

`USER-FLOW.md` 또는 UX/UI 기획 문서는 아래 항목을 확인한다.

- 사용자의 시작점과 종료점이 명확한가?
- 사용자가 기능을 사용하는 순서가 실제 업무 흐름과 맞는가?
- 신규 생성, 수정, 삭제, 복구, 검색 같은 기본 행동이 빠지지 않았는가?
- 빈 상태, 로딩 상태, 에러 상태, 권한 없음 상태가 고려됐는가?
- 사용자가 중간에 필요한 데이터를 새로 만들 수 있는 흐름이 있는가?
- 모바일과 데스크톱에서 흐름이 다르게 필요한 부분이 구분됐는가?
- Admin 사용자의 흐름과 일반 사용자의 흐름이 섞이지 않았는가?
- 민감정보를 보는 흐름에 사유 입력, 마스킹, 감사 로그가 연결됐는가?

## 9. FE-TODO 검토

`FE-TODO` 문서는 아래 항목을 확인한다.

- 화면 단위가 사용자 흐름과 일치하는가?
- User Web과 Admin Web의 책임이 분리되어 있는가?
- 각 화면의 주요 정보 우선순위가 명확한가?
- 생성, 수정, 삭제, 검색, 필터, 상세 확인 같은 핵심 조작이 정의됐는가?
- 입력 form의 필수값, 선택값, validation, placeholder 정책이 정의됐는가?
- API loading, empty, error, success 상태가 정의됐는가?
- TanStack Query 같은 상태 관리 책임이 화면 작업에 포함됐는가?
- 반응형 요구사항이 필요한 화면에 명시됐는가?
- E2E 또는 smoke test에서 확인할 사용자 행동이 완료 기준에 포함됐는가?
- 화면에서 필요한 데이터가 BE API response에 존재하는지 연결되어 있는가?

## 10. BE-TODO 검토

`BE-TODO` 문서는 아래 항목을 확인한다.

- 도메인별 책임이 명확히 분리되어 있는가?
- User API와 Admin API가 경로와 권한 기준으로 분리되어 있는가?
- 사용자별 데이터 소유권 검증이 모든 User API에 반영됐는가?
- Admin API는 기본 마스킹, 원문 조회 사유 입력, 감사 로그 정책을 따르는가?
- soft delete, restore, hard delete 정책이 문서화되어 있는가?
- 외부 Provider는 port/interface와 adapter 뒤에 숨겨져 있는가?
- 비즈니스 로직이 controller에 몰리지 않도록 application service 기준이 있는가?
- transaction이 필요한 흐름이 식별되어 있는가?
- 테스트해야 할 위험 흐름이 완료 기준에 포함되어 있는가?

## 11. API 명세 검토

API 명세는 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`와 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`를 기준으로 검토한다.

각 API마다 반드시 아래 항목이 있어야 한다.

- API 이름
- API 식별자
- 계약 상태
- 소비자
- 호환성
- method와 path
- request 이름
- request 필드
- 비즈니스 로직 흐름
- response 이름
- response 필드
- 연결된 DB 스키마
- transaction 필요 여부와 rollback 범위
- observability event key, audit log, request id, redaction 기준
- 에러 응답
- 관련 문서

추가 확인 항목:

- FE 화면에서 필요한 모든 필드가 response에 포함되어 있는가?
- FE가 보내야 하는 모든 입력이 request에 정의되어 있는가?
- request와 response 이름이 도메인 의도를 드러내는가?
- 목록 API에는 pagination, filtering, sorting 기준이 있는가?
- 상세 API에는 관련 엔티티 포함 범위가 명확한가?
- 생성/수정 API의 validation 기준이 DB 제약과 맞는가?
- 삭제 API는 soft delete 또는 hard delete 정책과 맞는가?
- 실패 케이스가 HTTP status, error code, message 기준으로 정의되어 있는가?
- API가 연결된 DB 모델과 필드를 명시하는가?
- API 계약 상태가 구현 전 최소 `confirmed`인가?
- API 계약이 `draft`이면 구현 goal이 아니라 계약 보완 goal로 분리되어 있는가?

## 12. DB 스키마 검토

DB 스키마 문서는 아래 항목을 확인한다.

- 핵심 도메인 엔티티가 누락 없이 정의되어 있는가?
- 각 테이블의 목적과 사용 흐름이 설명되어 있는가?
- 필수 필드, 선택 필드, 기본값이 명확한가?
- enum 또는 상태값의 의미가 설명되어 있는가?
- 관계와 cardinality가 명확한가?
- User ownership 기준 필드가 필요한 테이블에 있는가?
- soft delete가 필요한 테이블에 `deletedAt` 기준이 있는가?
- 감사 로그가 필요한 위험 행동이 식별되어 있는가?
- 민감정보 필드와 마스킹 대상이 구분되어 있는가?
- unique, index, foreign key, cascade 정책이 설명되어 있는가?
- Prisma schema로 옮길 수 있을 만큼 타입과 제약이 구체적인가?
- API request/response가 참조하는 필드와 DB 필드가 서로 맞는가?

## 13. GOAL 작업 순서 검토

`COMMON/GOAL-WORK-ORDER.md`는 아래 항목을 확인한다.

- 한 goal이 한 번의 `/goal`로 처리 가능한 크기인가?
- 각 goal에 목적, 포함 범위, 제외 범위, 완료 기준이 있는가?
- 선행 작업과 후속 작업의 의존성이 자연스러운가?
- FE 작업이 필요한 API와 DB 작업보다 먼저 배치되지 않았는가?
- Backend vertical slice와 Frontend 화면 작업이 적절히 나뉘어 있는가?
- 외부 Provider 실제 연동 범위와 자동 테스트용 stub/mock 범위가 구분되어 있는가?
- 테스트와 릴리즈 준비가 마지막 점검 단계로 남아 있는가?
- 순서를 바꿔야 할 경우 기록할 위치가 명시되어 있는가?
- 각 goal의 완료 기준이 명령 실행, 화면 확인, 테스트 통과처럼 검증 가능한가?
- 각 goal을 실행할 때 참조해야 하는 API 계약, DB 스키마, 화면 명세, 테스트 기준이 연결되어 있는가?
- API가 포함된 goal은 구현 전에 `COMMON/API-SPEC` 계약 상태, transaction, observability를 확인하도록 완료 기준에 적혀 있는가?

## 14. Goal 상세 명세 검토

`COMMON/GOAL-SPECS`는 아래 항목을 확인한다.

- 각 `/goal`별 상세 명세가 존재하는가?
- 화면이 포함된 goal에는 화면 목적, 사용자 행동, 주요 UI, 입력 필드가 있는가?
- 화면 상태가 `loading`, `empty`, `error`, `success`, 권한 없음 상태까지 포함하는가?
- validation과 사용자 피드백이 구체적인가?
- 필요한 API와 response 필드가 명시되어 있는가?
- 연결 DB 모델과 주요 필드가 명시되어 있는가?
- E2E 또는 smoke 테스트 기준이 완료 기준에 포함되어 있는가?
- Backend-only goal도 FE 영향과 API 계약 영향을 명시하는가?

## 15. FE/BE/API/DB 추적성 검토

기획 문서는 한 기능이 여러 문서에 흩어지기 때문에 추적성이 중요하다.

다음 연결을 반드시 확인한다.

```text
사용자 요구
-> 제품 기획
-> 사용자 흐름
-> FE 화면과 상태
-> COMMON API 명세
-> 비즈니스 로직
-> DB 스키마
-> 테스트와 완료 기준
-> GOAL 작업 순서
```

확인 기준:

- 사용자 흐름에 있는 행동이 FE-TODO에 화면 작업으로 존재하는가?
- FE-TODO에서 필요한 데이터가 API 명세에 존재하는가?
- API 명세의 request/response가 DB 스키마와 연결되는가?
- DB 스키마의 중요한 상태 변화가 비즈니스 로직에 반영되는가?
- 비즈니스 로직의 위험 흐름이 테스트 항목에 반영되는가?
- 테스트와 완료 기준이 `COMMON/GOAL-WORK-ORDER.md`와 `COMMON/GOAL-SPECS`에 들어가 있는가?

## 16. 구현 가능 여부 판정

검토 결과는 아래 중 하나로 판정한다.

### 통과

바로 구현을 시작해도 된다.

조건:

- Critical 문제가 없다.
- Major 문제가 없거나 구현 범위 밖으로 명확히 분리되어 있다.
- API, DB, FE, BE, goal 순서가 서로 맞다.
- 사용자의 판단이 필요한 Question이 없다.

### 조건부 통과

작은 보완 사항을 문서에 반영한 뒤 구현할 수 있다.

조건:

- Critical 문제가 없다.
- Major 문제가 일부 있지만 구현 전 빠르게 수정 가능하다.
- Question이 있어도 현재 goal 범위에는 영향을 주지 않는다.

### 수정 필요

구현 전에 문서를 먼저 고쳐야 한다.

조건:

- Critical 문제가 하나 이상 있다.
- API와 DB 또는 FE와 BE 책임이 맞지 않는다.
- goal 단위가 너무 커서 누락 위험이 높다.
- 사용자의 요구와 문서 방향이 다르다.

### 보류

사용자의 결정 없이는 문서를 확정할 수 없다.

조건:

- 제품 정책, 비용, 권한, 운영 방식처럼 임의로 정하면 안 되는 질문이 남아 있다.
- 외부 Provider, 결제, 보안 정책처럼 확정 정보가 부족하다.
- MVP 포함 여부 자체가 불명확하다.

## 17. 검토 결과 작성 형식

기획 검토 결과는 가능한 한 아래 형식으로 남긴다.

```text
# 기획 검토 결과

## 1. 결론

- 판정: 통과 / 조건부 통과 / 수정 필요 / 보류
- 이유:

## 2. 검토 대상

- 검토한 문서:
- 기준 문서:

## 3. 핵심 발견 사항

| 등급 | 문서 | 문제 | 영향 | 권장 조치 |
| --- | --- | --- | --- | --- |
| Critical |  |  |  |  |

## 4. 누락 사항

-

## 5. 충돌 사항

-

## 6. 사용자의 결정이 필요한 질문

-

## 7. 구현 가능 여부

- 바로 구현 가능 여부:
- 구현 전 반드시 수정할 항목:
- 첫 번째로 실행할 goal:
```

## 18. 문서 수정 판단 기준

검토 중 발견한 문제는 성격에 따라 처리한다.

바로 수정해도 되는 경우:

- 관련 문서 경로 누락
- 정본 용어 불일치
- 기존 결정과 명백히 맞는 세부 보완
- API 명세 필수 항목 누락
- DB 스키마 설명 부족
- goal 완료 기준 구체화

사용자에게 질문해야 하는 경우:

- MVP 포함 여부가 불명확한 기능
- 결제, 권한, 보안, 운영 정책 결정
- 사용자가 의도한 업무 흐름을 다르게 해석할 여지가 있는 경우
- 비용이 큰 외부 Provider 사용 여부
- FE/BE 작업 범위를 크게 바꾸는 결정

질문 진행 방식:

- 사용자의 판단이 필요한 항목이 여러 개 있으면 한 번에 하나씩 질문한다.
- 각 질문에는 질문의 의미, 왜 지금 결정해야 하는지, 선택지, 선택지별 영향, 추천안, 추천 이유, 반영할 문서 위치를 함께 적는다.
- 사용자가 짧게 답할 수 있도록 `A`, `B`, `C` 같은 선택지 형식을 기본으로 제공한다.
- 사용자가 답하면 관련 AGENT 또는 TODO 문서에 반영한 뒤 다음 질문으로 넘어간다.
- 세부 기준은 `AGENT/PM_AGENT/DECISIONS/021_user_decision_question_rule.md`를 따른다.

## 19. 금지 사항

- 검토 없이 큰 TODO 계획을 바로 구현하지 않는다.
- 사용자의 원래 요구와 다르게 바뀐 내용을 "정리된 기획"처럼 확정하지 않는다.
- API 명세 없이 FE 작업만 먼저 확정하지 않는다.
- DB 스키마 없이 Backend 작업을 구현 가능하다고 판단하지 않는다.
- 문서 간 충돌을 발견하고도 관련 문서를 갱신하지 않은 채 넘어가지 않는다.
- 질문이 필요한 기획 판단을 AI가 임의로 확정하지 않는다.
- 하나의 `/goal`에 여러 우선순위 작업을 묶지 않는다.

## 20. 관련 문서

- `AGENT/PM_AGENT/DECISIONS/017_planning_review_gate.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/OVERVIEW.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `TODO/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
