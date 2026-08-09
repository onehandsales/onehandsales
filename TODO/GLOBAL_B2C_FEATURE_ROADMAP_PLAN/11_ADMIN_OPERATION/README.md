# 11 Admin Operation

상태: Completed
순서: 11
성격: Global B2C 첫 판매 전 내부 최종 관리자 운영 콘솔/API/신뢰 gate
결정 상태: `COMMON/DECISION-LOG.md` 기준

## 1. 목적

11은 onehand.sales 최종 관리자만 사용하는 Admin 운영 기반을 만든다.

핵심은 결제/구독 운영이 아니라, 유료 고객을 받기 전에 반드시 필요한 사용자 상태 확인, 도메인 데이터 read-only 조회, 민감정보 마스킹, 원문 접근 사유와 감사 로그, provider 실패 확인, Trash/삭제 복구 정책, 계정 삭제와 데이터 export 요청, DB/migration/backup 운영 gate를 닫는 것이다.

결제, 구독, plan, entitlement, invoice, refund, failed payment recovery, paid conversion, churn, ARPU, LTV/CAC는 12번 `12_BILLING_SUBSCRIPTION_TAX`에서만 다룬다. 11의 Admin 화면에는 결제/구독 탭, 결제 상태, plan 상태, 복구 비용 처리 버튼을 만들지 않는다.

## 2. 현재 상태

- Backend는 G02~G09 구현 범위의 Admin 운영 API와 User 영향 API가 구현되어 있다.
- Admin Web은 사용자/도메인/Trash/provider/analytics/account request/system gate 운영 화면을 제공한다.
- `User.role=ADMIN`과 Admin 운영 감사 로그 table이 있다.
- `BE/prisma/schema.prisma`에는 핵심 도메인, soft delete, analytics, provider safe log foundation, 11 Admin 운영 table이 있다.
- `AdminAuditLog`, `AdminSensitiveAccessLog`, `TrashRecoveryRequest`, `AccountDeletionRequest`, `UserDataExportRequest`, `AdminOperationCheckRun`은 schema와 migration이 있다.
- Trash는 `deletedAt`, `deletedByUserId`, `trashExpiresAt` 기반 soft delete 구조가 이미 있다.
- 10번 Mobile/PWA와 충돌하지 않도록 BusinessCard OCR safe failure field는 현재 schema의 `BusinessCardScanLog.safeErrorCode`, `safeErrorMessage`, `retryable`를 사용한다.
- 10번 완료 후 `UserNotificationSetting`, `BrowserPushSubscription`, `NotificationDeliveryAttempt`, `ProductAnalyticsEvent`의 mobile field-use event는 Admin에서 safe summary/aggregate로 조회할 수 있는 기반이 됐다. 단 push endpoint/key/userAgent 원문과 analytics raw payload는 노출하지 않는다.
- `G10_QA_DOCUMENT_CLOSEOUT` 기준 최종 검증, 문서 정합성 점검, 보안/개인정보 redaction 리뷰가 완료됐다.
- 2026-08-09 `BEFORE_12_TASKS` G04 closeout에서 checklist, goal index, BE/FE TODO 상태를 실제 구현 상태와 맞췄다.

## 3. 확정 결정 요약

| 항목 | 결정 |
|---|---|
| Admin 사용자 | onehand.sales 내부 최종 관리자만 사용한다. 고객사/B2B tenant admin이 아니다. |
| 1차 범위 | 최소 운영 Admin + 운영 신뢰 항목 포함 |
| 사용자 조회 | 사용자 목록/상세가 1순위다. 사용자가 무엇을 하는지 숫자 요약과 최근 활동으로 본다. |
| 사용자 상세 기본 | 숫자 요약 + 최근 활동 타임라인 |
| Notification 상태 | 사용자 상세에서 알림 설정, browser push 활성 구독 수, 최근 delivery 실패 safe code를 운영 요약으로만 본다. endpoint/key 원문은 보지 않는다. |
| 도메인 상세 탭 | 별도 goal로 분리한다. 1차 사용자 상세 완성 후 진행한다. |
| 데이터 조회 기본 | read-only, masked response |
| 민감 원문 접근 | 기본 금지. 필요 시 reason 필수 + append-only audit log |
| Provider failure | safe summary/detail만 본다. provider raw, prompt, token, quota detail은 저장/표시하지 않는다. |
| Analytics | 09 foundation과 10 mobile field-use event를 읽는 Admin 운영 요약만 만든다. 결제/구독 지표는 제외한다. |
| Trash | DB hard delete/purge가 아니라 soft delete 유지다. 7일 무료 복구 이후에는 사용자 기본 위치와 무료 복구에서 숨기거나 제한하고, 데이터는 보존한다. |
| Admin Trash 조회 | 요약 + 삭제 데이터 목록까지 본다. Admin 직접 복구 실행은 11 1차에서 제외한다. |
| User Web 만료 Trash | Trash에 남기되 복구 버튼은 비활성화하고 복구 문의만 제공한다. 결제 연결은 하지 않는다. |
| 계정 삭제 | 일반 Trash 정책과 별개다. 개인정보 삭제 요청은 30일 유예 후 user-linked 데이터 삭제/익명화 정책으로 다룬다. |
| 결제/구독 | 11에서 완전히 제외한다. 12에서 처리한다. |
| ImportJob cleanup 운영 표시 | 01 cleanup 실패 전용 Admin 화면/API는 만들지 않는다. safe summary log만 남기고, 반복 장애 시 post-12 Admin 운영 후속에서 aggregate/system gate로 검토한다. |

## 4. Goal 실행 방식

11은 하나의 `/goal`로 구현하지 않는다. 각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

권장 순서:

```text
G01_DOCUMENT_CONTRACT_SYNC
-> G02_ADMIN_SECURITY_AUDIT_FOUNDATION
-> G03_ADMIN_USER_OVERVIEW
-> G04_ADMIN_DOMAIN_READONLY_TABS
-> G05_TRASH_RETENTION_RECOVERY
-> G06_PROVIDER_FAILURE_OPERATION
-> G07_ADMIN_ANALYTICS_OVERVIEW
-> G08_ACCOUNT_DATA_REQUESTS
-> G09_SYSTEM_OPERATION_GATE
-> G10_QA_DOCUMENT_CLOSEOUT
```

권장 1차 착수 묶음:

```text
G01 -> G02 -> G03 -> G05 -> G06 -> G07 -> G09 -> G10
```

`G04`는 사용자 상세의 별도 도메인 탭이고, 사용자가 앞서 결정한 대로 후속 goal로 분리한다. `G08`은 개인정보/삭제권 영향이 크므로 policy와 legal wording 확인 후 실행한다.

## 5. 구현 전 필수 참조

- `COMMON/REFERENCES.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/PLANNING-REVIEW.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/API-SPEC/README.md`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `FE/admin-web`
- `FE/user-web`는 Trash/account/data request 영향이 있는 goal에서만 확인한다.

## 6. 완료 기준

- Admin API는 모두 `/admin/api/*`로 분리된다.
- Admin API는 AuthGuard + AdminGuard를 통과해야 한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- Admin Web은 User Web feature/client를 직접 import하지 않는다.
- 사용자 목록/상세/활동/도메인/Trash/provider failure/analytics/system gate를 masked read-only 기준으로 볼 수 있다.
- 10번 완료 산출물 중 browser push 권한/구독 상태와 mobile field-use event는 safe summary/aggregate로만 조회한다.
- 민감 원문 접근과 주요 운영 조회/action은 append-only audit log를 남긴다.
- Trash 7일 이후 정책은 soft delete 보존과 후속 복구 정책 가능성을 해치지 않는다.
- 결제/구독 기능과 지표는 11에서 구현되지 않는다.
- 신규 Prisma model/field/enum/index에는 한글 주석과 migration SQL COMMENT가 있다.
- 모든 goal은 자체 체크리스트와 검증 기록을 남긴다.
- G10 closeout 검증 결과는 `COMMON/GOAL-SPECS/G10_QA_DOCUMENT_CLOSEOUT.md`에 기록되어 있다.
