# User Flow

상태: Confirmed
확정일: 2026-07-26

## 1. Text AI draft flow

```text
회의록 작성 열기
-> 미팅일/회사/담당자/선택 딜 입력
-> 원문 메모 입력
-> AI로 정리 클릭
-> AI가 details/nextPlan/requiredAction 초안 생성
-> 사용자가 수정
-> 회의록 저장
```

실패 시:

```text
AI 처리 실패
-> safe error 표시
-> 원문 메모와 입력값 유지
-> 사용자가 직접 작성으로 이어감
```

## 2. STT draft flow

```text
회의록 작성 열기
-> 미팅일/회사/담당자/선택 딜 입력
-> 음성 파일 선택
-> 음성으로 작성 클릭
-> STT transcript 임시 표시
-> AI가 회의록 초안 생성
-> 사용자가 transcript와 초안을 확인
-> 사용자가 수정
-> 회의록 저장
```

정책:

- transcript 원문은 저장 전 임시 표시다.
- 사용자가 저장한 `details`, `nextPlan`, `requiredAction`만 회의록 데이터가 된다.

## 3. Next action 후보 flow

```text
회의록 상세 열기
-> AI 후속 작업 section 확인
-> 다음 행동 후보 만들기 클릭
-> 후보 1~3개 표시
-> 사용자가 제목/권장일/딜을 확인 또는 수정
-> 딜 다음 행동으로 추가 클릭
-> 기존 딜 다음 행동 저장 API 호출
-> 딜 상세 timeline에서 후속 행동 맥락 확인
```

UX 기준:

- 후보는 실제 저장된 데이터처럼 보이지 않게 표시한다.
- 사용자가 저장하기 전에는 `후보` 상태로 표시한다.
- 연결 딜이 여러 개면 딜 선택을 요구한다.
- 07 1차 저장 API에는 다음 행동 제목만 저장한다. 권장일은 표시/판단용이다.

## 4. Follow-up 초안 flow

```text
회의록 상세 열기
-> AI 후속 작업 section 확인
-> 후속 연락 초안 만들기 클릭
-> email/SMS, 수신자 후보, 문체 선택
-> subject/body 초안 표시
-> 사용자가 수정
-> 복사
```

정책:

- 초안은 DB에 저장하지 않는다.
- 자동 발송하지 않는다.
- 05 follow-up delivery로 직접 연결하지 않는다.

## 5. Notion + Attio UX 적용

MeetingNote 상세는 record page처럼 유지한다.

권장 section:

```text
회의록 요약
연결 record
AI 후속 작업
  - 다음 행동 후보
  - 후속 연락 초안
회의 내용
```

Attio식 맥락:

- 회의록이 어떤 딜/담당자/회사와 연결되는지 항상 보여준다.
- next action 후보는 연결 딜을 기준으로 저장할 수 있게 한다.
- follow-up 초안은 연결 담당자를 기준으로 수신자 후보를 제안한다.

## 6. Mobile flow

모바일에서는 desktop table을 쓰지 않는다.

- AI 후속 작업 section은 card/list로 표시한다.
- 후보 action은 하단 버튼 또는 compact action row로 둔다.
- 긴 follow-up 본문은 textarea 안에서 편집하되 버튼과 겹치지 않게 한다.
- 실패 메시지는 화면을 막는 modal보다 inline error 또는 compact state를 우선한다.
