# G03 Admin User Overview

상태: Ready after G02
목표: Admin이 사용자 목록, 사용자 상세 요약, 최근 활동 timeline을 read-only/masked로 볼 수 있게 한다.

## 1. 포함 범위

- `GET /admin/api/users`
- `GET /admin/api/users/:userId`
- `GET /admin/api/users/:userId/activity-timeline`
- Admin Web `/users`
- Admin Web `/users/:userId`
- domain count, Trash count, activation/AI usage summary

## 2. 제외 범위

- 도메인별 전체 목록 탭
- 사용자 상태 변경
- 결제/구독 정보
- raw 원문 표시

## 3. Backend 작업

1. 사용자 목록 query DTO를 만든다.
2. 사용자 목록 repository query를 만든다.
3. email/displayName masking mapper를 만든다.
4. domain count aggregate를 만든다.
5. Trash active/expired count aggregate를 만든다.
6. 09 `UserActivationSnapshot`과 `AiProviderCallLog` summary를 조회한다.
7. activity timeline read model을 만든다.
8. 사용자 목록/상세 조회 audit를 남긴다.

## 4. Frontend 작업

1. `/users` list page를 만든다.
2. 검색, status, locale, country filter를 만든다.
3. 사용자 row 선택 시 `/users/:userId`로 이동한다.
4. 상세 page에 profile summary, domain counts, Trash summary, analytics summary를 배치한다.
5. activity timeline을 표시한다.
6. 결제/구독 card나 tab을 만들지 않는다.

## 5. Request 계약

```http
GET /admin/api/users?q=local&status=ACTIVE&limit=50
GET /admin/api/users/:userId
GET /admin/api/users/:userId/activity-timeline?limit=30
```

상세 계약: `COMMON/API-SPEC/ADMIN_USER_OPERATION_API.md`

## 6. Response 계약

사용자 상세 response 핵심:

```json
{
  "id": "user-id",
  "profile": {
    "emailMasked": "lo***@example.com",
    "displayNameMasked": "로컬 사**",
    "role": "USER",
    "status": "ACTIVE",
    "preferredLocale": "ko-KR",
    "timeZone": "Asia/Seoul",
    "countryCode": "KR",
    "defaultCurrencyCode": "KRW"
  },
  "domainCounts": {
    "companies": 12,
    "contacts": 48,
    "products": 7,
    "deals": 19,
    "schedules": 6,
    "meetingNotes": 8
  },
  "trashSummary": {
    "active": 3,
    "expired": 1
  },
  "analyticsSummary": {
    "activationStatus": "ACTIVATED",
    "aiRequestCount30d": 14
  }
}
```

## 7. Business Logic

- 사용자 목록/상세는 read-only다.
- 사용자의 email/displayName은 기본 masked다.
- Admin이 사용자를 “무엇을 하는지” 볼 때 원문 content가 아니라 count/timeline/event summary를 본다.
- AI usage는 비용/횟수/상태만 보여주고 prompt/raw response는 보여주지 않는다.
- 12번 범위인 plan/payment/subscription은 응답에 없다.

## 8. User Flow

1. Admin이 `/users`에 진입한다.
2. 검색과 필터로 사용자를 찾는다.
3. 사용자를 선택한다.
4. 상세에서 profile, domain count, Trash summary, activity timeline을 본다.
5. 상세한 도메인 목록이 필요하면 G04 탭으로 이동한다.

## 9. DB/Prisma 영향

신규 DB 변경 없음.

조회:

- `User`
- `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`
- `BusinessCardScanLog`, `ImportJob`
- `ProductAnalyticsEvent`, `UserActivationSnapshot`
- `AiProviderCallLog`
- `AdminAuditLog`

## 10. 주석 기준

```ts
// 역할 : Admin 사용자 목록과 요약 정보를 조회합니다.
// 기능 : 사용자 도메인 count와 Trash 만료 count를 계산합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- admin user
```

```powershell
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 12. Goal 체크리스트

- [ ] 사용자 목록 API가 있다.
- [ ] 사용자 상세 요약 API가 있다.
- [ ] activity timeline API가 있다.
- [ ] email/displayName은 masked다.
- [ ] domain count가 userId 기준으로 계산된다.
- [ ] Trash active/expired count가 있다.
- [ ] activation/AI usage summary가 있다.
- [ ] 결제/구독 field가 response에 없다.
- [ ] 사용자 목록/상세 조회 audit가 남는다.
- [ ] Admin Web `/users` 화면이 있다.
- [ ] Admin Web `/users/:userId` 화면이 있다.
- [ ] loading/empty/error 상태가 있다.
- [ ] 검증 command 결과를 기록했다.
