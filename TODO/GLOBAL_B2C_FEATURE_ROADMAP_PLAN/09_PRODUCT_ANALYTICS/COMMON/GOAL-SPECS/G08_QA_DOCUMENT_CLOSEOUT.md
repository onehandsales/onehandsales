# G08 QA Document Closeout

상태: Ready
목표: 09 구현 결과를 검증하고 문서를 구현 상태와 일치시킨다.

## 1. 목적

G08은 09의 마지막 goal이다. 구현이 문서와 일치하는지 확인하고, 검증 결과와 남은 후속 범위를 기록한다.

## 2. 포함 범위

- Backend Prisma/type/lint/test/build 검증
- User Web type/lint/build 검증
- event taxonomy 문서와 코드 대조
- privacy payload 검토
- Admin/Billing 이관 범위 확인
- README/SCOPE/API-SPEC/BE-TODO/FE-TODO/DB-SCHEMA closeout

## 3. 제외 범위

- 새 기능 구현
- Admin UI/API 구현
- Billing/paywall/churn 구현
- 운영 DB migrate/seed 무단 실행

## 4. 작업

1. `git status --short`로 변경 상태를 확인한다.
2. 09 관련 event name이 문서와 코드에서 일치하는지 검색한다.
3. Backend 검증 명령을 실행한다.
4. User Web 검증 명령을 실행한다.
5. payload allowlist와 PII 금지 기준을 코드에서 확인한다.
6. `COMMON/GOAL-COMPLETION-CHECKLIST.md`를 갱신한다.
7. README와 하위 TODO 문서 상태를 구현 결과에 맞게 갱신한다.
8. 실행하지 못한 검증은 사유를 기록한다.

## 5. Request 계약

G08은 신규 request를 만들지 않는다.

검토 대상:

- `POST /api/analytics/events`
- server event internal command
- snapshot internal command
- AI usage internal command

## 6. Response 계약

G08은 신규 response를 만들지 않는다.

검토 대상:

- `CollectProductAnalyticsEventResponse`
- snapshot result
- AI usage summary result

## 7. Business Logic

- activation 기준이 구현과 문서에서 일치해야 한다.
- retention이 사용자 timezone 기준 eventDate로 계산되어야 한다.
- analytics failure가 product failure로 전파되지 않아야 한다.
- raw event 365일 retention 기준이 구현 또는 명확한 후속으로 기록되어야 한다.
- account deletion 30일 유예 후 user-linked analytics 삭제 기준이 문서와 코드 영향에 반영되어야 한다.

## 8. User Flow

검토 대상:

- 로그인 후 app route view
- 딜 생성 activation
- 일정/회의록 연결 activation 보강
- import/business-card/export usage
- AI usage 집계

사용자-facing analytics error UI가 없어야 한다.

## 9. DB/Prisma 영향

G08은 DB를 변경하지 않는다.

검토 대상:

- `ProductAnalyticsEvent`
- `UserActivationSnapshot`
- `RetentionCohortSnapshot`
- `AiProviderCallLog`

## 10. 코드 주석 기준

검토:

- Backend controller endpoint에 `// API : ...`가 있다.
- Backend class/interface에 `// 역할 : ...`이 있다.
- Backend use case/service/repository/helper에 `// 기능 : ...`이 있다.
- Frontend component/hook/function/API client에 `// 기능 : ...`이 있다.

## 11. 검증

Backend:

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

User Web:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

검색:

```powershell
rg -n "app_route_viewed|auth_signup_completed|deal_created|deal_next_action_created|schedule_created|schedule_deal_linked|meeting_note_created|meeting_note_deal_linked|business_card_scan_confirmed|import_confirmed|export_downloaded|ProductAnalyticsEvent|UserActivationSnapshot|RetentionCohortSnapshot|paywall_viewed|churn_survey_submitted" BE FE TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS
```

## 12. Goal 검토 체크리스트

- [ ] Backend 검증 명령을 실행했다.
- [ ] User Web 검증 명령을 실행했다.
- [ ] 실행하지 못한 검증은 사유를 기록했다.
- [ ] README/SCOPE/API-SPEC/BE-TODO/FE-TODO/DB-SCHEMA가 구현 결과와 일치한다.
- [ ] `COMMON/GOAL-COMPLETION-CHECKLIST.md`가 갱신됐다.
- [ ] privacy allowlist가 코드와 문서에서 일치한다.
- [ ] 11 Admin 이관 범위가 유지됐다.
- [ ] 12 Billing reserved 범위가 유지됐다.
