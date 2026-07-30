# DB Schema TODO

상태: Confirmed

## 1. 목적

10번 Mobile/PWA Field Use에서 필요한 DB 변경과 만들지 말아야 할 DB를 명확히 한다.

## 2. 먼저 확인할 스키마

구현자는 DB 작업 전 아래 파일을 먼저 확인한다.

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/BUSINESS_CARD_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/PRODUCT_ANALYTICS_SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

## 3. 10번에서 필요한 유일한 migration

G02에서 `BusinessCardScanLog`에 safe OCR failure fields를 추가한다.

```prisma
model BusinessCardScanLog {
  safeErrorCode    String?
  safeErrorMessage String?
  retryable        Boolean @default(false)

  @@index([userId, status, safeErrorCode, createdAt])
}
```

주의:

- 기존 migration 파일 수정 금지
- 새 migration만 추가
- 기존 row는 nullable/default로 보존
- `safeErrorMessage`는 사용자에게 보여줄 수 있는 짧은 안전 문구만 저장
- provider raw detail은 저장하지 않음

## 4. 신규 DB를 만들지 않는 범위

10번에서는 아래 DB/model/table을 만들지 않는다.

- `UserDraft`
- `LocalDraft`
- `MobileDraft`
- `/api/drafts/*`용 draft table
- audio temporary storage table
- image temporary storage table
- native device table
- marketing opt-in table
- Admin provider failure dashboard table

## 5. 기존 DB 재사용

| 기능 | 기존 model | 처리 |
|---|---|---|
| BusinessCard OCR scan | `BusinessCardScanLog` | safe failure fields만 추가 |
| MeetingNote STT draft | `AiProviderCallLog` | provider safe log 재사용 |
| MeetingNote 최종 저장 | 기존 MeetingNote model | 사용자가 저장할 때만 생성 |
| Notification setting | `UserNotificationSetting` | 기존 model 재사용 |
| Browser push subscription | `BrowserPushSubscription` | 기존 model 재사용 |
| Analytics | `ProductAnalyticsEvent` | eventName string/payloadJson 재사용 |

## 6. 저장 금지 데이터

- image binary/blob/base64
- audio binary/blob/base64
- provider raw response
- provider raw error detail
- AI prompt
- transcript 전문
- 명함 OCR raw text 전문
- push endpoint/key
- access token/refresh token

## 7. migration 검증

권장 command:

```powershell
pnpm --dir BE prisma validate
pnpm --dir BE prisma migrate diff
```

운영/공유 DB에는 사용자 승인 없이 migrate/seed를 실행하지 않는다.

## 8. Goal별 DB 영향

| Goal | DB 영향 |
|---|---|
| G01 | 문서만, DB 변경 없음 |
| G02 | `BusinessCardScanLog` safe failure fields migration |
| G03 | 신규 migration 없음 |
| G04 | 신규 migration 없음, local draft는 client only |
| G05 | 신규 migration 없음 |
| G06 | 신규 migration 없음, `ProductAnalyticsEvent` 재사용 |
| G07 | 신규 migration 없음, 검토만 |
