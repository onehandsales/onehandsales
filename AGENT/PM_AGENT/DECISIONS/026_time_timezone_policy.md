# Timezone Policy Decision

## 결정

사용자 프로필은 IANA timezone ID를 저장하고, API의 instant 값은 UTC ISO string으로 다룬다.

## 이유

- 사용자 표시 기준과 서버 저장 기준을 분리해야 한다.
- 만료, 삭제, 세션 같은 서버 판단은 UTC instant가 안정적이다.
- Frontend는 사용자 locale/timezone을 기준으로 표시 형식을 결정한다.

## 적용

- `User.timeZone`은 기본 표시 timezone이다.
- `createdAt`, `updatedAt`, `deletedAt`은 UTC instant로 본다. 현재 `deletedAt`은 User 계정 상태 필드에만 남는다.
- Frontend formatter는 UTC string을 사용자 표시 기준으로 변환한다.
