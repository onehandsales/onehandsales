-- 기능 : Currency 타입 AttributeDefinition의 기본 통화 코드를 nullable 값으로 저장한다.
ALTER TABLE "AttributeDefinition"
  ADD COLUMN "currencyCode" TEXT;

COMMENT ON COLUMN "AttributeDefinition"."currencyCode" IS 'Currency 타입 AttributeDefinition에서 사용할 기본 통화 코드.';
