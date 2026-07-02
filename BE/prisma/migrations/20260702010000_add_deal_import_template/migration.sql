-- Add active deal import template aligned with current deal creation fields.
UPDATE "ImportTemplate"
SET "isActive" = false,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "templateType" = 'DEAL';

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
) VALUES (
    '00000000-0000-4000-8000-000000010004',
    'DEAL',
    'v1',
    '딜_불러오기_양식_v1.xlsx',
    '[
      {"key":"dealName","label":"딜 이름","required":true,"type":"text"},
      {"key":"dealCost","label":"딜 금액","required":true,"type":"number"},
      {"key":"dealStatus","label":"딜 단계","required":false,"type":"text","options":["초기 접촉","니즈 확인","제안/견적","협상","성사","실패"]},
      {"key":"companyName","label":"회사명","required":true,"type":"text"},
      {"key":"contactName","label":"담당자명","required":true,"type":"text"},
      {"key":"productName","label":"제품명","required":true,"type":"text"},
      {"key":"expectedEndDate","label":"예상 마감일","required":true,"type":"text"}
    ]'::jsonb,
    '[
      {
        "dealName":"한빛테크 초기 접촉 딜",
        "dealCost":12000000,
        "dealStatus":"초기 접촉",
        "companyName":"한빛테크",
        "contactName":"김도윤",
        "productName":"세일즈 파이프라인 Enterprise",
        "expectedEndDate":"2026-08-31"
      },
      {
        "dealName":"한빛테크 니즈 확인 딜",
        "dealCost":13200000,
        "dealStatus":"니즈 확인",
        "companyName":"한빛테크",
        "contactName":"김도윤",
        "productName":"세일즈 파이프라인 Enterprise",
        "expectedEndDate":"2026-09-15"
      },
      {
        "dealName":"한빛테크 제안 견적 딜",
        "dealCost":14500000,
        "dealStatus":"제안/견적",
        "companyName":"한빛테크",
        "contactName":"김도윤",
        "productName":"세일즈 파이프라인 Enterprise",
        "expectedEndDate":"2026-09-30"
      },
      {
        "dealName":"한빛테크 협상 딜",
        "dealCost":15800000,
        "dealStatus":"협상",
        "companyName":"한빛테크",
        "contactName":"김도윤",
        "productName":"세일즈 파이프라인 Enterprise",
        "expectedEndDate":"2026-10-15"
      },
      {
        "dealName":"한빛테크 성사 딜",
        "dealCost":17100000,
        "dealStatus":"성사",
        "companyName":"한빛테크",
        "contactName":"김도윤",
        "productName":"세일즈 파이프라인 Enterprise",
        "expectedEndDate":"2026-10-31"
      },
      {
        "dealName":"한빛테크 실패 딜",
        "dealCost":18400000,
        "dealStatus":"실패",
        "companyName":"한빛테크",
        "contactName":"김도윤",
        "productName":"세일즈 파이프라인 Enterprise",
        "expectedEndDate":"2026-11-15"
      }
    ]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("templateType", "templateVersion") DO UPDATE
SET "templateName" = EXCLUDED."templateName",
    "columnsJson" = EXCLUDED."columnsJson",
    "sampleRowsJson" = EXCLUDED."sampleRowsJson",
    "isActive" = true,
    "updatedAt" = CURRENT_TIMESTAMP;
