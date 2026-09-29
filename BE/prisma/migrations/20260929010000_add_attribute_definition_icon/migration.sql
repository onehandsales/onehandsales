-- 기능 : AttributeDefinition 화면 표시용 아이콘을 nullable 값으로 저장한다.
ALTER TABLE "AttributeDefinition"
  ADD COLUMN "icon" TEXT;

COMMENT ON COLUMN "AttributeDefinition"."icon" IS '화면 표시용 아이콘.';
