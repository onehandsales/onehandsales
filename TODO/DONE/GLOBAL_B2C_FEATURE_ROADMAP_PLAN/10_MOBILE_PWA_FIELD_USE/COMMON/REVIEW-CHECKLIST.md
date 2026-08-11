# Review Checklist

상태: Confirmed

## 1. 목적

10번 문서와 구현 결과가 UXUI Agent, Software Agent, Prisma 기준을 따르는지 최종 검토한다.

## 2. 문서 리뷰

- [ ] 모든 goal 문서에 request, response, backend business logic, user flow, DB/Prisma 항목이 있다.
- [ ] 모든 goal 문서에 `Goal 검토 체크리스트`가 있다.
- [ ] `COMMON/API-SPEC` 계약과 `GOAL-SPECS` 내용이 충돌하지 않는다.
- [ ] `BE-TODO`와 `FE-TODO`가 goal 순서와 일치한다.
- [ ] 09 Product Analytics와 연결되는 이벤트는 09 taxonomy/privacy 원칙을 따른다.

## 3. Software Agent 준수

- [ ] API contract에 method/path/auth/request/response/error/business logic/transaction/observability가 있다.
- [ ] Backend provider failure는 safe code/userMessage/retryable로 분리된다.
- [ ] provider 호출은 장기 transaction 안에서 수행하지 않는다.
- [ ] DB migration은 기존 schema를 먼저 확인한 뒤 새 migration으로만 처리한다.
- [ ] DB column/model/table 추가 또는 생성 시 Prisma 한국어 주석과 migration SQL `COMMENT ON COLUMN` 또는 `COMMENT ON TABLE`이 있다.
- [ ] 새 코드 주석은 Software Agent 주석 규칙을 따른다.
- [ ] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에는 한국어 주석이 있다.
- [ ] env var 추가 시 environment 문서가 갱신된다.

## 4. UXUI Agent 준수

- [ ] 모바일 현장 업무 화면이 실제 작업 화면으로 바로 시작한다.
- [ ] Global B2C 개인 영업자 모바일 현장 업무를 target으로 유지한다.
- [ ] UX/UI 구현 전 `AGENT/UXUI_AGENT` 기준을 확인했다.
- [ ] Software/architecture 구현 전 `AGENT/SOFTWARE_AGENT` 기준을 확인했다.
- [ ] landing/marketing 설명 페이지를 만들지 않는다.
- [ ] UI는 카드 남발 없이 조용하고 밀도 있게 구성한다.
- [ ] 버튼/입력/상태는 360px/390px에서 overflow 없이 동작한다.
- [ ] 권한 거부, 녹음 실패, OCR 실패 copy가 사용자의 다음 행동을 안내한다.
- [ ] 서비스성 알림과 마케팅성 알림 copy가 분리되어 있다.

## 5. Prisma/DB 준수

- [ ] `BusinessCardScanLog` safe failure fields가 10번에서 필요한 유일한 migration이다.
- [ ] `BusinessCardScanLog` safe failure fields에는 Prisma 주석과 migration SQL COMMENT가 있다.
- [ ] `UserDraft`는 만들지 않는다.
- [ ] audio/image binary는 DB에 저장하지 않는다.
- [ ] `ProductAnalyticsEvent`는 기존 model을 재사용한다.
- [ ] browser push는 기존 `UserNotificationSetting`, `BrowserPushSubscription`을 재사용한다.

## 6. QA Evidence

- [ ] Backend targeted tests 실행 결과가 기록되었다.
- [ ] Frontend targeted tests 실행 결과가 기록되었다.
- [ ] E2E mobile viewport 결과가 기록되었다.
- [ ] 실행하지 못한 test가 있으면 사유와 잔여 위험이 기록되었다.
