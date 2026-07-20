# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| `POST` | `/api/imports` | DB 기반 ImportJob 생성 |
| `GET` | `/api/imports/:importJobId` | 확정 전 job 조회/resume |
| `POST` | `/api/imports/:importJobId/map` | AI mapping 결과 저장 |
| `PATCH` | `/api/imports/:importJobId/mapping` | 사용자 mapping 수정 저장 |
| `POST` | `/api/imports/:importJobId/confirm` | 확정 실행 |
| 후보 | `/api/imports/:importJobId/cancel` | 수동 취소가 필요하면 추가 |

## 계약 보강 필요

- job status enum
- TTL/expired response
- row validation error 구조
- confirm transaction rollback 범위
- observability event key
- 업로드 원본/preview row redaction 기준
- 원본 파일 metadata 응답 노출 범위
- 사용자 데이터 export/delete와 import job cleanup 연결
