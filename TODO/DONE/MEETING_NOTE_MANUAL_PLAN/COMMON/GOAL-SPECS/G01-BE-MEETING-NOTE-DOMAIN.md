# G01-BE-MEETING-NOTE-DOMAIN Spec

## 1. 목적

Backend에 MeetingNote 도메인 DB, application service, repository, controller, 테스트를 추가한다.

## 2. 포함 범위

- Prisma schema와 migration
- `meeting-note` module 추가
- DTO validation
- application service
- repository port와 Prisma repository
- response mapper
- User API 6개
- ownership, validation, transaction 테스트

## 3. 제외 범위

- AI Text/STT provider
- 삭제/복구
- Admin API
- DealActivity 자동 생성
- rawText 암호화

## 4. 구현 기준

- 기존 Backend module 구조와 naming을 따른다.
- controller는 business logic을 가지지 않는다.
- Prisma는 infrastructure에서만 사용한다.
- mutation transaction 경계는 application layer에 둔다.
- 생성/수정은 `MeetingNote`와 연결 row 변경을 같은 transaction으로 처리한다.
- 외부 Provider 호출은 없다.
- audit log는 없다.
- structured log에는 본문, 연락처 email/mobile 원문을 남기지 않는다.

## 5. API 완료 기준

- `GET /api/meeting-notes`
- `GET /api/meeting-notes/filter-companies`
- `GET /api/meeting-notes/filter-contacts`
- `GET /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes`
- `PATCH /api/meeting-notes/:meetingNoteId`

## 6. 테스트 기준

- 인증 없음 401
- 타 사용자 회의록 상세 404
- 타 사용자 company/contact/product/deal 연결 404
- 생성 시 companies 또는 contacts 빈 배열이면 400
- 제품/딜 빈 배열은 허용
- 중복 dealId 요청은 400
- 생성 transaction rollback
- 수정 시 배열 빠짐은 기존 연결 유지
- 수정 시 products/deals 빈 배열은 연결 제거
- 수정 시 companies/contacts 빈 배열은 400
- 목록 pagination이 join row로 중복되지 않음
- 목록 summary count와 label 생성
- `User.timeZone` 기준 `meetingAt` 계산

## 7. 검증 명령

Backend goal 완료 전 아래 명령을 실행한다.

```powershell
cd BE
npm run typecheck
npm run lint
npm run test
npm run build
```

프로젝트 package script 이름이 다르면 `BE/package.json` 기준으로 대체하고 완료 기록에 남긴다.
