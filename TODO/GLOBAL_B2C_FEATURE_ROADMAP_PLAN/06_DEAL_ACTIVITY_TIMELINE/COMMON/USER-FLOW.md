# User Flow

상태: Confirmed
확정일: 2026-07-25

## 1. 딜 상세에서 활동 확인

전체 흐름:

```text
딜 목록 또는 linked record
-> 딜 상세
-> 딜 활동 timeline 확인
-> 활동 추가 또는 기존 수동 활동 수정
-> 저장 성공 후 timeline 갱신
```

1. 사용자가 `/app/deals/:dealId`에 들어간다.
2. 상단에는 딜명, 단계, 금액, 마감일, 회사, 담당자, 제품 연결이 보인다.
3. 본문에는 `딜 활동` timeline이 보인다.
4. activity는 최신순으로 표시한다.
5. 각 item은 type icon, 제목, 짧은 설명, 발생 시각, 연결 record link를 가진다.
6. 더 많은 이력은 `더 보기` 또는 cursor pagination으로 불러온다.

Empty 문구:

```text
활동을 남기면 딜 진행 흐름을 여기에서 볼 수 있어요.
```

Loading 문구:

```text
딜 활동을 불러오고 있어요.
```

Error 문구:

```text
딜 활동을 불러오지 못했어요. 다시 시도해 주세요.
```

## 2. 자동 activity 확인

사용자는 아래 활동을 별도 설정 없이 timeline에서 본다.

- 딜을 만들었어요.
- 단계가 `초기 접촉`에서 `제안/견적`으로 바뀌었어요.
- 다음 행동을 추가했어요.
- 다음 행동을 완료했어요.
- 일정을 연결했어요.
- 회의록을 연결했어요.
- 이메일 follow-up을 보냈어요.
- 문자 follow-up을 보내지 못했어요.

자동 activity는 수정 버튼과 삭제 버튼을 노출하지 않는다.

## 3. 수동 activity 생성

1. 사용자가 딜 상세의 `활동 추가`를 누른다.
2. 유형을 고른다: `통화`, `미팅`, `이메일`, `방문`, `기타`.
3. 제목을 입력한다.
4. 필요하면 짧은 내용을 입력한다.
5. 발생 시각은 기본값으로 현재 시각을 사용하고 수정할 수 있다.
6. 저장하면 timeline 맨 위에 추가된다.
7. 저장 성공 후 `deal.activities(dealId)` query를 갱신한다.

성공 문구:

```text
활동을 남겼어요.
```

Validation 예:

```text
제목을 입력해 주세요.
```

```text
발생 시각은 현재보다 미래로 설정할 수 없어요.
```

저장 실패 문구:

```text
활동을 저장하지 못했어요. 다시 시도해 주세요.
```

## 4. 수동 activity 수정

1. 사용자가 직접 남긴 activity item에서 수정 icon을 누른다.
2. 유형, 제목, 내용, 발생 시각을 수정한다.
3. 저장하면 timeline item이 갱신된다.
4. 저장 성공 후 `deal.activities(dealId)` query를 갱신한다.

성공 문구:

```text
활동을 저장했어요.
```

수정 실패 문구:

```text
활동을 수정하지 못했어요. 다시 시도해 주세요.
```

## 5. 수동 activity 삭제

1차에서는 삭제를 제공하지 않는다.

삭제가 필요하다는 사용자 신호가 확인되면 11 Trust/policy gate와 함께 soft delete, retention, audit 기준을 별도 goal로 만든다.

## 6. 목록 summary 확인

G05/G06 이후 사용자는 목록에서 아래를 본다.

- 딜 목록: 연결 제품, 최신 활동, 다음 행동
- 담당자 목록: 연결 딜 수

FE는 API 응답에 없는 최신 활동, 제품 summary, count를 임의로 꾸미지 않는다.

## 7. 모바일

- desktop timeline table을 그대로 축소하지 않는다.
- mobile은 card/list timeline으로 표시한다.
- 활동 추가 form은 하단 sheet 또는 화면폭에 맞는 dialog로 표시한다.
- 긴 제목과 본문은 줄바꿈하고 부모 영역을 뚫지 않는다.
