-- 기능 : 작업 범위를 AttributeDefinition 확장으로 정정하고 추가했던 빈 ListDefinition 기반을 되돌린다.
BEGIN;

-- 1. 검증 이후 새 List 데이터가 들어오지 않도록 두 테이블을 같은 transaction에서 잠근다.
LOCK TABLE "ListDefinition", "AttributeDefinition" IN ACCESS EXCLUSIVE MODE;

-- 2. 추가했던 List 기반이 비어 있을 때만 되돌린다. 데이터가 있으면 전체 migration을 중단한다.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "ListDefinition")
       OR EXISTS (SELECT 1 FROM "AttributeDefinition" WHERE "listDefinitionId" IS NOT NULL) THEN
        RAISE EXCEPTION 'ListDefinition 또는 List 소속 Attribute에 데이터가 있어 범위 정정을 중단합니다.';
    END IF;
END;
$$;

-- 3. List FK와 빈 List 테이블만 제거한다. Attribute 컬럼, CHECK, unique와 인덱스는 유지한다.
ALTER TABLE "AttributeDefinition"
    DROP CONSTRAINT "AttributeDefinition_listDefinitionId_workspaceId_fkey";
DROP TABLE "ListDefinition";

-- 4. List 테이블과 FK는 후속 작업이라는 현재 구현 범위를 주석에 기록한다.
COMMENT ON TABLE "AttributeDefinition" IS 'Object 또는 후속 List에 속하는 공용 필드 정의. List 테이블과 FK 연결은 후속 작업.';
COMMENT ON COLUMN "AttributeDefinition"."listDefinitionId" IS '후속 List 소속 Attribute의 List ID. 현재는 UUID 컬럼만 준비했으며 List 테이블과 FK는 후속 작업.';

COMMIT;
