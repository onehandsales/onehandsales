# BE TODO

## 1. 목적

이 문서는 `BE` NestJS 서버 구현 작업의 공통 기준을 정리한다.

Backend는 MVP에서 하나의 배포 단위지만 User API와 Admin API를 명확히 분리한다. 모든 비즈니스 도메인은 DDD와 Clean Architecture 기준으로 `domain`, `application`, `infrastructure`, `presentation` 계층을 가진다.

## 2. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`: FE/BE 공통 API 계약 정본
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`: `/goal` 작업 순서
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`: goal별 화면/API/DB 상세 명세
- `API-TODO.md`: Backend 모듈과 API 구현 작업 목록
- `DB-SCHEMA.md`: MVP에 필요한 DB 스키마 초안

## 3. 구현 원칙

- User API는 `/api/*`만 사용한다.
- Admin API는 `/admin/api/*`만 사용한다.
- Admin API는 AuthGuard와 AdminGuard를 모두 통과해야 한다.
- 사용자 소유 데이터는 항상 `userId`로 필터링한다.
- 민감정보 원문 조회는 사유 입력과 감사 로그가 필수다.
- OpenAI, Google Calendar, Email, Browser Push, Storage는 application port 뒤에 둔다.
- Prisma는 infrastructure 계층에서만 사용한다.
- Controller는 application service만 호출한다.
- API 명세는 `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`의 필수 항목을 따른다.
- 상세 API 명세는 `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC`를 정본으로 본다. 구현 시에는 해당 범위의 `*-ENDPOINT-CONTRACT.md`를 API별 처리 흐름 정본으로 본다.
- API마다 API 이름, request 이름, 비즈니스 로직 흐름, response 이름, 연결된 DB 스키마를 작성한다.

## 4. MVP 모듈

```text
auth
user
company
contact
product
deal
schedule
meeting-note
business-card
import-export
notification
tag
audit-log
admin
shared
```

## 5. 구현 순서

1. NestJS 프로젝트 생성
2. Prisma와 DB 연결
3. 공통 설정, logger, validation pipe, exception filter
4. Auth와 User
5. Company, Contact, Product
6. Deal과 DealActivity
7. Schedule과 Notification
8. MeetingNote와 AI port
9. BusinessCard OCR
10. Import/Export
11. Admin API와 감사 로그
12. 테스트와 seed/mock 데이터

## 6. 완료 기준

- User Web이 사용할 `/api/*`가 준비된다.
- Admin Web이 사용할 `/admin/api/*`가 준비된다.
- Prisma schema가 MVP 도메인을 모두 표현한다.
- 외부 Provider 없이도 mock adapter로 핵심 E2E를 실행할 수 있다.


