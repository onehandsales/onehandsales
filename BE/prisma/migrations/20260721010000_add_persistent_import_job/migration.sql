-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM (
    'UPLOADED',
    'MAPPED',
    'NEEDS_REVIEW',
    'READY_TO_CONFIRM',
    'CONFIRMING',
    'CONFIRMED',
    'FAILED',
    'CANCELED',
    'EXPIRED'
);

-- CreateEnum
CREATE TYPE "ImportJobRowStatus" AS ENUM (
    'PENDING',
    'VALID',
    'INVALID',
    'EXCLUDED',
    'IMPORTED',
    'FAILED'
);

-- CreateEnum
CREATE TYPE "ImportJobMappingSource" AS ENUM (
    'NONE',
    'AI',
    'RULE_BASED',
    'USER'
);

-- CreateEnum
CREATE TYPE "ImportUploadedFileStatus" AS ENUM (
    'STORED',
    'PARSED',
    'DELETED',
    'EXPIRED'
);

-- CreateEnum
CREATE TYPE "ImportJobErrorType" AS ENUM (
    'PARSE',
    'AI_MAPPING',
    'VALIDATION',
    'CONFIRM',
    'STORAGE',
    'SYSTEM'
);

-- CreateEnum
CREATE TYPE "ImportJobErrorSeverity" AS ENUM (
    'INFO',
    'WARNING',
    'ERROR'
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "targetType" "ImportTemplateType" NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateColumnsJson" JSONB NOT NULL,
    "sourceColumnsJson" JSONB NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'UPLOADED',
    "mappingJson" JSONB NOT NULL DEFAULT '{}',
    "mappingSource" "ImportJobMappingSource" NOT NULL DEFAULT 'NONE',
    "contextLabel" TEXT,
    "contextJson" JSONB,
    "originalFileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "totalRowCount" INTEGER NOT NULL DEFAULT 0,
    "validRowCount" INTEGER NOT NULL DEFAULT 0,
    "invalidRowCount" INTEGER NOT NULL DEFAULT 0,
    "importedRowCount" INTEGER NOT NULL DEFAULT 0,
    "failedRowCount" INTEGER NOT NULL DEFAULT 0,
    "importUserLogId" UUID,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "confirmedAt" TIMESTAMPTZ(3),
    "canceledAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "lastErrorCode" TEXT,
    "lastErrorMessage" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ImportJob_fileSizeBytes_check" CHECK ("fileSizeBytes" >= 0),
    CONSTRAINT "ImportJob_totalRowCount_check" CHECK ("totalRowCount" >= 0),
    CONSTRAINT "ImportJob_validRowCount_check" CHECK ("validRowCount" >= 0),
    CONSTRAINT "ImportJob_invalidRowCount_check" CHECK ("invalidRowCount" >= 0),
    CONSTRAINT "ImportJob_importedRowCount_check" CHECK ("importedRowCount" >= 0),
    CONSTRAINT "ImportJob_failedRowCount_check" CHECK ("failedRowCount" >= 0)
);

-- CreateTable
CREATE TABLE "ImportJobRow" (
    "id" UUID NOT NULL,
    "importJobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawDataJson" JSONB NOT NULL,
    "mappedDataJson" JSONB NOT NULL DEFAULT '{}',
    "normalizedDataJson" JSONB,
    "status" "ImportJobRowStatus" NOT NULL DEFAULT 'PENDING',
    "validationErrorsJson" JSONB NOT NULL DEFAULT '[]',
    "targetLabel" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJobRow_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ImportJobRow_rowNumber_check" CHECK ("rowNumber" > 1)
);

-- CreateTable
CREATE TABLE "ImportJobError" (
    "id" UUID NOT NULL,
    "importJobId" UUID NOT NULL,
    "importJobRowId" UUID,
    "userId" UUID NOT NULL,
    "errorType" "ImportJobErrorType" NOT NULL,
    "errorCode" TEXT NOT NULL,
    "severity" "ImportJobErrorSeverity" NOT NULL DEFAULT 'ERROR',
    "rowNumber" INTEGER,
    "fieldKey" TEXT,
    "safeMessage" TEXT NOT NULL,
    "detailJson" JSONB,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJobError_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ImportJobError_rowNumber_check" CHECK ("rowNumber" IS NULL OR "rowNumber" > 1)
);

-- CreateTable
CREATE TABLE "ImportUploadedFile" (
    "id" UUID NOT NULL,
    "importJobId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storageBucket" TEXT,
    "storageKey" TEXT NOT NULL,
    "status" "ImportUploadedFileStatus" NOT NULL DEFAULT 'STORED',
    "uploadedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportUploadedFile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ImportUploadedFile_fileSizeBytes_check" CHECK ("fileSizeBytes" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportJobRow_importJobId_rowNumber_key" ON "ImportJobRow"("importJobId", "rowNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ImportUploadedFile_importJobId_key" ON "ImportUploadedFile"("importJobId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportJob_importUserLogId_key" ON "ImportJob"("importUserLogId");

-- CreateIndex
CREATE INDEX "ImportJob_userId_status_createdAt_idx" ON "ImportJob"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJob_userId_expiresAt_idx" ON "ImportJob"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "ImportJob_userId_targetType_createdAt_idx" ON "ImportJob"("userId", "targetType", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJob_templateId_idx" ON "ImportJob"("templateId");

-- CreateIndex
CREATE INDEX "ImportJobRow_importJobId_status_idx" ON "ImportJobRow"("importJobId", "status");

-- CreateIndex
CREATE INDEX "ImportJobRow_userId_status_idx" ON "ImportJobRow"("userId", "status");

-- CreateIndex
CREATE INDEX "ImportJobError_importJobId_createdAt_idx" ON "ImportJobError"("importJobId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJobError_userId_createdAt_idx" ON "ImportJobError"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportJobError_importJobRowId_idx" ON "ImportJobError"("importJobRowId");

-- CreateIndex
CREATE INDEX "ImportUploadedFile_userId_status_expiresAt_idx" ON "ImportUploadedFile"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "ImportUploadedFile_checksum_idx" ON "ImportUploadedFile"("checksum");

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ImportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_importUserLogId_fkey" FOREIGN KEY ("importUserLogId") REFERENCES "ImportUserLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobRow" ADD CONSTRAINT "ImportJobRow_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobRow" ADD CONSTRAINT "ImportJobRow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobError" ADD CONSTRAINT "ImportJobError_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobError" ADD CONSTRAINT "ImportJobError_importJobRowId_fkey" FOREIGN KEY ("importJobRowId") REFERENCES "ImportJobRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJobError" ADD CONSTRAINT "ImportJobError_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportUploadedFile" ADD CONSTRAINT "ImportUploadedFile_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportUploadedFile" ADD CONSTRAINT "ImportUploadedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMENT ON TABLE "ImportJob" IS '확정 전 데이터 가져오기 작업의 header, 상태, 매핑 snapshot, row summary를 저장한다.';
COMMENT ON COLUMN "ImportJob"."id" IS 'ImportJob UUID primary key.';
COMMENT ON COLUMN "ImportJob"."userId" IS '작업 소유 사용자 ID. 모든 조회와 변경은 current user ownership으로 제한한다.';
COMMENT ON COLUMN "ImportJob"."templateId" IS '업로드 당시 사용한 ImportTemplate ID.';
COMMENT ON COLUMN "ImportJob"."targetType" IS '가져오기 대상. COMPANY, CONTACT, PRODUCT, DEAL 중 하나이다.';
COMMENT ON COLUMN "ImportJob"."templateVersion" IS '업로드 당시 ImportTemplate version snapshot.';
COMMENT ON COLUMN "ImportJob"."templateColumnsJson" IS '업로드 당시 template column 정의 snapshot. 이후 template 변경의 영향을 받지 않는다.';
COMMENT ON COLUMN "ImportJob"."sourceColumnsJson" IS '원본 파일 header 순서 snapshot. 새로고침/서버 재시작 후 매핑 UI 복구와 AI/rule mapping 입력으로 사용한다.';
COMMENT ON COLUMN "ImportJob"."status" IS '확정 전 작업 상태. UI 단계 복구와 confirm 가능 여부 판단에 사용한다.';
COMMENT ON COLUMN "ImportJob"."mappingJson" IS 'template field key를 원본 파일 header/source column에 연결한 매핑 JSON.';
COMMENT ON COLUMN "ImportJob"."mappingSource" IS '현재 매핑의 출처. NONE, AI, RULE_BASED, USER 중 하나이다.';
COMMENT ON COLUMN "ImportJob"."contextLabel" IS '담당자/딜처럼 화면에 보여줄 선택 context label.';
COMMENT ON COLUMN "ImportJob"."contextJson" IS 'confirm 시 필요한 context snapshot. raw PII 또는 provider 원문을 넣지 않는다.';
COMMENT ON COLUMN "ImportJob"."originalFileName" IS '사용자가 업로드한 원본 파일명. 화면 표시용이며 파일 내용은 저장하지 않는다.';
COMMENT ON COLUMN "ImportJob"."fileSizeBytes" IS '업로드 원본 파일 byte size.';
COMMENT ON COLUMN "ImportJob"."totalRowCount" IS '파싱된 전체 data row 수.';
COMMENT ON COLUMN "ImportJob"."validRowCount" IS '현재 validation 기준으로 가져올 수 있는 row 수.';
COMMENT ON COLUMN "ImportJob"."invalidRowCount" IS '사용자 수정이 필요한 row 수.';
COMMENT ON COLUMN "ImportJob"."importedRowCount" IS 'confirm 성공으로 실제 도메인 데이터에 반영된 row 수.';
COMMENT ON COLUMN "ImportJob"."failedRowCount" IS 'confirm 중 실패 처리된 row 수. 전체 rollback 정책에서는 0이어야 한다.';
COMMENT ON COLUMN "ImportJob"."importUserLogId" IS 'confirm 성공 후 생성된 ImportUserLog ID. 확정 전 review route에서 성공 이력 route로 이동할 때 사용한다.';
COMMENT ON COLUMN "ImportJob"."expiresAt" IS '확정 전 작업 만료 시각. UTC instant이며 기본 정책은 생성 후 7일이다.';
COMMENT ON COLUMN "ImportJob"."confirmedAt" IS 'confirm 성공 시각. UTC instant.';
COMMENT ON COLUMN "ImportJob"."canceledAt" IS '사용자 취소 시각. UTC instant.';
COMMENT ON COLUMN "ImportJob"."failedAt" IS 'job 전체 실패 시각. UTC instant.';
COMMENT ON COLUMN "ImportJob"."lastErrorCode" IS '마지막 job-level 오류 code. 사용자 지원과 재시도 판단에 사용한다.';
COMMENT ON COLUMN "ImportJob"."lastErrorMessage" IS '마지막 job-level 안전 메시지. 민감정보를 포함하지 않는다.';
COMMENT ON COLUMN "ImportJob"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "ImportJob"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

COMMENT ON TABLE "ImportJobRow" IS '업로드 파일의 각 row와 매핑/정규화/검증 결과를 저장한다.';
COMMENT ON COLUMN "ImportJobRow"."id" IS 'ImportJobRow UUID primary key.';
COMMENT ON COLUMN "ImportJobRow"."importJobId" IS '소속 ImportJob ID.';
COMMENT ON COLUMN "ImportJobRow"."userId" IS '소유 사용자 ID. row 단위 ownership 필터와 보조 index에 사용한다.';
COMMENT ON COLUMN "ImportJobRow"."rowNumber" IS '원본 파일 실제 row 번호. header row는 1, 첫 data row는 2로 본다.';
COMMENT ON COLUMN "ImportJobRow"."rawDataJson" IS '파일에서 읽은 원본 row 값. API/log에는 원문을 노출하지 않는다.';
COMMENT ON COLUMN "ImportJobRow"."mappedDataJson" IS 'template field key 기준으로 매핑된 row 값.';
COMMENT ON COLUMN "ImportJobRow"."normalizedDataJson" IS 'confirm에 사용할 정규화 row 값. 날짜/금액/전화번호 등 normalize 이후 값이다.';
COMMENT ON COLUMN "ImportJobRow"."status" IS 'row validation 및 confirm 상태.';
COMMENT ON COLUMN "ImportJobRow"."validationErrorsJson" IS 'cell 단위 validation 오류 배열. UI가 기본적으로 표시하는 오류 원천이다.';
COMMENT ON COLUMN "ImportJobRow"."targetLabel" IS 'confirm 후 생성 또는 연결될 대상의 대표 label.';
COMMENT ON COLUMN "ImportJobRow"."createdAt" IS 'row 생성 시각. UTC instant.';
COMMENT ON COLUMN "ImportJobRow"."updatedAt" IS 'row 마지막 수정 시각. UTC instant.';

COMMENT ON TABLE "ImportJobError" IS 'import 작업 중 발생한 redacted 오류 이력. 범용 시스템 로그가 아니라 import domain 오류 기록이다.';
COMMENT ON COLUMN "ImportJobError"."id" IS 'ImportJobError UUID primary key.';
COMMENT ON COLUMN "ImportJobError"."importJobId" IS '오류가 발생한 ImportJob ID.';
COMMENT ON COLUMN "ImportJobError"."importJobRowId" IS 'row 관련 오류일 때 연결되는 ImportJobRow ID. row 삭제 시 NULL 처리한다.';
COMMENT ON COLUMN "ImportJobError"."userId" IS '오류가 속한 사용자 ID. 사용자별 조회와 삭제 정책에 사용한다.';
COMMENT ON COLUMN "ImportJobError"."errorType" IS '오류 분류. PARSE, AI_MAPPING, VALIDATION, CONFIRM, STORAGE, SYSTEM 중 하나이다.';
COMMENT ON COLUMN "ImportJobError"."errorCode" IS 'application/domain error code.';
COMMENT ON COLUMN "ImportJobError"."severity" IS '오류 심각도. INFO, WARNING, ERROR 중 하나이다.';
COMMENT ON COLUMN "ImportJobError"."rowNumber" IS 'row 관련 오류일 때 원본 파일 실제 row 번호. header row는 1, 첫 data row는 2로 본다.';
COMMENT ON COLUMN "ImportJobError"."fieldKey" IS 'field 관련 오류일 때 template field key.';
COMMENT ON COLUMN "ImportJobError"."safeMessage" IS '사용자에게 보여줘도 되는 안전한 오류 메시지.';
COMMENT ON COLUMN "ImportJobError"."detailJson" IS '지원/디버깅용 redacted detail. raw row, prompt, provider 원문, PII를 넣지 않는다.';
COMMENT ON COLUMN "ImportJobError"."retryable" IS '같은 요청 재시도가 의미 있는지 여부.';
COMMENT ON COLUMN "ImportJobError"."createdAt" IS '오류 생성 시각. UTC instant.';

COMMENT ON TABLE "ImportUploadedFile" IS '업로드 원본 파일의 저장 위치와 삭제 상태를 기록한다. 파일 binary는 DB에 저장하지 않는다.';
COMMENT ON COLUMN "ImportUploadedFile"."id" IS 'ImportUploadedFile UUID primary key.';
COMMENT ON COLUMN "ImportUploadedFile"."importJobId" IS '연결된 ImportJob ID. job 하나에 원본 파일 하나를 원칙으로 한다.';
COMMENT ON COLUMN "ImportUploadedFile"."userId" IS '파일 소유 사용자 ID.';
COMMENT ON COLUMN "ImportUploadedFile"."originalFileName" IS '사용자가 업로드한 원본 파일명.';
COMMENT ON COLUMN "ImportUploadedFile"."mimeType" IS '업로드 파일 MIME type.';
COMMENT ON COLUMN "ImportUploadedFile"."fileSizeBytes" IS '업로드 파일 byte size.';
COMMENT ON COLUMN "ImportUploadedFile"."checksum" IS '업로드 파일 checksum. 중복 감지와 추적에 사용한다.';
COMMENT ON COLUMN "ImportUploadedFile"."storageProvider" IS '파일 저장 adapter/provider 이름. 예: local, s3.';
COMMENT ON COLUMN "ImportUploadedFile"."storageBucket" IS 'bucket 기반 storage를 사용할 때 bucket 이름.';
COMMENT ON COLUMN "ImportUploadedFile"."storageKey" IS 'storage 내부 object key. signed URL을 응답으로 노출하지 않는다.';
COMMENT ON COLUMN "ImportUploadedFile"."status" IS '원본 파일 보관 상태. STORED, PARSED, DELETED, EXPIRED 중 하나이다.';
COMMENT ON COLUMN "ImportUploadedFile"."uploadedAt" IS '파일 업로드 완료 시각. UTC instant.';
COMMENT ON COLUMN "ImportUploadedFile"."deletedAt" IS '파일 삭제 완료 또는 삭제 처리 시각. UTC instant.';
COMMENT ON COLUMN "ImportUploadedFile"."expiresAt" IS '원본 파일 보관 만료 시각. ImportJob expiresAt과 동일하게 시작한다.';
COMMENT ON COLUMN "ImportUploadedFile"."createdAt" IS 'metadata row 생성 시각. UTC instant.';
COMMENT ON COLUMN "ImportUploadedFile"."updatedAt" IS 'metadata row 마지막 수정 시각. UTC instant.';
