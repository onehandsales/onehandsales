# G03 MeetingNote Follow-up Reminder Contract

상태: Question
목표: 회의록 follow-up reminder와 자동 발송 후보를 분리하고, 구현 전 필요한 정책 결정을 문서화한다.

## 1. 현재 사실

- 02 Notification은 회의록 후속 알림을 제외했다.
- 07은 MeetingNote 상세에서 next action 후보와 follow-up draft를 생성한다.
- 07은 follow-up draft DB 저장, 이메일/SMS 자동 발송, 알림 생성을 제외했다.
- 05는 사용자가 확인하고 직접 보내는 follow-up delivery foundation과 Gmail/Microsoft email adapter를 구현했다.

## 2. 분리해야 할 후보

| 후보 | 의미 | 현재 기본 상태 |
| --- | --- | --- |
| follow-up draft reminder | 회의록 작성 후 후속 연락 초안을 만들거나 확인하라고 알림 | post-12-seed |
| follow-up send reminder | 초안이 있는데 아직 보내지 않았다고 알림 | post-12-seed |
| follow-up automatic send | 사용자가 확인하지 않아도 이메일/SMS를 발송 | post-12-seed / 정책 결정 필요 |
| follow-up delivery retry notification | 발송 실패나 재연결 필요 상태를 알림 | 05/11 safe failure와 연결해 재검토 |

## 3. 결정해야 할 질문

1. 알림 목적이 "초안 생성 유도"인지 "발송 누락 방지"인지 결정해야 한다.
2. 사용자 명시 확인 없이 자동 발송을 허용할지 결정해야 한다.
3. 수신 동의, 발신자 인증, unsubscribe, SMS 비용, 국가별 규제를 어떻게 다룰지 결정해야 한다.
4. MeetingNote 원문, follow-up body, 연락처 원문을 notification/log에 얼마나 노출할지 결정해야 한다.

## 4. 완료 기준

- 자동 발송은 별도 정책 결정 없이는 구현 금지로 유지한다.
- reminder만 검토하더라도 API/DB/FE 계약이 confirmed가 되기 전까지 구현하지 않는다.
- 후보 상태를 `CANDIDATE-MATRIX.md`에 반영한다.

