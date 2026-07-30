# Prisma Migration Spec

상태: Confirmed

## 1. 목적

10에서 필요한 DB 변경은 BusinessCard OCR 실패의 사용자 안전 계약을 scan log에 영속 저장하는 것이다.

## 2. G02 확정 migration

G02 구현자는 아래 이름의 새 migration을 생성한다.

```text
BE/prisma/migrations/{YYYYMMDDHHMMSS}_add_business_card_safe_failure_fields/migration.sql
```

## 3. Prisma 변경

`BusinessCardScanLog`에 아래 field를 추가한다.

```prisma
/// 기능 : 사용자에게 노출해도 안전한 OCR 실패 코드입니다. provider raw error는 저장하지 않습니다.
safeErrorCode String?
/// 기능 : 사용자에게 노출해도 안전한 OCR 실패 안내 문구입니다.
safeErrorMessage String?
/// 기능 : 같은 명함 스캔을 사용자가 다시 시도할 수 있는 실패인지 표시합니다.
retryable Boolean @default(false)
```

인덱스:

```prisma
@@index([userId, status, safeErrorCode, createdAt])
```

## 4. Migration SQL COMMENT 기준

```sql
ALTER TABLE "BusinessCardScanLog"
ADD COLUMN "safeErrorCode" TEXT,
ADD COLUMN "safeErrorMessage" TEXT,
ADD COLUMN "retryable" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "BusinessCardScanLog_userId_status_safeErrorCode_createdAt_idx"
ON "BusinessCardScanLog"("userId", "status", "safeErrorCode", "createdAt");

COMMENT ON COLUMN "BusinessCardScanLog"."safeErrorCode" IS '사용자에게 노출해도 안전한 OCR 실패 코드. provider raw error는 저장하지 않는다.';
COMMENT ON COLUMN "BusinessCardScanLog"."safeErrorMessage" IS '사용자에게 노출해도 안전한 OCR 실패 안내 문구.';
COMMENT ON COLUMN "BusinessCardScanLog"."retryable" IS '사용자가 촬영/업로드를 다시 시도할 수 있는 실패인지 여부.';
```

## 5. 기존 row 처리

- 기존 `OCR_FAILED` row는 `safeErrorCode=null`, `safeErrorMessage=null`, `retryable=false`로 남긴다.
- API mapper는 기존 row에 대해 generic fallback을 제공한다.
- 신규 실패부터 safe failure fields를 저장한다.

## 6. DB gate

G02 구현 전 반드시 확인한다.

1. `git status --short`
2. `BE/.env` DB target이 local/dev/test인지 확인
3. 공유/운영성 DB에 무단 migrate/seed 실행 금지
4. 기존 migration 파일 수정 금지
5. `cd BE && pnpm run prisma:validate`
6. `cd BE && pnpm run prisma:generate`

## 7. 만들지 않는 DB

- `UserDraft`
- `MobileDraft`
- `BusinessCardProviderFailureLog`
- `MobilePermissionLog`
- `PwaInstallLog`
- `AiUsageDaily`

위 항목은 10 1차 범위가 아니며 G02~G07에서 생성하면 안 된다.
