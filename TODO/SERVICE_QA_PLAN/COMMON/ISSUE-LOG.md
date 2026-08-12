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

## 2. Issue Template

```markdown
## QA-001 제목

- 상태: Open
- Severity: S2 Major
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

## 3. Open Issues

현재 기록된 Open issue 없음.

