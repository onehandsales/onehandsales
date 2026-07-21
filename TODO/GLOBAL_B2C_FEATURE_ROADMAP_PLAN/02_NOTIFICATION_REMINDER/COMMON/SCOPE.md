# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| In-app notification | 목록, 읽음 처리, unread count |
| Reminder source | 일정, 딜 마감, 다음 행동, 회의록 완료/후속 |
| User settings | 알림 기본값, email/browser push on/off |
| Delivery | browser push는 1차 포함, email은 중요 알림/digest 중심 |
| Worker | scheduledAt 기준 발송 job |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 네이티브 push | iOS/Android 앱 이전에는 제외 |
| 마케팅 알림 | 제품 사용 reminder와 분리 |
| 복잡한 notification automation builder | Series A 이후 후보 |

## 구현 전 세부 확인 질문

- in-app notification과 browser push를 1차로 구현하고, email은 중요 알림/digest 기준으로 제한한다.
- 사용자가 알림 권한을 언제 요청받아야 하는가?
- 기본 lead time은 일정 30분 전, 딜 마감 1일 전, 다음 행동 당일 오전으로 둔다.
- 알림 실패 재시도 횟수와 보관 기간은?

## 완료 기준 초안

- 알림 목록과 읽음 처리가 동작한다.
- unread count가 화면에 표시될 수 있다.
- 사용자별 설정이 저장된다.
- 다른 사용자 알림에 접근할 수 없다.
