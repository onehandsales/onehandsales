# Schedule User Flow

## 1. 일정 목록 확인

1. 사용자가 `/schedules`에 진입한다.
2. 화면은 사용자 timezone 기준 현재 월 일정을 기본으로 조회한다.
3. 사용자는 월간/주간 view를 전환할 수 있다.
4. 목록 또는 캘린더에는 일정 제목, 시작/종료 시각, 장소, 연결 딜 요약이 표시된다.
5. 사용자는 일정을 선택해 상세를 확인한다.

## 2. 일정 생성

1. 사용자가 일정 생성 버튼을 누른다.
2. Frontend는 `GET /api/schedules/deal-options`로 연결 가능한 딜 목록을 조회한다.
3. 사용자가 일정 제목, 시작/종료 시각, timezone, 장소, 메모, 연결 딜을 입력한다.
4. 같은 딜이 중복 선택되면 Frontend에서 먼저 막는다.
5. Backend도 `dealIds` 중복을 검증한다.
6. Backend는 `Schedule`을 생성하고 선택된 딜마다 `ScheduleDeal`을 생성한다.

## 3. 일정 수정

1. 사용자가 일정 상세에서 수정 화면을 연다.
2. Frontend는 일정 상세와 딜 옵션 목록을 조회한다.
3. 사용자는 일정 기본 정보와 연결 딜 목록을 수정한다.
4. `dealIds`가 요청에 포함되면 수정 후 최종 연결 딜 목록으로 본다.
5. Backend는 기존 `ScheduleDeal`과 요청 `dealIds`를 비교해 추가/삭제 diff를 적용한다.

## 4. 일정 삭제

1. 사용자가 일정 삭제를 실행한다.
2. Frontend는 확인 UI를 표시한다.
3. Backend는 현재 사용자 소유 일정인지 확인한다.
4. Backend는 `ScheduleDeal` 연결과 `Schedule` row를 실제 삭제한다.
5. Frontend는 월간/주간 일정 목록을 재조회한다.

## 5. 제외 흐름

- Google Calendar 가져오기
- 일정 알림
- 반복 일정
- 일정 휴지통
- 일정별 활동 로그 자동 생성
