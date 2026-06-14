일정

## 1. 목적

영업 담당자가 미팅, 통화, 방문, 팔로업 같은 일정을 월간/주간 단위로 확인하고, 일정에 관련 딜을 연결할 수 있게 한다.

영업 업무에서는 하나의 일정에서 여러 딜을 함께 논의할 수 있고, 하나의 딜도 여러 일정에 반복해서 연결될 수 있다.

예:

- 2026년 6월 14일 오후 2시 일정에 Deal A, Deal B가 함께 연결될 수 있다.
- 2026년 6월 14일 오후 3시 일정에 Deal A가 다시 연결될 수 있다.

따라서 `Schedule`과 `Deal`은 N:N 관계로 본다.

## 2. DB 테이블

### Schedule 테이블

일정 자체를 저장하는 테이블이다.

- `id`: uuid
- `userId`: uuid FK
- `scheduleTitle`: string
- `startAt`: date-time
- `endAt`: date-time
- `location`: string, 선택, null 가능
- `memo`: string, 선택, null 가능
- `createdAt`: date-time
- `updatedAt`: date-time

`Schedule` 테이블에는 `dealId`를 두지 않는다.

### ScheduleDeal 테이블

일정과 딜의 N:N 연결을 저장하는 테이블이다.

- `id`: uuid
- `userId`: uuid FK
- `scheduleId`: uuid FK
- `dealId`: uuid FK
- `createdAt`: date-time

권장 제약:

- `UNIQUE(scheduleId, dealId)`

같은 일정에 같은 딜이 중복 연결되는 것을 막기 위한 제약이다.

## 3. 관계

- 일정 1개는 여러 딜과 연결될 수 있다.
- 딜 1개는 여러 일정과 연결될 수 있다.
- 연결은 `ScheduleDeal`이 담당한다.
- `Deal` 테이블에는 `scheduleId`를 추가하지 않는다.
- `Schedule` 테이블에도 `dealId`를 추가하지 않는다.

## 4. API

### 월간/주간 일정 목록 조회 API

기본 화면은 월간 조회다.

사용자가 주간 버튼을 누르면 해당 주의 월, 화, 수, 목, 금, 토, 일 일정을 보여준다.

월간 조회는 현재 날짜를 기준으로 해당 월의 1일부터 말일까지 데이터를 보여준다.

- Method: `GET`
- Path: `/api/schedules`

Query 예:

- `view`: `month` 또는 `week`
- `baseDate`: `YYYY-MM-DD`

응답값:

- 일정 ID
- 일정 제목
- 시작일
- 종료일
- 연결 딜 목록 요약

정렬:

- `startAt` ASC

### 일정 단건 상세 조회 API

- Method: `GET`
- Path: `/api/schedules/:scheduleId`

응답값:

- 일정 ID
- 일정 제목
- 시작일
- 종료일
- 위치
- 메모
- 연결 딜 목록
  - 딜 ID
  - 딜 이름

응답 예:

```json
{
  "id": "schedule-id",
  "scheduleTitle": "제품 데모 미팅",
  "startAt": "2026-06-14T14:00:00+09:00",
  "endAt": "2026-06-14T15:00:00+09:00",
  "location": "강남",
  "memo": "Deal A, Deal B 동시 논의",
  "deals": [
    {
      "id": "deal-a-id",
      "dealName": "Deal A"
    },
    {
      "id": "deal-b-id",
      "dealName": "Deal B"
    }
  ]
}
```

### 일정 단건 생성 API

- Method: `POST`
- Path: `/api/schedules`

요청값:

- `scheduleTitle`: 필수
- `startAt`: 필수
- `endAt`: 필수
- `location`: 선택
- `memo`: 선택
- `dealIds`: 선택, 연결할 딜 ID 배열

요청 예:

```json
{
  "scheduleTitle": "제품 데모 미팅",
  "startAt": "2026-06-14T14:00:00+09:00",
  "endAt": "2026-06-14T15:00:00+09:00",
  "location": "강남",
  "memo": "Deal A, Deal B 동시 논의",
  "dealIds": ["deal-a-id", "deal-b-id"]
}
```

처리 기준:

- `Schedule`을 생성한다.
- `dealIds`가 있으면 `ScheduleDeal`에 연결 데이터를 생성한다.
- `dealIds`의 딜은 현재 사용자 소유 딜이어야 한다.

### 일정 단건 수정 API

- Method: `PATCH`
- Path: `/api/schedules/:scheduleId`

요청값:

- `scheduleTitle`: 선택
- `startAt`: 선택
- `endAt`: 선택
- `location`: 선택
- `memo`: 선택
- `dealIds`: 선택, 연결할 딜 ID 배열

MVP 기준:

- `dealIds`가 요청에 포함되면 기존 딜 연결을 전체 교체한다.
- `dealIds`가 요청에 없으면 기존 딜 연결은 유지한다.

처리 기준:

- 일정 기본 정보를 수정한다.
- `dealIds`가 있으면 기존 `ScheduleDeal` 연결을 삭제하고 새 연결을 생성한다.
- `dealIds`의 딜은 현재 사용자 소유 딜이어야 한다.

## 5. 현재 범위 밖

- Google Calendar 실연동
- 일정 알림
- 반복 일정
- 참석자 관리
- 일정 삭제/휴지통
- 딜 연결 개별 추가/삭제 API
- 일정별 활동 로그 자동 생성
