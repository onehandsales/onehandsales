# G01 06 Scope Guard And Code Audit

상태: Not selected / final classification에 흡수
목표: 06 완료 결과가 DealActivity 범위를 넘어 새 알림, 자동 발송, list summary, activity lifecycle/search/score 기능으로 확장되지 않았는지 확인하는 audit 후보였으나, 2026-08-07 최종 분류에서는 별도 12 전 작업으로 선택하지 않는다.

최종 기준은 `../FINAL-CLASSIFICATION.md`다. 06 관련 남은 후보는 `PRE12-F01`, `PRE12-F02`, `PRE12-F03`, `PRE12-F07`, `PRE12-F08`, `PRE12-F38`, `PRE12-F39`, `PRE12-F40` 등으로 분리됐고, 12 전 구현 대상으로 올리지 않는다.

## 1. 선행 조건

- G00 완료
- 06 완료 문서와 실제 코드 상태가 작업 트리에 반영되어 있어야 한다.

## 2. 포함 범위

- 06 관련 변경 파일 확인
- `DealActivity` event 생성과 safe summary 기준 확인
- Notification module 변경 여부 확인
- MeetingNote follow-up 자동 발송/알림 변경 여부 확인
- Company/Contact/Product/MeetingNote list summary response field 추가 여부 확인
- manual activity delete, automatic activity update/delete, DealActivity retention/audit/trash, memo/private memo 통합, 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단 추가 여부 확인
- 필요한 경우 06 문서에 "범위 확장 금지" closeout 보강

## 3. 제외 범위

- 06 기능 신규 구현
- 알림 scheduler 구현
- record summary API 구현
- 자동 발송 구현
- DealActivity 삭제/retention/audit/search/score/AI 확장 구현

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
