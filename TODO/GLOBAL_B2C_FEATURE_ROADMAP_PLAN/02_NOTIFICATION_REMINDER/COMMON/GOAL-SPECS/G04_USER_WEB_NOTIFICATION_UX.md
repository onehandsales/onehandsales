# G04 User Web Notification UX

상태: Ready after G02/G03

## 1. 목적

User Web에서 `/app/notifications`를 열고 알림 목록, unread badge, 읽음 처리, 알림 설정, browser push permission/subscription UX를 제공한다.

## 2. 선행 조건

- G02 API 구현 완료
- G03 delivery API 계약 영향 없음 확인
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 확인한다.
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`와 `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`를 확인한다.
- 기존 `features/notification` 구조를 확인하되, 재사용을 전제로 하지 않는다.

## 3. 포함 범위

- `/app/notifications` redirect 해제
- notification API client를 `COMMON/API-SPEC/NOTIFICATION_API.md`에 맞게 수정
- notification type/status 타입 수정
- app shell 알림 아이콘/unread badge
- UXUI_AGENT 기준에 맞춘 알림 목록, 필터, pagination
- 읽음 처리 mutation과 query invalidation
- settings 조회/저장
- browser push permission 요청
- service worker target path 수정
- push unsupported/denied/granted 상태 처리
- mobile card/list layout
- E2E mock route 업데이트

## 4. 제외 범위

- Admin Web
- `/admin/api/*` 호출
- 다음 행동 알림 UI
- 회의록 후속 알림 UI
- email template editor
- marketing notification UI

## 5. UX 기준

- 기존 `/app/notifications` page 형태를 보존하는 것이 목표가 아니다.
- 기존 notification component가 UXUI_AGENT 기준, 공용 shell/state UI, API 계약과 맞지 않으면 새로 구성한다.
- Notion식 page/list 문법과 Attio식 일정/딜 linked record 맥락을 따른다.
- 알림 화면은 일정/딜 record로 돌아가는 업무용 reminder surface로 보이게 한다.
- 사용자는 내부 `NotificationDeliveryAttempt` 같은 용어를 보지 않는다.
- 알림 row는 대상과 action을 빠르게 보여준다.
- push 권한 요청은 사용자가 toggle을 켤 때만 실행한다.
- email/browser push 실패 상세는 사용자에게 provider raw로 노출하지 않는다.
- private memo, meeting note body, deal amount는 알림 목록에 표시하지 않는다.

## 6. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 7. 완료 기준

- `/app/notifications` 접근이 가능하다.
- 기존 notification page를 그대로 복구하지 않아도 되며, 최종 UI가 UXUI_AGENT review 기준을 통과한다.
- unread badge가 app shell에 표시된다.
- 알림 읽음 처리 후 목록과 badge가 갱신된다.
- 설정 저장 후 새로고침해도 유지된다.
- push unsupported/denied 상태에서 화면이 깨지지 않는다.
- 390px/360px 모바일에서 알림 목록과 설정이 겹치지 않는다.
