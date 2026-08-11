# 05-B User Flow

상태: Implementation-ready draft

## 1. Provider 설정

1. 사용자가 `/app/settings`로 이동한다.
2. `이메일 연결` section에서 Gmail 또는 Microsoft 365를 연결한다.
3. `문자 발신번호` section에서 E.164 번호를 입력한다.
4. 사용자는 받은 인증 코드를 입력해 번호를 인증한다.
5. 연결이 만료되면 설정 화면에 `다시 연결`을 표시한다.

문구 예:

- `Gmail 연결`
- `Microsoft 365 연결`
- `문자 발신번호 인증`
- `연결이 만료됐어요. 다시 연결해 주세요.`

## 2. AI 리포트에서 compose 진입

1. 사용자가 `/app/schedules/week`의 AI 리포트 follow-up 초안 section을 본다.
2. 05-B 구현 후 follow-up 카드에 `이메일 작성`, `문자 작성` 버튼을 표시한다.
3. 연결된 provider가 없으면 `이메일 연결이 필요해요` 또는 `문자 발신번호 인증이 필요해요`와 설정 이동 버튼을 표시한다.
4. 사용자가 채널을 선택하면 compose draft 생성 API를 호출한다.

## 3. Compose 화면

1. 사용자는 언어를 선택한다.
2. 수신자를 확인한다.
3. email이면 제목과 본문을 확인/수정한다.
4. SMS이면 본문을 확인/수정한다.
5. SMS는 1~2 segment 제한을 초과하면 전송 전에 안내한다.
6. 첫 발송이면 수신 동의/주의 안내를 1회 확인한다.
7. 사용자가 `보내기`를 누르면 즉시 발송한다.

문구 예:

- `이메일 작성`
- `문자 작성`
- `보내기`
- `수신자가 연락을 받을 수 있는 관계인지 확인해 주세요.`
- `문자가 너무 길어요. 2개 이하로 나눠 보낼 수 있게 줄여 주세요.`

## 4. 발송 결과

AI 리포트 카드:

- `이메일 · 김민수 · 발송 완료 · 7월 24일 14:10`
- 실패 시 `보내지 못했어요. 다시 시도해 주세요.`
- retryable이면 `재시도` 표시

딜/담당자 timeline:

- `이메일 발송`
- `SMS 발송`
- 수신자, 채널, 발송 시각, 상태 표시
- 본문 상세는 timeline item을 열었을 때 보여준다.

## 5. 모바일

- 설정 연결은 card/list로 구성한다.
- compose는 full-screen sheet 또는 별도 route 형태가 좋다.
- SMS 글자 수/segment 안내는 입력창 근처에 짧게 표시한다.
- timeline은 table이 아니라 activity card로 표시한다.

## 6. 실패 흐름

Email 연결 만료:

1. 발송 실패 후 message는 `FAILED`가 된다.
2. connection은 `RECONNECT_REQUIRED`가 된다.
3. 사용자에게 `이메일 연결이 만료됐어요. 다시 연결한 뒤 재시도해 주세요.`를 보여준다.

SMS provider 지연:

1. attempt는 retryable=true로 저장된다.
2. 자동 재시도 대상이면 processor가 제한 횟수 내에서 재시도한다.
3. 사용자에게 `문자 provider 응답이 지연되고 있어요. 잠시 뒤 다시 시도해 주세요.`를 보여준다.
