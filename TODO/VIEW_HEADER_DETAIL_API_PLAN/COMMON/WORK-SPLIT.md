# View 헤더 작업 분담

## 1. Backend 구현 범위

| 영역 | 책임 | 참조 |
| --- | --- | --- |
| view-definition | View/Favorite 조회 Port·adapter, UseCase·DomainError·Controller, 응답 조합 | [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md) |
| object-definition | Workspace에 속한 Object 단건 요약 공개 Port·adapter·provider/export | [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md) |
| list-definition | Workspace에 속한 List 단건 요약 공개 Port·adapter·provider/export | [G01](../BE-TODO/G01-BE-VIEW-HEADER-DETAIL.goal.md) |
| workspace/auth/shared | 기존 인증·멤버 조회·UUID·오류 변환 재사용 | [DB·경계](../BE-TODO/DB-SCHEMA.md) |
| 테스트·최종 검토 | 단위/HTTP/DB 격리·DI·회귀 검증, Backend 규칙 대조와 발견 사항 수정 | [TEST-PLAN](../BE-TODO/TEST-PLAN.md), [G99](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md) |

Attribute/Record는 기존 구현 패턴과 회귀 검증의 참고 대상이다. 이번 헤더 API가 해당 모듈의 본문 조회·생성·수정을 실행하지 않는다.

## 2. Frontend 후속 범위

[FE-TODO](../FE-TODO/README.md)는 API 소비 기준과 아직 하지 않을 작업을 구분한다. 이번 계획에서 API client/hook/route/헤더/사이드바·본문을 수정하지 않는다. Backend 완료를 Frontend 연결 완료로 표시하지 않는다.

## 3. 공통 계약과 문서 책임

- [API-SPEC](API-SPEC/VIEW_HEADER_DETAIL_API.md): 경로·Request·Response·오류·조회·transaction/observability의 정본.
- [공통 범위](README.md)와 [작업 순서](GOAL-WORK-ORDER.md): 포함/제외·의존성·완료 조건.
- [기획 검토](PLANNING-REVIEW.md): 문서의 실행 가능성·충돌·보류 판단.
- [G99](../BE-TODO/G99-BE-RULE-COMPLIANCE-REVIEW.goal.md): 실제 구현 후 규칙 준수·실행 결과와 미확인 사항.
- 계약을 바꾸면 영향을 받는 BE/FE/DB 문서를 함께 확인한다. 구현 결과와 문서 상태가 일치해야 한다.
