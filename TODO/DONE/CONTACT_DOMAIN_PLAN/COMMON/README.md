# Contact Domain Common

## 목적

담당자 도메인에서 FE와 BE가 함께 봐야 하는 계약을 둔다.

현재 BE 구현은 완료되어 있으며, FE 작업은 이 폴더의 API 계약과 `BE/src/modules/contact`의 실제 응답 shape를 기준으로 진행한다.

## 문서

- `WORK-SPLIT.md`: FE/BE 책임 경계
- `API-SPEC/CONTACT_API.md`: 담당자 도메인 User API 계약
- `API-SPEC/CONTACT_API_DETAIL.md`: 담당자 도메인 User API 요청값, 응답값, 내부 비즈니스 로직, DB, 에러, FE/BE 처리 기준

## 공통 전제

- 이 폴더의 계약 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.
- 사용자 페이지 API만 다룬다.
- 모든 API는 로그인한 사용자 기준으로 동작한다.
- 모든 조회와 변경은 `userId` ownership을 검증한다.
- `Contact`는 반드시 `Company`에 소속된다.
- `Contact.companyId`는 필수다.
- `Contact.mobile`은 `010-1111-2222` 형식만 허용한다.
- 담당자 기본 기능에는 휴지통과 soft delete를 넣지 않는다.
- `contactMemo`는 `Contact` 테이블 컬럼이 아니다.
- 담당자 생성의 `contactMemo`는 값이 있을 때만 `ContactMemoLog` 첫 데이터로 저장한다.
- 담당자 생성의 `contactMemo`는 `memoType`을 `초기 메모`로 저장한다.
- 독립적인 담당자 일반 메모 로그 생성은 `memoType`, `memo`를 받는다.
- 독립적인 담당자 일반 메모 로그 수정은 `memoType`, `memo` 중 최소 1개를 받는다.
- 독립적인 담당자 개인 비밀 메모 로그 생성/수정은 `memo`만 받는다.
- 담당자 개인 비밀 메모 원문은 DB에 평문으로 저장하지 않는다.

API 계약을 수정할 때는 계약 상태, 소비자, 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, transaction, observability, 에러 응답, FE/BE 처리 기준을 누락하지 않는다.
API 구현 또는 FE 연동을 할 때는 `API-SPEC/CONTACT_API_DETAIL.md`를 최종 API 상세 계약으로 사용한다.

## 관련 문서

- `TODO/DONE/CONTACT_DOMAIN_PLAN/README.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/WORK-SPLIT.md`
- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
