-- 기능 : Contact.mobile을 유지하면서 KR/US 글로벌 전화번호 필드를 추가합니다.
ALTER TABLE "Contact" ADD COLUMN "phoneCountryCode" TEXT;
ALTER TABLE "Contact" ADD COLUMN "phoneNationalNumber" TEXT;
ALTER TABLE "Contact" ADD COLUMN "phoneE164" TEXT;

-- 기능 : 기존 한국 휴대폰 형식은 삭제 없이 KR national/E.164 값으로 자동 보강합니다.
UPDATE "Contact"
SET
  "phoneCountryCode" = 'KR',
  "phoneNationalNumber" = regexp_replace("mobile", '\D', '', 'g'),
  "phoneE164" = '+82' || substring(regexp_replace("mobile", '\D', '', 'g') from 2)
WHERE regexp_replace("mobile", '\D', '', 'g') ~ '^010[0-9]{8}$';

-- 기능 : 변환 실패 row는 mobile을 그대로 두고 신규 필드를 null로 유지해 legacy fallback 표시가 가능하게 합니다.
CREATE INDEX "Contact_userId_phoneE164_idx" ON "Contact"("userId", "phoneE164");

COMMENT ON COLUMN "Contact"."phoneCountryCode" IS '기능 : 담당자 전화번호가 속한 KR/US 국가 코드를 저장합니다.';
COMMENT ON COLUMN "Contact"."phoneNationalNumber" IS '기능 : 국가별 표준 national number 숫자 문자열을 저장합니다.';
COMMENT ON COLUMN "Contact"."phoneE164" IS '기능 : 검색/중복/외부 연동 기준이 되는 E.164 전화번호를 저장합니다.';
