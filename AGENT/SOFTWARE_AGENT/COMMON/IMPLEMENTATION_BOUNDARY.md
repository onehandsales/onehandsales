# Implementation Boundary

Status: Current Software Boundary
Date: 2026-09-13

## 1. 목적

이 문서는 OneHand CRM의 현재 구현 범위, 비활성 레거시 흔적, 후속 CRM Core 설계 대상을 구분한다.

Software 작업자는 이 문서를 기준으로 "현재 코드에 있는 기능", "남아 있지만 활성 범위가 아닌 흔적", "아직 설계 중인 후속 기능"을 혼동하지 않는다.

## 2. 현재 활성 구현

### Backend

- `auth`
- `user`
- `error-report`
- `support-request`
- `public-contact-request`
- `health`
- `GET /admin/api/me`

### User Web

- public/auth route
- `/app`
- `/app/more`
- account settings modal
- help modal
- error report
- support request
- public contact request

### Admin Web

- `/login`
- `/`
- `GET /admin/api/me` 권한 확인

### DB

- `User`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`

## 3. 비활성 또는 레거시 흔적

아래는 현재 활성 CRM 도메인이 아니다.

- 고정형 Company/Contact/Product/Deal 도메인
- 고정형 검색 API와 xlsx export
- schedule/meeting-note/trash 자리만 남은 FE feature folder
- public/help copy에 남은 과거 sales CRM 표현
- 과거 Product Analytics schema/API

레거시 문맥은 `DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md`에 모아 기록한다.

## 4. 후속 설계 대상

후속 CRM Core는 아래 개념을 구현하는 별도 설계 대상이다.

- Workspace
- Kit
- Object
- Attribute
- Relationship
- Record
- List
- View
- Status
- Next Action

이 개념은 PM/UXUI 기준이 먼저이며, Software 문서는 Backend/Frontend/DB 구현 경계를 정한다.

## 5. 작업 판단 기준

새 작업이 들어오면 먼저 아래를 판단한다.

1. 현재 활성 foundation 유지보수인가?
2. 비활성 레거시 제거인가?
3. 후속 CRM Core 설계인가?
4. PM 결정이 필요한 제품 범위인가?
5. UXUI 결정이 필요한 화면 흐름인가?

3번 이상이면 바로 구현하지 말고 PM/UXUI 선행 문서와 API/DB 계약을 먼저 확인한다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/LEGACY_REMOVED_DOMAINS.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CRM_CORE_SCHEMA_DRAFT.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
