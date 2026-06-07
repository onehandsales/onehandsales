# G27 Notification 기본 흐름

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

## 요구사항 체크
- Notification Backend 기본 조회/읽음/설정/push subscription API를 구현한다.
- 일정 알림 생성 흐름을 Notification 데이터로 연결한다.
- 딜 마감/다음 행동 알림 생성 흐름을 구현한다.
- 회의록 생성 완료 알림을 구현한다.
- SMTP email 발송 adapter와 테스트용 stub adapter를 제공한다.
- Web Push VAPID 발송 adapter와 테스트용 stub adapter를 제공한다.
- User Web에서 알림 목록, 읽지 않은 count, 읽음 처리, 알림 설정, browser push permission/구독/해제를 제공한다.

## 제외 범위
- 특정 유료 email SaaS vendor 고정
- native mobile push

## 작업 로그
- G27 기준 문서와 Notification endpoint 계약을 확인했다.
- Prisma schema에 `Notification`, `UserSetting`, `BrowserPushSubscription`, `ScheduleReminder` 모델이 이미 있음을 확인했다.
- 기존 `/api/users/me/settings`가 UserSetting을 다루고 있으므로 G27의 `/api/notifications/settings`는 같은 설정을 알림 전용 endpoint로 갱신하도록 구현하기로 했다.
- 기존 `ScheduleReminder`는 생성되지만 `Notification` 데이터가 아직 생성되지 않음을 확인했다.
- Backend `notification` 모듈에 목록/읽음/설정/public key/browser subscription API를 추가했다.
- SMTP email adapter, Web Push VAPID adapter, local/test용 stub adapter를 추가했다.
- 발송 job use case를 추가하고 provider 오류는 최대 3회 retry 후 `FAILED` 처리하도록 구현했다.
- 일정 생성/수정, 딜 생성/수정/다음 행동 변경/연기/완료, 회의록 저장 흐름에서 Notification을 생성/갱신하도록 연결했다.
- User Web `/notifications` 화면에 알림 목록, unread count, 읽음 처리, 알림 설정, browser push 권한/구독/해제 UI를 추가했다.
- browser push service worker를 추가했다.

## 검토
- Notification 목록은 사용자 소유 데이터만 조회하고 read filter는 `readAt` 기준으로 동작한다.
- 읽음 처리는 idempotent하게 `readAt`과 `READ` 상태를 갱신한다.
- 일정 reminder와 딜 마감/다음 행동은 pending notification을 새 기준으로 교체하고, 완료/제거 상태에서는 pending notification을 취소한다.
- SMTP/Web Push 실제 adapter는 `.env.example`의 `SMTP_*`, `VAPID_*` 값이 모두 있을 때 선택되고, 값이 없으면 stub adapter가 사용된다.
- Push endpoint/key 원문은 기존 encryption port로 암호화 저장하고, 발송 시에만 복호화한다.
- G27 제외 범위인 유료 email SaaS vendor 고정과 native mobile push는 추가하지 않았다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm run build`
- `cd BE && pnpm run test -- notification schedule deal meeting-note`
- `cd BE && pnpm run test`
- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`
- Playwright mock API smoke: `/notifications` 접속, unread count 표시, 알림 읽음 처리, 설정 저장 확인
- 스크린샷 확인: `/tmp/g27-notification-desktop.png`, `/tmp/g27-notification-mobile.png`

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G27 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
