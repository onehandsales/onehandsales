-- CreateEnum
CREATE TYPE "ImportTemplateType" AS ENUM ('COMPANY', 'CONTACT', 'PRODUCT', 'DEAL');

-- CreateTable
CREATE TABLE "ImportTemplate" (
    "id" UUID NOT NULL,
    "templateType" "ImportTemplateType" NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "columnsJson" JSONB NOT NULL,
    "sampleRowsJson" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ImportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportUserLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetType" "ImportTemplateType" NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "templateColumnsJson" JSONB NOT NULL,
    "contextLabel" TEXT,
    "contextJson" JSONB,
    "originalFileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "totalRowCount" INTEGER NOT NULL,
    "importedRowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportUserLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportUserLogRow" (
    "id" UUID NOT NULL,
    "importUserLogId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "submittedDataJson" JSONB NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportUserLogRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportTemplate_templateType_templateVersion_key" ON "ImportTemplate"("templateType", "templateVersion");

-- CreateIndex
CREATE INDEX "ImportTemplate_templateType_isActive_idx" ON "ImportTemplate"("templateType", "isActive");

-- CreateIndex
CREATE INDEX "ImportUserLog_userId_createdAt_idx" ON "ImportUserLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ImportUserLog_userId_targetType_createdAt_idx" ON "ImportUserLog"("userId", "targetType", "createdAt");

-- CreateIndex
CREATE INDEX "ImportUserLogRow_importUserLogId_rowNumber_idx" ON "ImportUserLogRow"("importUserLogId", "rowNumber");

-- AddForeignKey
ALTER TABLE "ImportUserLog" ADD CONSTRAINT "ImportUserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportUserLogRow" ADD CONSTRAINT "ImportUserLogRow_importUserLogId_fkey" FOREIGN KEY ("importUserLogId") REFERENCES "ImportUserLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SeedActiveTemplates
INSERT INTO "ImportTemplate" (
    "id",
    "templateType",
    "templateVersion",
    "templateName",
    "columnsJson",
    "sampleRowsJson",
    "isActive",
    "createdAt",
    "updatedAt"
) VALUES
(
    '00000000-0000-4000-8000-000000010001',
    'COMPANY',
    'v1',
    '회사_불러오기_양식_v1.xlsx',
    '[
      {"key":"companyName","label":"회사이름","required":true,"type":"text"},
      {"key":"companyFieldName","label":"회사분야","required":true,"type":"text"},
      {"key":"companyRegionName","label":"회사지역","required":true,"type":"text"}
    ]'::jsonb,
    '[
      {"companyName":"원핸드세일즈","companyFieldName":"SaaS","companyRegionName":"서울"}
    ]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '00000000-0000-4000-8000-000000010002',
    'PRODUCT',
    'v1',
    '제품_불러오기_양식_v1.xlsx',
    '[
      {"key":"productName","label":"제품이름","required":true,"type":"text"},
      {"key":"productPrice","label":"제품단가","required":true,"type":"number"},
      {"key":"productCategoryName","label":"제품 카테고리","required":true,"type":"text"},
      {"key":"productStatusName","label":"제품 상태","required":true,"type":"text"}
    ]'::jsonb,
    '[
      {"productName":"영업관리 솔루션","productPrice":1200000,"productCategoryName":"CRM","productStatusName":"판매중"}
    ]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '00000000-0000-4000-8000-000000010003',
    'CONTACT',
    'v1',
    '담당자_불러오기_양식_v1.xlsx',
    '[
      {"key":"companyName","label":"회사","required":true,"type":"text"},
      {"key":"contactName","label":"담당자 이름","required":true,"type":"text"},
      {"key":"contactEmail","label":"담당자 이메일","required":true,"type":"email"},
      {"key":"contactPhone","label":"담당자 핸드폰 번호","required":true,"type":"phone"},
      {"key":"contactDepartmentName","label":"담당자 부서","required":true,"type":"text"},
      {"key":"contactJobGradeName","label":"담당자 직급","required":true,"type":"text"}
    ]'::jsonb,
    '[
      {"companyName":"","contactName":"홍길동","contactEmail":"contact@example.com","contactPhone":"010-1234-5678","contactDepartmentName":"영업팀","contactJobGradeName":"팀장"}
    ]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
