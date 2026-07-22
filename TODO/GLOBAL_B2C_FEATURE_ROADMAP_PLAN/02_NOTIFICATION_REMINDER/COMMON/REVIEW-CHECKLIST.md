# Review Checklist

상태: Confirmed
목적: 02 구현 완료 후 검토자가 확인할 체크리스트

## 1. Product Scope

- [ ] 알림 채널은 앱 안 알림, 브라우저 푸시, 이메일만 포함한다.
- [ ] 알림 대상은 일정 시작 전과 딜 마감일만 포함한다.
- [ ] 다음 행동 알림이 02에 섞이지 않았다.
- [ ] 회의록 후속 알림이 02에 섞이지 않았다.
- [ ] 마케팅 알림이나 automation builder가 추가되지 않았다.

## 2. Scheduling

- [ ] 일정 알림은 `Schedule.startAt - 30분` 기준이다.
- [ ] 딜 마감 알림은 사용자 timezone 기준 `expectedEndDate - 1일 09:00`이다.
- [ ] date-only인 `Deal.expectedEndDate`를 FE가 임의로 UTC 변환하지 않는다.
- [ ] 일정/딜 변경 시 기존 pending notification이 취소되고 새 알림이 생성된다.
- [ ] 일정/딜 삭제 시 pending notification이 취소된다.
- [ ] 이미 지난 일정/딜에 새 reminder가 생성되지 않는다.

## 3. Backend API

- [ ] 모든 API가 `COMMON/API-SPEC/NOTIFICATION_API.md`와 일치한다.
- [ ] 모든 User API는 AuthGuard를 사용한다.
- [ ] notification/subscription/settings에 user ownership이 적용된다.
- [ ] 다른 사용자 데이터 접근은 404 또는 안전한 not found로 처리된다.
- [ ] 읽음 처리는 idempotent하다.
- [ ] unread count는 due/SENT/readAt null 기준이다.
- [ ] settings row가 없어도 기본값 response를 반환한다.

## 4. DB / Migration

- [ ] `COMMON/FIRST-SALE-GATE-MAP.md`의 `NBA-014` DB/Prisma 운영 gate를 확인했다.
- [ ] DB target이 local/dev/test인지 확인하고 기록했다.
- [ ] 신규 enum/model/relation이 Prisma schema에 있다.
- [ ] migration에 enum type, table, index, FK, unique, check constraint가 있다.
- [ ] migration에 `COMMENT ON TYPE`, `COMMENT ON TABLE`, `COMMENT ON COLUMN`, `COMMENT ON INDEX`가 있다.
- [ ] 기존 migration 파일을 수정하지 않고 신규 migration만 추가했다.
- [ ] `Notification.dedupeKey` 중복 방지 기준이 있다.
- [ ] `BrowserPushSubscription` endpoint/key는 ciphertext/hash로 저장된다.
- [ ] provider raw response 저장 금지 기준이 지켜진다.
- [ ] 공유/운영성 DB에 무단 migrate/seed를 실행하지 않았다.

## 5. Delivery

- [ ] due processor가 pending notification을 SENT로 전환한다.
- [ ] email delivery attempt가 생성되고 성공/실패가 기록된다.
- [ ] browser push delivery attempt가 생성되고 성공/실패가 기록된다.
- [ ] retryable failure는 retry 정책을 따른다.
- [ ] non-retryable push subscription failure는 subscription revoke로 이어진다.
- [ ] provider 실패가 앱 안 알림을 rollback하지 않는다.

## 6. Security / Redaction

- [ ] push endpoint가 log/response에 노출되지 않는다.
- [ ] p256dh/auth key가 log/response에 노출되지 않는다.
- [ ] email body 전문이 log에 남지 않는다.
- [ ] provider raw response가 log/DB detail에 남지 않는다.
- [ ] private memo, meeting note body, deal amount가 알림 payload에 들어가지 않는다.
- [ ] token/authorization header가 logging되지 않는다.

## 7. User Web

- [ ] `/app/notifications` redirect가 해제됐다.
- [ ] 기존 notification page 형태를 그대로 따를 필요가 없다는 기준이 지켜졌다.
- [ ] 최종 알림 UX가 `AGENT/UXUI_AGENT`의 Notion식 workspace/page/list 문법과 Attio식 linked record 맥락을 따른다.
- [ ] app shell unread badge가 동작한다.
- [ ] 알림 목록, 읽음 필터, pagination이 동작한다.
- [ ] 읽음 처리 후 list/unread count가 갱신된다.
- [ ] 알림 설정 저장 후 새로고침해도 유지된다.
- [ ] browser push permission denied/unsupported/granted 상태가 모두 처리된다.
- [ ] service worker notification click target이 `/app/*` 경로로 이동한다.
- [ ] 모바일 390px/360px에서 UI가 겹치지 않는다.

## 8. Verification

- [ ] Backend `pnpm run prisma:validate` 통과
- [ ] Backend `pnpm run typecheck` 통과
- [ ] Backend `pnpm run lint` 통과
- [ ] Backend `pnpm run test -- notification` 통과
- [ ] Backend `pnpm run build` 통과
- [ ] User Web `pnpm run typecheck` 통과
- [ ] User Web `pnpm run lint` 통과
- [ ] User Web `pnpm run build` 통과
- [ ] User Web `pnpm run test:e2e` 또는 notification E2E 통과

## 9. Documentation Closeout

- [ ] 구현 결과가 API-SPEC과 다르면 API-SPEC을 갱신했다.
- [ ] 구현 결과가 DB-SCHEMA와 다르면 DB 문서를 갱신했다.
- [ ] 구현 결과가 FE-TODO와 다르면 FE 문서를 갱신했다.
- [ ] QA 결과를 TODO_LOG에 남겼다.
- [ ] 02 README에 완료 상태를 반영했다.
