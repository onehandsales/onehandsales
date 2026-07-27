# G05 Contact Phone Global

상태: Not Started
목표: Contact 전화번호를 KR/US 글로벌 입력/저장/표시 구조로 전환한다.

## 1. 포함 범위

- 기존 `Contact.mobile` 유지
- `phoneCountryCode`
- `phoneNationalNumber`
- `phoneE164`
- KR/US 입력/검증/표시
- 기존 한국 `mobile` 자동 migration
- 변환 실패 legacy fallback
- Contact export/search/중복 기준 보강

## 2. 제외 범위

- 전 세계 전화번호 국가 선택
- SMS 발신 provider 연동 변경
- Contact 개인 주소
- 기존 `mobile` 즉시 제거

## 3. Backend 작업

1. Prisma schema에 글로벌 전화번호 필드를 추가한다.
2. 신규 migration을 작성한다.
3. 기존 `010-1234-5678` 형태를 KR/E.164로 자동 변환한다.
4. 변환 실패 데이터는 `mobile`을 보존한다.
5. create/update DTO에 글로벌 전화번호 필드를 추가한다.
6. KR/US validation을 구현한다.
7. 검색/중복/Export에서 `phoneE164` 우선, `mobile` fallback을 적용한다.

## 4. Frontend 작업

1. Contact type/API client/schema를 갱신한다.
2. Contact create/edit form에 KR/US country 선택과 전화번호 입력을 적용한다.
3. 기존 `010-0000-0000` 전용 validation copy를 locale-aware 문구로 바꾼다.
4. Contact detail/list/export 표시가 글로벌 필드 우선, mobile fallback을 따른다.

## 5. Request 계약

Contact create/update 요청은 글로벌 전화번호 필드를 포함한다.

```json
{
  "username": "John",
  "phoneCountryCode": "US",
  "phoneNationalNumber": "4155551234",
  "phoneE164": "+14155551234"
}
```

기존 `mobile`은 legacy 호환을 위해 유지한다.

## 6. Response 계약

Contact 목록/상세/검색/export 관련 응답은 글로벌 필드와 legacy fallback을 함께 처리한다.

```json
{
  "mobile": "010-1234-5678",
  "phoneCountryCode": "KR",
  "phoneNationalNumber": "01012345678",
  "phoneE164": "+821012345678"
}
```

에러 후보:

```json
{
  "code": "CONTACT_PHONE_INVALID",
  "field": "phone"
}
```

## 7. Business Logic

- 신규 입력은 KR/US만 허용한다.
- `phoneE164`는 검색/중복/외부 연동 기준이다.
- 표시와 Export는 글로벌 필드 우선, `mobile` fallback이다.
- 기존 `010-1234-5678`은 가능한 경우 자동 migration한다.
- 변환 실패 데이터는 삭제하지 않는다.

## 8. User Flow

1. 사용자가 Contact form에서 KR 또는 US를 선택한다.
2. 전화번호를 입력한다.
3. FE가 국가별 기본 형식을 돕고 BE가 최종 검증한다.
4. 저장 후 목록/상세에는 사람이 읽기 쉬운 번호가 보인다.
5. legacy `mobile`만 있는 Contact도 기존 번호가 계속 보인다.

## 9. DB/Prisma 영향

필수 참조:

- `BE/prisma/schema.prisma`의 `model Contact`
- 기존 Contact migration
- `BE/prisma/seed.ts`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/CONTACT_SCHEMA.md`

DB 변경:

- `Contact.phoneCountryCode`
- `Contact.phoneNationalNumber`
- `Contact.phoneE164`

주석 필수:

- Prisma schema 새 column에 `/// 기능 : ...` 주석을 추가한다.
- migration SQL에 `COMMENT ON COLUMN`을 추가한다.
- migration에 자동 변환과 실패 fallback 의도를 주석으로 남긴다.

## 10. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test -- contact
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 11. Goal 검토 체크리스트

- [ ] 기존 `mobile`이 유지된다.
- [ ] 글로벌 전화번호 필드 3개가 추가됐다.
- [ ] KR/US 입력과 검증이 있다.
- [ ] Contact request가 글로벌 전화번호 필드를 받는다.
- [ ] Contact response가 글로벌 필드와 legacy fallback을 포함한다.
- [ ] business logic이 E.164 우선 기준을 따른다.
- [ ] user flow에서 KR/US 선택과 legacy 표시가 동작한다.
- [ ] `BE/prisma`를 참고했고 신규 column에 한글 주석이 있다.
- [ ] 기존 한국 번호 자동 migration이 있다.
- [ ] 변환 실패 데이터는 보존된다.
- [ ] Contact UI가 legacy fallback을 표시한다.
- [ ] Contact export가 Phone, Phone Country, Phone E.164를 준비한다.
- [ ] 신규 코드에 한글 주석 규칙이 적용됐다.
- [ ] 실행한 검증 결과를 기록했다.
