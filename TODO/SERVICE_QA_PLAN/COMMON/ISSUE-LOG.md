# Service QA Issue Log

상태: No Issues Recorded
작성일: 2026-08-12

## 1. 기록 규칙

이슈는 발견 즉시 아래 형식으로 기록한다.

상태:

- `Open`
- `Fixed`
- `Deferred`
- `N/A`
- `Blocked`

Severity:

- `S0 Blocker`
- `S1 Critical`
- `S2 Major`
- `S3 Minor`
- `S4 Polish`
- `QA Infra`

Triage:

- `KEEP`
- `FIX`
- `IMPROVE`
- `REMOVE`
- `HIDE`
- `DEFER`
- `RETHINK`

처리 방식:

- `Fix Now`: QA 흐름을 크게 끊지 않는 작고 명확한 수정
- `Batch Later`: 기능별 QA 한 바퀴 이후 묶어서 처리
- `Backlog`: 베타 이후 또는 별도 계획으로 이동

## 2. Issue Template

```markdown
## QA-001 제목

- 상태: Open
- Severity: S2 Major
- Triage: FIX
- 처리 방식: Fix Now
- 영역: FE/user-web > 예: 딜 생성
- 발견일: 2026-08-12
- 환경: Chrome / Windows / localhost
- 관련 goal: G04-REAL-BE-INTEGRATION-QA

### 재현 절차

1. `/app/deals`로 이동
2. `딜 생성` 클릭
3. 필수값 입력
4. 저장 클릭

### 기대 결과

딜이 저장되고 목록 또는 상세 화면에서 확인된다.

### 실제 결과

저장이 실패하거나 화면이 멈춘다.

### 증거

- Screenshot:
- Trace:
- Console:
- API response:

### 처리 메모

- 원인:
- 수정 파일:
- 재검증 명령:
```

## 3. Feature Triage Template

```markdown
## FT-001 영역/기능명

- 상태: Open
- Triage: IMPROVE
- 우선순위: S3 Minor
- 영역: FE/user-web > 예: Import
- 발견일: 2026-08-13
- 처리 방식: Batch Later

### 현재 동작

현재 사용자가 경험하는 흐름을 적는다.

### 판단

KEEP/FIX/IMPROVE/REMOVE/HIDE/DEFER/RETHINK 중 하나와 이유를 적는다.

### 조치

- 즉시 수정:
- 묶어서 처리:
- 후속 문서:
```

## 4. Open Issues

현재 기록된 Open issue 없음.
