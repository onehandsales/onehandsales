# User Flow

상태: Confirmed

## 1. Admin 사용자 확인

1. 운영자가 Admin Web에 접속한다.
2. 로그인 session을 확인한다.
3. Backend `/admin/api/me`가 `role=ADMIN`을 확인한다.
4. Admin shell이 표시된다.
5. 일반 사용자면 접근 차단 화면으로 이동한다.

## 2. 사용자 운영 조회

1. 운영자가 `/users`에서 사용자 email/name/status/country/locale로 검색한다.
2. 목록에서 사용자를 선택한다.
3. `/users/:userId`에서 masked profile과 요약 count를 본다.
4. 최근 활동 timeline에서 딜/일정/회의록/명함/import/export 흐름을 확인한다.
5. 필요하면 `도메인 탭 보기`로 G04 화면에 진입한다.
6. 사용자 상세 조회 audit가 남는다.

## 3. 민감 원문 조회

1. 운영자가 masked field 옆의 원문 조회 action을 누른다.
2. reason modal이 열린다.
3. 운영자가 구체적인 사유를 입력한다.
4. Backend가 AdminGuard와 target 존재를 확인한다.
5. `AdminAuditLog`와 `AdminSensitiveAccessLog`가 생성된다.
6. 허용된 field만 원문으로 표시된다.
7. provider raw/prompt/token/quota detail은 어떤 경우에도 표시되지 않는다.

## 4. Trash 만료와 복구 문의

1. 사용자가 User Web `/app/trash`에 진입한다.
2. 7일 이내 row는 `복구` 버튼이 활성화된다.
3. 7일 이후 row는 `무료 복구 기간이 지났어요` 상태로 표시된다.
4. 7일 이후 row는 `복구 문의`를 생성할 수 있다.
5. 운영자는 Admin Web `/trash/recovery-requests`에서 문의를 확인한다.
6. 운영자는 상태만 관리한다.
7. 11 1차에서는 Admin이 직접 복구하거나 결제를 받지 않는다.

## 5. Provider Failure 확인

1. 운영자가 `/provider-failures`에 진입한다.
2. provider type, feature area, status, retryable, 기간으로 필터한다.
3. 목록에서 safe error code/message와 발생 추이를 본다.
4. 상세 drawer에서 target user와 target type/id, latency, requestId를 본다.
5. provider raw response는 없다.
6. 상세 조회 audit가 남는다.

## 6. Admin Analytics

1. 운영자가 `/analytics`에 진입한다.
2. 기간과 timezone을 선택한다.
3. activation, retention, active user, core event count, route view, AI usage/cost를 본다.
4. paid conversion/churn/revenue는 표시하지 않는다.

## 7. 계정 삭제와 데이터 export

1. 사용자가 `/app/settings`에서 데이터 export 또는 계정 삭제를 요청한다.
2. User API가 request row를 생성한다.
3. Admin은 `/account-requests`에서 요청 상태를 본다.
4. 데이터 export가 준비되면 사용자는 User Web에서 다운로드 가능 상태를 본다.
5. 계정 삭제는 30일 유예와 취소 flow를 가진다.
6. Admin은 직접 임의 삭제가 아니라 요청 상태와 job 상태를 추적한다.

## 8. System Operation Gate

1. 운영자가 `/system`에 진입한다.
2. 현재 환경, migration status, prisma validate/generate, seed 금지, backup, restore dry-run, provider smoke 결과를 기록한다.
3. 기록은 `AdminOperationCheckRun`에 남는다.
4. production secret이나 DB URL은 저장하지 않는다.
