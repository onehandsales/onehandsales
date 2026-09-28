-- 기능 : RecordAttributeValueDefinition에 Attribute 타입 snapshot과 타입별 값 저장 컬럼을 추가한다.
ALTER TABLE "RecordAttributeValueDefinition"
  ADD COLUMN IF NOT EXISTS "attributeType" "AttributeType",
  ADD COLUMN IF NOT EXISTS "jsonValue" JSONB,
  ADD COLUMN IF NOT EXISTS "textValue" TEXT,
  ADD COLUMN IF NOT EXISTS "numberValue" DECIMAL(30, 10),
  ADD COLUMN IF NOT EXISTS "booleanValue" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "dateValue" DATE,
  ADD COLUMN IF NOT EXISTS "timestampValue" TIMESTAMPTZ(3);

-- 기능 : 기존 값 row가 있으면 현재 AttributeDefinition 타입으로 snapshot을 채운다.
UPDATE "RecordAttributeValueDefinition" AS "recordAttributeValueDefinition"
SET "attributeType" = "attributeDefinition"."type"
FROM "AttributeDefinition" AS "attributeDefinition"
WHERE "recordAttributeValueDefinition"."attributeDefinitionId" = "attributeDefinition"."id";

-- 기능 : 모든 값 row는 생성 당시 Attribute 타입 snapshot을 반드시 가진다.
ALTER TABLE "RecordAttributeValueDefinition"
  ALTER COLUMN "attributeType" SET NOT NULL;

COMMENT ON COLUMN "RecordAttributeValueDefinition"."attributeType" IS '값 생성 당시 Attribute 타입 snapshot.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."jsonValue" IS '복합 값 원본. 주소, 통화, 이름 구조 등에 사용.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."textValue" IS '문자열 값. 검색과 정렬에 사용.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."numberValue" IS '숫자 값. 필터, 정렬, 범위 검색에 사용.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."booleanValue" IS '체크박스 true 또는 false 값.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."dateValue" IS '날짜 값.';
COMMENT ON COLUMN "RecordAttributeValueDefinition"."timestampValue" IS '날짜와 시간이 있는 값.';
