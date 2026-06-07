# G33 Backend 위험 흐름 테스트

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P6-G33-G36-TEST-RELEASE.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`

## 요구사항 체크
- user ownership isolation 위험 흐름을 테스트한다.
- AdminGuard 위험 흐름을 테스트한다.
- deal stage change activity log 경로를 테스트한다.
- meeting note link activity log 경로를 테스트한다.
- sensitive raw view audit transaction을 테스트한다.
- trash restore 경로를 테스트한다.
- 위험 흐름 테스트가 자동 실행되게 한다.

## 제외 범위
- 전체 API full integration
- 외부 Provider 실제 호출

## 작업 로그
- G33 기준 문서와 Backend 테스트 원칙을 확인했다.
- 기존 테스트가 use case별로 분산되어 있어, 추적성을 위해 전용 `backend-risk-flows.spec.ts`를 추가했다.
- 신규 spec은 실제 use case/guard/Prisma adapter를 호출하고 외부 DB/provider 없이 fake repository와 mock adapter로 위험 흐름을 검증한다.
- user ownership isolation은 다른 사용자의 딜 상세 조회가 `DealNotFound`로 실패하는지 확인했다.
- AdminGuard는 non-admin 접근 차단을 확인했다.
- 딜 단계 변경과 회의록-딜 연결은 repository의 activity-log 경로로 전달되는 입력을 확인했다.
- 민감 원문 조회는 Prisma `$transaction` 내부 AuditLog 생성 후 복호화 순서를 확인했다.
- 휴지통 복구는 current user id와 target type/id가 repository로 전달되는지 확인했다.

## 검토
- 신규 risk spec은 G33 완료 기준을 한 파일에서 추적하기 위한 보강 테스트이며, 기존 도메인별 단위 테스트를 제거하거나 대체하지 않았다.
- 외부 Provider와 실제 DB를 호출하지 않아 기본 `pnpm test`에서 안정적으로 자동 실행된다.
- sensitive raw test는 원문 값이 AuditLog metadata에 들어가지 않고, transaction 이후 복호화되는 기존 G32 adapter 흐름을 회귀 테스트한다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm test -- backend-risk-flows`
- `cd BE && pnpm run build`
- `cd BE && pnpm test`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G33 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
