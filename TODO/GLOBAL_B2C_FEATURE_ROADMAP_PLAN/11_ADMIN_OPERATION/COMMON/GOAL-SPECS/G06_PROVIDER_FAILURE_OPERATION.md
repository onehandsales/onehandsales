# G06 Provider Failure Operation

상태: Ready after G02
목표: AI/OCR/STT/Calendar/Push/Email/SMS provider 실패를 Admin에서 safe summary/detail로 조회한다.

## 1. 포함 범위

- `GET /admin/api/provider-failures`
- `GET /admin/api/provider-failures/:failureId`
- Admin Web `/provider-failures`
- provider type/status/retryable/기간/user filter
- 기존 safe log source read model

## 2. 제외 범위

- provider raw response 저장/표시
- prompt 전문 표시
- STT transcript 전문 표시
- API key/token/quota detail 표시
- provider retry 실행 mutation
- 신규 generic `ProviderFailureLog` table

## 3. Backend 작업

1. provider failure source mapping을 만든다.
2. source별 safe select를 정의한다.
3. `AiProviderCallLog` 실패/취소/대기 상태를 normalize한다.
4. `BusinessCardScanLog.safeErrorCode/safeErrorMessage/retryable`를 OCR failure로 연결한다.
5. `NotificationDeliveryAttempt`, `FollowUpDeliveryAttempt` safe error를 연결한다.
6. Calendar connection/source sync error safe field를 연결한다.
7. browser push failure에서는 endpointHash, endpointCiphertext, p256dh/auth ciphertext, userAgent 원문을 조회하지 않는 select를 만든다.
8. list/detail API를 만든다.
9. detail 조회 audit를 남긴다.

## 4. Frontend 작업

1. `/provider-failures` page를 만든다.
2. provider type, feature area, retryable, status, 기간 filter를 만든다.
3. table에는 safe code/message, user masked, occurredAt, retryable을 표시한다.
4. detail drawer에는 safe context만 표시한다.
5. raw/prompt/token/quota detail 영역은 만들지 않는다.

## 5. Request 계약

```http
GET /admin/api/provider-failures?providerType=OCR&status=FAILED&limit=50
GET /admin/api/provider-failures/OCR:business-card-scan-log-id
```

상세 계약: `COMMON/API-SPEC/ADMIN_PROVIDER_FAILURE_API.md`

## 6. Response 계약

```json
{
  "items": [
    {
      "id": "OCR:business-card-scan-log-id",
      "providerType": "OCR",
      "sourceModel": "BusinessCardScanLog",
      "userId": "user-id",
      "userEmailMasked": "lo***@example.com",
      "featureArea": "BUSINESS_CARD_SCAN",
      "operation": "OCR_SCAN",
      "targetType": "BUSINESS_CARD_SCAN",
      "targetId": "business-card-scan-log-id",
      "status": "FAILED",
      "safeErrorCode": "OCR_IMAGE_BLURRY",
      "safeErrorMessage": "이미지가 흐려서 읽기 어려워요",
      "retryable": true,
      "latencyMs": 3200,
      "occurredAt": "2026-07-31T00:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

## 7. Business Logic

- 기존 log source를 공통 DTO로 normalize한다.
- source ID는 `SOURCE:id` opaque string으로 만든다.
- source별 select에서 금지 field를 조회하지 않는다.
- detail 조회는 audit 대상이다.
- BusinessCard 관련 DB 변경은 10번 migration을 재사용하고 중복하지 않는다.
- PUSH failure는 `NotificationDeliveryAttempt` safe field만 사용하고 browser push subscription secret/raw identifier는 사용하지 않는다.

## 8. User Flow

1. Admin이 `/provider-failures`에 진입한다.
2. provider type과 기간을 필터한다.
3. 실패 목록을 본다.
4. row를 선택해 safe detail을 본다.
5. 필요하면 사용자 상세로 이동한다.

## 9. DB/Prisma 영향

신규 DB 변경 없음.

조회:

- `AiProviderCallLog`
- `BusinessCardScanLog`
- `NotificationDeliveryAttempt`
- `FollowUpDeliveryAttempt`
- `ExternalCalendarConnection`
- `ExternalCalendarSource`
- `User`
- `AdminAuditLog`

## 10. 주석 기준

```ts
// 기능 : source별 provider 실패 로그를 Admin 공통 failure row로 변환합니다.
// 기능 : provider raw response 없이 safe error context만 조회합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- admin provider
```

```powershell
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 12. Goal 체크리스트

- [ ] provider failure list API가 있다.
- [ ] provider failure detail API가 있다.
- [ ] `AiProviderCallLog`가 연결된다.
- [ ] `BusinessCardScanLog.safeError*`가 연결된다.
- [ ] notification/follow-up/calendar safe failure가 연결된다.
- [ ] browser push endpoint/key/userAgent 원문이 조회되지 않는다.
- [ ] provider raw/prompt/token/quota detail을 조회하지 않는다.
- [ ] detail 조회 audit가 남는다.
- [ ] Admin Web `/provider-failures` 화면이 있다.
- [ ] retryable/status/provider type filter가 있다.
- [ ] 검증 command 결과를 기록했다.
