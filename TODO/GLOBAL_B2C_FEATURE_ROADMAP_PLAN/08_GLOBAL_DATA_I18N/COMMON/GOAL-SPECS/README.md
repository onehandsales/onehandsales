# Goal Specs

상태: Ready for Goal Execution

## 1. 목적

08을 `/goal` 단위로 작게 실행하기 위한 상세 명세 모음이다. 각 `/goal`은 이 폴더의 파일 하나만 구현 범위로 삼는다.

## 2. 실행 순서

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

## 3. 파일

- `G01_DOCUMENT_CONTRACT_SYNC.md`
- `G02_USER_GLOBAL_SETTINGS.md`
- `G03_APP_I18N_FOUNDATION.md`
- `G04_CURRENCY_PRODUCT_DEAL.md`
- `G05_CONTACT_PHONE_GLOBAL.md`
- `G06_COMPANY_REGION_ADDRESS.md`
- `G07_IMPORT_EXPORT_LOCALIZATION.md`
- `G08_AUTH_GOOGLE_LINE_APPLE.md`
- `G09_APP_SCREEN_TRANSLATION.md`
- `G10_QA_DOCUMENT_CLOSEOUT.md`

## 4. 공통 완료 조건

- [ ] request 계약이 명시됐거나 영향 없음으로 기록됐다.
- [ ] response 계약이 명시됐거나 영향 없음으로 기록됐다.
- [ ] business logic이 goal 범위 안에서 명시됐다.
- [ ] user flow가 goal 범위 안에서 명시됐다.
- [ ] DB/Prisma 영향이 명시됐거나 변경 없음으로 기록됐다.
- [ ] goal 범위 밖 기능을 구현하지 않았다.
- [ ] `COMMON/DECISION-LOG.md`의 확정 결정과 충돌하지 않는다.
- [ ] UX/UI 변경은 `AGENT/UXUI_AGENT` 기준을 따른다.
- [ ] Software 변경은 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- [ ] 신규/수정 코드에 한국어 주석 규칙이 적용됐다.
- [ ] 실행한 검증 command와 결과를 기록했다.
- [ ] 실행하지 못한 검증은 사유를 기록했다.

## 5. 필수 계약 문서

모든 goal은 구현 전 `COMMON/IMPLEMENTATION-CONTRACT-RULES.md`를 읽고, 해당 goal 문서 안에서 아래 항목을 확인한다.

- Request
- Response
- Business Logic
- User Flow
- DB/Prisma
- Goal 검토 체크리스트

추가로 모든 goal은 `COMMON/GOAL-IMPLEMENTATION-MATRIX.md`에서 실제 수정 후보 파일, 생성 후보 파일, 완료 산출물을 확인한 뒤 구현한다. goal spec이 범위를 정하고, implementation matrix가 실제 파일 진입점을 정한다.
