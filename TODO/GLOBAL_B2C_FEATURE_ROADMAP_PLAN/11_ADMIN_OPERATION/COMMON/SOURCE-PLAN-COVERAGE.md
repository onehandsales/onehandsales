# Source Plan Coverage

상태: Confirmed

## 1. NEXT_BACKEND_API_BACKLOG_PLAN 반영

| Source | 11 반영 |
|---|---|
| NBA-005 BusinessCard provider failure contract | G06에서 `BusinessCardScanLog.safeErrorCode/safeErrorMessage/retryable` 기반 Admin provider failure에 포함 |
| NBA-007 Trash private memo backend response restriction | G05에서 User Trash response와 Admin Trash response 모두 private memo 원문 제외 |
| NBA-011 MeetingNote provider Admin/internal audit 잔여 | G06에서 `AiProviderCallLog` safe 조회, G02에서 raw access/audit foundation |
| NBA-012 Trash 7일 이후 복구 정책 | G05에서 7일 무료 복구, 만료 후 복구 문의, hard delete 금지로 반영 |
| NBA-013 Admin 운영 UX/API | G02~G09로 분해 |
| NBA-014 DB/Prisma migration 운영 gate | G09에서 operation check run으로 반영 |
| 09_PRODUCT_ANALYTICS Admin dashboard 이관 | G07에서 Admin analytics overview로 반영 |

## 2. USER_WEB_PRODUCTIZATION_GAP_PLAN 반영

| Source | 11 반영 |
|---|---|
| Global B2C first-sale Admin/support gate | G02/G03/G06/G09 |
| Trust/policy 계정 삭제/데이터 export/delete | G08 |
| Data reliability backup/restore/장애 대응 | G09 |
| Admin provider audit/retention | G06/G09 |
| Trash 7일 이후 정책/private memo | G05 |
| Admin analytics dashboard | G07 |
| Billing/paywall/churn 연결 | 11 제외, 12 이관 |

## 3. 09 Product Analytics 이관

| 09 산출물 | 11 사용 방식 |
|---|---|
| `ProductAnalyticsEvent` | Admin overview event count, route count, workflow activity |
| `UserActivationSnapshot` | activation status/count |
| `RetentionCohortSnapshot` | cohort retention summary |
| `AiProviderCallLog` 기반 AI usage summary | 사용자별/기간별 AI usage/cost 참고용 |
| Billing reserved taxonomy | 11 제외, 12 이관 |

## 4. 10 Mobile/PWA 충돌 방지

| 10 산출물 | 11 사용 방식 |
|---|---|
| BusinessCard mobile capture/OCR safe failure | 11은 safe failure 조회만 한다 |
| `BusinessCardScanLog.safeError*` migration | 11에서 중복 migration을 만들지 않는다 |
| Mobile analytics 세부 event | 11에서 새 mobile event를 추가하지 않는다 |
| Local draft/PWA | 11 scope 아님 |

## 5. 제외 확인

11에 넣지 않는 항목:

- 결제/구독/plan/entitlement
- invoice/refund/tax/MoR
- billing-linked paid conversion/churn
- Admin 직접 결제 또는 유료 복구 과금 실행
- provider raw response storage
- B2B tenant admin
