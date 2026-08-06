# API Spec

상태: Draft / confirmed API 없음
작성일: 2026-08-06

## 1. 목적

이 폴더는 `PRE12_FOLLOWUP_RECHECK`에서 생길 수 있는 API 후보의 계약 상태를 관리한다.

현재 이 계획에는 바로 구현 가능한 confirmed API가 없다. 아래 후보는 모두 contract 작업 전용이다.

## 2. 후보 API 계약 상태

| 후보 | 예상 API 방향 | 상태 | 구현 가능 여부 |
| --- | --- | --- | --- |
| 다음 행동 reminder | Notification source 확장 또는 NextAction reminder 전용 endpoint/setting | draft placeholder | 구현 금지 |
| 회의록 follow-up reminder | MeetingNote 기반 follow-up reminder 생성/취소/목록 | draft placeholder | 구현 금지 |
| Company/Contact/Product latest summary | 기존 list response field 추가 또는 summary endpoint | defer | 12 전 계약화/구현 금지. 비고: 2026-08-06 A 결정, post-12 B2B/team CRM strategy seed. |
| MeetingNote list latest/next summary | `GET /api/meeting-notes` response field 추가 또는 별도 summary endpoint | post-12-seed | 12 전 구현 금지 |
| Import scale/source/Admin 확장 | 대용량 import worker API, 일정/회의록 import source API, ImportJob Admin 전용 API | post-12-seed | 12 전 구현 금지 |
| Gmail/Microsoft provider smoke closeout | 새 API 없음 | not applicable | 운영 smoke 기록만 가능 |

## 3. API 계약을 만들 때 필수로 채울 항목

새 API 계약을 confirmed로 올리기 전에는 아래를 모두 채운다.

- API 이름과 생명주기
- 소비자
- method/path
- path param, query, header, body
- request DTO 이름과 validation
- success status와 response DTO
- error code와 사용자 표시 기준
- 인증, 권한, ownership
- transaction 필요 여부와 rollback 범위
- provider 호출 여부와 호출 위치
- observability event key, audit log 필요 여부, redaction 기준
- 연결 Prisma model, enum, index, retention 기준
- FE 처리 기준과 optimistic update 여부

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
