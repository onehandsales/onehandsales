# API Spec

상태: Confirmed

## 1. 목적

이 폴더는 `01_IMPORT_JOB_PERSISTENCE`의 User Web과 Backend가 함께 보는 API 계약을 둔다.

## 2. 계약 문서

| 문서 | 계약 상태 | 소비자 | 설명 |
|---|---|---|---|
| `IMPORT_JOB_API.md` | confirmed | User Web | ImportJob persistence/resume API 전체 계약 |

## 3. 구현 기준

- API 구현 goal은 `COMMON/GOAL-SPECS/G02_BACKEND_IMPORT_JOB_API.md`를 따른다.
- User Web 구현 goal은 `COMMON/GOAL-SPECS/G03_USER_WEB_RESUME_UX.md`를 따른다.
- API 계약은 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`와 `API_CONTRACT.md` 기준을 따른다.
- request, response, business logic, DB 연결, transaction, observability, error, FE/BE 처리 기준이 구현 전 최소 `confirmed` 상태여야 한다.

## 4. 주의

- 이 API는 User API이며 `/api/*` 경로만 사용한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- raw row, provider raw response, storage signed URL, 전화번호, 이메일은 response/log에 원문으로 노출하지 않는다.
