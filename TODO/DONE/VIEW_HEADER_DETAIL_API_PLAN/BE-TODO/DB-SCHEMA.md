# View 헤더 DB 읽기 범위와 소유권

- 스키마: [schema.prisma](../../../../BE/prisma/schema.prisma)
- 계약: [API-SPEC](../COMMON/API-SPEC/VIEW_HEADER_DETAIL_API.md)
- DB 현황: [README](../../../../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md)
- schema/migration/seed/조회 인덱스·UNIQUE·CHECK 변경 없음

| 데이터 | 소유 모듈 | 조건과 용도 |
| --- | --- | --- |
| WorkspaceMember | workspace 공개 Port | 인증 사용자 + Workspace → 서버 멤버 ID |
| ObjectDefinition | object-definition 공개 Summary Port | 요청 ID + Workspace → id/singularName/icon |
| ListDefinition | list-definition 공개 Summary Port | 요청 ID + Workspace → id/name/icon |
| ViewDefinition | view-definition | Workspace + 클릭 대상 FK → 저장 순서 첫 요약 |
| ViewFavoriteDefinition | view-definition | 현재 멤버 + Workspace + 선택 View 존재 여부 |

View FK는 단일 ID 기준이므로 Workspace 범위를 직접 제한한다. 다른 소속 FK의 null을 강제하거나 XOR 제약을 새로 적용하지 않는다. 응답 요약은 클릭한 대상 문맥이다. Favorite 중복은 존재 여부로만 처리한다.

Attribute/Record/ListEntry 값과 View 표시 속성·필터·정렬·그룹·위젯은 조회하지 않는다. View 없음과 DB 실패를 구분하고 자동 생성·갱신·삭제를 하지 않는다.

실제 통합 검증은 [TEST-PLAN](TEST-PLAN.md)의 명시적 테스트 DB와 rollback fixture로 수행한다. 업무 DB·환경 파일·실행 서버는 검증에 사용하거나 변경하지 않는다. Prisma가 표현하지 못하는 기존 List SQL 전용 제약도 임시 테스트 DB에 보존한다.
