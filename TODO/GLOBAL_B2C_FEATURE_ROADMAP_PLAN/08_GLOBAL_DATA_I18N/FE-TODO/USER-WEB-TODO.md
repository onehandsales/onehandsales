# User Web TODO

상태: Implemented / G10 Reviewed / Provider Ops Complete

## 1. 화면 범위

- `/app` 내부 핵심 업무 화면 전체
- Home
- Company
- Contact
- Product
- Deal
- Schedule
- MeetingNote
- Notification
- Settings
- Import
- 도메인별 Export 진입점
- 공통 navigation, button, empty, error, validation copy
- 로그인/회원가입 소셜 provider 버튼 영역

## 2. App I18N

- `/app` URL에는 locale prefix를 붙이지 않는다.
- public-site i18n과 app i18n을 분리한다.
- 1차 locale은 `ko-KR`, `en`이다.
- 앱 번역 리소스는 도메인별 namespace 구조를 사용한다.
- `User.preferredLocale`을 정본으로 사용하고 `/app/settings` 저장 즉시 화면에 반영한다.
- 초기 로딩 fallback은 브라우저 locale 또는 `ko-KR`를 사용한다.
- 2026-07-28 G03 완료 기준 app i18n foundation은 `FE/user-web/src/features/app-i18n`에 구현됐다.
- G03 완료 기준 `/app/settings`의 profile 영역과 날짜/시간 표시는 app i18n provider를 사용한다. 전체 화면 문구 전환은 G09 범위다.

예시 key:

```text
app.common.save
app.company.title
app.contact.phone
app.deal.amount
app.import.templateLanguage
```

## 3. UX Writing

- 한국어/영어 모두 간결하고 사용자 친화적으로 작성한다.
- 한국어는 해요체를 따른다.
- 영어는 짧고 자연스러운 B2C 업무툴 톤을 사용한다.
- BE raw validation message를 그대로 보여주지 않는다.

예시:

```text
ko-KR: 저장했어요.
en: Saved.
```

## 4. Global Formatting

- 날짜/시간은 API ISO string을 직접 노출하지 않고 `User.preferredLocale + User.timeZone` 기준으로 표시한다.
- 통화는 `currencyCode` 기준으로 표시한다.
- 1차 통화는 `KRW`, `USD`다.
- 금액 입력은 정수만 받는다.
- 전화번호는 KR/US 국가 선택 기반 입력을 제공한다.
- 기존 `mobile`만 있는 Contact는 fallback 표시한다.
- Company region은 code를 저장하고 locale별 표시명으로 보여준다.

## 5. Settings

`/app/settings`에서 다음 설정을 제공한다.

```text
Language: Korean / English
Time zone: IANA timezone
Country: Korea / United States
Default currency: KRW / USD
```

저장 즉시 현재 화면에 반영한다.

## 6. Auth UI

- 기존 로그인/회원가입 화면의 소셜 버튼 영역만 수정한다.
- 이메일 로그인, magic link, password login은 추가하지 않는다.
- 버튼은 카드형 3개를 기존 소셜 로그인 영역 안에 배치한다.
- 순서는 Google -> LINE -> Apple이다.
- 모바일에서는 겹치지 않도록 responsive grid 또는 wrap을 허용한다.
- provider 실패 메시지는 provider raw error 없이 일반 문구를 보여준다.

예시:

```text
[ Google ] [ LINE ] [ Apple ]
```

## 7. Import/Export

- Export는 사용자 app 설정값 기준으로 header/value를 표시한다.
- Import template은 `ko-KR`, `en` 중 사용자가 선택할 수 있다.
- 기본 선택값은 `User.preferredLocale`이다.
- 지원하지 않는 locale은 fallback한다.
- Contact export는 표시용 Phone, Phone Country, Phone E.164를 함께 표시한다.

## 8. Code Comment

- 신규/수정 React component/function/hook/event handler/API client에는 `// 기능 : ...` 한글 주석을 둔다.
- 함수명을 단순 번역한 주석은 쓰지 않는다.
- 복잡한 anonymous callback은 이름 있는 함수로 추출하고 주석을 둔다.
- `console.log`와 PII logging을 추가하지 않는다.

## 9. 검증

- locale 변경 후 주요 route text가 즉시 바뀐다.
- 긴 영어 문구가 버튼/표/사이드바를 깨지 않는다.
- 날짜/시간/통화/전화번호 표시가 사용자 설정과 맞다.
- `/app/*` route에 locale prefix가 붙지 않는다.
- 로그인/회원가입 화면에서 Google, LINE, Apple 버튼만 의도한 영역에 추가된다.
- User Web이 `/admin/api/*`를 호출하지 않는다.

## 10. 구현 및 G10 검토 기록

- 2026-07-28: G03~G09에서 app i18n foundation, `/app/settings` 글로벌 설정, Product/Deal currency UI, Contact KR/US phone UI, Company country/region/address UI, Import template language selector, Export 현지화 문구, Google/LINE/Apple auth provider 버튼, 핵심 `/app` 화면 번역을 구현했다.
- 2026-07-28: G10에서 `pnpm.cmd run typecheck`, `pnpm.cmd run lint`, `pnpm.cmd run build`, `pnpm.cmd run test:e2e` 27 passed, `pnpm.cmd run test:e2e:mobile` 12 passed를 확인했다.
- 2026-07-28: G10 QA 중 주간 보고서 구버전 응답 fallback, Settings Google Calendar notice 반복 표시, E2E mock provider/CompanyRegion 계약 불일치를 수정하고 재검증했다.
- 2026-07-29: 사용자 확인 기준 LINE/Apple provider 설정값 연결과 실제 OAuth 동작이 운영 환경에서 완료됐다. Google/LINE/Apple provider 버튼과 FE 흐름은 08 구현 및 G10 QA 범위에서 완료됐다.
