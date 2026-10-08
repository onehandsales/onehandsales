-- 기능 : 합의한 List 정의, 참여 항목과 값 테이블을 생성하고 소속 검증을 연결한다.
BEGIN;

-- 기능 : 업무 List의 정의, 참여 항목과 값 테이블을 생성한다.
CREATE TABLE "ListDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "apiSlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ListDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : 업무 List의 정의, 참여 항목과 값 테이블을 생성한다.
CREATE TABLE "ListEntryDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "listDefinitionId" UUID NOT NULL,
    "recordDefinitionId" UUID NOT NULL,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ListEntryDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : 업무 List의 정의, 참여 항목과 값 테이블을 생성한다.
CREATE TABLE "ListEntryValueDefinition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspaceId" UUID NOT NULL,
    "listDefinitionId" UUID NOT NULL,
    "listEntryDefinitionId" UUID NOT NULL,
    "attributeDefinitionId" UUID NOT NULL,
    "attributeType" "AttributeType" NOT NULL,
    "jsonValue" JSONB,
    "textValue" TEXT,
    "numberValue" DECIMAL(30,10),
    "booleanValue" BOOLEAN,
    "dateValue" DATE,
    "timestampValue" TIMESTAMPTZ(3),
    "selectOptionId" UUID,
    "statusOptionId" UUID,
    "targetRecordDefinitionId" UUID,
    "targetObjectDefinitionId" UUID,
    "targetActorId" UUID,
    "createdByActorId" UUID NOT NULL,
    "updatedByActorId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ListEntryValueDefinition_pkey" PRIMARY KEY ("id")
);

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "ListDefinition_id_workspaceId_key" ON "ListDefinition"("id", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "ListDefinition_workspaceId_apiSlug_key" ON "ListDefinition"("workspaceId", "apiSlug");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE INDEX "ListEntryDefinition_workspaceId_listDefinitionId_createdAt__idx" ON "ListEntryDefinition"("workspaceId", "listDefinitionId", "createdAt", "id");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE INDEX "ListEntryDefinition_workspaceId_recordDefinitionId_idx" ON "ListEntryDefinition"("workspaceId", "recordDefinitionId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "ListEntryDefinition_id_listDefinitionId_workspaceId_key" ON "ListEntryDefinition"("id", "listDefinitionId", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE INDEX "ListEntryValueDefinition_workspaceId_listEntryDefinitionId__idx" ON "ListEntryValueDefinition"("workspaceId", "listEntryDefinitionId", "attributeDefinitionId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE INDEX "ListEntryValueDefinition_workspaceId_listDefinitionId_attri_idx" ON "ListEntryValueDefinition"("workspaceId", "listDefinitionId", "attributeDefinitionId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "Actor_id_workspaceId_key" ON "Actor"("id", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "AttributeDefinition_id_listDefinitionId_workspaceId_key" ON "AttributeDefinition"("id", "listDefinitionId", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "ObjectDefinition_id_workspaceId_key" ON "ObjectDefinition"("id", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "RecordDefinition_id_workspaceId_key" ON "RecordDefinition"("id", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "RecordDefinition_id_objectDefinitionId_workspaceId_key" ON "RecordDefinition"("id", "objectDefinitionId", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "SelectOption_id_attributeDefinitionId_workspaceId_key" ON "SelectOption"("id", "attributeDefinitionId", "workspaceId");

-- 기능 : 소속 검증을 위한 복합 키와 업무 조회 인덱스를 추가한다.
CREATE UNIQUE INDEX "StatusOption_id_attributeDefinitionId_workspaceId_key" ON "StatusOption"("id", "attributeDefinitionId", "workspaceId");

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListDefinition" ADD CONSTRAINT "ListDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListDefinition" ADD CONSTRAINT "ListDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListDefinition" ADD CONSTRAINT "ListDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryDefinition" ADD CONSTRAINT "ListEntryDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryDefinition" ADD CONSTRAINT "ListEntryDefinition_listDefinitionId_workspaceId_fkey" FOREIGN KEY ("listDefinitionId", "workspaceId") REFERENCES "ListDefinition"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryDefinition" ADD CONSTRAINT "ListEntryDefinition_recordDefinitionId_workspaceId_fkey" FOREIGN KEY ("recordDefinitionId", "workspaceId") REFERENCES "RecordDefinition"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryDefinition" ADD CONSTRAINT "ListEntryDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryDefinition" ADD CONSTRAINT "ListEntryDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_listDefinitionId_workspaceId_fkey" FOREIGN KEY ("listDefinitionId", "workspaceId") REFERENCES "ListDefinition"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_listEntryDefinitionId_listDefinit_fkey" FOREIGN KEY ("listEntryDefinitionId", "listDefinitionId", "workspaceId") REFERENCES "ListEntryDefinition"("id", "listDefinitionId", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_attributeDefinitionId_listDefinit_fkey" FOREIGN KEY ("attributeDefinitionId", "listDefinitionId", "workspaceId") REFERENCES "AttributeDefinition"("id", "listDefinitionId", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_createdByActorId_fkey" FOREIGN KEY ("createdByActorId") REFERENCES "Actor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_updatedByActorId_fkey" FOREIGN KEY ("updatedByActorId") REFERENCES "Actor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_selectOptionId_attributeDefinitio_fkey" FOREIGN KEY ("selectOptionId", "attributeDefinitionId", "workspaceId") REFERENCES "SelectOption"("id", "attributeDefinitionId", "workspaceId") ON DELETE SET NULL ("selectOptionId") ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_statusOptionId_attributeDefinitio_fkey" FOREIGN KEY ("statusOptionId", "attributeDefinitionId", "workspaceId") REFERENCES "StatusOption"("id", "attributeDefinitionId", "workspaceId") ON DELETE SET NULL ("statusOptionId") ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_targetRecordDefinitionId_targetOb_fkey" FOREIGN KEY ("targetRecordDefinitionId", "targetObjectDefinitionId", "workspaceId") REFERENCES "RecordDefinition"("id", "objectDefinitionId", "workspaceId") ON DELETE SET NULL ("targetRecordDefinitionId", "targetObjectDefinitionId") ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_targetObjectDefinitionId_workspac_fkey" FOREIGN KEY ("targetObjectDefinitionId", "workspaceId") REFERENCES "ObjectDefinition"("id", "workspaceId") ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "ListEntryValueDefinition" ADD CONSTRAINT "ListEntryValueDefinition_targetActorId_workspaceId_fkey" FOREIGN KEY ("targetActorId", "workspaceId") REFERENCES "Actor"("id", "workspaceId") ON DELETE SET NULL ("targetActorId") ON UPDATE CASCADE;

-- 기능 : 참조 대상과 선언된 Workspace/List/Attribute 범위를 FK로 검증한다.
ALTER TABLE "AttributeDefinition" ADD CONSTRAINT "AttributeDefinition_listDefinitionId_workspaceId_fkey" FOREIGN KEY ("listDefinitionId", "workspaceId") REFERENCES "ListDefinition"("id", "workspaceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기능 : 참조 Record/Object 쌍이 일부만 입력되어 복합 FK 검증을 우회하지 못하게 한다.
ALTER TABLE "ListEntryValueDefinition"
  ADD CONSTRAINT "ListEntryValueDefinition_target_record_object_pair_check"
  CHECK (("targetRecordDefinitionId" IS NULL) = ("targetObjectDefinitionId" IS NULL));

-- 기능 : 테이블, 컬럼과 조회 키의 역할을 DB 주석으로 기록한다.
COMMENT ON TABLE "ListDefinition" IS 'Workspace 안에서 원본 Record를 업무 맥락으로 묶는 List 정의.';
COMMENT ON COLUMN "ListDefinition"."id" IS 'DB에서 gen_random_uuid()로 생성하는 row 고유 식별자.';
COMMENT ON COLUMN "ListDefinition"."workspaceId" IS '이 row가 속한 Workspace ID.';
COMMENT ON COLUMN "ListDefinition"."createdByActorId" IS '이 row를 생성한 Actor ID.';
COMMENT ON COLUMN "ListDefinition"."updatedByActorId" IS '이 row를 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "ListDefinition"."createdAt" IS 'UTC 생성 시각. DB 기본값은 현재 시각.';
COMMENT ON COLUMN "ListDefinition"."updatedAt" IS 'UTC 마지막 수정 시각. Prisma에서 갱신.';
COMMENT ON COLUMN "ListDefinition"."apiSlug" IS 'Workspace 안에서 중복되지 않는 코드용 List 이름.';
COMMENT ON COLUMN "ListDefinition"."name" IS '사용자에게 표시할 List 이름.';
COMMENT ON COLUMN "ListDefinition"."description" IS 'List의 업무 목적 설명.';
COMMENT ON COLUMN "ListDefinition"."icon" IS '화면 표시용 아이콘.';
COMMENT ON TABLE "ListEntryDefinition" IS '기존 Record가 특정 List에 등록된 개별 참여 항목. 원본 Record를 복사하지 않는다.';
COMMENT ON COLUMN "ListEntryDefinition"."id" IS 'DB에서 gen_random_uuid()로 생성하는 row 고유 식별자.';
COMMENT ON COLUMN "ListEntryDefinition"."workspaceId" IS '이 row가 속한 Workspace ID.';
COMMENT ON COLUMN "ListEntryDefinition"."createdByActorId" IS '이 row를 생성한 Actor ID.';
COMMENT ON COLUMN "ListEntryDefinition"."updatedByActorId" IS '이 row를 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "ListEntryDefinition"."createdAt" IS 'UTC 생성 시각. DB 기본값은 현재 시각.';
COMMENT ON COLUMN "ListEntryDefinition"."updatedAt" IS 'UTC 마지막 수정 시각. Prisma에서 갱신.';
COMMENT ON COLUMN "ListEntryDefinition"."listDefinitionId" IS '같은 Workspace에서 참여 항목이 등록된 List ID.';
COMMENT ON COLUMN "ListEntryDefinition"."recordDefinitionId" IS '같은 Workspace의 원본 Record ID.';
COMMENT ON TABLE "ListEntryValueDefinition" IS 'List 참여 항목의 List 전용 Attribute 실제 값. 다중값은 여러 row로 저장할 수 있다.';
COMMENT ON COLUMN "ListEntryValueDefinition"."id" IS 'DB에서 gen_random_uuid()로 생성하는 row 고유 식별자.';
COMMENT ON COLUMN "ListEntryValueDefinition"."workspaceId" IS '이 row가 속한 Workspace ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."createdByActorId" IS '이 row를 생성한 Actor ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."updatedByActorId" IS '이 row를 마지막으로 수정한 Actor ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."createdAt" IS 'UTC 생성 시각. DB 기본값은 현재 시각.';
COMMENT ON COLUMN "ListEntryValueDefinition"."updatedAt" IS 'UTC 마지막 수정 시각. Prisma에서 갱신.';
COMMENT ON COLUMN "ListEntryValueDefinition"."listDefinitionId" IS 'Entry와 Attribute가 함께 속한 List ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."listEntryDefinitionId" IS '이 값을 가진 List 참여 항목 ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."attributeDefinitionId" IS '같은 List와 Workspace에 속한 Attribute ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."attributeType" IS '값 생성 당시 Attribute 타입 snapshot.';
COMMENT ON COLUMN "ListEntryValueDefinition"."jsonValue" IS '주소, 통화, 이름 등 복합 값 원본.';
COMMENT ON COLUMN "ListEntryValueDefinition"."textValue" IS '검색과 정렬에 사용하는 문자열 값.';
COMMENT ON COLUMN "ListEntryValueDefinition"."numberValue" IS '필터와 정렬에 사용하는 숫자 값.';
COMMENT ON COLUMN "ListEntryValueDefinition"."booleanValue" IS '체크박스 true 또는 false 값.';
COMMENT ON COLUMN "ListEntryValueDefinition"."dateValue" IS '시간대 없는 날짜 값.';
COMMENT ON COLUMN "ListEntryValueDefinition"."timestampValue" IS 'UTC instant로 저장하는 날짜와 시간 값.';
COMMENT ON COLUMN "ListEntryValueDefinition"."selectOptionId" IS '같은 Attribute와 Workspace에서 선택한 SelectOption ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."statusOptionId" IS '같은 Attribute와 Workspace에서 선택한 StatusOption ID.';
COMMENT ON COLUMN "ListEntryValueDefinition"."targetRecordDefinitionId" IS '같은 Workspace의 참조 대상 Record ID. targetObjectDefinitionId와 함께 지정한다.';
COMMENT ON COLUMN "ListEntryValueDefinition"."targetObjectDefinitionId" IS '참조 대상 Record가 속한 Object ID. targetRecordDefinitionId와 함께 지정한다.';
COMMENT ON COLUMN "ListEntryValueDefinition"."targetActorId" IS '같은 Workspace의 참조 대상 Actor ID.';
COMMENT ON INDEX "ListDefinition_id_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "ListDefinition_workspaceId_apiSlug_key" IS '한 Workspace 안에서 List apiSlug 중복 방지.';
COMMENT ON INDEX "ListEntryDefinition_workspaceId_listDefinitionId_createdAt__idx" IS 'List 참여 항목과 Attribute 값의 조회 인덱스.';
COMMENT ON INDEX "ListEntryDefinition_workspaceId_recordDefinitionId_idx" IS 'List 참여 항목과 Attribute 값의 조회 인덱스.';
COMMENT ON INDEX "ListEntryDefinition_id_listDefinitionId_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "ListEntryValueDefinition_workspaceId_listEntryDefinitionId__idx" IS 'List 참여 항목과 Attribute 값의 조회 인덱스.';
COMMENT ON INDEX "ListEntryValueDefinition_workspaceId_listDefinitionId_attri_idx" IS 'List 참여 항목과 Attribute 값의 조회 인덱스.';
COMMENT ON INDEX "Actor_id_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "AttributeDefinition_id_listDefinitionId_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "ObjectDefinition_id_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "RecordDefinition_id_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "RecordDefinition_id_objectDefinitionId_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "SelectOption_id_attributeDefinitionId_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON INDEX "StatusOption_id_attributeDefinitionId_workspaceId_key" IS '복합 FK에서 참조 대상의 ID와 소속이 함께 일치하도록 제공하는 unique 키.';
COMMENT ON COLUMN "AttributeDefinition"."listDefinitionId" IS 'List 소속 Attribute의 ListDefinition ID. 같은 Workspace의 List를 FK로 참조한다. Object 소속이면 null.';
COMMENT ON CONSTRAINT "ListEntryValueDefinition_target_record_object_pair_check" ON "ListEntryValueDefinition" IS '참조 Record와 Object ID는 둘 다 null이거나 둘 다 지정되어야 한다.';

-- 기능 : 복합 FK의 SET NULL은 nullable 참조 ID만 비우도록 지정했다. Workspace와 Attribute 소속은 유지한다.
-- 기능 : 참조 Object FK는 transaction 종료 때 검사한다. Object 삭제로 Record가 cascade된 후 참조 Record/Object ID가 함께 해제될 수 있게 한다.
COMMIT;
