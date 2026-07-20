# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `GET` | `/api/schedules/week` | 주간 보고서 조회 |
| `POST` | `/api/schedules/week/export` | 주간 보고서 파일 생성 |
| 후보 | `/api/exports` | 범용 export job 생성 |
| 후보 | `/api/exports/:exportJobId` | export job 상태 조회 |
| 후보 | `/api/exports/:exportJobId/download` | export 파일 다운로드 |
| 후보 | `/api/schedules/recurring-rules` | 반복 일정 rule이 필요하면 추가 |

## 계약 보강 필요

- `weekStart` date-only validation
- `timeZone` IANA validation
- `weekEnd` 계산 기준
- days array response 구조
- export format enum
- xlsx/pdf 파일 응답 방식
- observability event key
- export target enum
- includeSensitiveData 확인값
- export job idempotency
- 반복 일정 recurrence rule validation
