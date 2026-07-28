# 08 Global Data I18N

상태: Ready for Goal Execution
순서: 08
성격: Global B2C 앱 내부 현지화와 글로벌 데이터 모델 구현 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 확정 결정 반영

## 1. 목적

Global B2C 첫 판매를 위해 로그인 이후 `/app` 업무 화면이 한국 사용자와 영어권 사용자 모두에게 자연스럽게 동작하도록 만든다.

08의 핵심은 public/auth 다국어가 아니라 `/app` 내부 제품 경험과 데이터 모델이다. 날짜/시간, 통화, 전화번호, 회사 지역/주소, Import/Export, OAuth provider 확장을 같은 글로벌 기준으로 정리한다.

## 2. 현재 상태

- public/auth 진입면은 URL locale을 지원한다.
- `/app` 내부 route는 locale prefix 없이 `/app/*`를 사용한다.
- G01~G03은 완료됐고, G04 Product/Deal currency부터 순차 착수 가능하다.
- `/app` 내부 UI와 validation copy는 한국어 우선이다.
- Contact 전화번호 검증은 한국 휴대폰 형식 중심이다.
- Product/Deal 금액은 정수 금액만 있고 통화 코드가 없다.
- Company는 사용자 커스텀 `CompanyRegion`을 사용한다.
- 사용자 timezone 기반 일정 처리는 일부 구현되어 있다.
- Google login만 현재 정식 인증 provider로 본다. 08에서 Apple/LINE을 실제 구현 대상으로 승격한다.

## 3. 확정 결정 요약

| 항목 | 결정 |
|---|---|
| `/app` URL | locale prefix를 붙이지 않는다. `/app/contacts` 같은 기존 구조를 유지한다. |
| 앱 언어 | 1차는 `ko-KR`, `en`만 지원한다. |
| 언어 저장 | 서버 `User.preferredLocale`을 정본으로 사용한다. |
| 사용자 글로벌 설정 | `Language`, `Time zone`, `Country`, `Default currency`를 `/app/settings`에서 수정한다. |
| 신규 가입 기본값 | 브라우저 locale, proxy geo country, 브라우저 timezone으로 추론하고 없으면 `ko-KR`, `KR`, `Asia/Seoul`, `KRW`를 사용한다. |
| 날짜/시간 | DB는 UTC, API는 ISO, FE는 `User.preferredLocale + User.timeZone`으로 표시한다. |
| 통화 | Product/Deal에 `currencyCode`를 추가한다. 1차 허용 통화는 `KRW`, `USD`다. |
| 금액 단위 | 1차는 정수 금액을 유지한다. USD cent/minor unit은 후속이다. |
| Deal 통화 | Product 통화를 기본값으로 가져오되 Deal에서 변경 가능하다. |
| Contact 전화번호 | 기존 `mobile` 유지, 글로벌 필드 `phoneCountryCode`, `phoneNationalNumber`, `phoneE164` 추가. |
| 전화번호 국가 | 1차는 `KR`, `US`만 지원한다. |
| 기존 전화번호 migration | `010-1234-5678`처럼 변환 가능한 한국 번호는 자동 migration한다. 실패 데이터는 `mobile` fallback으로 유지한다. |
| Company 지역/주소 | Company에만 먼저 적용한다. Contact에는 주소/지역 필드를 추가하지 않는다. |
| 지역 범위 | 1차는 `KR`, `US`만 지원한다. KR 시/도와 US State를 code로 저장한다. |
| 기존 CompanyRegion | 유지하고 `countryCode`, `regionCode`를 추가한다. 한국 지역명은 가능한 경우 자동 매핑한다. |
| Import/Export | 기본 표시 형식은 사용자 앱 설정값을 따른다. Import 템플릿 언어는 `ko-KR`, `en` 중 선택 가능하다. |
| OAuth provider | Google, LINE, Apple을 실제 구현한다. 버튼 순서는 Google -> LINE -> Apple이다. |
| OAuth 버튼 UX | 기존 로그인/회원가입 화면의 소셜 버튼 영역만 카드형 3개 버튼으로 바꾼다. 이메일 로그인은 추가하지 않는다. |
| OAuth 연결 정책 | provider 계정이 없고 verified email이 기존 `User.email`과 같으면 기존 User에 연결한다. |
| email 없음 | provider email이 없으면 가입/로그인을 차단한다. |
| email 비교 | lowercase 정규화 기준으로 비교한다. |
| UX writing | 한국어/영어 모두 간결하고 사용자 친화적으로 작성한다. 한국어는 해요체를 따른다. |
| validation error | BE는 `code`, `field` 중심으로 내려주고 FE가 locale별 문구로 표시한다. |
| 코드 주석 | 신규/수정 코드에는 `AGENT/SOFTWARE_AGENT`의 한글 주석 규칙을 적용한다. |

## 4. Goal 실행 방식

08은 범위가 넓으므로 하나의 `/goal`로 구현하지 않는다. 각 `/goal`은 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행한다.

권장 순서:

```text
G01_DOCUMENT_CONTRACT_SYNC
-> G02_USER_GLOBAL_SETTINGS
-> G03_APP_I18N_FOUNDATION
-> G04_CURRENCY_PRODUCT_DEAL
-> G05_CONTACT_PHONE_GLOBAL
-> G06_COMPANY_REGION_ADDRESS
-> G07_IMPORT_EXPORT_LOCALIZATION
-> G08_AUTH_GOOGLE_LINE_APPLE
-> G09_APP_SCREEN_TRANSLATION
-> G10_QA_DOCUMENT_CLOSEOUT
```

## 5. 참고

- `COMMON/REFERENCES.md`
- `COMMON/DECISION-LOG.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `COMMON/GOAL-REVIEW-CHECKLIST.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `COMMON/SOFTWARE-AGENT-REVIEW.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
