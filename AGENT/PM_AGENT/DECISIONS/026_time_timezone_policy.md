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

## Bonsai 전환 적용 범위

2026-11-17: 위 원칙은 사용자 표시·인증·audit의 기본값이다. Bonsai Tasks의 날짜·반복·기한 분류·알림은 Workspace 시간대와 사용자 시간대의 적용 범위를 별도로 확인한다. [시간대 정책의 전환 경계](../../SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md)를 따르며, 날짜만 있는 값을 instant와 동일하게 다루지 않는다.
