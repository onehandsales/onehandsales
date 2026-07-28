-- 기능 : 기존 Product/Deal 정수 금액에 통화 의미를 보존하는 컬럼을 추가합니다.
ALTER TABLE "Product" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'KRW';

ALTER TABLE "Deal" ADD COLUMN "currencyCode" TEXT NOT NULL DEFAULT 'KRW';

COMMENT ON COLUMN "Product"."currencyCode" IS '기능 : 제품 금액이 어떤 통화 기준인지 보존합니다.';

COMMENT ON COLUMN "Deal"."currencyCode" IS '기능 : 딜 금액이 어떤 통화 기준인지 보존합니다.';
