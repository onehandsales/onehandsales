-- 기능 : Company에는 자유 입력 주소를 추가하고 CompanyRegion에는 KR/US 표준 지역 code를 추가합니다.
ALTER TABLE "Company" ADD COLUMN "address" TEXT;
ALTER TABLE "CompanyRegion" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "CompanyRegion" ADD COLUMN "regionCode" TEXT;

-- 기능 : 기존 한국 지역명은 삭제 없이 가능한 경우 KR 시/도 code로 자동 보강합니다.
UPDATE "CompanyRegion"
SET
  "countryCode" = 'KR',
  "regionCode" = CASE
    WHEN "region" LIKE '%서울%' THEN 'KR-11'
    WHEN "region" LIKE '%부산%' THEN 'KR-26'
    WHEN "region" LIKE '%대구%' THEN 'KR-27'
    WHEN "region" LIKE '%인천%' THEN 'KR-28'
    WHEN "region" LIKE '%광주%' THEN 'KR-29'
    WHEN "region" LIKE '%대전%' THEN 'KR-30'
    WHEN "region" LIKE '%울산%' THEN 'KR-31'
    WHEN "region" LIKE '%세종%' THEN 'KR-50'
    WHEN "region" LIKE '%경기%' THEN 'KR-41'
    WHEN "region" LIKE '%강원%' THEN 'KR-42'
    WHEN "region" LIKE '%충북%' OR "region" LIKE '%충청북%' THEN 'KR-43'
    WHEN "region" LIKE '%충남%' OR "region" LIKE '%충청남%' THEN 'KR-44'
    WHEN "region" LIKE '%전북%' OR "region" LIKE '%전라북%' THEN 'KR-45'
    WHEN "region" LIKE '%전남%' OR "region" LIKE '%전라남%' THEN 'KR-46'
    WHEN "region" LIKE '%경북%' OR "region" LIKE '%경상북%' THEN 'KR-47'
    WHEN "region" LIKE '%경남%' OR "region" LIKE '%경상남%' THEN 'KR-48'
    WHEN "region" LIKE '%제주%' THEN 'KR-49'
    ELSE NULL
  END
WHERE
  "region" LIKE '%서울%'
  OR "region" LIKE '%부산%'
  OR "region" LIKE '%대구%'
  OR "region" LIKE '%인천%'
  OR "region" LIKE '%광주%'
  OR "region" LIKE '%대전%'
  OR "region" LIKE '%울산%'
  OR "region" LIKE '%세종%'
  OR "region" LIKE '%경기%'
  OR "region" LIKE '%강원%'
  OR "region" LIKE '%충북%'
  OR "region" LIKE '%충청북%'
  OR "region" LIKE '%충남%'
  OR "region" LIKE '%충청남%'
  OR "region" LIKE '%전북%'
  OR "region" LIKE '%전라북%'
  OR "region" LIKE '%전남%'
  OR "region" LIKE '%전라남%'
  OR "region" LIKE '%경북%'
  OR "region" LIKE '%경상북%'
  OR "region" LIKE '%경남%'
  OR "region" LIKE '%경상남%'
  OR "region" LIKE '%제주%';

-- 기능 : 매핑 실패 row는 region 문자열을 그대로 두고 countryCode/regionCode를 null로 유지합니다.
CREATE INDEX "CompanyRegion_userId_countryCode_regionCode_idx"
  ON "CompanyRegion"("userId", "countryCode", "regionCode");

COMMENT ON COLUMN "Company"."address" IS '기능 : 회사 상세 주소를 국가별 강제 검증 없이 자유 입력으로 저장합니다.';
COMMENT ON COLUMN "CompanyRegion"."countryCode" IS '기능 : 회사 지역이 속한 KR/US 국가 코드를 저장하고 legacy custom 지역은 null을 허용합니다.';
COMMENT ON COLUMN "CompanyRegion"."regionCode" IS '기능 : KR 시/도 또는 US State 표준 code를 저장하고 매핑 실패 custom 지역은 null을 유지합니다.';
COMMENT ON INDEX "CompanyRegion_userId_countryCode_regionCode_idx" IS '기능 : 사용자별 표준 회사 지역 code 조회를 지원합니다.';
