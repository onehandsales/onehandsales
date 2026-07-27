# Scope

상태: Confirmed

## 1. 포함 범위

| 항목 | 내용 |
|---|---|
| `/app` 내부 i18n | `/app` route prefix 없이 `ko-KR`, `en` UI를 지원한다. |
| 사용자 글로벌 설정 | `preferredLocale`, `timeZone`, `countryCode`, `defaultCurrencyCode`를 설정 화면과 API로 관리한다. |
| 날짜/시간 | DB UTC/API ISO 유지, FE locale/timezone 표시를 적용한다. |
| 통화 | Product/Deal에 `currencyCode`를 추가하고 `KRW`, `USD`만 1차 허용한다. |
| Contact 전화번호 | 기존 `mobile` 유지, `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`를 추가한다. |
| 전화번호 migration | 기존 한국 휴대폰 번호는 가능한 경우 자동 변환하고 실패 데이터는 legacy fallback으로 유지한다. |
| Company 지역/주소 | Company에만 `KR`, `US` 기준 국가/지역/자유 입력 주소를 적용한다. |
| CompanyRegion 글로벌화 | 기존 `CompanyRegion` 유지, `countryCode`, `regionCode`를 추가한다. |
| Import/Export 현지화 | 사용자 앱 설정 기준 표시와 `ko-KR`, `en` 템플릿 선택을 지원한다. |
| Apple login | 08에서 실제 provider로 구현한다. |
| LINE login | 08에서 실제 provider로 구현한다. |
| 글로벌 UX writing | 한국어/영어 모두 간결하고 사용자 친화적인 문구를 적용한다. |
| 코드 주석 | 신규/수정 코드에 Backend/Frontend 한글 주석 규칙을 적용한다. |

## 2. 제외 범위

| 항목 | 이유 |
|---|---|
| 결제 국가/세금 | 12에서 다룬다. |
| 마케팅 사이트 전체 rewrite | public/auth locale은 기존 흐름을 유지한다. |
| `/app` locale URL prefix | 로그인 후 앱은 사용자 설정 기반 locale로 처리한다. |
| `ja`, `zh-TW` 앱 내부 번역 | 1차 MVP는 `ko-KR`, `en`만 지원한다. |
| 중국 본토 `zh-CN` | 현재 글로벌 후보가 아니다. |
| 국가별 상세 주소 검증 | 08 MVP에서는 국가/지역 코드와 자유 입력 주소까지만 다룬다. |
| Contact 개인 주소 | Contact는 Company 소속으로 지역 맥락을 간접 사용한다. |
| USD cent/minor unit | 1차는 기존 정수 금액을 유지한다. |
| 전 세계 국가/통화/전화번호 | 1차는 KR/US, KRW/USD로 제한한다. |
| 이메일/비밀번호 로그인 | 기존 소셜 OAuth 흐름만 유지한다. |
| Microsoft login | 08 provider 대상이 아니다. |
| Kakao runtime 복구 | Kakao는 legacy enum/데이터 호환만 유지한다. |

## 3. 완료 기준

- `/app` 핵심 업무 화면이 `ko-KR`, `en`으로 표시된다.
- `/app/settings`에서 Language, Time zone, Country, Default currency를 저장하고 즉시 반영한다.
- Product/Deal 금액에 통화 코드가 저장되고 표시/Import/Export에 반영된다.
- Contact 전화번호가 KR/US 입력, E.164 저장, legacy fallback을 지원한다.
- 기존 한국 Contact `mobile` 데이터와 CompanyRegion 데이터가 손실 없이 migration된다.
- Company 지역/주소가 KR/US code 기반으로 동작한다.
- Import 템플릿은 `ko-KR`, `en` 중 선택 가능하다.
- Export는 사용자 앱 설정값 기준으로 헤더와 값을 출력한다.
- Google/LINE/Apple provider가 로그인/회원가입 화면과 Backend exchange에서 동작한다.
- 같은 verified email의 provider 계정은 기존 User에 연결된다.
- email 없는 provider 로그인은 사용자 친화적인 메시지로 차단된다.
- BE validation은 code/field 중심이고 FE가 locale별 문구를 표시한다.
- 신규/수정 코드에 한국어 주석 규칙이 적용된다.

## 4. UX/UI 기준

- `AGENT/UXUI_AGENT`를 따른다.
- Notion식 workspace/page/database/detail 구조와 Attio식 CRM record/linked record 맥락을 유지한다.
- 화면을 새 시각 시스템으로 갈아엎지 않는다.
- 로그인/회원가입 화면은 소셜 버튼 영역만 변경한다.
- 한국어는 해요체, 영어는 짧고 자연스러운 B2C 업무툴 톤을 사용한다.
- 긴 영어 문구는 짧게 쓰고, UI는 줄바꿈/ellipsis로 깨짐을 막는다.

## 5. Software 기준

- `AGENT/SOFTWARE_AGENT`를 따른다.
- Backend API는 contract, transaction, observability, ownership을 명시한다.
- Frontend는 `/admin/api/*`를 호출하지 않는다.
- 날짜/시간은 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.
- Backend 신규 controller/use case/repository/helper에는 한글 주석 규칙을 적용한다.
- Frontend 신규 component/hook/event handler/API client에는 `// 기능 : ...` 주석을 적용한다.
