# G30 Admin Backend 조회 API

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P5-G30-G32-ADMIN-AUDIT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`

## 요구사항 체크
- `/admin/api/dashboard`를 구현한다.
- `/admin/api/users`, `/admin/api/users/:userId`를 구현한다.
- 전체 Company/Contact/Product/Deal 목록과 상세 조회 API를 구현한다.
- 특정 사용자별 Company/Contact/Product/Deal 목록 API를 구현한다.
- 모든 Admin API는 `AuthGuard`와 `AdminGuard`를 통과해야 한다.
- 서버 페이지네이션을 적용한다.
- 민감 데이터는 기본 마스킹한다.
- Memo 원문과 MeetingNote 원문은 Admin 조회 API에서 복호화/노출하지 않는다.

## 제외 범위
- Admin Frontend 화면
- 민감정보 raw view API
- 감사 로그 조회 화면/API
- 사용자 상태 변경 API

## 작업 로그
- G30 기준 문서와 Admin endpoint 계약을 확인했다.
- 기존 admin 모듈은 README만 있는 상태임을 확인했다.
- Schedule/MeetingNote Admin 화면은 G30 범위가 아니므로 Company/Contact/Product/Deal 중심으로 구현한다.
- `AdminModule`을 추가하고 `AppModule`에 연결했다.
- 모든 Admin 조회 controller에 `AuthGuard`와 `AdminGuard`를 적용했다.
- `/admin/api/dashboard`를 구현했다.
- `/admin/api/users`, `/admin/api/users/:userId`를 구현했다.
- `/admin/api/companies`, `/admin/api/companies/:companyId`를 구현했다.
- `/admin/api/contacts`, `/admin/api/contacts/:contactId`를 구현했다.
- `/admin/api/products`, `/admin/api/products/:productId`를 구현했다.
- `/admin/api/deals`, `/admin/api/deals/:dealId`를 구현했다.
- `/admin/api/users/:userId/companies|contacts|products|deals` 사용자별 목록을 구현했다.
- 서버 페이지네이션, 검색, 사용자 필터, 삭제 포함 필터, 딜 stage 필터를 적용했다.
- 이메일, 전화번호, 금액, 단가는 기본 마스킹 응답으로 매핑했다.
- Memo 원문과 MeetingNote 원문은 조회/복호화하지 않고 summary/count만 반환하도록 제한했다.
- Admin use case normalization 테스트와 masking 테스트를 추가했다.

## 검토
- G30은 조회 API goal이므로 사용자 상태 변경 API는 이번 범위에서 제외했다.
- Product schema에는 currency 필드가 없어 Admin product response의 `currency`는 `null`로 반환한다.
- 상세 API는 운영 조회 목적상 삭제된 대상도 반환하되 `deletedAt`, `permanentDeleteAt`을 함께 내려준다.
- 최근 로그/활동은 원문 content를 제외하고 title/date/deletedAt만 반환한다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm run build`
- `cd BE && pnpm run test -- admin`
- `cd BE && pnpm run test`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G30 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
