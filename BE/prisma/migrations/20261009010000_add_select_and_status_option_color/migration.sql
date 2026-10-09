-- 기능 : SelectOption과 StatusOption에 nullable 화면 표시용 색상을 추가합니다.
BEGIN;

-- 1. 선택 옵션에 기본값 없는 nullable 문자열 색상을 추가합니다.
ALTER TABLE "SelectOption"
  ADD COLUMN "color" TEXT;

COMMENT ON COLUMN "SelectOption"."color" IS '옵션의 화면 표시용 색상. 미지정이면 null.';

-- 2. 상태 옵션에 기본값 없는 nullable 문자열 색상을 추가합니다.
ALTER TABLE "StatusOption"
  ADD COLUMN "color" TEXT;

COMMENT ON COLUMN "StatusOption"."color" IS '상태의 화면 표시용 색상. 미지정이면 null.';

COMMIT;
