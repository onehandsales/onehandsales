# View 헤더 작업 분담

| 영역 | 책임 |
| --- | --- |
| view-definition | 초기 View/Favorite Query·adapter, 응답 조합 UseCase, DomainError·Query DTO·Controller·DI |
| object-definition | 같은 Workspace Object의 공개 단건 요약 Port·adapter·provider/export |
| list-definition | 같은 Workspace List의 공개 단건 요약 Port·adapter·provider/export |
| workspace/auth/shared | 기존 인증·멤버 ID·UUID·Filter·request id 재사용 |
| 검증 | UseCase·HTTP·실제 Repository 격리/정렬/rollback·DI·기존 API 회귀·규칙 검토 |

Attribute/Record는 기존 구현 패턴과 회귀 확인의 참고 대상이다. View 모듈이 다른 모듈의 persistence 구현을 import하지 않는다. 내부 Summary Port는 별도 HTTP API가 아니다.

[API 정본](API-SPEC/VIEW_HEADER_DETAIL_API.md), [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md), [검증](../BE-TODO/TEST-PLAN.md), [G99](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md)를 따른다. Frontend는 [후속 범위](../FE-TODO/README.md)이며 코드 변경 대상이 아니다.
