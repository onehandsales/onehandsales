# Decision Log

상태: Confirmed
확정일: 2026-07-27

## 1. 사용자 결정

| 항목 | 결정 |
|---|---|
| 실행 방식 | 08 전체를 하나의 `/goal`로 처리하지 않고 작은 goal 단위로 나눠 실행한다. |
| UX/UI 기준 | `AGENT/UXUI_AGENT`를 따른다. |
| Software 기준 | `AGENT/SOFTWARE_AGENT`를 따른다. |
| 코드 주석 | 신규/수정 코드에는 한국어 주석 규칙을 적용한다. |
| `/app` URL | 로그인 후 앱 URL에는 locale prefix를 넣지 않는다. |
| 1차 앱 언어 | `ko-KR`, `en`만 먼저 지원한다. |
| 앱 언어 저장 | 서버 `User.preferredLocale`을 정본으로 사용한다. |
| 언어 변경 | `/app/settings` 저장 즉시 현재 화면에 반영한다. |
| 사용자 글로벌 설정 | Language, Time zone, Country, Default currency를 사용자가 직접 바꿀 수 있다. |
| 사용자 국가/통화 | `User.countryCode`, `User.defaultCurrencyCode`를 DB에 명시 저장한다. |
| 신규 가입 기본값 | 브라우저 locale, proxy geo country, 브라우저 timezone으로 추론하고 없으면 한국 기본값을 사용한다. |
| 날짜/시간 | DB는 UTC, API는 ISO 유지, FE가 사용자 locale/timezone 기준으로 표시한다. |
| Product/Deal 통화 | Product와 Deal 각각 `currencyCode`를 저장한다. |
| 허용 통화 | 1차는 `KRW`, `USD`만 허용한다. |
| 금액 입력 | 1차는 기존 정수 금액을 유지한다. |
| Deal 통화 기본값 | Product 통화를 기본으로 가져오고 Deal에서 변경 가능하다. |
| Contact 전화번호 | 기존 `mobile`을 유지하고 글로벌 전화번호 필드를 추가한다. |
| 전화번호 필드 | `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`를 추가한다. |
| 전화번호 국가 | 1차는 `KR`, `US`만 지원한다. |
| 기존 전화번호 migration | 변환 가능한 한국 `mobile`은 자동 migration한다. 실패 데이터는 fallback으로 유지한다. |
| Import/Export 기본 형식 | 사용자 앱 설정값을 기준으로 한다. |
| Import template | `ko-KR`, `en` 템플릿을 선택 가능하게 한다. |
| Apple/LINE | 08에서 실제 로그인 provider로 구현한다. |
| OAuth 버튼 | Google -> LINE -> Apple 순서의 카드형 3개 버튼을 항상 노출한다. |
| Auth UI 범위 | 기존 Google 로그인 버튼 영역만 수정한다. 이메일 로그인은 추가하지 않는다. |
| Provider 환경변수 | 사용자가 운영 전에 모두 설정하는 전제다. 누락/실패 시 일반 실패 메시지를 표시한다. |
| Account linking | 같은 verified email이면 기존 User에 provider 계정을 연결한다. |
| Provider email 없음 | 가입/로그인을 차단한다. |
| Provider email 다름 | 다른 이메일로 보고 신규 User를 생성한다. |
| Email 비교 | lowercase 정규화 기준으로 비교한다. |
| 주소/지역 국가 | 1차는 `KR`, `US`만 지원한다. |
| 주소/지역 범위 | Company에만 먼저 적용한다. Contact에는 주소/지역 필드를 추가하지 않는다. |
| 지역 입력 | KR 시/도, US State 선택 목록을 제공한다. |
| 지역 저장 | 표시명이 아니라 region code를 저장한다. |
| CompanyRegion | 기존 사용자 커스텀 구조를 유지하고 `countryCode`, `regionCode`를 추가한다. |
| 기존 CompanyRegion migration | 알 수 있는 한국 시/도 이름은 자동 매핑한다. 실패 데이터는 legacy custom region으로 유지한다. |
| `/app` 번역 범위 | 핵심 업무 화면 전체에 적용한다. |
| 번역 리소스 | 도메인별 namespace 구조를 사용한다. public-site i18n과 분리한다. |
| UX writing | 한국어/영어 모두 간결하고 사용자 친화적으로 작성한다. |
| 긴 영어 문구 | 번역을 짧게 만들고 UI는 줄바꿈/ellipsis로 깨짐을 막는다. |
| Validation error | BE는 code/field 중심, FE가 locale별 문구를 표시한다. |

## 2. 기존 정책 변경

08에서 아래 기존 문서 정책은 갱신 대상이다.

| 기존 정책 | 08 변경 |
|---|---|
| 현재 활성 auth provider는 Google only | Google, LINE, Apple을 실제 provider로 구현 |
| Apple/LINE은 future provider 후보 | 08 구현 범위에 포함 |
| 신규/기존 사용자 판정은 이메일이 아니라 `provider + providerUserId` 기준 | 기존 provider 계정이 없으면 verified email lowercase로 기존 User 연결 가능 |
| `/app`은 한국어 중심 | `/app` 핵심 업무 화면은 `ko-KR`, `en` 지원 |
| Contact `mobile`은 한국 휴대폰 형식 | 글로벌 전화번호 필드 추가, `mobile`은 legacy fallback |
| Product/Deal 금액은 KRW 전제 | `currencyCode`로 KRW/USD 명시 |

## 3. 제품 판단

08은 Global B2C 첫 판매를 위한 기반 작업이다. 사용자가 결제 전후로 실제 영업 데이터를 입력할 때 한국 전용 형식에 막히지 않아야 한다.

따라서 08의 우선순위는 다음이다.

1. 기존 한국 사용자 데이터와 UX를 깨지 않는다.
2. 미국/캐나다 영어 사용자가 `/app` 핵심 업무 흐름을 사용할 수 있다.
3. 금액, 전화번호, 날짜/시간, 지역이 데이터 모델 차원에서 국가별 의미를 잃지 않는다.
4. Google/LINE/Apple OAuth를 글로벌 진입 provider로 준비한다.
5. public/auth i18n과 `/app` i18n을 섞지 않는다.

## 4. 후속으로 남긴 결정

| 항목 | 후속 위치 |
|---|---|
| 보류 locale 앱 내부 번역 | KR/US/CA 이후 보류 시장 판매 goal |
| `zh-CN` 중국 본토 지원 | 별도 시장 진입 결정 |
| 전 세계 국가/통화/전화번호 | CA/CAD/캐나다 전화번호 우선 후속 및 이후 글로벌 국가 확장 goal |
| USD cent/minor unit | 금액 정밀도 개선 goal |
| 국가별 상세 주소 검증 | 주소 품질/배송/세금 필요 시 후속 |
| Contact 개인 주소 | CRM 확장 요구가 명확해질 때 후속 |
| 이메일/비밀번호 로그인 | 별도 auth strategy 결정 |
| Kakao runtime 복구 | 현재 범위 밖 |

## 5. G10 구현 확인

- 2026-07-28: G01~G10 구현과 QA closeout을 완료했다.
- Google/LINE/Apple은 runtime provider로 구현됐고 Kakao는 legacy enum/과거 데이터 호환으로만 유지한다.
- `/app` 내부는 locale prefix 없이 `ko-KR`, `en` 앱 i18n을 사용한다.
- 2026-07-29 `pnpm.cmd exec prisma migrate status` 재확인 기준 현재 `BE/.env` 연결 DB는 최신 상태다.
- 2026-07-29 사용자 확인 기준 LINE/Apple provider 설정값 연결과 실제 OAuth 동작도 운영 환경에서 완료됐다.
