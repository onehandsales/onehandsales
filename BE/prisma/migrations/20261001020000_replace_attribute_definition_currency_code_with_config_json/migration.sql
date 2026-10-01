-- 기능 : AttributeDefinition의 타입별 설정을 nullable JSON 값으로 저장한다.
ALTER TABLE "AttributeDefinition"
  ADD COLUMN "configJson" JSONB,
  DROP COLUMN "currencyCode";

COMMENT ON COLUMN "AttributeDefinition"."configJson" IS 'AttributeType별 설정 JSON. Currency 통화 설정, 참조 허용 Object, 평점 설정 등을 저장한다.';
