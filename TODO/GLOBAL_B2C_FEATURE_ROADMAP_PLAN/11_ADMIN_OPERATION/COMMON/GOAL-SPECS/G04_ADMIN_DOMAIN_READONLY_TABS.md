# G04 Admin Domain Readonly Tabs

상태: Follow-up
목표: 사용자 상세에서 회사/담당자/제품/딜/일정/회의록/명함/import를 read-only 탭으로 조회한다.

## 1. 포함 범위

- `GET /admin/api/users/:userId/domain-records`
- Admin Web `/users/:userId/domain`
- domain tabs
- table + detail drawer
- deleted row 포함 필터

## 2. 제외 범위

- Admin 도메인 수정/삭제/복구 mutation
- private memo 원문
- meeting note 본문 원문 기본 노출
- provider raw
- 결제/구독 탭

## 3. Backend 작업

1. domain enum query validation을 만든다.
2. domain별 safe select mapper를 만든다.
3. `includeDeleted` 필터를 구현한다.
4. private memo 원문을 제외한다.
5. meeting note body는 preview 또는 숨김으로 처리한다.
6. domain records 조회 audit를 남긴다.

## 4. Frontend 작업

1. 사용자 상세에서 `도메인` 탭 route를 만든다.
2. domain segmented tabs를 만든다.
3. domain별 table column을 정의한다.
4. detail drawer는 safe field만 표시한다.
5. 원문이 필요한 field는 G02 raw access modal을 연결한다.

## 5. Request 계약

```http
GET /admin/api/users/:userId/domain-records?domain=DEAL&includeDeleted=false&limit=30
```

상세 계약: `COMMON/API-SPEC/ADMIN_DOMAIN_READONLY_API.md`

## 6. Response 계약

```json
{
  "domain": "DEAL",
  "items": [
    {
      "id": "deal-id",
      "displayTitle": "삼성전자 갱신 딜",
      "status": "ACTIVE",
      "summary": {
        "dealStatus": "NEGOTIATION",
        "dealCost": 12000000,
        "currencyCode": "KRW"
      },
      "sensitiveFlags": {
        "hasMemo": true,
        "hasPrivateMemo": false,
        "privateMemoIncluded": false
      },
      "createdAt": "2026-07-01T00:00:00.000Z",
      "deletedAt": null,
      "trashExpiresAt": null
    }
  ],
  "nextCursor": null
}
```

## 7. Business Logic

- 모든 조회는 `userId` 소유 조건을 가진다.
- domain별 raw content는 safe summary로 변환한다.
- private memo 원문은 어떤 list/detail response에도 포함하지 않는다.
- raw access가 필요하면 G02 API로 분리한다.

## 8. User Flow

1. Admin이 사용자 상세에서 `도메인` 탭을 연다.
2. Company/Contact/Product/Deal/Schedule/MeetingNote 등을 전환한다.
3. table에서 row를 선택한다.
4. detail drawer에서 safe summary를 본다.
5. 민감 원문이 필요하면 reason modal을 거친다.

## 9. DB/Prisma 영향

신규 DB 변경 없음.

조회:

- 핵심 domain tables
- join/snapshot tables
- `AdminAuditLog`

## 10. 주석 기준

```ts
// 기능 : Admin 도메인 탭에 노출 가능한 안전한 row summary로 변환합니다.
```

## 11. 검증

```powershell
cd BE
pnpm run test -- admin domain
```

```powershell
cd FE/admin-web
pnpm run build
```

## 12. Goal 체크리스트

- [ ] domain query allowlist가 있다.
- [ ] userId 소유 조건이 모든 domain 조회에 있다.
- [ ] private memo 원문이 response에 없다.
- [ ] meeting note body 원문이 기본 response에 없다.
- [ ] deleted row include 필터가 있다.
- [ ] domain records 조회 audit가 남는다.
- [ ] Admin Web domain tabs가 있다.
- [ ] detail drawer가 safe field만 표시한다.
- [ ] 결제/구독 탭이 없다.
- [ ] 검증 command 결과를 기록했다.
