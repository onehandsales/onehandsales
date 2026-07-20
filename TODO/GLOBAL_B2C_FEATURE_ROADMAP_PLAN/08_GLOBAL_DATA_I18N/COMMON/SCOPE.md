# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| `/app` 내부 i18n | 주요 앱 화면 locale 적용 |
| 전화번호 | 국가별 전화번호 저장/검증/표시 |
| 날짜/시간 | locale/timezone 기반 표시 |
| 통화 | 딜/제품 금액 currency 표시 |
| 주소/지역 | 국가별 지역/주소 입력 모델 후보 |
| 글로벌 UX writing | locale별 에러, empty, validation, onboarding 문구 |
| Import/Export 현지화 | template, xlsx header, 날짜/전화번호/통화 표시 |
| Apple login | iOS/Apple 생태계 대응 후보 |
| LINE login | 일본/대만 확장 대응 후보 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 결제 국가/세금 | 12에서 다룬다. |
| 마케팅 사이트 전체 rewrite | public/auth locale은 별도 흐름 |
| 네이티브 앱 locale | 10 이후 후보 |

## 열린 질문

- 첫 판매 locale은 `ko`, `en-us`, `ja`, `zh-tw` 중 어디까지인가?
- 기존 phone 필드를 국제 전화번호 모델로 migration할지?
- 딜/제품 금액에 currency column을 추가할지?
- `/app` 번역 리소스 구조를 public-site와 공유할지 분리할지?
- Apple login은 web에서도 먼저 넣을지, iOS 앱 시점까지 기다릴지?
- LINE login은 일본/대만 확장 전에 필요한지?
- Import/Export template의 header와 validation message를 locale별로 나눌지?

## 완료 기준 초안

- `/app` 주요 화면이 선택 locale로 표시된다.
- 국가별 전화번호 입력/표시가 가능하다.
- 금액/날짜/시간 표시가 locale 기준과 맞다.
- 기존 한국 데이터가 깨지지 않는다.
- Apple/LINE login의 포함 시점과 범위가 결정되어 있다.
- Import/Export의 국가별 표시 기준이 문서화되어 있다.
