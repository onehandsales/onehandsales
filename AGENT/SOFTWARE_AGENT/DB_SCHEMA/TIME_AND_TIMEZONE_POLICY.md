# Time And Timezone Policy

현재 활성 범위에서는 사용자 프로필과 시스템 audit 성격의 시각 필드를 중심으로 timezone을 다룬다.

## 저장 원칙

- DB의 instant 값은 UTC 기준 `DateTime @db.Timestamptz(3)`로 저장한다.
- 사용자가 선택한 기본 timezone은 `User.timeZone`에 IANA timezone ID로 저장한다.
- 사용자-facing 날짜/시간 표시는 브라우저 locale과 `User.timeZone`을 우선해 변환한다.
- 서버 내부 비교와 만료 계산은 UTC instant 기준으로 처리한다.

## 입력 원칙

- 프로필의 timezone 값은 IANA timezone ID allow-list 또는 런타임 검증을 거친다.
- 사용자 기본 국가/통화/locale은 프로필 API에서 검증한다.
- API request가 local date-time을 받을 경우 timezone metadata를 별도 필드로 함께 받는다.

## 표시 원칙

- API 응답의 `createdAt`, `updatedAt`, `deletedAt`, `trashExpiresAt`은 UTC ISO string으로 간주한다.
- Frontend는 UTC string을 그대로 렌더링하지 않고 사용자 표시 기준으로 변환한다.
- 휴지통 만료, 세션 만료, 최근 활동 표시는 같은 formatter를 공유한다.
