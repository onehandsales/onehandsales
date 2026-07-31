# G05 Mobile Notification Permission UX Work Log

상태: Done
작업일: 2026-07-31

## 작업 내용

- User Web 알림 화면에서 서비스 알림 설정과 browser push 권한 UX를 분리했다.
- `Notification.requestPermission()`은 `푸시 알림 켜기` 클릭 후 설명 dialog의 `계속` 클릭에서만 실행되도록 바꿨다.
- 권한 설명 dialog에 서비스성 알림 목적과 광고성 알림 분리 copy를 추가했다.
- `granted`, `denied`, `default`, `unsupported` 상태별 안내 UI를 보강했다.
- browser push 구독 생성은 기존 public key/subscription API를 재사용한다.
- 구독 해제는 기존 subscription delete API와 local subscription ID 정리를 유지한다.
- 서비스 알림 저장은 기존 notification settings PATCH API를 재사용하되 browser push 자동 허용으로 취급하지 않는다.
- G05 범위에서는 신규 marketing opt-in DB/API, native push token, notification delivery runner 변경을 만들지 않았다.
- push permission client event는 endpoint/key/userAgent 없이 browser 내부 CustomEvent로만 발행했다. 09 collector allowlist 확장은 G06 범위로 남겼다.

## 검증 결과

- `pnpm.cmd --dir FE/user-web test -- notification` 통과
- `pnpm.cmd --dir FE/user-web typecheck` 통과
- `pnpm.cmd --dir FE/user-web lint` 통과
- `pnpm.cmd --dir FE/user-web test:e2e -- notification` 통과
- `pnpm.cmd --dir BE test -- notification` 통과

## 검토 결과

- 검토 횟수: 3회 완료
- 1차: G05/API 계약, UX copy, 기존 notification API 재사용 범위 확인
- 2차: 구현 diff, explicit click flow, denied/default/unsupported/granted UI 확인 후 marketing copy와 event payload를 보정했다.
- 3차: commit 직전 checklist, DB/BE 무변경, endpoint/key analytics 미포함, 무관 변경 제외 확인. 추가 수정 사항 없음.

## 미실행 검증

- production build는 G05 권장 command가 아니라 실행하지 않았다.
- Backend 코드는 변경하지 않아 Backend typecheck/lint는 실행하지 않았다.
