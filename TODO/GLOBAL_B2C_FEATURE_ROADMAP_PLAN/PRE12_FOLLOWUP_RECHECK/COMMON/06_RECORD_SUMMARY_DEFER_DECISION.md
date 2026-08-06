# 06 Record Summary Defer Decision

상태: Decided / pre-12 계약화 및 구현 금지
결정일: 2026-08-06
결정: A - 06 완료 범위 유지, 잔여 record summary는 post-12 전략 재검토

## 1. 판단 근거

- 서비스 방향은 Global B2C first-sale이며, 현재 우선순위는 개인 영업자가 딜 중심으로 업무를 이어갈 수 있는 최소 신뢰/운영/결제 gate를 닫는 것이다.
- UX/UI 기준은 Notion식 작업공간과 Attio식 CRM record/activity 방향을 따른다. 다만 Attio식 record-level activity 확장은 최종 방향으로 유효하지만, 첫 판매 전 필수 구현 범위로 확정된 것은 아니다.
- 실제 BE/FE 구현 상태상 06은 `DealActivity` 정본, 딜 상세 timeline, Deal list `products/latestActivity`, Contact list `dealCount`, page size 15 계약을 구현하고 QA closeout했다.
- `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에 남아 있는 `NBA-003` 잔여는 `GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE`에서 confirmed로 승격되지 않은 후속 후보다.
- `01_IMPORT_JOB_PERSISTENCE`처럼 완료 슬롯은 구현 완료 의미를 보존하고, 잔여 후보는 기존 완료 폴더를 재개하지 않고 별도 TODO 후보로 다시 판단한다는 원칙을 유지한다.

## 2. 결정 내용

- 06은 Completed 상태를 유지한다.
- Company/Contact/Product latest activity, latest memo, next action summary는 12 전 API/DB/FE 계약화 대상이 아니다.
- 모든 record를 묶는 generic summary endpoint와 Company/Contact/Product별 상세 activity timeline은 12 전 구현 대상이 아니다.
- B/C로 논의된 전체 record summary와 record별 상세 timeline 확장은 B2B 또는 team CRM에서 더 강한 가치가 있는 후보로 본다.
- UX/UI 전체 polish는 지금 06 후속으로 하지 않고, 12와 post-12 재검토 이후 별도 UX/UI 전면 유지보수 계획에서 다룬다.

## 3. 구현 금지

아래 작업은 이 결정만으로 시작하지 않는다.

- Company/Contact/Product list response에 latest summary field 추가
- Company/Contact/Product summary 전용 endpoint 추가
- Company/Contact/Product별 activity timeline route 추가
- private memo, meeting note raw text, follow-up body, provider raw를 list summary로 합치는 작업
- FE에서 API에 없는 latest summary를 조합해 사실처럼 표시하는 작업
- 06 문서의 완료 의미를 바꿔 잔여 summary를 06 미완료로 재분류하는 작업

## 4. 재검토 시점

- 12 Billing/Subscription/Tax 완료 후 post-12 재검토에서 다시 판단한다.
- 판단 시 `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`, 01~12 완료 문서, 실제 BE/FE/Prisma 상태를 함께 대조한다.
- Global B2C 개인 영업자 first-sale 지표에서 Company/Contact/Product summary가 반복 사용을 실제로 높인다는 근거가 생기거나, B2B/team CRM 방향으로 제품 전략이 확장될 때 새 TODO 후보로 승격한다.
