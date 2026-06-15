# G03-MEETING-NOTE-INTEGRATION Spec

## 1. 목적

Backend와 Frontend가 같은 MeetingNote 계약으로 동작하는지 통합 검증하고 완료 기록을 남긴다.

## 2. 포함 범위

- API 계약과 실제 Backend response 비교
- User Web 화면 smoke 검증
- 생성, 목록, 상세, 수정, 필터 수동 시나리오 확인
- `TODO_LOG` 완료 기록 작성
- 남은 후속 범위 정리

## 3. 제외 범위

- 새 기능 구현
- API 계약 변경
- AI/STT 구현
- 삭제/복구 구현

## 4. 검증 시나리오

1. 회사와 담당자가 있는 회의록을 제품/딜 없이 생성한다.
2. 제품과 딜을 포함한 회의록을 생성한다.
3. 목록에서 회사 필터를 적용한다.
4. 목록에서 담당자 필터를 적용한다.
5. 회사 필터와 담당자 필터를 동시에 적용한다.
6. 상세 화면에서 snapshot과 현재 엔티티 정보가 보인다.
7. 수정에서 제품/딜을 빈 배열로 제거한다.
8. 수정에서 회사/담당자를 빈 배열로 만들 수 없는지 확인한다.
9. `timeZone`이 request body에 포함되지 않는지 Network 탭 또는 API client에서 확인한다.
10. `rawText`, `stageText`, 단일 `dealId`, `hasNext`가 새 코드에 남아 있지 않은지 검색한다.

## 5. 완료 기준

- BE 검증 명령이 통과한다.
- FE 검증 명령이 통과한다.
- 주요 시나리오가 통과한다.
- `TODO_LOG/YYYY-MM-DD/G03_MEETING_NOTE_INTEGRATION/WORK_LOG.md`가 작성된다.
- 남은 후속 범위가 이 계획 README 또는 새 계획 후보로 분리되어 있다.
