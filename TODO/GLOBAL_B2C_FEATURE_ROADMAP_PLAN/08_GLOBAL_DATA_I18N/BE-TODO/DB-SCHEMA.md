# DB Schema TODO

상태: G08 Done

## 1. User

기존:

- `preferredLocale`
- `timeZone`
- `signupLocale`
- `signupCountryCode`
- `signupTimeZone`
- `lastLoginLocale`
- `lastLoginCountryCode`
- `lastLoginTimeZone`

추가 후보:

- `countryCode String @default("KR")`
- `defaultCurrencyCode String @default("KRW")`

정책:

- `preferredLocale`은 `ko-KR`, `en`만 1차 허용한다.
- `timeZone`은 IANA timezone ID다.
- `countryCode`는 `KR`, `US`만 1차 허용한다.
- `defaultCurrencyCode`는 `KRW`, `USD`만 1차 허용한다.

## 2. OAuthProvider / UserOAuthAccount

현재 enum:

```prisma
enum OAuthProvider {
  KAKAO
  GOOGLE
  APPLE
  LINE
}
```

정책:

- `KAKAO`는 legacy 호환을 위해 남기되 runtime provider로 노출하지 않는다.
- `APPLE`은 runtime provider로 활성화됐다.
- `LINE`은 신규 enum/migration으로 추가됐다.
- `@@unique([provider, providerUserId])`는 유지한다.
- 자동 연결은 verified email lowercase 비교로 처리한다.
- provider email이 없으면 `User`를 만들지 않는다.

## 3. Product / Deal Currency

추가 후보:

```prisma
model Product {
  productPrice Int
  currencyCode String @default("KRW")
}

model Deal {
  dealCost Int
  currencyCode String @default("KRW")
}
```

정책:

- 기존 정수 금액은 유지한다.
- 기존 데이터는 `KRW` default로 의미를 보존한다.
- 1차 허용 통화는 `KRW`, `USD`다.
- USD minor unit/cent는 후속이다.
- Deal은 Product currency를 기본값으로 가져오되 변경 가능하다.

## 4. Contact Phone

기존:

- `mobile String`

추가 후보:

```prisma
model Contact {
  mobile              String
  phoneCountryCode    String?
  phoneNationalNumber String?
  phoneE164           String?
}
```

정책:

- `mobile`은 legacy fallback으로 유지한다.
- 신규/수정 로직은 글로벌 필드를 우선 사용한다.
- 1차 지원 국가는 `KR`, `US`다.
- 변환 가능한 기존 `010-1234-5678` 데이터는 `KR`, `01012345678`, `+821012345678`로 자동 migration한다.
- 변환 실패 데이터는 삭제/수정하지 않고 `mobile` fallback으로 유지한다.
- `phoneE164`는 검색/중복/외부 연동 기준이다.

## 5. Company / CompanyRegion / Address

기존:

- Company는 `companyRegionId`로 사용자 커스텀 `CompanyRegion`을 참조한다.
- Contact에는 주소/지역 필드가 없다.

추가 후보:

```prisma
model Company {
  address String?
}

model CompanyRegion {
  region      String
  countryCode String?
  regionCode  String?
}
```

정책:

- Company에만 주소/지역 글로벌화를 적용한다.
- Contact 개인 주소는 추가하지 않는다.
- 기존 `CompanyRegion.region`은 legacy 표시명으로 유지한다.
- 신규 표준 지역은 `countryCode`, `regionCode`로 저장한다.
- KR 시/도와 US State만 1차 제공한다.
- 기존 한국 지역명은 가능한 경우 자동 매핑한다.
- 매핑 실패 데이터는 legacy custom region으로 유지한다.

예시:

```text
서울 -> countryCode KR, regionCode KR-11
경기 -> countryCode KR, regionCode KR-41
California -> countryCode US, regionCode US-CA
```

## 6. Import/Export

- 별도 ExportJob table은 추가하지 않는다.
- 기존 도메인별 export API를 locale-aware하게 보강한다.
- Import template은 `locale` 파라미터와 locale별 header dictionary를 사용한다.
- 필요하면 template metadata에 locale을 추가하되, 08에서는 우선 기존 `ImportTemplate` 구조와 충돌 여부를 G01에서 확인한다.

## 7. Migration 주의

- 기존 migration 파일은 수정하지 않는다.
- 신규 migration에는 한글 의도 주석 또는 DB COMMENT를 남긴다.
- 운영/공유 DB에 무단 `migrate dev`, `migrate deploy`, `seed`를 실행하지 않는다.
- migration은 기존 한국 데이터 보존을 최우선으로 한다.
- 자동 mapping 실패 row는 삭제하지 않는다.
- enum 추가는 application mapping, seed, test까지 함께 갱신한다.

## 8. 새 Table 작성 기준

08의 현재 확정 범위는 새 table보다 기존 table column 보강이 중심이다. 그래도 G01 검토 또는 구현 중 새 table이 필요하다고 판단되면 아래 기준을 반드시 따른다.

필수 참조:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`
- 관련 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/*.md`

Prisma schema 필수:

- model 바로 위에 `/// 기능 : ...` 주석을 추가한다.
- 새 column마다 의도를 설명하는 `/// 기능 : ...` 주석을 추가한다.
- relation, index, unique 제약은 user ownership과 조회 패턴을 설명한다.

Migration SQL 필수:

- table 생성 전 `-- 기능 : ...` 주석을 추가한다.
- `COMMENT ON TABLE`을 추가한다.
- 모든 새 column에 `COMMENT ON COLUMN`을 추가한다.
- 주요 index에는 `COMMENT ON INDEX`를 추가한다.

금지:

- 기존 migration 파일 수정
- provider token, phone/email 원문, raw response 같은 민감값을 주석/log에 기록
- user ownership이 없는 사용자 데이터 table 생성
