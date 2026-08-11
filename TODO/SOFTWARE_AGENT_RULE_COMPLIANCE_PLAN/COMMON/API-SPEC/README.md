# API Spec

상태: Draft

## 1. 현재 API 변경 여부

이번 계획의 기본 범위에는 신규 API 추가, 기존 API request/response 변경, DB schema 변경이 없다.

따라서 현재 확정 API 계약 문서는 없다.

## 2. API 계약 작성이 필요한 경우

작업 중 다음 중 하나가 발생하면 구현 전에 이 폴더에 goal별 API 계약을 추가한다.

- request body, query, path param, header, cookie 변경
- response DTO 필드 추가/삭제/rename
- status code 변경
- error code 변경
- 인증/권한/ownership 동작 변경
- transaction 경계 변경이 API 실패/성공 의미를 바꾸는 경우
- Admin sensitive raw access, audit log, provider observability 동작 변경

## 3. 작성 기준

API 계약 문서는 다음을 포함해야 한다.

- 계약 상태: draft / confirmed / implemented
- method/path
- request DTO와 validation
- response DTO와 status code
- error response
- 내부 business logic
- transaction 필요 여부와 rollback 범위
- observability event key와 audit log 필요 여부
- FE consumer
- BE 구현 위치
- 호환성 영향

