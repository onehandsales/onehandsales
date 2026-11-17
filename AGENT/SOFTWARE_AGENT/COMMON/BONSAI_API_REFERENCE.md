# Bonsai 공개 API 참고 기준

Updated: 2026-11-17
Status: 공식 개요 확인 / endpoint별 상세 대조·실호출 미수행

공식 정본: [Bonsai REST API](https://docs.hellobonsai.com/api)
관련 문서: [Bonsai MCP](https://docs.hellobonsai.com/), [기능 대응표](../../PM_AGENT/PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)

## 이번 확인 내용

공식 v1 개요는 `https://app.hellobonsai.com/public-api/v1` 경로, Bearer 인증(API key 또는 OAuth 2.1), 계정 멤버 권한 적용을 설명한다. 응답은 `data`와 `meta`, 쓰기는 리소스별 wrapper를 사용한다. PATCH의 누락과 null 의미는 필드별로 확인해야 한다.

목록은 `page[number]`·`page[size]`와 `has_more`를 사용한다. 금액은 decimal string, 날짜는 date, 시각은 UTC timestamp로 구분한다. 오류·request ID·호출 제한·재시도 조건이 있으며 정확한 값은 구현 직전 공식 문서를 다시 대조한다.

Companies, Contacts, Deals, Projects, Tasks, Time Entries, Invoices, Documents, Notes 등 공개 리소스 목록을 확인했다. 모든 endpoint의 필드·필터·삭제 동작까지 검토한 것은 아니다. 토큰 발급과 실제 요청은 수행하지 않았다.

## 우리 구현과의 관계

- 공식 API는 제품의 공개 계약 근거다. 우리 내부 API 경로·인증·응답 형식의 자동 결정이 아니다.
- 공개 API에 없는 견적·포털·인력·보고서 기능도 제품 조사 범위다.
- 리소스 이름과 필드만으로 Bonsai의 DB 테이블·FK·트랜잭션을 추정해 확정하지 않는다.
- 기능별로 공식 URL·method/path·입출력·누락/null·권한·오류·페이지네이션과 미확인을 기록한다.
- 우리 API는 기존 [API 계약 기준](../BACKEND_AGENT/CONVENTION/API_CONTRACT.md)에 맞춰 별도로 확정하고 FE·DB 의존을 연결한다.
- Bonsai MCP의 계정 데이터 작업과 Gummble의 화면 조사 연결을 구분한다.

문서 확인, 로컬 mock, 우리 API 구현, Bonsai 실계정 호출을 각각 별도 검증 상태로 남긴다.
