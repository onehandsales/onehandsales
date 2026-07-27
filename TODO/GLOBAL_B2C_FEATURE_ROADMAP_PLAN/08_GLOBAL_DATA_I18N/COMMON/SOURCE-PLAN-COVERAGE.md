# Source Plan Coverage

상태: Ready for Goal Execution

## 1. 목적

08은 `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`을 Global B2C feature roadmap으로 재구성한 슬롯이다. 이 문서는 상위 계획에서 어떤 요구를 08에 반영하고, 어떤 요구를 후속으로 남기는지 기록한다.

## 2. 반영 범위

| 상위 요구 | 08 반영 |
|---|---|
| Global B2C 첫 판매 가능성 | `/app` 내부 `ko-KR`, `en` 지원과 글로벌 데이터 입력/표시로 반영 |
| 사용자 locale/timezone | `User.preferredLocale`, `User.timeZone` 설정 화면/API로 반영 |
| 국가/통화 기본값 | `User.countryCode`, `User.defaultCurrencyCode`로 반영 |
| 날짜/시간 표시 | DB UTC/API ISO/FE locale-timezone 표시로 반영 |
| 전화번호 글로벌화 | Contact 글로벌 전화번호 필드와 KR/US 입력으로 반영 |
| 통화 글로벌화 | Product/Deal `currencyCode`, KRW/USD로 반영 |
| 주소/지역 글로벌화 | Company/CompanyRegion KR/US code와 자유 입력 주소로 반영 |
| Import/Export 현지화 | 사용자 설정 기준 Export와 `ko-KR`/`en` 템플릿 선택으로 반영 |
| Apple/LINE login | 08에서 실제 auth provider로 구현 |
| UX writing 자연스러움 | 한국어 해요체와 짧은 영어 B2C 업무툴 톤으로 반영 |

## 3. 제외 또는 후속 범위

| 요구 | 처리 |
|---|---|
| 결제 국가/세금 | 12 Payment/Tax 범위 |
| Admin 운영 화면 | Admin Operation 범위 |
| Product Analytics | 09 Product Analytics 범위 |
| Backup/Restore | 별도 안정성/운영 goal |
| Trust/Privacy policy 확장 | 별도 정책/운영 문서 |
| `ja`, `zh-TW` 앱 내부 번역 | 일본/대만 판매 준비 goal |
| 중국 본토 `zh-CN` | 현재 후보 아님 |
| 전 세계 국가/통화/전화번호 | KR/US 검증 후 확장 |
| USD cent/minor unit | 금액 정밀도 후속 |
| 국가별 상세 주소 검증 | 주소 품질 필요 시 후속 |
| 이메일/비밀번호 로그인 | Auth strategy 후속 |
| Microsoft login | 08 대상 아님 |

## 4. 기존 충돌 정책

G01에서 아래 문서를 갱신해야 한다.

- `AGENT/PM_AGENT/DECISIONS/027_auth_session_and_provider_qa_policy.md`
- `AGENT/PM_AGENT/DECISIONS/028_auth_provider_google_only_and_future_local_providers.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`

충돌 이유:

- 기존 문서에는 Google only와 Apple/LINE future 정책이 남아 있다.
- 기존 문서에는 신규/기존 사용자 판정을 `provider + providerUserId`만으로 한다는 정책이 남아 있다.
- 08 확정 정책은 verified email 기반 provider 연결을 포함한다.
