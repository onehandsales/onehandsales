# G06 Company Region Address

상태: Not Started
목표: Company 지역/주소를 KR/US 글로벌 code 기반으로 보강한다.

## 1. 포함 범위

- Company에만 주소/지역 글로벌화 적용
- 기존 `CompanyRegion` 유지
- `CompanyRegion.countryCode`
- `CompanyRegion.regionCode`
- Company address 자유 입력
- KR 시/도, US State 목록
- 기존 한국 CompanyRegion 자동 매핑
- 매핑 실패 legacy custom region 유지

## 2. 제외 범위

- Contact 주소/지역 필드 추가
- Deal 주소 필드 추가
- 국가별 상세 주소 검증
- JP/TW/CN region 지원
- 전 세계 region 목록

## 3. Backend 작업

1. Prisma schema에 Company/CompanyRegion 변경을 반영한다.
2. 기존 CompanyRegion을 유지한다.
3. KR/US region code dictionary를 정의한다.
4. 기존 한국 지역명을 가능한 경우 `KR-*` code로 migration한다.
5. 매핑 실패 region은 삭제/수정하지 않는다.
6. Company/CompanyRegion API response에 code를 포함한다.
7. Company create/update validation을 보강한다.

## 4. Frontend 작업

1. Company type/API client를 갱신한다.
2. Company create/edit form에서 Country와 Region 선택을 제공한다.
3. Region은 locale별 표시명으로 보여준다.
4. Address는 자유 입력으로 제공한다.
5. Contact 화면에는 주소/지역 입력을 추가하지 않는다.

## 5. Request 계약

Company create/update 요청은 Company 주소와 region 선택을 포함한다.

```json
{
  "companyName": "Onehand",
  "companyRegionId": "region-id",
  "address": "강남구 테헤란로 123"
}
```

CompanyRegion 생성/수정 또는 표준 region 선택 계약은 기존 API 구조와 G01 검토 결과에 맞춰 확정한다.

```json
{
  "region": "서울",
  "countryCode": "KR",
  "regionCode": "KR-11"
}
```

## 6. Response 계약

Company/CompanyRegion 응답은 locale 표시명 변환에 필요한 code를 포함한다.

```json
{
  "companyRegion": {
    "region": "서울",
    "countryCode": "KR",
    "regionCode": "KR-11"
  },
  "address": "강남구 테헤란로 123"
}
```

에러 후보:

```json
{
  "code": "COMPANY_REGION_UNSUPPORTED",
  "field": "regionCode"
}
```

## 7. Business Logic

- Company에만 주소/지역 글로벌화를 적용한다.
- Contact에는 주소/지역 필드를 추가하지 않는다.
- KR 시/도와 US State만 1차 지원한다.
- 기존 `CompanyRegion.region`은 legacy 표시명으로 유지한다.
- 기존 한국 지역명은 가능한 경우 region code로 자동 매핑한다.
- 매핑 실패 region은 legacy custom region으로 보존한다.

## 8. User Flow

1. 사용자가 Company form에서 Country를 KR 또는 US로 선택한다.
2. Country에 맞는 Region 목록을 선택한다.
3. Address는 자유 입력한다.
4. 저장 후 목록/상세/export에서는 locale별 region 표시명이 보인다.
5. 기존 custom region은 code가 없어도 기존 문자열로 계속 보인다.

## 9. DB/Prisma 영향

필수 참조:

- `BE/prisma/schema.prisma`의 `model Company`
- `BE/prisma/schema.prisma`의 `model CompanyRegion`
- 기존 Company migration
- `BE/prisma/seed.ts`

DB 변경:

- Company address 필드 또는 G01에서 확정한 기존 구조 연결
- `CompanyRegion.countryCode`
- `CompanyRegion.regionCode`

주석 필수:

- Prisma schema 새 column에 `/// 기능 : ...` 주석을 추가한다.
- migration SQL에 `COMMENT ON COLUMN`을 추가한다.
- 새 index가 있으면 `COMMENT ON INDEX`를 추가한다.
- 자동 mapping과 legacy custom region 보존 의도를 migration 주석에 남긴다.

## 10. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test -- company
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 11. Goal 검토 체크리스트

- [ ] Company에만 주소/지역 글로벌화가 적용됐다.
- [ ] Contact에는 주소/지역 필드를 추가하지 않았다.
- [ ] 기존 CompanyRegion 구조가 유지된다.
- [ ] countryCode/regionCode가 추가됐다.
- [ ] Company/CompanyRegion request가 국가/지역 code를 처리한다.
- [ ] Company/CompanyRegion response가 locale 표시명 변환에 필요한 code를 포함한다.
- [ ] business logic이 mapping 실패 데이터 보존을 따른다.
- [ ] user flow에서 Country 선택 후 Region 목록이 바뀐다.
- [ ] `BE/prisma`를 참고했고 신규 column/index에 한글 주석이 있다.
- [ ] KR/US region dictionary가 있다.
- [ ] 기존 한국 region 자동 매핑이 있다.
- [ ] 매핑 실패 region은 legacy custom region으로 유지된다.
- [ ] 신규 코드에 한글 주석 규칙이 적용됐다.
- [ ] 실행한 검증 결과를 기록했다.
