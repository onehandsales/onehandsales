# MeetingNote Deal Link Activity Work Log

## 작업 일시

- 2026-06-19 KST

## 목표

- 저장된 회의록을 영업 딜과 추가 연동한다.
- 연동 성공 시 딜 상세 활동 로그에 회의록 링크와 요약을 자동 생성한다.

## 구현

- Backend
  - `POST /api/meeting-notes/:meetingNoteId/deals` 추가
  - `LinkMeetingNoteDealsDto` 추가
  - `MeetingNoteApplicationService.linkMeetingNoteDeals` 추가
  - 기존 연결 딜은 중복 생성하지 않고 건너뜀
  - 신규 연결마다 `MeetingNoteDeal` snapshot row 생성
  - 신규 연결마다 `DealFollowingActionLog` row 생성
- User Web
  - 회의록 상세 화면 우측에 `영업 딜과 연동` 카드 추가
  - 딜 검색/선택 후 새 API 호출
  - 성공 시 회의록 상세, 딜 상세, 딜 활동 로그 query cache 갱신
- 문서
  - API spec, PM/UX/DB/Frontend/Backend 상태 문서 갱신
  - 현재 구현은 범용 `DealActivity` table 없이 `DealFollowingActionLog`를 재사용하는 방식으로 기록

## 검증

- `pnpm --dir BE typecheck`
- `pnpm --dir BE test -- meeting-note`
- `pnpm --dir BE lint`
- `pnpm --dir BE build`
- `pnpm --dir FE/user-web typecheck`
- `pnpm --dir FE/user-web exec eslint src/features/meeting-note/api/meeting-note-api.ts src/features/meeting-note/components/meeting-note-editor-screen.tsx src/features/meeting-note/hooks/use-meeting-note-mutations.ts src/features/meeting-note/index.ts src/features/meeting-note/types/meeting-note.ts`
- `pnpm --dir FE/user-web lint`
- `pnpm --dir FE/user-web build`
- `git diff --check`

## 참고

- `pnpm` 명령은 로컬 Node `v25.7.0` 때문에 프로젝트 engine `>=24 <25` 경고를 표시했지만 실패하지 않았다.
- User Web 전체 lint는 기존 `FE/user-web/src/components/ui/toast.tsx` fast-refresh warning 1건을 표시했다.
- Vite build는 기존 500kB 초과 chunk warning을 표시했다.

## 후속

- 실제 로그인 세션과 샘플 데이터로 회의록 상세 딜 연동 및 딜 상세 활동 로그 표시를 브라우저 smoke 확인한다.
- 범용 `DealActivity` table과 activity type 관리는 별도 후속 범위로 둔다.
