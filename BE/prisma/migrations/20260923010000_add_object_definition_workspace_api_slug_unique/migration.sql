-- 기능 : 한 Workspace 안에서 같은 ObjectDefinition apiSlug가 중복되지 않도록 unique index를 추가한다.
CREATE UNIQUE INDEX "ObjectDefinition_workspaceId_apiSlug_key"
  ON "ObjectDefinition"("workspaceId", "apiSlug");

COMMENT ON INDEX "ObjectDefinition_workspaceId_apiSlug_key" IS '한 Workspace 안에서 ObjectDefinition apiSlug가 중복되지 않도록 보장한다.';
