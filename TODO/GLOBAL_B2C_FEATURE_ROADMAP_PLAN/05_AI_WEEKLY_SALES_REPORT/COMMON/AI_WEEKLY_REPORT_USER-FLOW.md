# 05-A User Flow

상태: Implementation-ready draft

## 1. 진입

1. 사용자가 `/app/schedules/week`에 들어간다.
2. 기존 주간 일정 보고서와 Excel 다운로드가 그대로 보인다.
3. 보고서 상단 또는 본문 첫 section 아래에 `AI 리포트` section을 보여준다.
4. 현재 주의 최신 성공 AI 리포트가 있으면 바로 표시한다.
5. 성공 리포트가 없으면 `리포트 생성` 버튼을 보여준다.

문구 예:

- Empty: `AI 리포트를 만들면 이번 주 리스크와 다음 행동을 한눈에 볼 수 있어요.`
- Button: `리포트 생성`
- Loading: `리포트를 만들고 있어요.`
- Failure: `리포트를 만들지 못했어요. 다시 시도해 주세요.`

## 2. 리포트 생성

1. 사용자가 `리포트 생성`을 누른다.
2. FE는 `POST /api/sales-reports/weekly`를 호출한다.
3. 응답으로 `reportId`, `jobId`, `status=GENERATING`, `version`을 받는다.
4. FE는 `GET /api/sales-reports/weekly/:reportId` 또는 week query를 polling한다.
5. `READY`가 되면 AI 리포트 section을 표시한다.
6. `FAILED`가 되면 실패 상태와 `다시 생성` 버튼을 표시한다.

## 3. 중복 생성

1. 같은 주에 이미 생성 중이면 FE는 새 요청을 만들지 않는다.
2. 사용자가 빠르게 여러 번 눌러도 버튼은 disabled 상태다.
3. Backend가 `AiWeeklySalesReportAlreadyGenerating`을 반환하면 기존 생성 중 report를 계속 polling한다.

## 4. 리포트 읽기

AI 리포트는 아래 순서로 배치한다.

1. 생성 정보: `v3`, 생성 시각, 상태
2. 주간 요약
3. 주요 리스크
4. 다음 주 행동
5. follow-up 초안
6. 데이터 정리 제안
7. 참고 데이터 요약
8. version 목록

## 5. Version 목록

1. 기본 목록에는 성공 version을 최신순으로 표시한다.
2. 실패 이력은 `실패한 생성 시도 2건`처럼 접어서 표시한다.
3. version은 삭제하거나 숨길 수 없다.
4. version 이름은 `v3 · 2026-07-24 14:10 생성`처럼 자동 표시한다.

## 6. Suggestion interaction

리스크:

- `딜 열기`, `일정 열기`, `회의록 열기`만 제공한다.
- 자동 수정은 제공하지 않는다.

다음 행동:

- `딜 열기`, `회의록 열기`, `일정 열기`만 제공한다.
- `다음 행동으로 추가`는 05-A에서 만들지 않는다.

Follow-up 초안:

- 05-A에서는 초안 카드와 05-B 연결 placeholder만 설계한다.
- 05-B 구현 전에는 `이메일 작성`, `문자 작성` 버튼을 사용자에게 노출하지 않는다.

데이터 정리:

- `대상 열기`만 제공한다.
- 자동 연결/자동 병합/자동 수정은 제공하지 않는다.

## 7. 모바일

- desktop table을 억지로 유지하지 않는다.
- 리스크, 다음 행동, follow-up, 데이터 정리는 card/list로 표현한다.
- 긴 AI 본문은 section 단위로 접거나 줄 간격을 확보한다.
- CTA는 짧게 쓴다. 예: `딜 열기`, `일정 열기`, `다시 생성`.

## 8. 접근성

- 생성 버튼은 loading 중 disabled와 `aria-busy` 상태를 제공한다.
- version 목록과 실패 이력 접기에는 명확한 label을 둔다.
- 리스크 severity는 색상만으로 구분하지 않고 text label을 함께 둔다.
