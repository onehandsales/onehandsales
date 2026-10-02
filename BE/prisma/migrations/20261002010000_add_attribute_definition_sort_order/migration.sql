-- 기능 : AttributeDefinition 정렬 순서를 저장합니다.
ALTER TABLE "AttributeDefinition"
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- 기능 : 기존 AttributeDefinition 정렬 순서를 ObjectDefinition별 생성 순서 기준으로 설정합니다.
WITH ordered_attributes AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "objectDefinitionId"
      ORDER BY "createdAt" ASC, "id" ASC
    ) - 1 AS "nextSortOrder"
  FROM "AttributeDefinition"
)
UPDATE "AttributeDefinition" AS attribute_definition
SET "sortOrder" = ordered_attributes."nextSortOrder"
FROM ordered_attributes
WHERE attribute_definition."id" = ordered_attributes."id";

-- 기능 : AttributeDefinition 정렬 조회를 지원합니다.
CREATE INDEX "AttributeDefinition_objectDefinitionId_sortOrder_id_idx"
  ON "AttributeDefinition"("objectDefinitionId", "sortOrder", "id");

COMMENT ON COLUMN "AttributeDefinition"."sortOrder" IS 'AttributeDefinition 정렬 순서.';
