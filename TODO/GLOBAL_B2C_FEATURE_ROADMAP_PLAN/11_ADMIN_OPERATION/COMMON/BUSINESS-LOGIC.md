# Business Logic

상태: Confirmed

## 1. Admin Authorization

1. 모든 `/admin/api/*` 요청은 AuthGuard를 통과한다.
2. AuthGuard가 만든 현재 사용자 context에서 `role=ADMIN`인지 확인한다.
3. AdminGuard 실패 시 대상 사용자/record 존재 여부를 노출하지 않는다.
4. Admin Web route guard는 UX 보조일 뿐 보안 경계가 아니다.

## 2. Masking

기본 response는 항상 masked다.

| Field | Masking 예시 |
|---|---|
| email | `lo***@example.com` |
| displayName | `김**` 또는 initials |
| phone | `+82 10-****-1234` |
| provider email | `go***@example.com` |
| meeting note body | preview 80자 이하 또는 `본문 숨김` |
| memo | preview 80자 이하, private memo 원문 제외 |
| token/secret | response 포함 금지 |

raw access API에서도 provider raw, prompt, token, API key, quota detail은 제외한다.

## 3. Audit

Admin 주요 조회/action은 append-only audit를 남긴다.

1. application use case 시작 시 action과 target을 결정한다.
2. 권한 검증을 수행한다.
3. 조회/action 성공 또는 실패 결과를 `AdminAuditLog`에 기록한다.
4. 민감 원문 조회는 `AdminSensitiveAccessLog`를 추가로 기록한다.
5. audit 기록 실패는 민감 원문 조회의 경우 전체 요청 실패로 처리한다.
6. 일반 목록 조회 audit 실패는 운영 정책에 따라 요청 실패 또는 fallback을 선택하되, G02에서 명확히 구현한다.

## 4. 사용자 상세

사용자 상세는 raw domain content를 직접 보여주지 않는다.

1. User 기본 정보를 masked로 조회한다.
2. 도메인별 count를 계산한다.
3. Trash count와 무료 복구 만료 count를 계산한다.
4. 09 analytics snapshot/event 기반 activation/최근 활동 summary를 결합한다.
5. AI usage summary는 `AiProviderCallLog`의 count/token/cost/status만 사용한다.
6. 상세 조회 audit를 남긴다.

## 5. Trash

일반 도메인 삭제는 soft delete다.

1. 삭제 시 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 채운다.
2. `trashExpiresAt` 이전에는 User Web에서 self-restore 가능하다.
3. `trashExpiresAt` 이후에는 User Web 복구 버튼을 비활성화한다.
4. 만료 후에도 row를 hard delete하지 않는다.
5. 사용자는 `복구 문의`를 생성할 수 있다.
6. Admin은 요약과 목록, 복구 문의 queue를 볼 수 있다.
7. Admin 직접 복구 실행은 11 1차에서 하지 않는다.

## 6. Provider Failure

Admin provider failure는 safe log read model이다.

1. 기존 provider log source를 기간/상태/사용자 기준으로 조회한다.
2. 각 source를 공통 DTO로 normalize한다.
3. provider raw, prompt, transcript, token, quota detail은 select하지 않는다.
4. safe error code/message, retryable, latency, requestId, target type/id만 반환한다.
5. 상세 조회는 audit 대상이다.

## 7. Account Deletion

계정 삭제는 일반 Trash와 다르다.

1. 사용자가 `/app/settings`에서 삭제 요청을 생성한다.
2. request row를 만들고 `scheduledDeletionAt=requestedAt+30일`을 저장한다.
3. 세션 revoke 또는 접근 차단을 적용한다.
4. 유예 기간 내 취소 API를 제공한다.
5. 유예 기간 이후 삭제/익명화 job이 실행될 수 있게 한다.
6. user-linked analytics raw event와 user-level snapshot은 실제 삭제 대상이다.
7. 법무/보안/결제 예외 보관은 별도 policy로 분리한다.

## 8. Data Export

데이터 export 요청은 user-owned 데이터 기준이다.

1. 사용자가 export 요청을 생성한다.
2. 기본 export는 사용자가 일반 화면에서 볼 수 있는 데이터만 포함한다.
3. `includeSensitive=true`는 별도 확인 UI와 Backend validation이 필요하다.
4. provider raw, token, audit log, internal admin note는 export하지 않는다.
5. export 파일은 만료 시각을 가진다.
6. Admin은 처리 상태를 볼 수 있지만 파일 원문을 기본 다운로드하지 않는다.

## 9. System Operation Gate

Admin은 DB/migration/backup 상태를 기록하고 확인한다.

1. 운영자는 대상 환경을 local/qa/staging/production으로 분류한다.
2. migration status, prisma validate/generate, seed 실행 여부, backup 확인, restore dry-run 여부를 기록한다.
3. Admin 화면은 secret, DB URL, access token을 저장하거나 표시하지 않는다.
4. 공유/운영 DB에 Admin API가 migrate/seed를 실행하지 않는다.
