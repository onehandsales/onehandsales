# User Flow

상태: Draft / Skeleton

## 1. 목적

이 문서는 사용자가 보는 제품 기능 흐름이 아니라, 12 Billing 착수 전 작업자가 따라야 하는 closeout 흐름을 정의한다.

## 2. 작업자 흐름

```text
PRE12 정본 확인
-> 실제 BE/FE 코드 상태 재확인
-> 05 provider smoke 상태 기록
-> 10 문서 체크리스트 정합성 정리
-> User Web route/architecture 문서 정리
-> 11 문서 체크리스트/goal index 정리
-> Admin Web architecture/legacy route 문서 정리
-> 12 Billing 착수 가능 상태 handoff
```

## 3. 사용자가 보는 변화

- 일반 사용자에게 새 기능이 노출되지 않는다.
- `/app/notifications`는 현재 활성 상태를 유지한다.
- `/app/export`는 현재 redirect 상태를 유지한다.
- Admin Web의 11 운영 route는 현재 활성 상태를 유지한다.
- Billing, subscription, tax 기능은 이 계획에서 노출하지 않는다.

## 4. 운영자 확인 흐름

G01 provider smoke closeout에서만 외부 운영 확인이 필요할 수 있다.

```text
provider env key 존재 확인
-> provider console callback URL 등록 여부 확인
-> Gmail OAuth 연결 smoke
-> Gmail allowlist 수신자 실제 발송 smoke
-> Microsoft OAuth 연결 smoke
-> Microsoft allowlist 수신자 실제 발송 smoke
-> allowlist 밖 수신자 차단 smoke
-> 결과와 미실행 사유 문서 기록
```

비밀값, access token, refresh token, 수신자 개인정보 원문은 문서에 기록하지 않는다.

## 5. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/GOAL-WORK-ORDER.md`
- `TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G01_PROVIDER_SMOKE_CLOSEOUT.md`
