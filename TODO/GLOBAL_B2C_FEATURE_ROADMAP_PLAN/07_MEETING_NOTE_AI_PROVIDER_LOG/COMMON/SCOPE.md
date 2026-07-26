# Scope

상태: Confirmed
확정일: 2026-07-26

## 1. 목적

07의 범위는 MeetingNote AI/STT를 Global B2C 판매 가능한 사용자 가치로 끌어올리는 것이다.

1차 기능은 `회의 직후 next action 후보`와 `follow-up 초안`이다. Provider log는 이 기능을 유료 제품 수준으로 운영하기 위한 기반이다.

## 2. 포함 범위

| 항목 | 내용 |
|---|---|
| Provider call log | 기존 `AiProviderCallLog`를 확장해 MeetingNote AI/STT/next action/follow-up provider 호출 상태, provider, model, latency, token/cost, safe error를 기록한다. |
| Transcript policy | STT transcript 원문은 DB에 저장하지 않는다. User Web에서 사용자가 확인하는 임시 표시만 허용한다. |
| Raw/prompt redaction | provider raw response, prompt 원문, 회의록 원문, transcript 원문, 음성 파일, API key, quota detail은 저장하지 않는다. |
| Safe failure UX | 사용자에게는 안전한 실패 문구와 retryable 여부만 노출한다. |
| Next action draft | 저장된 회의록에서 다음 행동 후보를 생성한다. 후보는 사용자가 확인/수정한 뒤 기존 딜 다음 행동 저장 흐름으로 저장한다. |
| Follow-up draft | 저장된 회의록에서 email/SMS용 follow-up 초안을 생성한다. 초안은 자동 발송하지 않고 사용자가 확인/수정/복사한다. |
| UX/UI | MeetingNote 상세 record page 안에 Notion식 section과 Attio식 linked record 맥락으로 배치한다. |
| Backend 주석 | 코드 작업 시 class/interface/API/function/처리 단계에 한글 주석을 반드시 추가한다. |

## 3. 제외 범위

| 항목 | 이유 |
|---|---|
| `MeetingNoteTranscript` table | transcript 원문 장기 저장은 Global B2C 개인정보/삭제권 리스크가 크므로 1차 제외한다. |
| `MeetingNoteFollowUpDraft` table | follow-up 초안 subject/body를 DB에 저장하지 않는다. |
| AI data cleanup 제안 | 회의록/명함/Import 전체 데이터 품질과 연결되어 1차 범위를 넘는다. |
| MeetingNote 목록 latest/next summary | 목록 summary는 raw text/민감 원문 노출 정책 안정화 뒤 후속으로 둔다. |
| Admin 운영 조회 API/UI | 11 Admin Operation에서 masking, reason, audit와 함께 구현한다. |
| 자동 발송 | 05 follow-up delivery와 범위가 겹치고 사용자 확인 원칙과 충돌한다. |
| 자동 일정 생성/딜 변경 | AI 자동 mutation은 금지한다. |
| 음성 파일 장기 저장 | 정책 확정 전 제외한다. |
| 결제/구독/가격/세금 | Global B2C 첫 판매 gate의 별도 큰 계획으로 둔다. |
| 앱 내부 다국어/다국가 데이터 모델 | 07은 MeetingNote AI 후속 작업 범위만 다룬다. |
| 제품 분석 event taxonomy | 07은 provider log만 포함하고 제품 분석 pipeline은 만들지 않는다. |
| backup/restore/장애 대응 운영 절차 | provider log 기반은 포함하지만 운영 절차는 Data reliability gate로 남긴다. |
| BusinessCard/Trash 후속 후보 | `NBA-005`, `NBA-007`, `NBA-012`는 각 도메인 후속 계획으로 둔다. |

## 4. 확정 결정

- 기존 `AiProviderCallLog`를 확장한다.
- STT transcript 원문은 기본 저장하지 않는다.
- provider raw response와 prompt 원문은 저장하지 않는다.
- next action은 AI 후보만 만들고 사용자가 확인 후 저장한다.
- follow-up은 AI 초안만 만들고 사용자가 확인/수정/복사한다.
- follow-up 초안은 DB에 저장하지 않는다.
- 사용자 실패 메시지는 safe message와 retryable만 제공한다.
- AI data cleanup과 MeetingNote 목록 summary는 1차 제외한다.
- Admin 운영 조회는 11로 넘긴다.
- 결제, Admin minimal operation, 현지화, 정책, 제품 분석, backup/restore는 07이 아니라 Global B2C first-sale gate 후속 묶음으로 둔다.

## 5. 완료 기준

- API/DB/FE 문서가 구현 가능한 수준으로 confirmed 상태다.
- 신규 API의 request, response, error, transaction, observability, DB 연결이 문서화된다.
- 신규 Prisma 변경은 `BE-TODO/DB-SCHEMA.md`와 API spec에 연결된다.
- User Web 흐름은 `FE-TODO/USER-WEB-TODO.md`와 `COMMON/USER-FLOW.md`에 연결된다.
- `AGENT/UXUI_AGENT`와 `AGENT/SOFTWARE_AGENT` 기준이 `ARCHITECTURE-GUARDRAILS.md`에 명시된다.
