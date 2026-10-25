# View 헤더 작업 순서

현재는 계획 문서 작성 단계다. 아래 goal 파일은 후속 실행 단위이며 지금 goal 생성·실행이나 API 구현을 요청하는 것은 아니다.

| 순서 | 작업 | 목적·포함 범위 | 제외 범위 | 완료 기준·의존성 |
| --- | --- | --- | --- | --- |
| 1 | [G01 Backend API](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md) | 내부 Object/List 요약 Port, View 단건 GET, 단위·HTTP·DB/DI·회귀 검증 | Frontend·본문·다른 HTTP API·DB schema 변경 | confirmed API 정본 준수. TEST-PLAN의 검증 결과를 실패/skip까지 기록. 필수 검증 미확인이면 검증 미완으로 유지 |
| 2 | [G99 규칙 검토](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md) | Backend 규칙 전수 대조, 발견 사항 수정·관련 재검증, 현황 문서와 완료 로그 정리 | 새 기능·추가 API·Frontend 구현 | G01 구현과 검증 증거를 확인. 항목별 판정과 근거를 기록하고 필수 미확인 항목이 없어야 최종 완료 |

## 실행 원칙

1. 각 작업 전에 현재 변경 상태와 필수 정본을 확인하고 기존 변경을 보존한다.
2. API 계약은 [API-SPEC](API-SPEC/VIEW_HEADER_DETAIL_API.md) 한 곳에서 관리한다.
3. 구현 작업일의 TODO_LOG를 시작 시 만들고 구현·검증·검토에 따라 갱신한다.
4. G01 뒤 G99를 생략하지 않는다. G99에서 발견한 결함은 수정하고 필요한 검증을 다시 수행한다.
5. Backend 최종 완료 후에도 Frontend 작업은 별도 후속 범위다.
6. 필수 검증 미확인이 남으면 confirmed 상태와 활성 계획을 유지한다. 최종 완료 후 TODO/DONE 보관·링크 갱신을 하고, 커밋은 사용자 요청 시에만 한다.
