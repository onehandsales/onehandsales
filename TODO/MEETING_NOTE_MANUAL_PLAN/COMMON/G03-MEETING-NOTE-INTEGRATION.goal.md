# /goal G03-MEETING-NOTE-INTEGRATION

## 1. Goal

MeetingNote Backend와 User Web 연동을 통합 검증하고 완료 기록을 남긴다.

## 2. 선행 조건

- `G01-BE-MEETING-NOTE-DOMAIN` 완료
- `G02-FE-MEETING-NOTE-PAGES` 완료

## 3. 먼저 읽을 문서

- `TODO/MEETING_NOTE_MANUAL_PLAN/README.md`
- `TODO/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
- `TODO/MEETING_NOTE_MANUAL_PLAN/COMMON/GOAL-SPECS/G03-MEETING-NOTE-INTEGRATION.md`
- `TODO/MEETING_NOTE_MANUAL_PLAN/COMMON/PLANNING-REVIEW.md`

## 4. 작업 체크리스트

- [ ] Backend와 User Web dev 환경을 실행한다.
- [ ] 수동 회의록을 회사/담당자만 포함해 생성한다.
- [ ] 수동 회의록을 회사/담당자/제품/딜을 포함해 생성한다.
- [ ] 목록 pagination과 summary를 확인한다.
- [ ] 회사 필터를 확인한다.
- [ ] 담당자 필터를 확인한다.
- [ ] 회사+담당자 조합 필터를 확인한다.
- [ ] 상세 화면에서 snapshot과 현재 엔티티 표시를 확인한다.
- [ ] 수정에서 제품/딜 제거를 확인한다.
- [ ] 수정에서 회사/담당자 빈 배열 validation을 확인한다.
- [ ] request body에 `timeZone`, `rawText`, `stageText`, 단일 `dealId`가 없는지 확인한다.
- [ ] `hasNext` 의존성이 남아 있지 않은지 확인한다.
- [ ] BE 검증 명령을 재실행한다.
- [ ] FE 검증 명령을 재실행한다.
- [ ] `TODO_LOG` 완료 기록을 작성한다.

## 5. Acceptance Criteria

- 생성, 목록, 상세, 수정, 필터가 실제 화면과 API에서 모두 통과한다.
- API 계약과 FE type이 일치한다.
- AI/STT, 삭제/복구, Admin, DealActivity는 후속 범위로 남아 있다.
- 완료 로그에 검증 명령과 결과가 남아 있다.

## 6. 완료 기록

완료 후 아래 경로에 작업 로그를 작성한다.

```text
TODO_LOG/YYYY-MM-DD/G03_MEETING_NOTE_INTEGRATION/WORK_LOG.md
```
