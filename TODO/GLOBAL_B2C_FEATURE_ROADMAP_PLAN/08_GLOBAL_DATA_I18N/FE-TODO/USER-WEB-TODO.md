# User Web TODO

상태: Draft

## 화면 후보

- `/app` 전체 주요 route
- `/app/settings`
- 회사/담당자/제품/딜 form
- 일정/회의록/명함/Import 화면

## 작업 후보

- app 내부 i18n provider
- locale resource 구조
- 날짜/시간/통화 format utility
- 국가별 phone input
- 긴 번역 문구 layout 점검
- 언어 선택 UX
- Apple/LINE login 버튼 노출 조건 후보
- locale별 validation/error/empty copy
- Import/Export template/download 문구 현지화

## 검증 후보

- locale 변경 후 주요 route text가 바뀐다.
- 긴 영어/일본어/중국어 문구가 버튼/표를 깨지 않는다.
- phone/date/currency 표시가 locale별로 다르다.
- Apple/LINE이 범위 밖이면 UI에 노출되지 않는다.
