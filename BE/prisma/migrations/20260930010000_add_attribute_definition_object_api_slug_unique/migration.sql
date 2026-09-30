-- 기능 : 같은 ObjectDefinition 안에서 같은 apiSlug를 가진 AttributeDefinition 중복 생성을 차단한다.
ALTER TABLE "AttributeDefinition"
  ADD CONSTRAINT "AttributeDefinition_objectDefinitionId_apiSlug_key"
  UNIQUE ("objectDefinitionId", "apiSlug");
