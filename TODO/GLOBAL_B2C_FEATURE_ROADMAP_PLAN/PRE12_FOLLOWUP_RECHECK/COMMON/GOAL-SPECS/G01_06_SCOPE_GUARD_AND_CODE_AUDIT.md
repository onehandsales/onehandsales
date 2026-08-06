# G01 06 Scope Guard And Code Audit

상태: Pending
목표: 현재 06 작업 결과가 DealActivity 범위를 넘어 새 알림, 자동 발송, list summary 기능으로 확장되지 않았는지 확인한다.

## 1. 선행 조건

- G00 완료
- 다른 터미널의 06 작업 변경분이 작업 트리에 반영되어 있어야 한다.

## 2. 포함 범위

- 06 관련 변경 파일 확인
- `DealActivity` event 생성과 safe summary 기준 확인
- Notification module 변경 여부 확인
- MeetingNote follow-up 자동 발송/알림 변경 여부 확인
- Company/Contact/Product/MeetingNote list summary response field 추가 여부 확인
- 필요한 경우 06 문서에 "범위 확장 금지" closeout 보강

## 3. 제외 범위

- 06 기능 신규 구현
- 알림 scheduler 구현
- record summary API 구현
- 자동 발송 구현

## 4. 완료 기준

- 06 변경이 DealActivity timeline 범위 안이면 `pre-12-follow-up-done`으로 기록한다.
- 06 변경이 후보 기능을 넓혔다면 해당 후보를 이 폴더의 matrix로 이동시키고, 구현 코드는 별도 결정 전 유지하지 않는다.
- private memo, provider raw, follow-up body 전체, meeting note raw text가 새 response/log에 노출되지 않음을 확인한다.

## 5. 권장 확인 명령

```powershell
git status --short
rg -n "NotificationSourceType|schedule.*reminder|deal.*reminder|NEXT_ACTION.*reminder|MEETING_NOTE.*reminder|FOLLOW_UP.*reminder" BE\src BE\prisma\schema.prisma -g "*.ts" -g "*.prisma"
rg -n "latestActivity|latestSummary|Company|Contact|Product|MeetingNote" BE\src\modules\deal BE\src\modules\meeting-note FE\user-web\src\features -g "*.ts" -g "*.tsx"
```

