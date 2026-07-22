# Review Checklist

상태: Ready
목적: 03 구현 완료 후 검토자가 확인할 체크리스트

## 1. Product Scope

- [ ] 03은 주간 보고서 화면과 동기식 Excel 다운로드까지만 포함한다.
- [ ] 03은 `NBA-009 Schedule week report`만 승격하고 다른 NBA 후보를 섞지 않았다.
- [ ] Global B2C 대조 결과가 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`와 일치한다.
- [ ] `/api/exports`, `ExportJob`, `/app/export`가 구현에 섞이지 않았다.
- [ ] PDF export가 구현에 섞이지 않았다.
- [ ] 반복 일정 정식 모델이 구현에 섞이지 않았다.
- [ ] 제품 요약이 구현에 섞이지 않았다.
- [ ] AI 요약이 구현에 섞이지 않았다.
- [ ] app-wide i18n, currency/phone/address global data model, product analytics event taxonomy가 구현에 섞이지 않았다.
- [ ] Pricing/Billing/Admin/Trust policy 구현이 03에 섞이지 않았다.

## 2. Backend API

- [ ] Backend 구현이 `COMMON/ARCHITECTURE-GUARDRAILS.md`를 따른다.
- [ ] Backend 구조가 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`를 따른다.
- [ ] Backend 주석/로그가 `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`를 따른다.
- [ ] `GET /api/schedules/week`가 `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`와 일치한다.
- [ ] `GET /api/schedules/week/export/xlsx`가 `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`와 일치한다.
- [ ] 모든 User API는 AuthGuard를 사용한다.
- [ ] `weekStart`는 `YYYY-MM-DD` date-only이며 월요일만 허용한다.
- [ ] invalid `timeZone`은 400으로 처리된다.
- [ ] 기존 `GET /api/schedules` response가 변경되지 않았다.
- [ ] `@Get("week")`, `@Get("week/export/xlsx")`가 `@Get(":scheduleId")`보다 먼저 선언됐다.

## 3. DB / Migration

- [ ] 이번 03에서 새 데이터베이스를 생성하지 않았다.
- [ ] 새 Prisma model을 만들지 않았다.
- [ ] 새 table/column/enum/index를 만들지 않았다.
- [ ] 새 Prisma migration을 만들지 않았다.
- [ ] migrate/seed를 실행하지 않았다.
- [ ] 기존 `Schedule`, `ScheduleDeal`, `Deal` 관계 조회로 구현했다.
- [ ] active linked deal은 `Deal.deletedAt IS NULL`만 포함한다.
- [ ] cross-user 일정/딜/회사/담당자가 response/export에 섞이지 않는다.
- [ ] DB 관련 repository/projection 코드에는 한글 `// 기능 : ...` 주석이 있다.
- [ ] DB 관련 문서 변경에는 한글 설명이 있다.
- [ ] 만약 새 DB 구조 필요성이 발견됐다면 03 구현에 섞지 않고 별도 사용자 결정/goal로 분리했다.

## 4. Timezone / Day Bucket

- [ ] 요청 timezone 기준 `[weekStart 00:00, weekStart + 7일 00:00)` 범위를 사용한다.
- [ ] 일정 없는 주도 7개 day를 반환한다.
- [ ] 일정 없는 날도 화면에 표시된다.
- [ ] 다일 일정은 겹치는 날짜마다 표시된다.
- [ ] FE가 `weekStart` date-only 값을 UTC instant로 변환하지 않는다.
- [ ] API response의 UTC instant는 response `timeZone` 기준으로 표시된다.

## 5. Deal Summary

- [ ] 딜 금액, 단계, 마감일, 회사, 담당자, 다음 행동이 표시된다.
- [ ] distinct linked deal summary가 중복을 제거한다.
- [ ] 다음 행동은 미완료/미삭제 가장 오래된 항목이다.
- [ ] deleted deal은 표시되지 않는다.
- [ ] 제품 요약은 표시하지 않는다.

## 6. Security / Redaction

- [ ] 일정 메모 본문이 response/export/log에 노출되지 않는다.
- [ ] `hasMemo`만 제공한다.
- [ ] private memo가 response/export/log에 노출되지 않는다.
- [ ] meeting note body가 response/export/log에 노출되지 않는다.
- [ ] Excel row 전체가 structured log에 남지 않는다.
- [ ] 딜 금액, 딜명, 회사명, 담당자명, 다음 행동 본문이 structured log에 남지 않는다.

## 7. User Web

- [ ] User Web 구조가 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`를 따른다.
- [ ] UX/UI가 `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 따른다.
- [ ] UX writing이 `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`를 따른다.
- [ ] `/app/schedules/week` redirect가 해제됐다.
- [ ] legacy `/schedules/week`는 `/app/schedules/week`로 이동한다.
- [ ] `/app/schedules`에서 주간 보고서로 진입할 수 있다.
- [ ] 주간 이동/이번 주 이동 후 URL query와 query key가 갱신된다.
- [ ] loading/empty/error/export error 문구가 해요체 기준과 맞다.
- [ ] 화면 문구는 현재 한국어 UX writing을 따르되 향후 locale key 분리가 어렵지 않다.
- [ ] 날짜/시간/금액 표시가 기존 formatter 또는 `Intl` 기준을 따른다.
- [ ] `Asia/Seoul`이 화면 기본값으로 하드코딩되지 않았다.
- [ ] Excel 다운로드 중 버튼이 disabled 처리된다.
- [ ] 일정 row 또는 딜 summary에서 관련 record로 이동할 수 있다.
- [ ] 모바일 390px/360px에서 UI가 겹치지 않는다.

## 8. Verification

- [ ] Backend `pnpm run prisma:validate` 통과
- [ ] Backend `pnpm run typecheck` 통과
- [ ] Backend `pnpm run lint` 통과
- [ ] Backend `pnpm run test -- schedule` 통과
- [ ] Backend `pnpm run build` 통과
- [ ] User Web `pnpm run typecheck` 통과
- [ ] User Web `pnpm run lint` 통과
- [ ] User Web `pnpm run build` 통과
- [ ] User Web `pnpm run test:e2e` 또는 weekly report E2E 통과

## 9. Documentation Closeout

- [ ] 구현 결과가 API-SPEC과 다르면 API-SPEC을 갱신했다.
- [ ] 구현 결과가 DB-SCHEMA와 다르면 DB 문서를 갱신했다.
- [ ] 구현 결과가 FE-TODO와 다르면 FE 문서를 갱신했다.
- [ ] QA 결과를 TODO_LOG에 남겼다.
- [ ] 03 README에 완료 상태를 반영했다.
