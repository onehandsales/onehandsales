# View 헤더 작업 순서

상태: G01 구현·검증과 G99 규칙 검토 완료. 실제 결과는 TEST-PLAN과 작업 로그에 기록했다.

사용자의 명시적 구현 요청에 따라 ③ Backend API만 순차 구현한다. API 계약 정본은 [API-SPEC](API-SPEC/VIEW_HEADER_DETAIL_API.md)이다.

| 순서 | 작업 | 포함 범위 | 제외 범위 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 1 | [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md) | 대상 기반 계약 갱신, 공개 Summary Port, 초기 헤더 GET, 단위·HTTP·DB·DI·회귀 검증 | FE·본문·다른 HTTP API·자동 생성·DB schema | 실제 검증 결과 기록, 실패/skip 구분 |
| 2 | [G99](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md) | Backend 규칙·diff·검증 근거 대조, 발견 사항 수정, 문서·로그 상태 갱신 | 새 기능·①/②·FE | 필수 미확인 없이 완료하고 DONE 보관 |

작업 시작부터 [로그](../../../../TODO_LOG/2026-10-25/VIEW_HEADER_TARGET_GET/WORK_LOG.md)를 갱신한다. G01 뒤 G99를 수행한다. 커밋·배포는 별도 요청 범위다.
