# DB Schema

## 1. 목적

이 폴더는 OneHand CRM의 현재 Prisma schema, 후속 CRM Core schema draft, 제거된 레거시 도메인 기록을 관리한다.

현재 코드에 없는 모델을 활성 DB schema처럼 설명하지 않는다.

## 2. 현재 활성 Prisma 범위

현재 `BE/prisma/schema.prisma`의 활성 범위는 인증/세션, 사용자 프로필, 지원 접수, 공개 문의 접수 모델이다.

### Enums

- `UserRole`
- `UserStatus`
- `OAuthProvider`
- `AuthSessionStatus`
- `AuthDeviceStatus`
- `AuthDeviceSlot`
- `ErrorReportStatus`
- `SupportRequestType`
- `SupportRequestStatus`
- `PublicContactRequestStatus`

### Models

- `User`
- `UserOAuthAccount`
- `AuthDevice`
- `AuthSession`
- `ErrorReport`
- `SupportRequest`
- `PublicContactRequest`

## 3. 현재 schema 원칙

- 인증이 필요한 접수 row는 `userId` ownership과 제출 시점 사용자 snapshot을 가진다.
- 공개 문의 row는 User FK 없이 독립 원장으로 저장한다.
- 공개 문의의 회사명과 회사 규모 입력 필드는 공개 문의 원문 보존 필드다.
- 공개 문의 필드는 고정형 Company record가 아니다.

## 4. 후속 CRM Core

후속 CRM Core는 현재 schema에 없다.

Workspace, Kit, Object, Attribute, Relationship, Record, List, View 후보는 `CRM_CORE_SCHEMA_DRAFT.md`에서 draft로만 관리한다.

이 draft는 migration 준비 문서가 아니며, 실제 구현 전 API 계약과 PM/UXUI 결정을 함께 확인해야 한다.

## 5. 제거된 도메인

고정형 고객사/담당자/상품/딜/일정/회의록/검색/Product Analytics 계열 모델은 현재 schema에 없다.

제거 기록은 `LEGACY_REMOVED_DOMAINS.md`에 통합한다.

## 6. 현재 문서

| 문서 | 목적 |
| --- | --- |
| `AUTH_USER_SCHEMA.md` | User/Auth schema 설명 |
| `ERROR_REPORT_SCHEMA.md` | 오류 신고 schema 설명 |
| `SUPPORT_REQUEST_SCHEMA.md` | 지원 문의 schema 설명 |
| `PUBLIC_CONTACT_REQUEST_SCHEMA.md` | 공개 문의 schema 설명 |
| `TIME_AND_TIMEZONE_POLICY.md` | 시간/타임존 저장 정책 |
| `CRM_CORE_SCHEMA_DRAFT.md` | 후속 CRM Core schema 초안 |
| `LEGACY_REMOVED_DOMAINS.md` | 제거된 레거시 도메인 기록 |

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/COMMON/IMPLEMENTATION_BOUNDARY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
