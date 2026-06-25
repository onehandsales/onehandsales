# 휴지통 삭제 정책 백엔드 개발 가이드

## 목적

주요 데이터의 삭제 버튼은 DB row를 즉시 삭제하지 않는다. 삭제 버튼을 누르면 목록/상세/검색에서는 사라지고 휴지통에서만 보이는 soft delete 상태가 된다. 삭제 시점부터 30일이 지나면 백그라운드 작업이 실제 DB row를 hard delete 한다.

용어를 아래처럼 고정한다.

- Soft delete: 사용자가 삭제 버튼을 눌러 `deletedAt`이 설정되고 휴지통으로 이동한 상태
- Restore: 휴지통에서 `deletedAt`을 다시 `null`로 돌리는 복구
- Hard delete 또는 purge: 삭제 후 30일이 지난 row를 DB에서 실제 삭제하는 작업

현재 구현된 로그 단위 삭제는 주요 데이터 row 삭제 정책과 다르게 7일 보관 정책을 따른다.

- 대상: `CompanyMemoLog`, `CompanyUserPrivateMemoLog`, `ContactMemoLog`, `ContactUserPrivateMemoLog`, `ProductMemoLog`, `ProductUserPrivateMemoLog`, `DealFollowingActionLog`, `DealMemoLog`
- 삭제 시 실제 row를 삭제하지 않고 `deletedAt`, `deletedByUserId`, `trashExpiresAt`만 설정한다.
- `trashExpiresAt`은 `deletedAt + 7일`이다.
- 7일 후에는 일반 휴지통 목록에서 보이지 않는 영구 삭제 상태로 취급할 예정이지만, DB row를 hard delete하지 않는다.
- 비밀 메모 로그도 복구 가능성을 유지해야 하므로 `memoCiphertext`, `memoKeyVersion`은 삭제 시 변경하지 않는다.
- 휴지통 목록, 무료 복구, 7일 후 유료 복구 API는 후속 범위다.

## 대상

1. 회사 `Company`
2. 담당자 `Contact`
3. 제품 `Product`
4. 딜 `Deal`
5. 회의록 `MeetingNote`

프론트에는 이미 휴지통 API 기대 계약이 있다.

- `GET /api/trash?targetType=...&page=...&pageSize=...`
- `POST /api/trash/:targetType/:targetId/restore`
- 휴지통 item 응답 필드: `targetType`, `targetId`, `title`, `deletedAt`, `permanentDeleteAt`

## 삭제 정책

사용자가 주요 데이터 삭제 버튼을 누르면 다음 순서로 처리한다.

1. 현재 사용자 소유 row인지 확인한다.
2. 참조 차단 조건을 검사한다.
3. 차단 조건이 없으면 대상 row의 `deletedAt`을 현재 시각으로 설정한다.
4. 일반 목록, 상세, 옵션, 검색에서는 `deletedAt: null`인 row만 조회한다.
5. 휴지통 목록에서는 `deletedAt IS NOT NULL`인 row만 모아 보여준다.
6. `deletedAt + 30일`이 지난 row는 배치 작업에서 실제 삭제한다.

참조 차단은 기존 hard delete 계획과 동일하게 유지한다.

- 회사: 연결된 담당자, 딜, 회의록 회사/담당자 스냅샷 참조가 있으면 삭제 불가
- 담당자: 연결된 딜, 회의록 담당자 스냅샷 참조가 있으면 삭제 불가
- 제품: 딜-제품 연결, 회의록 제품 스냅샷 참조가 있으면 삭제 불가
- 딜: 일정 연결, 회의록 딜 스냅샷 참조가 있으면 삭제 불가
- 회의록: 외부 차단 조건 없음

차단 시 HTTP `409 Conflict`를 반환한다.

권장 오류 코드:

- `CompanyInUse`
- `ContactInUse`
- `ProductInUse`
- `DealInUse`

## Prisma 스키마 권장 변경

각 대상 모델에 soft delete 필드를 추가한다.

```prisma
deletedAt DateTime? @db.Timestamptz(3)
deletedBy String?   @db.Uuid
```

선택 사항이지만 운영 관점에서는 아래도 추천한다.

```prisma
deleteReason String?
```

인덱스는 목록과 purge 작업을 기준으로 추가한다.

```prisma
@@index([userId, deletedAt])
@@index([deletedAt])
```

기존 조회 정렬 인덱스와 충돌하지 않게 모델별 인덱스를 조정한다. PostgreSQL partial index를 쓰고 싶으면 Prisma migration SQL에서 직접 추가한다.

```sql
CREATE INDEX CONCURRENTLY idx_company_active_user_created
ON "Company" ("userId", "createdAt" DESC)
WHERE "deletedAt" IS NULL;
```

## API 설계

### 주요 데이터 삭제

기존 프론트 삭제 버튼은 아래 API를 호출한다.

- `DELETE /api/companies/:companyId`
- `DELETE /api/contacts/:contactId`
- `DELETE /api/products/:productId`
- `DELETE /api/deals/:dealId`
- `DELETE /api/meeting-notes/:meetingNoteId`

성공 응답은 `204 No Content`.

주의: 여기서 DELETE는 hard delete가 아니라 `deletedAt` 설정이다.

없는 ID, 다른 사용자 소유 ID, 이미 삭제된 ID는 기존 정책에 맞춰 `404 NotFound`로 처리한다. 이미 삭제된 항목을 다시 삭제하는 요청을 idempotent하게 `204`로 처리할 수도 있지만, 현재 앱 패턴은 NotFound가 더 명확하다.

### 휴지통 목록

`GET /api/trash`

Query:

- `targetType`: optional, `ALL | COMPANY | CONTACT | PRODUCT | DEAL | SCHEDULE | MEETING_NOTE ...`
- `page`: 기본 1
- `pageSize`: 기본 20 또는 프론트 기본값과 맞춤

응답:

```ts
type TrashListResponse = {
  items: Array<{
    targetType: TrashTargetType;
    targetId: string;
    title: string;
    deletedAt: string;
    permanentDeleteAt: string;
  }>;
  page: number;
  pageSize: number;
  totalCount: number;
};
```

`permanentDeleteAt`은 서버에서 `deletedAt + 30일`로 계산한다.

### 휴지통 복구

`POST /api/trash/:targetType/:targetId/restore`

성공 응답:

```ts
type TrashRestoreResponse = {
  targetType: TrashTargetType;
  targetId: string;
  restoredAt: string;
  resource: unknown;
};
```

복구 시 `deletedAt = null`, `deletedBy = null`, `deleteReason = null`로 되돌린다.

복구 정책:

- 삭제된 row가 없으면 `404 NotFound`
- 이미 30일이 지나 purge 대상이면 복구 불가. 배치가 아직 안 지웠더라도 `410 Gone` 또는 `409 Conflict` 중 하나로 통일한다.
- 복구 후 관련 목록/상세/옵션/검색 캐시가 갱신될 수 있게 프론트가 invalidate할 query key와 맞춘다.

## Repository/Application 구현 패턴

각 도메인 repository에 hard delete가 아니라 soft delete 메서드를 둔다.

```ts
hasCompanyBlockingReferences(userId: string, companyId: string): Promise<boolean>;
softDeleteCompany(userId: string, companyId: string, deletedAt: Date): Promise<boolean>;
restoreCompany(userId: string, companyId: string): Promise<CompanyRecord | null>;
```

application service 흐름:

```ts
await repository.runInTransaction(async (tx) => {
  const existing = await tx.findCompanyLookup(userId, companyId, { includeDeleted: false });
  if (!existing) throw new CompanyNotFoundError();

  if (await tx.hasCompanyBlockingReferences(userId, companyId)) {
    throw new CompanyInUseError();
  }

  const updated = await tx.softDeleteCompany(userId, companyId, now);
  if (!updated) throw new CompanyNotFoundError();
});
```

중요한 점:

- 삭제 action에서는 메모 로그나 연결 row를 지우지 않는다.
- 관계 row는 purge 단계에서만 지운다.
- 일반 조회 repository는 기본적으로 `deletedAt: null` 조건을 포함한다.
- 휴지통 조회 repository만 `deletedAt: { not: null }` 조건을 사용한다.

## 일반 조회 필터 변경

아래 화면/API는 모두 삭제된 row를 제외해야 한다.

- 회사/담당자/제품/딜/회의록 목록
- 상세 조회
- export
- 검색 `/api/search`
- 생성/수정 form option API
- 홈/대시보드 집계
- 일정/회의록 연결 옵션

예시:

```ts
where: {
  userId,
  deletedAt: null,
}
```

관계 조회에서도 연결 대상이 삭제된 row면 일반 화면에 노출하지 않는 것을 기본으로 한다. 예를 들어 딜 목록에서 회사/담당자가 soft deleted 상태가 될 수 없도록 참조 차단을 유지하기 때문에 정상적으로는 발생하지 않는다.

## Purge 작업

30일 경과 row는 백그라운드 작업으로 hard delete 한다.

권장 기준:

```ts
const cutoff = subDays(now, 30);
where: { deletedAt: { lte: cutoff } }
```

purge 순서:

1. 회의록: 관계 스냅샷 row 삭제 후 `MeetingNote` 삭제
2. 딜: `DealProduct`, `DealFollowingActionLog`, `DealMemoLog` 삭제 후 `Deal` 삭제
3. 제품: 제품 메모/개인 메모 로그 삭제 후 `Product` 삭제
4. 담당자: 담당자 메모/개인 메모 로그 삭제 후 `Contact` 삭제
5. 회사: 회사 메모/개인 메모 로그 삭제 후 `Company` 삭제

다만 참조 차단 정책 때문에 soft deleted 상태의 회사/담당자/제품/딜은 외부 참조가 없어야 한다. purge는 방어적으로 관계 row 정리를 포함한다.

운영 방식:

- Nest schedule, queue worker, 또는 운영 cron 중 하나로 하루 1회 실행
- 한 번에 너무 많은 row를 지우지 않도록 domain별 batch size 제한
- purge 결과 로그: targetType, count, cutoff
- 실패해도 다음 실행에서 재시도 가능하게 idempotent하게 작성

## HTTP 오류 매핑

`HttpExceptionFilter`에서 아래 코드를 `409 Conflict`로 매핑한다.

- `CompanyInUse`
- `ContactInUse`
- `ProductInUse`
- `DealInUse`

복구 만료 오류를 별도 도입한다면 예:

- `TrashItemExpired` -> `410 Gone`
- `TrashItemNotFound` -> `404 NotFound`

## 테스트 기준

도메인별 삭제 테스트:

- 삭제 성공 시 row가 DB에서 사라지지 않고 `deletedAt`이 설정된다.
- 삭제된 row는 일반 목록/상세/검색/export에 나오지 않는다.
- 삭제된 row는 휴지통 목록에 나온다.
- 참조가 있으면 삭제 시 `409 Conflict`.
- 없는 ID 또는 다른 사용자 ID는 `404 NotFound`.

복구 테스트:

- 휴지통 row 복구 시 `deletedAt`이 `null`로 돌아간다.
- 복구 후 일반 목록/상세에 다시 보인다.
- 없는 휴지통 항목은 `404`.
- 만료된 항목은 정책에 맞는 오류를 반환한다.

purge 테스트:

- `deletedAt <= now - 30일` row는 hard delete 된다.
- 30일 미만 row는 유지된다.
- 관계/로그 row 삭제 순서 때문에 FK 오류가 나지 않는다.

## 프론트와 맞출 문구

삭제 성공:

- `회사가 휴지통으로 이동되었습니다.`
- `담당자가 휴지통으로 이동되었습니다.`
- `제품이 휴지통으로 이동되었습니다.`
- `딜이 휴지통으로 이동되었습니다.`
- `회의록이 휴지통으로 이동되었습니다.`

참조 차단:

- 회사: `연결된 담당자, 딜 또는 회의록이 있어 회사를 삭제할 수 없습니다.`
- 담당자: `연결된 딜 또는 회의록이 있어 담당자를 삭제할 수 없습니다.`
- 제품: `연결된 딜 또는 회의록이 있어 제품을 삭제할 수 없습니다.`
- 딜: `연결된 일정 또는 회의록이 있어 딜을 삭제할 수 없습니다.`

완전 삭제 예정일:

- 휴지통 목록에서 `permanentDeleteAt`을 표시한다.
- 30일이 지난 항목은 복구 버튼을 비활성화하거나, 서버 오류 응답을 안내한다.
