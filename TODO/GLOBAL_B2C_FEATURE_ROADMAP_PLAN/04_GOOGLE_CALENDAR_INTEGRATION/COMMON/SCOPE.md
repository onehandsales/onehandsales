# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| Calendar connection | Google Calendar 권한 연결 |
| Import | 외부 calendar event를 일정으로 가져오기 |
| Source 표시 | `source = GOOGLE` 또는 별도 source metadata |
| Sync status | 마지막 동기화, 실패 사유 |
| Token 보관 | refresh token 암호화/폐기 기준 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 양방향 실시간 sync | 1차 scope가 커진다. |
| 여러 calendar provider | Google 이후 확장한다. |
| 네이티브 캘린더 | 모바일 앱 이전에는 제외한다. |

## 열린 질문

- 1차는 가져오기만 할지, 내보내기까지 할지?
- Google OAuth scope는 언제 요청할지?
- 연결 해제 시 가져온 일정을 삭제할지 유지할지?
- 외부 일정 변경을 재동기화할 기준은?

## 완료 기준 초안

- 사용자가 Google Calendar 연결 상태를 볼 수 있다.
- Calendar event를 일정으로 가져올 수 있다.
- 가져온 일정은 source가 구분된다.
- provider 실패가 사용자에게 안전하게 표시된다.
