-- 1. 보기 표시 설정과 독립적인 대표 이름 속성 포인터를 추가합니다.
ALTER TABLE "ObjectDefinition" ADD COLUMN "recordTitleAttributeDefinitionId" UUID;
ALTER TABLE "ObjectDefinition" ADD CONSTRAINT "ObjectDefinition_recordTitleAttributeDefinitionId_fkey"
  FOREIGN KEY ("recordTitleAttributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. 기존 직접 제목이 하나의 이름 속성으로 수렴할 때만 옮깁니다. 모호한 대상은 추정하지 않습니다.
WITH candidates AS (
  SELECT a."objectDefinitionId", a."workspaceId", MIN(a.id::text)::uuid AS "attributeId"
  FROM "ViewAttributeSettingDefinition" s
  JOIN "ViewDefinition" v ON v.id = s."viewDefinitionId" AND v."workspaceId" = s."workspaceId"
  JOIN "AttributeDefinition" a ON a.id = s."attributeDefinitionId" AND a."workspaceId" = s."workspaceId"
  WHERE s."attributeDisplayRole" = 'TITLE' AND s."sourceScope" = 'RECORD'
    AND s."referenceAttributeIdPathJson" = '[]'::jsonb AND a."objectDefinitionId" IS NOT NULL
    AND a."listDefinitionId" IS NULL
  GROUP BY a."objectDefinitionId", a."workspaceId"
  HAVING COUNT(DISTINCT a.id) = 1 AND BOOL_AND(a.type IN ('Text', 'PersonalName'))
)
UPDATE "ObjectDefinition" o SET "recordTitleAttributeDefinitionId" = c."attributeId"
FROM candidates c WHERE o.id = c."objectDefinitionId" AND o."workspaceId" = c."workspaceId";
