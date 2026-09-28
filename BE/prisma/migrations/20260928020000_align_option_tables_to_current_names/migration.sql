-- 기능 : Supabase 현재 CRM Core option 테이블/컬럼 이름을 Prisma schema 정본과 맞춘다.
DO $$
BEGIN
  IF to_regclass('public."SelectOptionDefinition"') IS NOT NULL
    AND to_regclass('public."SelectOption"') IS NULL THEN
    ALTER TABLE public."SelectOptionDefinition" RENAME TO "SelectOption";
  END IF;

  IF to_regclass('public."StatusOptionDefinition"') IS NOT NULL
    AND to_regclass('public."StatusOption"') IS NULL THEN
    ALTER TABLE public."StatusOptionDefinition" RENAME TO "StatusOption";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'RecordAttributeValueDefinition'
      AND column_name = 'selectOptionDefinitionId'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'RecordAttributeValueDefinition'
      AND column_name = 'selectOptionId'
  ) THEN
    ALTER TABLE public."RecordAttributeValueDefinition"
      RENAME COLUMN "selectOptionDefinitionId" TO "selectOptionId";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'RecordAttributeValueDefinition'
      AND column_name = 'statusOptionDefinitionId'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'RecordAttributeValueDefinition'
      AND column_name = 'statusOptionId'
  ) THEN
    ALTER TABLE public."RecordAttributeValueDefinition"
      RENAME COLUMN "statusOptionDefinitionId" TO "statusOptionId";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOptionDefinition_pkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOption_pkey') THEN
    ALTER TABLE public."SelectOption"
      RENAME CONSTRAINT "SelectOptionDefinition_pkey" TO "SelectOption_pkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOptionDefinition_workspaceId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOption_workspaceId_fkey') THEN
    ALTER TABLE public."SelectOption"
      RENAME CONSTRAINT "SelectOptionDefinition_workspaceId_fkey" TO "SelectOption_workspaceId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOptionDefinition_attributeDefinitionId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOption_attributeDefinitionId_fkey') THEN
    ALTER TABLE public."SelectOption"
      RENAME CONSTRAINT "SelectOptionDefinition_attributeDefinitionId_fkey" TO "SelectOption_attributeDefinitionId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOptionDefinition_createdByActorId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOption_createdByActorId_fkey') THEN
    ALTER TABLE public."SelectOption"
      RENAME CONSTRAINT "SelectOptionDefinition_createdByActorId_fkey" TO "SelectOption_createdByActorId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOptionDefinition_updatedByActorId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SelectOption_updatedByActorId_fkey') THEN
    ALTER TABLE public."SelectOption"
      RENAME CONSTRAINT "SelectOptionDefinition_updatedByActorId_fkey" TO "SelectOption_updatedByActorId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOptionDefinition_pkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOption_pkey') THEN
    ALTER TABLE public."StatusOption"
      RENAME CONSTRAINT "StatusOptionDefinition_pkey" TO "StatusOption_pkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOptionDefinition_workspaceId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOption_workspaceId_fkey') THEN
    ALTER TABLE public."StatusOption"
      RENAME CONSTRAINT "StatusOptionDefinition_workspaceId_fkey" TO "StatusOption_workspaceId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOptionDefinition_attributeDefinitionId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOption_attributeDefinitionId_fkey') THEN
    ALTER TABLE public."StatusOption"
      RENAME CONSTRAINT "StatusOptionDefinition_attributeDefinitionId_fkey" TO "StatusOption_attributeDefinitionId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOptionDefinition_createdByActorId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOption_createdByActorId_fkey') THEN
    ALTER TABLE public."StatusOption"
      RENAME CONSTRAINT "StatusOptionDefinition_createdByActorId_fkey" TO "StatusOption_createdByActorId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOptionDefinition_updatedByActorId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StatusOption_updatedByActorId_fkey') THEN
    ALTER TABLE public."StatusOption"
      RENAME CONSTRAINT "StatusOptionDefinition_updatedByActorId_fkey" TO "StatusOption_updatedByActorId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecordAttributeValueDefinition_selectOptionDefinitionId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecordAttributeValueDefinition_selectOptionId_fkey') THEN
    ALTER TABLE public."RecordAttributeValueDefinition"
      RENAME CONSTRAINT "RecordAttributeValueDefinition_selectOptionDefinitionId_fkey" TO "RecordAttributeValueDefinition_selectOptionId_fkey";
  END IF;

  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecordAttributeValueDefinition_statusOptionDefinitionId_fkey')
    AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecordAttributeValueDefinition_statusOptionId_fkey') THEN
    ALTER TABLE public."RecordAttributeValueDefinition"
      RENAME CONSTRAINT "RecordAttributeValueDefinition_statusOptionDefinitionId_fkey" TO "RecordAttributeValueDefinition_statusOptionId_fkey";
  END IF;
END $$;

COMMENT ON TABLE public."SelectOption" IS 'SELECT Attribute에서 선택 가능한 옵션.';
COMMENT ON TABLE public."StatusOption" IS 'STATUS Attribute에서 선택 가능한 상태 옵션.';
COMMENT ON COLUMN public."RecordAttributeValueDefinition"."selectOptionId" IS 'SELECT 값일 때 선택된 SelectOption ID.';
COMMENT ON COLUMN public."RecordAttributeValueDefinition"."statusOptionId" IS 'STATUS 값일 때 선택된 StatusOption ID.';
