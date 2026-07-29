# User Web TODO

상태: Draft
최종 업데이트: 2026-07-29

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: User Web import resume UX와 client state 구현 완료
- [x] `NBA-009 Schedule week report`: `/app/schedules/week` 주간 보고서 UX와 Excel 다운로드 구현 완료
- [x] `NBA-010 Notification`: `/app/notifications`, unread badge, settings, browser push fallback UX 구현 완료
- [x] `NBA-015 Google Calendar Integration`: `/app/schedules`, `/app/settings`, `/app/trash` Google Calendar UX 구현 완료
- [x] `NBA-001 Deal list products summary`: `/app/deals` desktop/mobile 목록 표시 구현 완료
- [x] `NBA-002 Contact list dealCount`: `/app/contacts` desktop/mobile 목록 표시 구현 완료
- [x] `NBA-003 Deal latest activity subset`: `/app/deals` 최신 활동 summary 표시 구현 완료
- [x] `NBA-008 Page size 15 contract cleanup`: User Web E2E에서 page size 15 계약 확인 완료
- [x] `NBA-014`: User Web 코드 변경 없이 06 범위 DB/Prisma 운영 gate closeout 완료
- [x] `NBA-004 MeetingNote detail next action/follow-up draft subset`: `/app/meeting-notes/:meetingNoteId` AI 후속 작업 UX 구현 완료
- [x] `NBA-011 MeetingNote provider log subset`: User Web safe failure UX와 `/admin/api/*` 미호출 기준 확인 완료
- [x] `08_GLOBAL_DATA_I18N`: `/app/settings` global settings, `/app` i18n, currency/phone/region/address UI, import/export localization, Google/LINE/Apple auth buttons 구현 및 QA closeout 완료

## 1. 목적

이 문서는 G07에서 분리한 Backend/API 후보가 `FE/user-web`에 미칠 수 있는 영향을 정리한다.

이 문서에서 남은 active User Web 후보는 future API contract가 `confirmed`된 뒤 함께 확인할 client/screen 영향만 기록한다. `NBA-001`, `NBA-002`, `NBA-003` Deal subset, `NBA-004` MeetingNote detail subset, `NBA-006`, `NBA-008`, `NBA-009`, `NBA-010`, `NBA-011` provider log subset, `NBA-015`, `08_GLOBAL_DATA_I18N`은 별도 계획에서 구현 완료된 이력으로만 남긴다.

## 1.1 08에서 닫힌 User Web Global Data/I18N 범위

- `/app/settings`에서 국가, 앱 언어, 기본 통화 저장과 저장 후 문구/formatter 반영을 구현했다.
- `/app` 전용 i18n provider/resource/formatter와 핵심 화면 `ko-KR`/`en` 문구를 적용했다. `/app` route에 locale prefix는 추가하지 않는다.
- Product/Deal 금액, 주간 보고서, export 화면에서 currency-aware 표시를 적용했다.
- Contact 생성/수정/import/business-card/search/export 흐름에 KR/US 전화번호 UI와 validation을 적용했다.
- Company 생성/수정/export 흐름에 country/region/address UI를 적용했다.
- Import template language selector와 export header/date-time/currency 현지화를 적용했다.
- 로그인/회원가입 provider 버튼은 Google, LINE, Apple을 한 줄 3개 배치로 제공하고, LINE/Apple도 Google과 동일한 버튼 톤을 따른다.
- LINE/Apple 실제 provider smoke는 2026-07-29 사용자 확인 기준 운영 환경에서 완료됐다. 08 DB migration은 2026-07-29 최신 상태로 재확인됐다.

## 2. Release follow-up 영향 후보

| 후보 ID | FE 영향 | 확인 기준 |
|---|---|---|
| NBA-005 | 명함 OCR 실패 copy와 retry UI | 사용자 copy는 provider/quota/API key 정보를 노출하지 않는다. |

## 3. Product feature 영향 후보

| 후보 ID | FE 영향 | 확인 기준 |
|---|---|---|
| NBA-003 잔여 | 회사/담당자/제품 목록 summary 표시 | Deal list `latestActivity`는 완료됐다. 남은 summary도 private memo와 일반 활동을 구분한다. |
| NBA-004 | 부분 완료: 회의록 상세 AI 후속 작업 section, 다음 행동 후보 편집 저장, follow-up draft 수정/복사 구현. 회의록 목록 summary 표시는 후속 | 목록에는 AI/STT raw text나 민감 원문을 노출하지 않는다. 상세 AI 후보도 자동 저장/자동 발송하지 않는다. |
| NBA-006 | Import resume 화면과 client state | 완료: 새로고침/탭 이동 복구 UX, 만료/실패 상태, confirm/cancel 흐름 구현 |
| NBA-009 | 완료: `/app/schedules/week` route, 주간 보고서 화면, 이전/다음/이번 주 이동, Excel 다운로드, loading/empty/error/export error 처리 | Active FE TODO에서 제외한다. PDF/범용 ExportJob, 반복 일정, AI 요약은 별도 backlog에서 다룬다. |
| NBA-010 | Notification route/sidebar 노출 | 완료: `/app/notifications`, unread badge, settings, browser push 권한 fallback UX 구현 |
| NBA-015 | 완료: `/app/schedules` source badge/sync/calendar hidden handling, `/app/settings` Google Calendar 연결/선택/해제, `/app/trash` Schedule restore UX 구현 | Active FE TODO에서 제외한다. Google export/write, realtime webhook/watch, 반복 일정은 별도 backlog에서 다룬다. |

## 4. Ops/security 영향 후보

| 후보 ID | FE 영향 | 확인 기준 |
|---|---|---|
| NBA-007 | Trash detail response type 조정 | private memo 원문이 없어도 복구 판단 UI가 깨지지 않아야 한다. |
| NBA-011 | 일반 사용자 provider log 노출 없음. 생성/상세 AI 실패 UX는 07에서 safe message/retry로 구현 | transcript/provider log는 User Web 일반 화면에 노출하지 않는다. Admin/internal 조회는 User Web 밖에서 별도 정책으로 다룬다. |
| NBA-012 | Trash restore error/copy 조정 | 7일 이후 restore 실패 안내와 위험 액션 copy가 필요하다. |
| NBA-013 | User Web 영향 없음 | User Web은 `/admin/api/*`를 호출하지 않는다. |
| NBA-014 | User Web 영향 없음 | 06 범위 DB/Prisma 운영 gate는 FE 코드 변경 없이 닫혔다. 운영 DB 적용 절차는 별도 data reliability gate다. |

## 5. 공통 FE 규칙

- 서버 상태는 TanStack Query로 관리한다.
- API 호출은 `src/lib/api-client.ts`를 통한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- API response에 없는 latest activity, next action, count, product summary를 FE에서 사실처럼 꾸미지 않는다.
- form validation은 React Hook Form + Zod를 따른다.
- 모바일 record list는 desktop table을 억지로 노출하지 않고 card/list로 확인한다.

## 6. future 검증 명령

API 계약이 confirmed되고 FE 변경이 생긴 경우 아래를 기본 gate로 실행한다.

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```
