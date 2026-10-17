-- 기능 : 비어 있는 구형 View 구조를 현재 schema.prisma의 10개 모델로 교체합니다.
-- 기준 : 모델 10개, Enum 9개, 컬럼 134개, 단일 ID FK 56개. 추가 UNIQUE/CHECK/조회 인덱스 없음.
-- 기존 업무 데이터와 SQL 전용 List 제약은 보존합니다. 과거 DB 전용 migration 이력도 수정하지 않습니다.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
SET LOCAL search_path = public, pg_catalog;

-- 1. 기존 View를 잠근 뒤 비어 있는지 확인하고 기존 보안 설정을 보존합니다.
DO $guard$
DECLARE
  target_name TEXT;
  has_rows BOOLEAN;
BEGIN
  FOREACH target_name IN ARRAY ARRAY['ViewDefinition', 'ViewAttributeSettingDefinition', 'ViewFilterGroupDefinition', 'ViewFilterConditionDefinition', 'ViewSortDefinition', 'ViewGroupDefinition', 'ViewGroupSettingDefinition', 'ViewWidgetDefinition', 'ViewWorkDependencyDefinition', 'ViewFavoriteDefinition'] LOOP
    IF to_regclass(format('public.%I', target_name)) IS NOT NULL THEN
      EXECUTE format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE', target_name);
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I)', target_name) INTO has_rows;
      IF has_rows THEN
        RAISE EXCEPTION 'View rebuild aborted: % contains data.', target_name;
      END IF;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=ANY(ARRAY['ViewDefinition', 'ViewAttributeSettingDefinition', 'ViewFilterGroupDefinition', 'ViewFilterConditionDefinition', 'ViewSortDefinition', 'ViewGroupDefinition', 'ViewGroupSettingDefinition', 'ViewWidgetDefinition', 'ViewWorkDependencyDefinition', 'ViewFavoriteDefinition'])) THEN
    RAISE EXCEPTION 'View rebuild aborted: unexpected RLS policies require preservation.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname=ANY(ARRAY['ViewDefinition', 'ViewAttributeSettingDefinition', 'ViewFilterGroupDefinition', 'ViewFilterConditionDefinition', 'ViewSortDefinition', 'ViewGroupDefinition', 'ViewGroupSettingDefinition', 'ViewWidgetDefinition', 'ViewWorkDependencyDefinition', 'ViewFavoriteDefinition']) AND NOT t.tgisinternal
  ) THEN
    RAISE EXCEPTION 'View rebuild aborted: unexpected custom triggers require preservation.';
  END IF;
END;
$guard$;

CREATE TEMP TABLE _view_rebuild_acl ON COMMIT DROP AS
SELECT c.relname::text AS table_name,
  CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee)::text END AS grantee,
  a.privilege_type, a.is_grantable
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
WHERE n.nspname='public' AND c.relname=ANY(ARRAY['ViewDefinition', 'ViewAttributeSettingDefinition', 'ViewFilterGroupDefinition', 'ViewFilterConditionDefinition', 'ViewSortDefinition', 'ViewGroupDefinition', 'ViewGroupSettingDefinition', 'ViewWidgetDefinition', 'ViewWorkDependencyDefinition', 'ViewFavoriteDefinition']);

CREATE TEMP TABLE _view_rebuild_security ON COMMIT DROP AS
SELECT c.relname::text AS table_name, pg_get_userbyid(c.relowner)::text AS owner,
  c.relforcerowsecurity AS force_rls
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname=ANY(ARRAY['ViewDefinition', 'ViewAttributeSettingDefinition', 'ViewFilterGroupDefinition', 'ViewFilterConditionDefinition', 'ViewSortDefinition', 'ViewGroupDefinition', 'ViewGroupSettingDefinition', 'ViewWidgetDefinition', 'ViewWorkDependencyDefinition', 'ViewFavoriteDefinition']);

-- 2. View 테이블과 전용 Enum만 제거합니다. 외부 의존성이 있으면 CASCADE 없이 중단합니다.
DROP TABLE IF EXISTS public."ViewDefinition", public."ViewAttributeSettingDefinition", public."ViewFilterGroupDefinition", public."ViewFilterConditionDefinition", public."ViewSortDefinition", public."ViewGroupDefinition", public."ViewGroupSettingDefinition", public."ViewWidgetDefinition", public."ViewWorkDependencyDefinition", public."ViewFavoriteDefinition";
DROP TYPE IF EXISTS public."ViewAttributeDisplayRoleEnum", public."ViewAttributeSettingRoleEnum", public."ViewConditionGroupOperatorEnum", public."ViewFilterOperatorEnum", public."ViewGroupRoleEnum", public."ViewLogicalOperatorEnum", public."ViewMultiValueMatchModeEnum", public."ViewSortDirectionEnum", public."ViewSourceScopeEnum", public."ViewTypeEnum", public."ViewValueMatchModeEnum", public."ViewWorkDependencyLagUnitEnum", public."ViewWorkDependencyTypeEnum", public."ViewWorkDependencyUnitEnum";

-- 3. 현재 스키마에 명시된 기존 공용 참조 키를 보존하며, 구형 View가 없던 DB에도 제공합니다.
CREATE UNIQUE INDEX IF NOT EXISTS "AttributeDefinition_id_workspaceId_key"
  ON "AttributeDefinition"("id", "workspaceId");
CREATE UNIQUE INDEX IF NOT EXISTS "ListEntryDefinition_id_workspaceId_key"
  ON "ListEntryDefinition"("id", "workspaceId");

-- 4. Prisma가 현재 스키마에서 생성한 View Enum, 테이블과 기본 FK를 적용합니다.
CREATE TYPE "ViewTypeEnum" AS ENUM ('TABLE', 'KANBAN', 'LIST', 'GALLERY', 'CALENDAR', 'TIMELINE', 'GANTT', 'CHART', 'PIVOT', 'MAP', 'DASHBOARD');

CREATE TYPE "ViewSourceScopeEnum" AS ENUM ('RECORD', 'LIST_ENTRY');

CREATE TYPE "ViewAttributeDisplayRoleEnum" AS ENUM ('DISPLAY', 'TITLE', 'BODY', 'IMAGE', 'START_DATE', 'END_DATE', 'LOCATION', 'PROGRESS', 'MEASURE');

CREATE TYPE "ViewConditionGroupOperatorEnum" AS ENUM ('AND', 'OR');

CREATE TYPE "ViewMultiValueMatchModeEnum" AS ENUM ('ANY', 'ALL');

CREATE TYPE "ViewSortDirectionEnum" AS ENUM ('ASC', 'DESC');

CREATE TYPE "ViewGroupRoleEnum" AS ENUM ('GROUP', 'SERIES', 'PIVOT_ROW', 'PIVOT_COLUMN');

CREATE TYPE "ViewWorkDependencyTypeEnum" AS ENUM ('FINISH_TO_START', 'START_TO_START', 'FINISH_TO_FINISH', 'START_TO_FINISH');

CREATE TYPE "ViewWorkDependencyUnitEnum" AS ENUM ('MINUTE', 'HOUR', 'DAY');

CREATE TABLE "ViewDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "objectDefinitionId" UUID,
    "listDefinitionId" UUID,
    "name" TEXT NOT NULL,
    "type" "ViewTypeEnum" NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "configJson" JSONB,

    CONSTRAINT "ViewDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewAttributeSettingDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "sourceScope" "ViewSourceScopeEnum" NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "referenceAttributeIdPathJson" JSONB NOT NULL DEFAULT '[]',
    "attributeDisplayRole" "ViewAttributeDisplayRoleEnum" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "labelOverride" TEXT,
    "width" INTEGER,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "formatJson" JSONB,

    CONSTRAINT "ViewAttributeSettingDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewFilterGroupDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "parentViewFilterGroupDefinitionId" UUID,
    "conditionGroupOperator" "ViewConditionGroupOperatorEnum" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ViewFilterGroupDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewFilterConditionDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "viewFilterGroupDefinitionId" UUID NOT NULL,
    "sourceScope" "ViewSourceScopeEnum" NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "referenceAttributeIdPathJson" JSONB NOT NULL DEFAULT '[]',
    "comparisonOperator" TEXT NOT NULL,
    "comparisonValueJson" JSONB,
    "multiValueMatchMode" "ViewMultiValueMatchModeEnum" NOT NULL DEFAULT 'ANY',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ViewFilterConditionDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewSortDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "sourceScope" "ViewSourceScopeEnum" NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "referenceAttributeIdPathJson" JSONB NOT NULL DEFAULT '[]',
    "sortDirection" "ViewSortDirectionEnum" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "configJson" JSONB,

    CONSTRAINT "ViewSortDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewGroupDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "sourceScope" "ViewSourceScopeEnum" NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "referenceAttributeIdPathJson" JSONB NOT NULL DEFAULT '[]',
    "groupRole" "ViewGroupRoleEnum" NOT NULL DEFAULT 'GROUP',
    "sortDirection" "ViewSortDirectionEnum" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "configJson" JSONB,

    CONSTRAINT "ViewGroupDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewGroupSettingDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "viewGroupDefinitionId" UUID NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "statusOptionId" UUID,
    "selectOptionId" UUID,
    "groupKeyJson" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "labelOverride" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isFold" BOOLEAN NOT NULL DEFAULT false,
    "configJson" JSONB,

    CONSTRAINT "ViewGroupSettingDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewWidgetDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "contentViewDefinitionId" UUID NOT NULL,
    "titleOverride" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "layoutJson" JSONB NOT NULL,
    "configJson" JSONB,

    CONSTRAINT "ViewWidgetDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewWorkDependencyDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "sourceRecordDefinitionId" UUID,
    "sourceListEntryDefinitionId" UUID,
    "targetRecordDefinitionId" UUID,
    "targetListEntryDefinitionId" UUID,
    "type" "ViewWorkDependencyTypeEnum" NOT NULL,
    "dependencyTimeOffsetValue" DECIMAL(30,10) NOT NULL DEFAULT 0,
    "dependencyTimeOffsetUnit" "ViewWorkDependencyUnitEnum" NOT NULL,

    CONSTRAINT "ViewWorkDependencyDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ViewFavoriteDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "workspaceMemberId" UUID NOT NULL,
    "viewDefinitionId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ViewFavoriteDefinition_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ViewDefinition" ADD CONSTRAINT "ViewDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewDefinition" ADD CONSTRAINT "ViewDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewDefinition" ADD CONSTRAINT "ViewDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewDefinition" ADD CONSTRAINT "ViewDefinition_objectDefinitionId_fkey" FOREIGN KEY ("objectDefinitionId") REFERENCES "ObjectDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewDefinition" ADD CONSTRAINT "ViewDefinition_listDefinitionId_fkey" FOREIGN KEY ("listDefinitionId") REFERENCES "ListDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewAttributeSettingDefinition" ADD CONSTRAINT "ViewAttributeSettingDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewAttributeSettingDefinition" ADD CONSTRAINT "ViewAttributeSettingDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewAttributeSettingDefinition" ADD CONSTRAINT "ViewAttributeSettingDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewAttributeSettingDefinition" ADD CONSTRAINT "ViewAttributeSettingDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewAttributeSettingDefinition" ADD CONSTRAINT "ViewAttributeSettingDefinition_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "ViewFilterGroupDefinition" ADD CONSTRAINT "ViewFilterGroupDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFilterGroupDefinition" ADD CONSTRAINT "ViewFilterGroupDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewFilterGroupDefinition" ADD CONSTRAINT "ViewFilterGroupDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewFilterGroupDefinition" ADD CONSTRAINT "ViewFilterGroupDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFilterGroupDefinition" ADD CONSTRAINT "ViewFilterGroupDefinition_parentViewFilterGroupDefinitionI_fkey" FOREIGN KEY ("parentViewFilterGroupDefinitionId") REFERENCES "ViewFilterGroupDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFilterConditionDefinition" ADD CONSTRAINT "ViewFilterConditionDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFilterConditionDefinition" ADD CONSTRAINT "ViewFilterConditionDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewFilterConditionDefinition" ADD CONSTRAINT "ViewFilterConditionDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewFilterConditionDefinition" ADD CONSTRAINT "ViewFilterConditionDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFilterConditionDefinition" ADD CONSTRAINT "ViewFilterConditionDefinition_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "ViewFilterConditionDefinition" ADD CONSTRAINT "ViewFilterConditionDefinition_viewFilterGroupDefinitionId_fkey" FOREIGN KEY ("viewFilterGroupDefinitionId") REFERENCES "ViewFilterGroupDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewSortDefinition" ADD CONSTRAINT "ViewSortDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewSortDefinition" ADD CONSTRAINT "ViewSortDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewSortDefinition" ADD CONSTRAINT "ViewSortDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewSortDefinition" ADD CONSTRAINT "ViewSortDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewSortDefinition" ADD CONSTRAINT "ViewSortDefinition_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "ViewGroupDefinition" ADD CONSTRAINT "ViewGroupDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewGroupDefinition" ADD CONSTRAINT "ViewGroupDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewGroupDefinition" ADD CONSTRAINT "ViewGroupDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewGroupDefinition" ADD CONSTRAINT "ViewGroupDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewGroupDefinition" ADD CONSTRAINT "ViewGroupDefinition_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_attributeDefinitionId_fkey" FOREIGN KEY ("attributeDefinitionId") REFERENCES "AttributeDefinition"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_viewGroupDefinitionId_fkey" FOREIGN KEY ("viewGroupDefinitionId") REFERENCES "ViewGroupDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_statusOptionId_fkey" FOREIGN KEY ("statusOptionId") REFERENCES "StatusOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewGroupSettingDefinition" ADD CONSTRAINT "ViewGroupSettingDefinition_selectOptionId_fkey" FOREIGN KEY ("selectOptionId") REFERENCES "SelectOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWidgetDefinition" ADD CONSTRAINT "ViewWidgetDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWidgetDefinition" ADD CONSTRAINT "ViewWidgetDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewWidgetDefinition" ADD CONSTRAINT "ViewWidgetDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewWidgetDefinition" ADD CONSTRAINT "ViewWidgetDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWidgetDefinition" ADD CONSTRAINT "ViewWidgetDefinition_contentViewDefinitionId_fkey" FOREIGN KEY ("contentViewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWorkDependencyDefinition" ADD CONSTRAINT "ViewWorkDependencyDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWorkDependencyDefinition" ADD CONSTRAINT "ViewWorkDependencyDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewWorkDependencyDefinition" ADD CONSTRAINT "ViewWorkDependencyDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewWorkDependencyDefinition" ADD CONSTRAINT "ViewWorkDependencyDefinition_sourceRecordDefinitionId_fkey" FOREIGN KEY ("sourceRecordDefinitionId") REFERENCES "RecordDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWorkDependencyDefinition" ADD CONSTRAINT "ViewWorkDependencyDefinition_targetRecordDefinitionId_fkey" FOREIGN KEY ("targetRecordDefinitionId") REFERENCES "RecordDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWorkDependencyDefinition" ADD CONSTRAINT "ViewWorkDependencyDefinition_sourceListEntryDefinitionId_fkey" FOREIGN KEY ("sourceListEntryDefinitionId") REFERENCES "ListEntryDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewWorkDependencyDefinition" ADD CONSTRAINT "ViewWorkDependencyDefinition_targetListEntryDefinitionId_fkey" FOREIGN KEY ("targetListEntryDefinitionId") REFERENCES "ListEntryDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFavoriteDefinition" ADD CONSTRAINT "ViewFavoriteDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFavoriteDefinition" ADD CONSTRAINT "ViewFavoriteDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ViewFavoriteDefinition" ADD CONSTRAINT "ViewFavoriteDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViewFavoriteDefinition" ADD CONSTRAINT "ViewFavoriteDefinition_viewDefinitionId_fkey" FOREIGN KEY ("viewDefinitionId") REFERENCES "ViewDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViewFavoriteDefinition" ADD CONSTRAINT "ViewFavoriteDefinition_workspaceMemberId_fkey" FOREIGN KEY ("workspaceMemberId") REFERENCES "WorkspaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. RLS를 활성화하고 기존 ACL을 복원합니다. 신규 즐겨찾기는 기존 ViewDefinition의 ACL을 따릅니다.
DO $security$
DECLARE
  target_name TEXT;
  template_name TEXT;
  grant_row RECORD;
  security_row RECORD;
  grantee_sql TEXT;
BEGIN
  FOREACH target_name IN ARRAY ARRAY['ViewDefinition', 'ViewAttributeSettingDefinition', 'ViewFilterGroupDefinition', 'ViewFilterConditionDefinition', 'ViewSortDefinition', 'ViewGroupDefinition', 'ViewGroupSettingDefinition', 'ViewWidgetDefinition', 'ViewWorkDependencyDefinition', 'ViewFavoriteDefinition'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_name);
    template_name := target_name;
    IF NOT EXISTS (SELECT 1 FROM _view_rebuild_acl WHERE table_name=template_name) THEN
      template_name := 'ViewDefinition';
    END IF;
    IF EXISTS (SELECT 1 FROM _view_rebuild_acl WHERE table_name=template_name) THEN
      FOR grant_row IN
        SELECT DISTINCT CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee)::text END AS grantee
        FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
        WHERE n.nspname='public' AND c.relname=target_name
      LOOP
        grantee_sql := CASE WHEN grant_row.grantee='PUBLIC' THEN 'PUBLIC' ELSE quote_ident(grant_row.grantee) END;
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM %s', target_name, grantee_sql);
      END LOOP;
      FOR grant_row IN SELECT * FROM _view_rebuild_acl WHERE table_name=template_name LOOP
        grantee_sql := CASE WHEN grant_row.grantee='PUBLIC' THEN 'PUBLIC' ELSE quote_ident(grant_row.grantee) END;
        EXECUTE format('GRANT %s ON TABLE public.%I TO %s%s', grant_row.privilege_type, target_name,
          grantee_sql, CASE WHEN grant_row.is_grantable THEN ' WITH GRANT OPTION' ELSE '' END);
      END LOOP;
    ELSE
      -- 기존 View가 없는 DB에서도 Supabase 클라이언트 역할의 DML 권한을 새로 열지 않습니다.
      FOR grant_row IN SELECT rolname AS grantee FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role') LOOP
        EXECUTE format('REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I FROM %I', target_name, grant_row.grantee);
      END LOOP;
    END IF;
    SELECT * INTO security_row FROM _view_rebuild_security WHERE table_name=template_name;
    IF FOUND THEN
      IF security_row.force_rls THEN
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', target_name);
      END IF;
      EXECUTE format('ALTER TABLE public.%I OWNER TO %I', target_name, security_row.owner);
    END IF;
  END LOOP;
END;
$security$;

-- 6. 현재 모델과 컬럼의 역할을 DB 주석으로 남깁니다.
COMMENT ON TABLE "ViewDefinition" IS 'Object/List의 View와 대시보드의 기본 정의를 저장합니다.';
COMMENT ON COLUMN "ViewDefinition"."id" IS 'View PK';
COMMENT ON COLUMN "ViewDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewDefinition"."objectDefinitionId" IS 'Object 기반 View의 원본 또는 대시보드의 선택적 소속';
COMMENT ON COLUMN "ViewDefinition"."listDefinitionId" IS 'List 기반 View의 원본 또는 대시보드의 선택적 소속';
COMMENT ON COLUMN "ViewDefinition"."name" IS 'View 선택 메뉴의 표시 이름';
COMMENT ON COLUMN "ViewDefinition"."type" IS '표현 방식';
COMMENT ON COLUMN "ViewDefinition"."description" IS '목적과 사용 방법';
COMMENT ON COLUMN "ViewDefinition"."icon" IS '기존 아이콘 값 계약을 사용하는 표시 아이콘';
COMMENT ON COLUMN "ViewDefinition"."sortOrder" IS '같은 소속의 View 순서';
COMMENT ON COLUMN "ViewDefinition"."configJson" IS '타입별 표현·집계 설정';
COMMENT ON TABLE "ViewAttributeSettingDefinition" IS 'View에 표시할 속성의 참조 경로, 역할과 표시 방법을 저장합니다.';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."id" IS '설정 PK';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."viewDefinitionId" IS '소속 View';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."sourceScope" IS '원본 Record 또는 ListEntry에서 조회를 시작할지 구분';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."attributeDefinitionId" IS '경로 끝에서 읽을 기존 Attribute';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."referenceAttributeIdPathJson" IS 'RecordReference Attribute ID의 순서 배열';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."attributeDisplayRole" IS '일반 표시·제목·본문·날짜·위치·집계값 역할';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."sortOrder" IS '표시 순서';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."labelOverride" IS '해당 View에서만 사용할 표시 이름';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."width" IS '표 열 너비. 단위는 px 제안';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."isHidden" IS '화면에서 숨길지 여부';
COMMENT ON COLUMN "ViewAttributeSettingDefinition"."formatJson" IS 'View별 날짜·숫자·금액 표시 형식';
COMMENT ON TABLE "ViewFilterGroupDefinition" IS 'View의 AND/OR 필터 그룹과 부모 그룹 연결을 저장합니다.';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."id" IS '그룹 PK';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."viewDefinitionId" IS '소속 View';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."parentViewFilterGroupDefinitionId" IS '상위 그룹. NULL이면 루트';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."conditionGroupOperator" IS 'AND 또는 OR';
COMMENT ON COLUMN "ViewFilterGroupDefinition"."sortOrder" IS '같은 부모 안의 순서';
COMMENT ON TABLE "ViewFilterConditionDefinition" IS '필터 그룹에 속하는 개별 비교 조건을 저장합니다.';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."id" IS '조건 PK';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."viewDefinitionId" IS '소속 View';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."viewFilterGroupDefinitionId" IS '조건이 속하는 필터 그룹';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."sourceScope" IS 'Record / ListEntry 시작점';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."attributeDefinitionId" IS '비교할 최종 Attribute';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."referenceAttributeIdPathJson" IS '참조 경로';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."comparisonOperator" IS '속성 타입에 맞는 비교 연산자입니다. 연산자 목록이 미정이므로 문자열로 두고 API 검증은 후속 작업으로 남깁니다.';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."comparisonValueJson" IS '비교값 또는 현재 사용자·상대 날짜 표현';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."multiValueMatchMode" IS '여러 값·참조 결과의 ANY/ALL 평가';
COMMENT ON COLUMN "ViewFilterConditionDefinition"."sortOrder" IS '그룹 안의 조건 순서';
COMMENT ON TABLE "ViewSortDefinition" IS 'View의 정렬 기준과 우선순위를 저장합니다.';
COMMENT ON COLUMN "ViewSortDefinition"."id" IS '정렬 설정 PK';
COMMENT ON COLUMN "ViewSortDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewSortDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewSortDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewSortDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewSortDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewSortDefinition"."viewDefinitionId" IS '소속 View';
COMMENT ON COLUMN "ViewSortDefinition"."sourceScope" IS 'Record / ListEntry 시작점';
COMMENT ON COLUMN "ViewSortDefinition"."attributeDefinitionId" IS '정렬할 최종 Attribute';
COMMENT ON COLUMN "ViewSortDefinition"."referenceAttributeIdPathJson" IS '참조 경로';
COMMENT ON COLUMN "ViewSortDefinition"."sortDirection" IS 'ASC 또는 DESC';
COMMENT ON COLUMN "ViewSortDefinition"."sortOrder" IS '정렬 기준의 우선순위';
COMMENT ON COLUMN "ViewSortDefinition"."configJson" IS 'NULL 위치·다중값 정렬값 선택 방식';
COMMENT ON TABLE "ViewGroupDefinition" IS '칸반, 차트와 피벗에서 데이터를 묶는 기준을 저장합니다.';
COMMENT ON COLUMN "ViewGroupDefinition"."id" IS '그룹 기준 PK';
COMMENT ON COLUMN "ViewGroupDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewGroupDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewGroupDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewGroupDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewGroupDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewGroupDefinition"."viewDefinitionId" IS '소속 View';
COMMENT ON COLUMN "ViewGroupDefinition"."sourceScope" IS 'Record / ListEntry 시작점';
COMMENT ON COLUMN "ViewGroupDefinition"."attributeDefinitionId" IS '그룹 기준 Attribute';
COMMENT ON COLUMN "ViewGroupDefinition"."referenceAttributeIdPathJson" IS '참조 경로';
COMMENT ON COLUMN "ViewGroupDefinition"."groupRole" IS '일반 그룹·계열·피벗 행/열 역할';
COMMENT ON COLUMN "ViewGroupDefinition"."sortDirection" IS '그룹의 기본 정렬 방향';
COMMENT ON COLUMN "ViewGroupDefinition"."sortOrder" IS '그룹 기준의 우선순위';
COMMENT ON COLUMN "ViewGroupDefinition"."configJson" IS '날짜 버킷·숫자 구간·집계 기준 정렬';
COMMENT ON TABLE "ViewGroupSettingDefinition" IS '개별 그룹의 순서, 이름, 숨김과 접힘 상태를 저장합니다.';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."id" IS '그룹 설정 PK';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."viewDefinitionId" IS '소속 View';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."viewGroupDefinitionId" IS '표시 설정을 적용하는 그룹 기준';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."attributeDefinitionId" IS '그룹 기준에서 도출한 Attribute. 옵션 소속 검증용';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."statusOptionId" IS 'Status 옵션 그룹';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."selectOptionId" IS 'Select 옵션 그룹';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."groupKeyJson" IS '옵션 외 그룹의 정규화 식별 키';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."sortOrder" IS '개별 그룹 표시 순서';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."labelOverride" IS '해당 View에서 사용할 그룹 이름';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."isHidden" IS '그룹 숨김';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."isFold" IS '그룹 접힘';
COMMENT ON COLUMN "ViewGroupSettingDefinition"."configJson" IS '추가 표현 설정';
COMMENT ON TABLE "ViewWidgetDefinition" IS '대시보드 안에 배치할 기존 View와 배치 설정을 저장합니다.';
COMMENT ON COLUMN "ViewWidgetDefinition"."id" IS '위젯 PK';
COMMENT ON COLUMN "ViewWidgetDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewWidgetDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewWidgetDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewWidgetDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewWidgetDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewWidgetDefinition"."viewDefinitionId" IS '소유 대시보드 View';
COMMENT ON COLUMN "ViewWidgetDefinition"."contentViewDefinitionId" IS '위젯에 표시하는 기존 View';
COMMENT ON COLUMN "ViewWidgetDefinition"."titleOverride" IS '위젯 제목';
COMMENT ON COLUMN "ViewWidgetDefinition"."sortOrder" IS '위젯 순서';
COMMENT ON COLUMN "ViewWidgetDefinition"."isHidden" IS '위젯 숨김';
COMMENT ON COLUMN "ViewWidgetDefinition"."layoutJson" IS '위치·너비·높이·화면별 배치';
COMMENT ON COLUMN "ViewWidgetDefinition"."configJson" IS '제목 표시 등 위젯 표현 옵션';
COMMENT ON TABLE "ViewWorkDependencyDefinition" IS 'Record 또는 ListEntry 사이의 업무 선후행 관계를 저장합니다.';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."id" IS '의존 관계 PK';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."sourceRecordDefinitionId" IS '선행 Record';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."sourceListEntryDefinitionId" IS '선행 ListEntry';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."targetRecordDefinitionId" IS '후행 Record';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."targetListEntryDefinitionId" IS '후행 ListEntry';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."type" IS '선행·후행 업무의 시작·종료 연결 방식';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."dependencyTimeOffsetValue" IS '선후행 사이의 시간 간격';
COMMENT ON COLUMN "ViewWorkDependencyDefinition"."dependencyTimeOffsetUnit" IS 'MINUTE·HOUR·DAY';
COMMENT ON TABLE "ViewFavoriteDefinition" IS 'Workspace 구성원이 등록한 View 즐겨찾기를 저장합니다.';
COMMENT ON COLUMN "ViewFavoriteDefinition"."id" IS '즐겨찾기 PK';
COMMENT ON COLUMN "ViewFavoriteDefinition"."workspaceId" IS '소속 Workspace';
COMMENT ON COLUMN "ViewFavoriteDefinition"."createdByActorId" IS '생성 Actor';
COMMENT ON COLUMN "ViewFavoriteDefinition"."updatedByActorId" IS '마지막 수정 Actor';
COMMENT ON COLUMN "ViewFavoriteDefinition"."createdAt" IS '생성 시각';
COMMENT ON COLUMN "ViewFavoriteDefinition"."updatedAt" IS '수정 시각';
COMMENT ON COLUMN "ViewFavoriteDefinition"."workspaceMemberId" IS '즐겨찾기 소유 구성원';
COMMENT ON COLUMN "ViewFavoriteDefinition"."viewDefinitionId" IS '바로 여는 View';
COMMENT ON COLUMN "ViewFavoriteDefinition"."sortOrder" IS '개인 사이드바 순서';

COMMIT;
