# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| In-app notification | 목록, 읽음 처리, unread count |
| Reminder source | 일정, 딜 마감, 다음 행동, 회의록 완료/후속 |
| User settings | 알림 기본값, email/browser push on/off |
| Delivery | email/browser push는 착수 전 범위 재결정 |
| Worker | scheduledAt 기준 발송 job |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 네이티브 push | iOS/Android 앱 이전에는 제외 |
| 마케팅 알림 | 제품 사용 reminder와 분리 |
| 복잡한 notification automation builder | Series A 이후 후보 |

## 열린 질문

- 첫 구현은 in-app만 할지, email/browser push까지 할지?
- 사용자가 알림 권한을 언제 요청받아야 하는가?
- 일정/딜/다음 행동 알림의 기본 lead time은 무엇인가?
- 알림 실패 재시도 횟수와 보관 기간은?

## 완료 기준 초안

- 알림 목록과 읽음 처리가 동작한다.
- unread count가 화면에 표시될 수 있다.
- 사용자별 설정이 저장된다.
- 다른 사용자 알림에 접근할 수 없다.
