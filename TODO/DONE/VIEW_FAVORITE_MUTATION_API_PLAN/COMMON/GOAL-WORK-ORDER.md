# 실행 순서

| 단계 | 목적·포함 | 제외 | 완료 기준·결과 |
| --- | --- | --- | --- |
| G01 | 규칙·기존 구조·요청/응답/transaction 확정 | 코드 | 계약 confirmed 작성 완료 |
| G02 | Controller·DTO/Pipe·별도 UseCase·Command Port/Adapter·DI·오류 | FE·스키마·Workspace/공통 코드 변경 | API 계약 일치 구현 완료 |
| G03 | 단위·HTTP·격리 PostgreSQL 검증과 기존 GET 회귀 | 업무 DB fixture·실제 인증 Provider | 전체 400건·정적 검사·빌드 통과 |
| G99 | Backend 규칙·범위·계약·검증·문서 링크 최종 검토 | FE 연결 | 검토 완료·DONE 보관, 후속 사용자 요청으로 재검토 후 커밋 |

사용자의 직접 구현 요청으로 진행하며 goal 도구는 만들지 않는다. 기준은 [TODO Software 정본](../../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)이다.
