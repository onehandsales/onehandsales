# Company Domain Common

## 목적

회사 도메인에서 FE와 BE가 함께 봐야 하는 계약을 둔다.

## 문서

- `WORK-SPLIT.md`: FE/BE 책임 경계
- `API-SPEC/COMPANY_API.md`: 회사 도메인 User API 계약
- `API-SPEC/COMPANY_API_DETAIL.md`: 회사 도메인 User API 요청값, 응답값, 내부 비즈니스 로직, DB, 에러, FE/BE 처리 기준

## 공통 전제

- 이 폴더의 계약 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- 사용자 페이지 API만 다룬다.
- 모든 API는 로그인한 사용자 기준으로 동작한다.
- 모든 조회와 변경은 `userId` ownership을 검증한다.
- 회사 기본 기능에는 휴지통과 soft delete를 넣지 않는다.
- `companyMemo`는 `Company` 테이블 컬럼이 아니다.
- 회사 생성의 `companyMemo`는 `memoType`을 `초기 메모`로 저장한다.
- 독립적인 회사 메모 로그 생성은 `memoType`, `memo`를 받는다.
- 독립적인 회사 개인 비밀 메모 로그 생성은 `memo`만 받는다.

API 계약을 수정할 때는 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, 에러 응답, FE/BE 처리 기준을 누락하지 않는다.
API 구현 또는 FE 연동을 할 때는 `API-SPEC/COMPANY_API_DETAIL.md`를 최종 API 상세 계약으로 사용한다.
