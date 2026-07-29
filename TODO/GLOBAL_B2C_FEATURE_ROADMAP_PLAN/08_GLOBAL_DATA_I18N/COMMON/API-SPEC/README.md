# API Spec

상태: Implemented / G10 Reviewed

## 1. 목적

08의 Backend API 계약과 G10 기준 구현 결과를 함께 고정한다. 실제 DTO/route 이름은 G01~G10에서 현재 코드와 대조해 보정했다.

## 2. Spec 파일

- `USER_GLOBAL_SETTINGS_API.md`
- `AUTH_PROVIDER_API.md`
- `DOMAIN_GLOBAL_DATA_API.md`
- `IMPORT_EXPORT_LOCALIZATION_API.md`

G10 기준 네 spec 모두 구현 결과와 대조했다. 2026-07-29 `pnpm.cmd exec prisma migrate status` 재확인 기준 현재 `BE/.env` 연결 DB는 최신 상태다. 남은 운영 항목은 LINE/Apple 실제 OAuth provider smoke와 provider 설정값 연결이다.

## 3. 공통 원칙

- API는 locale별 완성 문구보다 stable `code`, `field`, ISO/date/value를 우선한다.
- 사용자가 보는 문구는 FE app i18n에서 처리한다.
- 날짜/시간 응답은 ISO string을 유지한다.
- 통화, 전화번호, 국가, 지역처럼 의미가 필요한 값은 code를 함께 내려준다.
- mutation은 AuthGuard와 user ownership을 유지한다.
- 신규/수정 Backend 코드에는 한글 주석 규칙을 적용한다.

## 4. Software Agent 필수 계약

`AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`와 `API_CONTRACT.md` 기준으로 각 API spec은 아래 항목을 반드시 가진다.

- 계약 상태: `confirmed` 이상이어야 구현 착수 가능
- 소비자: User Web, Backend internal 등
- 호환성: breaking change 여부, 기존 FE 영향, migration/fallback
- API 이름과 API 식별자
- Method, Path, 인증, 권한
- Request DTO 이름과 path/query/header/cookie/body 구분
- Response DTO 이름, success status, body 유무
- 비즈니스 로직 흐름
- 연결된 DB schema
- Transaction 계약
- Observability 계약
- Error response와 FE 처리 기준

## 5. 08 공통 Transaction 기준

- 단순 조회 API: `transaction: 없음`
- 단일 model 설정 update: 기본 `transaction: 없음`, 단 audit log 또는 연계 row가 생기면 재검토
- 여러 model을 함께 쓰는 auth exchange: `transaction: 필요`
- Import confirm/export generation: 기존 도메인 정책을 따르되 batch/파일 처리 경계 명시
- 외부 provider OAuth/Supabase 검증: DB transaction 밖에서 수행

## 6. 08 공통 Observability 기준

- 모든 HTTP 요청은 request id를 사용한다.
- 사용자 응답에는 safe error code/message만 내려준다.
- provider raw error, token, secret, authorization header, phone/email 원문은 log에 남기지 않는다.
- OAuth provider 실패는 provider, status, retryable, category, requestId 중심으로 기록한다.
- 데이터 mutation은 event key를 짧은 영어 dot notation으로 기록한다.
