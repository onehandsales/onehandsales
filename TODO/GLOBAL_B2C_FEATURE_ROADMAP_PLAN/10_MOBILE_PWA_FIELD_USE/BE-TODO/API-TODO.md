# Backend API TODO

상태: Draft

## API 후보

| Method | Path | 목적 |
|---|---|---|
| 기존 | `/api/business-card-scans` | 모바일 촬영 파일 처리 보강 |
| 기존 | `/api/meeting-notes/stt-draft` | 모바일 음성 draft 보강 |
| 후보 | `/api/drafts/*` | server draft가 필요하면 추가 |

## 계약 보강 필요

- mobile upload size
- audio mime type
- draft retention
- offline conflict 처리
- provider failure mapping
- BusinessCard OCR status/error code contract
- retry 가능/불가능 failure 구분
- native app client 식별 후보
