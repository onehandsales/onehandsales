# User Web TODO

상태: Draft

## 화면 후보

- `/app/schedules/week`
- `/app/schedules`에서 보고서 진입 버튼
- `/app/export`

## 작업 후보

- route redirect 해제
- 주간 이동/이번 주 이동
- 주간 보고서 loading/empty/error
- 파일 export 버튼
- timezone 표시
- 딜 요약 표시
- generic export 화면 redirect 해제 여부 결정
- export 대상: 회사/담당자/제품/딜/일정/회의록
- export job 상태 polling
- 반복 일정 표시/생성 UX 후보

## 검증 후보

- 390px/360px에서 보고서가 깨지지 않는다.
- weekStart 이동 후 query가 갱신된다.
- export 실패 시 재시도 안내가 있다.
- 민감 데이터 포함 export는 확인 전 실행되지 않는다.
- 반복 일정이 범위 밖이면 사용자에게 노출되지 않는다.
