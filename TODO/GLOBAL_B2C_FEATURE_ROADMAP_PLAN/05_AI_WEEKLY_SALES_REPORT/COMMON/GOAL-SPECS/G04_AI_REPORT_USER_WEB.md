# G04 AI Report User Web

상태: Ready
완료일:

## 1. 목적

`/app/schedules/week`에 AI weekly report 생성, 진행 상태, version 목록, report 상세, 제안 카드를 구현한다.

## 2. 선행 조건

- G03 API가 구현되었거나 stable mock이 준비되어 있다.
- `FE-TODO/AI_WEEKLY_REPORT_USER-WEB-TODO.md`를 먼저 읽는다.
- `COMMON/AI_WEEKLY_REPORT_USER-FLOW.md`를 먼저 읽는다.
- UX/UI 기준은 `AGENT/UXUI_AGENT`를 따른다.

## 3. 포함 범위

- User Web feature folder 추가
- API client/type/schema/query key/mutation
- `/app/schedules/week` AI report section
- 생성 button
- generating polling
- success/failed/empty state
- version 목록과 실패 version 접힘 표시
- summary/risk/next action/follow-up/data cleanup sections
- snapshot summary drawer 또는 panel
- mobile card/list layout

## 4. 제외 범위

- 05-B 실제 email/SMS 발송 button
- AI suggestion이 원본 record를 자동 수정하는 기능
- landing/hero 설명 화면

## 5. UX 계약

- 기존 주간 일정 보고서와 Excel 다운로드를 유지한다.
- AI report section은 업무도구형 compact UI로 둔다.
- 생성 중에는 중복 클릭을 막고 진행 상태를 보여준다.
- 성공 시 최신 성공 version을 기본 표시한다.
- 실패 version은 접힌 이력으로 표시하고 삭제 기능을 제공하지 않는다.
- snapshot summary는 전체 input 원문이 아니라 count/range/source summary만 보여준다.
- next action/data cleanup suggestion은 target record 열기만 제공한다.
- 사용자 문구는 해요체를 쓴다.

## 6. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 7. 완료 기준

- desktop과 mobile에서 empty/generating/success/failed 상태가 깨지지 않는다.
- 05-A API response 계약과 FE 타입이 일치한다.
- 05-B가 나중에 compose CTA를 연결할 확장 지점이 남아 있다.

## 8. 작업 로그 경로

- `TODO_LOG/<date>/G04_AI_REPORT_USER_WEB/WORK_LOG.md`
