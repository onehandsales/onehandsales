# Software Agent Review

상태: Confirmed

## 1. Backend 기준

09 구현자는 아래 기준을 따른다.

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/DECISIONS/005_backend_api_function_comment_rule.md`

적용:

- collector API는 `COMMON/API-SPEC/PRODUCT_ANALYTICS_EVENT_API.md`를 먼저 구현한다.
- server event는 HTTP API가 아니라 internal contract다.
- transaction은 제품 mutation과 analytics insert를 분리한다.
- structured log에는 payload 원문을 남기지 않는다.
- 모든 신규/수정 Backend class/interface/method에 한국어 주석을 둔다.

## 2. Frontend 기준

09 구현자는 아래 기준을 따른다.

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`

적용:

- analytics feature는 `FE/user-web/src/features/analytics`에 둔다.
- API client는 `src/lib/api-client.ts`를 사용한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- route view hook은 `FE/user-web/src/components/layout/app-shell.tsx`에서 core `/app` route만 수집한다.
- `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때만 client event를 전송한다.
- 신규/수정 component/hook/API client/event handler에는 `// 기능 : ...` 주석을 둔다.
- `console.log`를 남기지 않는다.

## 3. DB 기준

09 구현자는 아래 기준을 따른다.

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

적용:

- `occurredAt`은 UTC instant다.
- `eventDate`는 사용자 timezone 기준 날짜다.
- `timeZone`은 IANA timezone ID다.
- 날짜 전용 값은 `@db.Date`를 사용한다.
- 새 model/field에는 Prisma `/// 기능 : ...` 주석을 둔다.
- migration에는 COMMENT를 남긴다.

## 4. UX/UI 기준

09 구현자는 아래 기준을 따른다.

- `AGENT/UXUI_AGENT/README.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

적용:

- 09는 사용자-facing 분석 화면을 만들지 않는다.
- route tracking 때문에 기존 Notion + Attio식 업무 흐름이 느려지면 안 된다.
- analytics failure UI를 보여주지 않는다.
- 11 Admin에서 화면을 만들 때 Admin desktop 운영 콘솔 기준을 적용한다.
