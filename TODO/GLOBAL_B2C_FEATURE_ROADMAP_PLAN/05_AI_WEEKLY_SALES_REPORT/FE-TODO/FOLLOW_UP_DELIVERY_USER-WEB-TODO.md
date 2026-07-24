# 05-B User Web TODO

상태: Implementation-ready draft

## 1. 신규 feature 후보

```text
FE/user-web/src/features/follow-up-delivery/
  api/follow-up-delivery-api.ts
  api/follow-up-delivery-query-keys.ts
  components/email-connection-settings.tsx
  components/sms-sender-settings.tsx
  components/follow-up-compose-dialog.tsx
  components/follow-up-timeline-item.tsx
  hooks/use-follow-up-delivery-queries.ts
  hooks/use-follow-up-delivery-mutations.ts
  types/follow-up-delivery.ts
```

## 2. 설정 화면

위치:

- `/app/settings`

필수 UI:

- Gmail 연결 상태
- Microsoft 365 연결 상태
- 연결/다시 연결/연결 해제
- SMS 발신번호 목록
- 발신번호 추가
- 인증 코드 입력
- 인증 완료/만료/실패 상태

## 3. AI 리포트 연결

위치:

- `/app/schedules/week` AI 리포트 follow-up section

05-B 구현 전:

- 버튼 자리만 설계하고 사용자에게 미구현 발송 버튼을 노출하지 않는다.

05-B 구현 후:

- `이메일 작성`
- `문자 작성`
- 연결 없을 때 설정 이동 안내

## 4. Compose

필수 필드:

Email:

- sender email
- recipient contact
- language
- subject
- body

SMS:

- sender phone
- recipient contact
- language
- body
- segment count

버튼:

- `닫기`
- `보내기`

## 5. Timeline

표시 위치:

- AI 리포트 detail
- Deal detail activity/timeline
- Contact detail activity/timeline

표시 정보:

- channel
- recipient
- status
- sentAt/failedAt
- safe error
- 본문 상세 보기

## 6. 상태 문구

| 상황 | 문구 |
|---|---|
| Gmail 미연결 | `Gmail을 연결하면 이메일을 보낼 수 있어요.` |
| Microsoft 미연결 | `Microsoft 365를 연결하면 이메일을 보낼 수 있어요.` |
| SMS 미인증 | `문자 발신번호를 인증해 주세요.` |
| 첫 발송 안내 | `수신자가 연락을 받을 수 있는 관계인지 확인해 주세요.` |
| 발송 중 | `보내고 있어요.` |
| 발송 성공 | `보냈어요.` |
| 발송 실패 | `보내지 못했어요. 다시 시도해 주세요.` |
| 연결 만료 | `이메일 연결이 만료됐어요. 다시 연결해 주세요.` |

## 7. FE 검증

- 연결이 없으면 compose 대신 설정 이동 안내를 보여준다.
- compose에서 사용자가 본문을 확인하지 않고 바로 발송되는 흐름이 없다.
- SMS 2 segment 초과 시 발송을 막는다.
- 첫 발송 안내는 user/channel별 1회만 표시한다.
- SENT 메시지는 수정 UI를 열지 않는다.
- 실패 메시지는 safe error만 표시한다.
- 발송 본문을 console/log에 출력하지 않는다.
- 모바일 390px/360px에서 compose와 timeline이 겹치지 않는다.
