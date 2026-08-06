# G00 Scope Classification

상태: Ready
목표: 12 전 후속 후보의 상태를 확정하고 06 작업에 적용할 경계를 다시 고정한다.

## 1. 목적

G00은 구현 goal이 아니다. 문서와 실제 코드 상태를 다시 대조해 후보별 상태를 `done`, `pre-12-follow-up-needed`, `post-12-seed`, `billing-blocked`, `Question`, `defer` 중 하나로 확정한다.

## 2. 포함 범위

- 01~05 재대조 결과 확인
- 06, 07 문서와 현재 코드 상태 확인
- `NotificationSourceType`, `DealActivityType`, `DealActivitySourceType`, `AiProviderOperation` 상태 확인
- 후보 matrix 갱신
- 06 작업자가 바로 참고할 구현 금지 조건 보강

## 3. 제외 범위

- 코드 구현
- Prisma schema 변경
- API contract confirmed 승격
- FE route/page/client 추가
- provider smoke 실행

## 4. 검증 기준

- `COMMON/CANDIDATE-MATRIX.md`의 모든 후보가 상태를 가진다.
- `COMMON/API-SPEC/README.md`에 confirmed API가 없음을 유지하거나, confirmed로 올릴 후보가 있으면 별도 사용자 결정 근거가 기록된다.
- 06에서 구현 가능한 범위와 금지 범위가 `README.md`, `SCOPE.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`에 일관되게 남는다.

## 5. 권장 확인 명령

```powershell
rg -n "enum NotificationSourceType|enum DealActivityType|enum DealActivitySourceType|enum AiProviderOperation" BE\prisma\schema.prisma
rg -n "NotificationSourceType|sourceType: \"NEXT|sourceType: \"MEETING|sourceType: \"FOLLOW" BE\src -g "*.ts"
rg -n "NEXT_ACTION|MEETING_NOTE|FOLLOW_UP|알림|reminder|자동 발송|latestActivity|Company/Contact/Product|MeetingNote 목록" TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\06_DEAL_ACTIVITY_TIMELINE TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\07_MEETING_NOTE_AI_PROVIDER_LOG -g "*.md"
```

