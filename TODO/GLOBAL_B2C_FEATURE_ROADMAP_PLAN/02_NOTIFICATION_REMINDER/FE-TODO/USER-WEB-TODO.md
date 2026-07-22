# User Web TODO

상태: Confirmed
구현 상태: G04 Done
기준 문서:

- `COMMON/SCOPE.md`
- `COMMON/API-SPEC/NOTIFICATION_API.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

## 1. 목표

User Web에서 일정 시작 전과 딜 마감일 알림을 확인하고, 읽음 처리하고, email/browser push 설정을 관리할 수 있게 한다.

## 2. 현재 FE 상태

- `FE/user-web/src/features/notification` 코드는 02 API 계약에 맞춰 타입, API client, query key, mutation invalidation을 정리했다.
- `FE/user-web/src/pages/notifications/index.tsx`는 `/app/notifications` route에서 접근된다.
- `FE/user-web/public/notification-sw.js`의 기본 click target은 `/app/notifications`로 정리했다.
- `FE/user-web/src/app/router/router.tsx`에서 `/app/notifications` redirect를 해제했다.
- API client는 `/api/notifications/settings` 기준으로 정리했다.
- 기존 notification feature/page는 참고 대상일 뿐 UX source of truth가 아니다. UXUI_AGENT 기준과 충돌하면 새 구조로 재작성하거나 기존 컴포넌트를 폐기할 수 있다.

## 3. Route

| Route | 목적 |
|---|---|
| `/app/notifications` | 알림 목록, 읽음 처리, 알림 설정 요약, push 권한 상태 |
| `/app/settings` | 알림 설정 진입점 또는 설정 section |

Route 정책:

- Backend API 구현 전에는 redirect를 해제하지 않는다.
- G04에서 redirect를 해제한다.
- app shell에는 알림 아이콘과 unread badge를 추가한다.
- route 이름은 `/app/notifications`를 사용하되, 현재 `pages/notifications/index.tsx`의 화면 형태를 그대로 유지할 의무는 없다.

## 4. API 연결

| 화면 행동 | API | FE 처리 |
|---|---|---|
| 알림 화면 진입 | `GET /api/notifications` | 목록, unread count, pagination 표시 |
| app shell 표시 | `GET /api/notifications/unread-count` | badge 숫자 표시 |
| 알림 읽음 | `PATCH /api/notifications/:notificationId/read` | 목록과 unread count invalidation |
| 설정 조회 | `GET /api/notifications/settings` | toggle와 reminder 기본값 표시 |
| 설정 저장 | `PATCH /api/notifications/settings` | 저장 후 settings/unread 관련 query 갱신 |
| push key 조회 | `GET /api/notifications/browser-push/public-key` | PushManager subscribe에 사용 |
| push 등록 | `POST /api/notifications/browser-subscriptions` | browserPushEnabled true 저장 또는 상태 갱신 |
| push 해제 | `DELETE /api/notifications/browser-subscriptions/:subscriptionId` | subscription 상태 갱신 |

## 5. Query Key

```ts
['notifications', 'list', { page, pageSize, read, includeUpcoming }]
['notifications', 'unread-count']
['notifications', 'settings']
['notifications', 'browser-push-public-key']
['notifications', 'browser-subscriptions']
```

Mutation 후 invalidation:

- read success: list, unread-count
- settings update success: settings
- push subscription create/revoke success: settings, browser-subscriptions

## 6. 화면 구성

화면 설계 원칙:

- 기존 알림 페이지를 그대로 복구하는 작업이 아니다.
- `AGENT/UXUI_AGENT` 기준의 Notion식 workspace/page/list 문법과 Attio식 record 관계 UX를 우선한다.
- 알림은 독립 marketing inbox가 아니라 일정/딜 record로 돌아가게 하는 업무용 activity/reminder surface로 설계한다.
- desktop은 조용한 page + compact list 구조를 우선하고, mobile은 card/list 구조를 우선한다.
- 기존 `features/notification` 코드가 API 계약, 공용 shell/state UI, UX writing 기준과 맞지 않으면 재사용하지 않는다.
- page size는 API 계약의 기본 15를 유지한다. FE 단독으로 변경하지 않는다.

### `/app/notifications`

- 상단 제목: `알림`
- unread count
- 필터: 전체, 읽지 않음, 읽음
- 알림 row/card
  - 제목
  - 짧은 내용
  - 대상 타입: 일정 또는 딜
  - 예정/발송 시각
  - 읽음 상태
  - 대상 상세로 이동
- empty state
- loading/error state
- 설정 요약 panel

### App Shell

- bell icon button
- unread count badge
- 클릭 시 `/app/notifications`
- badge는 99+ 처리

### Settings

- 일정 알림 toggle
- 딜 마감 알림 toggle
- 이메일 알림 toggle
- 브라우저 푸시 toggle
- 일정 알림 시간: 30분 전 고정값 표시 또는 disabled select
- 딜 마감 알림: 마감 1일 전 오전 9시 고정값 표시

## 7. Browser Push UX

- 권한 요청은 사용자가 browser push toggle을 켤 때만 실행한다.
- 브라우저가 push를 지원하지 않으면 toggle을 disabled하고 짧게 안내한다.
- permission denied면 다시 요청하지 않고 브라우저 설정 안내만 보여준다.
- service worker 경로는 `/notification-sw.js`를 유지하되 notification click target은 `/app/notifications` 또는 notification `targetPath`로 이동한다.
- subscription 등록 성공 전에는 browser push enabled로 보이지 않게 한다.

## 8. Email UX

- email 알림 toggle을 제공한다.
- 사용자 email이 없으면 email toggle을 disabled하고 안내한다.
- 이메일 본문 상세 편집은 제공하지 않는다.
- 수신거부/정책 문구는 12 Billing/Trust 문서와 연결될 수 있으나, 02에서는 사용자 설정 toggle로 끄는 흐름을 제공한다.

## 9. UX 기준

- 알림 화면은 업무 도구처럼 조용하고 스캔 가능해야 한다.
- marketing copy나 automation builder처럼 보이면 안 된다.
- 기존 notification page의 시각 구조를 보존하는 것보다 현재 User Web shell, 공용 상태 UI, 공용 list/card 문법과 맞추는 것을 우선한다.
- Notion 브랜드/화면을 복제하지 않고, page/list/detail 문법만 참고한다.
- Attio 브랜드/화면을 복제하지 않고, 일정/딜 linked record 맥락만 참고한다.
- 알림 row는 한 줄 요약과 대상 이동을 우선한다.
- private memo, meeting note body, deal amount를 알림 목록에 노출하지 않는다.
- 모바일에서는 table이 아니라 card/list로 표시한다.

## 10. 테스트 기준

Component:

- unread badge가 0일 때 숨거나 0으로 표시되는 정책이 일관된다.
- 읽음 처리 중 버튼 중복 클릭이 막힌다.
- push unsupported/denied/granted 상태가 각각 표시된다.
- 긴 알림 제목이 layout을 깨지 않는다.

E2E:

- `/app/notifications` 접근이 가능하다.
- 목록 mock 응답이 표시된다.
- 읽음 처리 후 unread count가 갱신된다.
- 설정 저장 후 새로고침해도 유지된다.
- push 미지원 브라우저 mock에서 화면이 깨지지 않는다.

검증 명령:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```
