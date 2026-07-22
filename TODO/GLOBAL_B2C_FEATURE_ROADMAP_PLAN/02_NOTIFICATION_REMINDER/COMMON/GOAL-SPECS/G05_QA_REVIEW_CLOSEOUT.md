# G05 QA Review Closeout

상태: Ready after G01-G04

## 1. 목적

02 Notification Reminder가 Global B2C retention 기능으로 안전하게 닫혔는지 검증하고, 구현 결과와 문서를 맞춘다.

## 2. 선행 조건

- G01 DB foundation 완료
- G02 Backend API 완료
- G03 reminder generation/delivery 완료
- G04 User Web UX 완료

## 3. 포함 범위

- Backend validation, lint, test, build
- User Web typecheck, lint, build, E2E
- 일정 알림 QA
- 딜 마감 알림 QA
- email delivery stub/provider QA
- browser push permission/subscription QA
- provider failure redaction QA
- cross-user 접근 차단 QA
- 문서와 구현 결과 정합성 점검
- `COMMON/REVIEW-CHECKLIST.md` 기준 검토

## 4. 제외 범위

- 다음 행동 알림 QA
- 회의록 후속 알림 QA
- Admin provider failure UI QA
- Billing/email compliance full review
- native push QA

## 5. 수동 QA 시나리오

```text
1. 일정 생성 -> 시작 30분 전 pending notification 생성 확인
2. 일정 시간 수정 -> 기존 pending 취소, 새 pending 생성 확인
3. 일정 삭제 -> pending notification 취소 확인
4. 딜 생성 -> 마감 1일 전 오전 9시 pending notification 생성 확인
5. 딜 마감일 수정 -> 기존 pending 취소, 새 pending 생성 확인
6. 딜 삭제 -> pending notification 취소 확인
7. due processor 실행 -> 앱 안 알림 SENT 전환 확인
8. email enabled -> EMAIL delivery attempt 생성/성공 확인
9. browser push enabled + subscription -> BROWSER_PUSH delivery attempt 생성/성공 확인
10. provider 실패 강제 -> safe error와 retry/revoke 정책 확인
11. 다른 user notification/subscription 접근 -> 404 확인
12. User Web 알림 읽음 -> unread badge 감소 확인
13. push permission denied -> 안전한 fallback 확인
```

## 6. 검증 명령

Backend:

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- notification
pnpm run build
```

User Web:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 7. 완료 기준

- Backend/User Web 검증 명령이 통과한다.
- 핵심 수동 QA가 통과한다.
- email/browser push provider 실패가 앱 안 알림을 깨뜨리지 않는다.
- cross-user 접근 차단이 확인된다.
- push endpoint/key, provider raw response, email body 전문이 log/response에 노출되지 않는다.
- 구현 결과가 API/DB/FE 문서와 다르면 문서를 갱신한다.
