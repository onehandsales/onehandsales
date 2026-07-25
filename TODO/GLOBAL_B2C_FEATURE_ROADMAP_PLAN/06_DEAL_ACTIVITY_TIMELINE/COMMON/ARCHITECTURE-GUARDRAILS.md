# Architecture Guardrails

상태: Confirmed
확정일: 2026-07-25

## 1. 정본 기준

06은 아래 AGENT 문서를 따른다.

UX/UI:

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

Software:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`

## 2. Backend 구조

- 1차 구현은 기존 `deal` module 안에 둔다.
- `DealActivity` 전용 application service 또는 use case를 만들 수 있다.
- Controller는 request validation과 application 호출만 담당한다.
- Application layer가 transaction 경계를 결정한다.
- Prisma query는 infrastructure repository에서만 수행한다.
- Domain layer는 NestJS, Prisma, HTTP, logger를 import하지 않는다.
- User API는 `/api/*`만 사용한다.
- Admin API는 만들지 않는다.

## 3. Transaction 기준

Transaction이 필요한 흐름:

- 딜 생성과 `DEAL_CREATED` activity 생성
- 딜 단계 변경과 `STAGE_CHANGED` activity 생성
- 다음 행동 생성과 `NEXT_ACTION_CREATED` activity 생성
- 다음 행동 완료 변경과 `NEXT_ACTION_COMPLETION_CHANGED` activity 생성
- ScheduleDeal 생성/삭제와 schedule activity 생성
- MeetingNoteDeal 생성/삭제와 meeting-note activity 생성
- FollowUpMessage 상태 변경과 follow-up activity 생성
- 수동 activity 생성/수정

외부 provider 호출은 transaction 안에서 실행하지 않는다. follow-up delivery provider 호출 뒤 DB 상태 갱신 transaction에서 activity를 만든다.

## 4. DB/Migration 기준

G02에서 신규 Prisma model과 migration을 허용한다.

필수:

- `COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` DB/Prisma 운영 gate를 선행 확인한다.
- 기존 migration 파일을 수정하지 않는다.
- 공유/운영성 DB에 사용자 결정 없이 migrate/seed를 실행하지 않는다.
- Prisma schema model/field/relation/index에는 한글 `/// 기능 : ...` 주석을 둔다.
- migration SQL에는 table/column/index 의도를 `COMMENT ON` 또는 한글 SQL 주석으로 남긴다.

## 5. 주석 규칙

Backend 코드를 작성할 때 한글 주석을 반드시 둔다.

- class/interface: `// 역할 : ...`
- controller method: `// API : ...`
- internal method/function: `// 기능 : ...`
- application orchestration: 필요한 경우 `// 1. ...`, `// 2. ...` 단계 주석

주석은 이름 번역이 아니라 역할, transaction, ownership, redaction 의도를 설명해야 한다.

## 6. Logging/Redaction

Structured log는 count, id, type, status 같은 안전한 값만 남긴다.

Logging 금지:

- activity title/body 원문
- private memo
- follow-up body 전체
- meeting note details/rawText
- provider raw response
- token/API key
- contact email/phone 원문
- deal amount 원문

## 7. Frontend 구조

- `FE/user-web/src/features/deal` 안에 API, hooks, components, types를 둔다.
- 서버 상태는 TanStack Query로 관리한다.
- API 호출은 `src/lib/api-client.ts`를 통한다.
- User Web에서 `/admin/api/*`를 호출하지 않는다.
- page component는 조립만 담당한다.
- form validation은 React Hook Form + Zod를 따른다.

## 8. UX/UI 기준

- 딜 상세는 Notion식 page/detail 구조를 유지한다.
- activity timeline은 Attio식 CRM record activity처럼 관계와 시간을 분명히 보여준다.
- 카드 안에 카드를 중첩하지 않는다.
- desktop은 조밀한 timeline list를 우선한다.
- mobile은 card/list로 표시한다.
- 버튼은 lucide icon과 짧은 label을 쓴다.
- 사용자 노출 문구는 해요체를 따른다.
- API 응답에 없는 최신 활동, 제품 summary, dealCount를 FE에서 사실처럼 꾸미지 않는다.

## 9. Scope Control

06에서 금지:

- 수동 activity 삭제 API 구현
- 자동 activity 수정/삭제 구현
- Admin API 구현
- generic activity bus 구현
- private memo summary 노출
- FE 단독 page size 변경
- AI activity 자동 판단
