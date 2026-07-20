# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| Provider call log | AI/STT 요청 상태, provider, latency, 실패 요약 |
| Transcript policy | STT transcript 보관 여부와 노출 기준 |
| Next action extraction | 회의록에서 다음 행동 후보 추출 여부 결정 |
| Follow-up draft | 회의 후 이메일/메시지 초안 후보 |
| AI data cleanup | 회의록/명함/Import 결과의 누락, 중복, 이상값 정리 제안 후보 |
| Summary field | 목록에서 latest/next action summary 표시 후보 |
| Redaction | provider error와 원문 민감정보 분리 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| Admin 민감 원문 조회 | 11 Admin 운영에서 다룬다. |
| AI 주간 리포트 | 05에서 분리 |
| 음성 파일 장기 저장 | 정책 확정 전 제외 |

## 열린 질문

- STT transcript를 저장할지, 사용자 확인 후 회의록 본문만 저장할지?
- provider raw response를 저장하면 안 되는 범위는?
- next action 추출 결과를 딜 following action으로 자동 생성할지?
- 실패 로그를 사용자에게 어디까지 보여줄지?
- follow-up 초안을 저장할지 일회성으로 보여줄지?
- AI 데이터 정리 제안이 실제 데이터를 자동 수정할 수 있는지, 사용자 확인이 필수인지?

## 완료 기준 초안

- AI/STT 실패 원인을 운영자가 추적할 수 있는 최소 로그가 있다.
- 사용자에게는 안전한 실패 메시지만 노출된다.
- transcript/원문 보관 정책이 문서화된다.
- next action summary를 표시할지 여부가 결정된다.
- follow-up 초안과 데이터 정리 제안의 저장/폐기 정책이 결정된다.
