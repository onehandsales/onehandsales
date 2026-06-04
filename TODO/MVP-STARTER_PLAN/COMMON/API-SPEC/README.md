# API 명세 인덱스

## 1. 목적

이 폴더는 `MVP-STARTER_PLAN`의 Frontend와 Backend가 함께 보는 API 계약 문서를 관리한다.

API 명세는 Backend 내부 작업 목록이 아니다. 화면이 어떤 request를 보내고 어떤 response를 기대하는지, Backend가 어떤 비즈니스 로직과 DB 스키마로 처리해야 하는지를 연결하는 공통 계약이다.

## 2. 작성 원칙

- API 명세는 한국어로 작성한다.
- API 명세는 전체 MVP API를 한 문서에 몰아넣지 않고 `/goal` 우선순위에 맞춰 나눈다.
- 각 API는 `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`의 필수 항목을 따른다.
- 도메인 요약 문서와 엔드포인트 구현 계약 문서가 나뉜 경우, 실제 구현 시에는 `*-ENDPOINT-CONTRACT.md`를 API별 상세 계약 정본으로 본다.
- FE 화면에서 필요한 response 필드는 반드시 명시한다.
- 연결된 DB model과 transaction 여부를 반드시 명시한다.
- Admin API는 masking, 원문 조회 사유, 감사 로그 여부를 반드시 명시한다.

## 3. 공통 API 응답 규칙

### 인증

- User API는 `/api/*` 경로를 사용한다.
- Admin API는 `/admin/api/*` 경로를 사용한다.
- User API는 인증된 사용자 context를 필요로 한다.
- Admin API는 `AuthGuard`와 `AdminGuard`를 모두 통과해야 한다.

### 시간과 통화

- 모든 날짜/시간 response는 ISO 8601 문자열을 사용한다.
- 금액은 MVP에서 KRW 기준 정수로 내려준다.
- 다중 통화는 MVP 이후 확장한다.

### 목록 응답

목록 API는 기본적으로 다음 response 구조를 사용한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `items` | array | 목록 데이터 |
| `page` | number | 현재 페이지 |
| `pageSize` | number | 페이지 크기 |
| `totalCount` | number | 전체 개수 |
| `hasNext` | boolean | 다음 페이지 존재 여부 |

### 공통 에러

| 상황 | 에러 | HTTP |
|---|---|---|
| 인증 없음 | `Unauthorized` | 401 |
| 권한 없음 | `Forbidden` | 403 |
| validation 실패 | `ValidationError` | 400 |
| 대상 없음 | `NotFound` | 404 |
| 사용자 소유 데이터 아님 | `OwnershipViolation` | 403 |
| 삭제된 데이터 수정 시도 | `DeletedResource` | 409 |
| 서버 내부 오류 | `InternalServerError` | 500 |

## 4. 명세 문서

| 우선순위 | 문서 | 포함 goal | 설명 |
|---|---|---|---|
| P0-P1 | `G01-G05-FOUNDATION-AUTH-API.md` | G01-G05 | health, auth, me, settings, admin me |
| P1-P2 | `G06-G12-CORE-DOMAIN-API.md` | G06-G12 | Company, Contact, Product, Deal Backend |
| P1-P2 | `G06-G12-ENDPOINT-CONTRACT.md` | G06-G12 | 핵심 도메인 API별 request, business flow, response, DB, transaction, error 구현 계약 |
| P3-P4 | `G17-G29-WORKFLOW-AUTOMATION-API.md` | G17-G29 | Schedule, MeetingNote, OCR, Import, Export, 알림, 휴지통, 검색 |
| P3-P4 | `G17-G29-ENDPOINT-CONTRACT.md` | G17-G29 | 업무 흐름/자동화 API별 request, business flow, response, DB, adapter, error 구현 계약 |
| P5 | `G30-G32-ADMIN-AUDIT-API.md` | G30-G32 | Admin 조회, 민감정보 원문 조회, 감사 로그 |
| P5 | `G30-G32-ENDPOINT-CONTRACT.md` | G30-G32 | Admin/Audit API별 masking, 원문 조회, 감사 로그 transaction 구현 계약 |

## 5. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
