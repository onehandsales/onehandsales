# 통합검색 사용자 흐름

## 1. 목적

사용자가 도메인 화면을 이동하지 않고 기억나는 키워드로 관련 영업 데이터를 빠르게 찾도록 한다.

## 2. 기본 흐름

1. 사용자가 User Web 상단 검색 입력에 두 글자 이상 입력한다.
2. Frontend는 `GET /api/search`에 `q`와 `limit`을 전달한다.
3. Backend는 현재 사용자 `userId`에 속한 데이터만 도메인별로 검색한다.
4. 결과는 회사, 담당자, 제품, 딜, 일정, 회의록 그룹으로 반환된다.
5. 사용자가 결과를 선택하면 `targetPath`로 이동한다.
6. 각 상세 화면은 기존 단건 상세 API로 최신 정보를 다시 조회한다.

## 3. 검색 대상

| 대상 | 검색 기준 |
|---|---|
| Company | 회사명, 분야명, 지역명 |
| Contact | 담당자명, 이메일, 모바일, 회사명, 부서명, 직급명 |
| Product | 제품명, 카테고리명, 상태명 |
| Deal | 딜이름, 상태, 회사명, 담당자명 |
| Schedule | 일정 제목, 장소, 메모, 연결 딜이름 |
| MeetingNote | 제목, 상세내용, 다음 계획, 필요 행동, 연결 snapshot |

검색 필드 정책은 넓게 검색이다. 사용자가 업무 중 기억나는 본문 키워드로도 record를 찾을 수 있도록 일정 메모와 회의록 상세내용/필요 행동까지 검색한다.

## 4. 화면 이동 기준

- 회사: `/app/companies/{companyId}`
- 담당자: `/app/contacts/{contactId}`
- 제품: `/app/products/{productId}`
- 딜: `/app/deals/{dealId}`
- 일정: `/app/schedules/{scheduleId}`
- 회의록: `/app/meeting-notes/{meetingNoteId}`

## 5. 예외 흐름

- `q`가 두 글자 미만이면 Backend는 빈 `groups`를 반환한다.
- 검색 결과가 없으면 Frontend는 empty 상태를 표시한다.
- 인증이 없으면 401을 반환한다.
- `types`에 허용하지 않는 값이 있으면 400 domain validation error를 반환한다.

## 6. 관련 문서

- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
