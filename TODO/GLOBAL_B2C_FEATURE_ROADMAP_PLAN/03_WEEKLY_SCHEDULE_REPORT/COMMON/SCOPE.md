# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| 주간 보고서 조회 | weekStart와 timezone 기준 7일 보고서 |
| 딜 연결 요약 | 일정에 연결된 딜 요약 |
| 파일 export | PDF/Excel 중 우선순위 결정 후 구현 |
| route 노출 | `/app/schedules/week` redirect 해제 |
| AI 리포트 준비 | 05 AI 주간 영업 리포트가 재사용할 데이터 구조 고려 |
| 범용 ExportJob | `/app/export`, `/api/exports`, job 상태, 다운로드, 민감정보 포함 정책 후보 |
| 일정/회의록 export | 기존 회사/담당자/제품/딜 xlsx 이후 일정/회의록 export 확장 |
| 반복 일정 | 일정 도메인 고도화 후보로 포함하되 주간 보고서와 우선순위 분리 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| AI 요약 | 05에서 분리 |
| Google Calendar import | 04에서 분리 |

## 열린 질문

- 보고서 1차 형식은 화면+Excel인가, 화면+PDF인가?
- 일정이 없는 날도 보고서에 표시할지?
- 딜 금액/단계/다음 행동을 보고서에 포함할지?
- timezone이 바뀌면 기존 보고서 snapshot을 유지할지 실시간 계산할지?
- 범용 ExportJob을 주간 보고서와 함께 만들지, 이 슬롯 안의 별도 `/goal`로 분리할지?
- 민감 데이터 포함 export는 11 운영/보안 정책과 어떤 순서로 맞출지?
- 반복 일정은 단순 repeat rule부터 할지, exception/skip까지 할지?

## 완료 기준 초안

- `/app/schedules/week`에서 주간 보고서를 볼 수 있다.
- weekStart/timezone 기준이 일관된다.
- 파일 export가 선택한 1차 형식으로 동작한다.
- 사용자 소유 일정만 포함된다.
- 범용 ExportJob을 이번 슬롯에서 구현할지 별도 goal로 분리할지 결정되어 있다.
- 반복 일정 포함 여부와 후속 시점이 문서화되어 있다.
