# 029 Global B2C Series A Priority

Date: 2026-07-18

## Decision

현재 `onehand.sales`의 바로 다음 우선순위는 새 기능 추가가 아니라 출시 전 품질 라운드다.

우선순위는 다음 순서로 고정한다.

1. UX/UI 공통 QA
2. 모바일 브라우저 QA
3. Chrome/Edge 브라우저 QA
4. 다중 계정 보안 QA
5. DB/Prisma/migration 운영 정합성 정리
6. S0/S1/S2 버그 수정

이 순서가 끝나기 전에는 DataImport 영속화, Notification, Admin 운영 API, 결제/구독, Series A급 AI/리텐션 기능을 새로 시작하지 않는다.

## Reason

현재 핵심 MVP 업무 기능은 이미 상당 부분 구현되어 있다.

기능을 더 추가하면 제품 완성도가 올라가는 것처럼 보일 수 있지만, 실제 유료 사용자가 보는 품질은 다음 요소에서 결정된다.

- 모바일 브라우저에서 핵심 업무를 수행할 수 있는가?
- 딜/회사/담당자/제품/일정/회의록 화면이 실무 도구처럼 읽히는가?
- 긴 텍스트, 작은 화면, 로딩/오류/빈 상태가 깨지지 않는가?
- 다른 사용자 데이터가 Search, Trash, Export, 직접 URL 접근에서 섞이지 않는가?
- DB migration과 seed 상태가 운영 배포에 안전한가?

따라서 지금은 UX/UI를 신경써야 하는 타이밍이다.

## Global B2C Implication

글로벌 B2C 유료 판매는 가능하지만, 현재 상태만으로 바로 세계 판매를 시작하는 것은 이르다.

글로벌 유료 판매 전에는 다음 계층이 필요하다.

- 결제/구독
- VAT/GST/판매세 또는 Merchant of Record
- `/app` 내부 다국어
- 국가별 전화번호/날짜/통화/문구
- Admin 고객 지원/구독 상태/감사 로그
- 제품 분석과 유료 전환 funnel

## Series A Implication

Series A급으로 가려면 기능 완성이 아니라 반복 매출과 리텐션이 증명되어야 한다.

추가로 필요한 축:

- Notification/Reminder 기반 리텐션 루프
- AI next action/follow-up/딜 리스크 추천
- 주간 영업 리포트
- 모바일 현장 사용성
- 결제/paywall 실험
- 제품 분석과 unit economics
- Admin 운영과 보안/감사 신뢰 체계

## Related Documents

- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
