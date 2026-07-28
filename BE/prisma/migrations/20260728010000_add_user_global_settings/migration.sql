-- 기능 : 사용자 앱 글로벌 설정을 저장할 기본 국가와 기본 통화 컬럼을 추가한다.
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "countryCode" TEXT NOT NULL DEFAULT 'KR',
ADD COLUMN IF NOT EXISTS "defaultCurrencyCode" TEXT NOT NULL DEFAULT 'KRW';

COMMENT ON COLUMN "User"."countryCode" IS '사용자의 기본 국가 코드이며 글로벌 입력값 기본값에 사용한다.';
COMMENT ON COLUMN "User"."defaultCurrencyCode" IS '사용자의 기본 통화 코드이며 금액 입력 기본값에 사용한다.';
