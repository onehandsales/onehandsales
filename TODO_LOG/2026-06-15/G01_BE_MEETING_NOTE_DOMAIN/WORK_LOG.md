# G01_BE_MEETING_NOTE_DOMAIN Work Log

## 작업 일자

- 2026-06-15

## 수정한 주요 파일

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations/20260615000000_add_meeting_note_domain/migration.sql`
- `BE/src/app.module.ts`
- `BE/src/modules/meeting-note/application/ports/meeting-note.repository.ts`
- `BE/src/modules/meeting-note/application/services/meeting-note-application.service.ts`
- `BE/src/modules/meeting-note/application/services/meeting-note-application.service.spec.ts`
- `BE/src/modules/meeting-note/domain/meeting-note.errors.ts`
- `BE/src/modules/meeting-note/infrastructure/meeting-note.module.ts`
- `BE/src/modules/meeting-note/infrastructure/persistence/prisma-meeting-note.repository.ts`
- `BE/src/modules/meeting-note/presentation/http/meeting-note.controller.ts`
- `BE/src/modules/meeting-note/presentation/http/dto/meeting-note-request.dto.ts`

## 구현 내용

- `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal` Prisma 모델과 migration을 추가했다.
- User API 6개를 추가했다.
  - `GET /api/meeting-notes`
  - `GET /api/meeting-notes/filter-companies`
  - `GET /api/meeting-notes/filter-contacts`
  - `GET /api/meeting-notes/:meetingNoteId`
  - `POST /api/meeting-notes`
  - `PATCH /api/meeting-notes/:meetingNoteId`
- 수동 1차 범위만 허용하도록 `sourceType=MANUAL`을 강제하고 AI/STT/delete/restore/Admin/DealActivity 자동 생성은 구현하지 않았다.
- `meetingLocalDateTime`은 request `timeZone` 없이 현재 사용자 `User.timeZone` 기준 UTC instant로 변환한다.
- 생성/수정 시 회사/연락처는 1개 이상 필수, 제품/딜은 빈 배열로 관계 제거가 가능하도록 구현했다.
- request DTO는 API-SPEC의 외부 계약명(`companyName`, `contactUsername`, `productName`)을 사용하고 DB row에는 snapshot 컬럼으로 저장한다.
- 목록 응답은 상세 배열이 아니라 `label/count` summary와 `totalPages`를 반환하도록 구현했다.
- Backend AGENT의 Clean Architecture, transaction boundary, comment/logging 규칙을 기준으로 신규 class/interface/API/method 주석을 보정했다.

## 검증

- `pnpm.cmd --dir BE run prisma:validate` 통과
- `pnpm.cmd --dir BE run prisma:generate` 통과
- `pnpm.cmd --dir BE run typecheck` 통과
- `pnpm.cmd --dir BE run lint` 통과
- `pnpm.cmd --dir BE run test -- meeting-note-application.service.spec.ts` 통과
- `pnpm.cmd --dir BE run test` 통과
- `pnpm.cmd --dir BE run build` 통과

## 참고 경고

- 현재 로컬 Node가 `v20.11.0`이라 `package.json`의 `>=24 <25` engine 경고가 출력되었다.
