-- 기능 : 명함 OCR 실패를 사용자에게 안전하게 안내할 수 있도록 safe failure 필드를 추가합니다.
ALTER TABLE "BusinessCardScanLog"
  ADD COLUMN "safeErrorCode" TEXT,
  ADD COLUMN "safeErrorMessage" TEXT,
  ADD COLUMN "retryable" BOOLEAN NOT NULL DEFAULT false;

-- 기능 : 사용자별 OCR 실패 코드 분석과 상태 필터 조회에 사용합니다.
CREATE INDEX "BusinessCardScanLog_userId_status_safeErrorCode_createdAt_idx"
  ON "BusinessCardScanLog"("userId", "status", "safeErrorCode", "createdAt");

COMMENT ON COLUMN "BusinessCardScanLog"."safeErrorCode" IS '사용자에게 노출해도 안전한 OCR 실패 코드. provider raw error는 저장하지 않는다.';
COMMENT ON COLUMN "BusinessCardScanLog"."safeErrorMessage" IS '사용자에게 노출해도 안전한 OCR 실패 안내 문구.';
COMMENT ON COLUMN "BusinessCardScanLog"."retryable" IS '사용자가 촬영/업로드를 다시 시도할 수 있는 실패인지 여부.';
