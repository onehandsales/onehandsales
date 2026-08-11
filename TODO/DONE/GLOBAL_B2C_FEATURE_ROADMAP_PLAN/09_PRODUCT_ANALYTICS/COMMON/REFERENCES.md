# References

상태: Confirmed

## 1. 전체 참조

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/REFERENCE-MAP.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/CURRENT-VS-FINAL-GAP-MATRIX.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/FINAL-SERVICE-SHAPE.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/PADDLE_PLAN`

## 2. PM / Product 참조

- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`

## 3. Software Agent 참조

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
- `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`

## 4. UX/UI Agent 참조

- `AGENT/UXUI_AGENT/README.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 5. 현재 코드 참조

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/src/app.module.ts`
- `BE/src/modules/auth`
- `BE/src/modules/deal`
- `BE/src/modules/schedule`
- `BE/src/modules/meeting-note`
- `BE/src/modules/business-card`
- `BE/src/modules/data-import`
- `BE/src/modules/sales-report`
- `FE/user-web/src/lib/api-client.ts`
- `FE/user-web/src/app/router/router.tsx`
- `FE/user-web/src/app/providers/app-providers.tsx`
- `FE/user-web/src/features/auth/auth-service.ts`
- `FE/user-web/src/features/deal`
- `FE/user-web/src/features/schedule`
- `FE/user-web/src/features/meeting-note`
- `FE/user-web/src/features/business-card`
- `FE/user-web/src/features/import-export`
- `FE/admin-web/src/app/router/router.tsx`
- `FE/admin-web/src/pages/analytics/index.tsx`

## 6. 09에서 확인한 현재 코드 사실

- `AuthSession`과 `AuthDevice`가 이미 존재하므로 09에서 별도 session/device table을 만들지 않는다.
- `CurrentUserContext`는 `sessionId`를 갖고 있다.
- User Web client는 access token을 localStorage에 저장하고 refresh token은 httpOnly cookie로 유지한다.
- User Web은 device id를 login exchange 때만 보내며 analytics event에는 보내지 않는다.
- `AiProviderCallLog`가 이미 존재하므로 09의 AI usage 1차 집계는 이 table을 사용한다.
- `FE/user-web/src/app/router/router.tsx` 기준 `/app/notifications`, `/app/schedules/week`, `new/full`, import review route가 존재하므로 routeKey allowlist에 반영한다.
- Admin analytics route는 현재 운영 화면이 아니며 09에서 full UI/API를 만들지 않는다.
