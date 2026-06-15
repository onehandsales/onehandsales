# Meeting Note User Flow

## 1. 목록 조회

```text
회의록 메뉴 진입
-> GET /api/meeting-notes 호출
-> 회사/담당자/제품/딜 summary와 회의 일시를 목록에 표시
-> 회사 필터 또는 담당자 필터 선택
-> 같은 필터 그룹은 OR, 회사 그룹과 담당자 그룹은 AND로 목록 재조회
-> 페이지 이동 시 page query만 변경
```

## 2. 회의록 생성

```text
회의록 목록
-> 새 회의록
-> 회의 일시, 상세 내용, 향후 계획, 필요 액션 입력
-> 회사 1개 이상 선택 또는 snapshot 입력
-> 담당자 1개 이상 선택 또는 snapshot 입력
-> 제품은 필요하면 선택 또는 snapshot 입력
-> 딜은 필요하면 기존 딜 선택
-> 저장
-> POST /api/meeting-notes 성공
-> 상세 화면으로 이동
```

## 3. 회의록 상세

```text
목록에서 회의록 선택
-> GET /api/meeting-notes/:meetingNoteId 호출
-> 본문, 회의 일시, 연결 회사/담당자/제품/딜 표시
-> 현재 엔티티 정보와 snapshot이 다르면 둘을 구분해 표시
```

## 4. 회의록 수정

```text
상세 화면
-> 수정 진입
-> 본문, 회의 일시, 연결 목록 수정
-> 회사와 담당자는 1개 이상 유지
-> 제품과 딜은 빈 배열로 제거 가능
-> PATCH /api/meeting-notes/:meetingNoteId 성공
-> 상세 query와 목록 query invalidate
```

## 5. 제외 흐름

이번 계획에서는 아래 흐름을 만들지 않는다.

- 텍스트 AI 초안 생성
- STT 변환
- 음성 파일 업로드
- 삭제/복구
- 딜 상세에서 회의록 자동 생성 또는 활동 로그 자동 생성
- Admin 회의록 조회
