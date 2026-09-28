-- 1. RecordDefinition body row cursor pagination 조회를 위한 composite index를 추가한다.
CREATE INDEX IF NOT EXISTS "RecordDefinition_workspace_object_created_id_idx"
  ON public."RecordDefinition" ("workspaceId", "objectDefinitionId", "createdAt", "id");

-- 2. 현재 page의 RecordDefinition ID 목록으로 value row를 일괄 조회하기 위한 composite index를 추가한다.
CREATE INDEX IF NOT EXISTS "RecordAttributeValue_workspace_object_record_idx"
  ON public."RecordAttributeValueDefinition" ("workspaceId", "objectDefinitionId", "recordDefinitionId");
