# User Web Frontend Architecture

이 문서는 `FE/user-web`의 정본 frontend 아키텍처를 정의한다. User Web은 개인 영업자가 회사, 담당자, 제품, 딜, 일정, 회의록을 실제로 관리하는 화면이며, 모바일과 데스크톱을 함께 지원한다.

## 1. 기술 기준

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24 LTS |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 번들러/개발 서버 | Vite 7 |
| 라우터 | React Router DOM 7 |
| 스타일 | Tailwind CSS 3, PostCSS, shadcn/ui, Pretendard Font |
| 아이콘 | lucide-react |
| 서버 상태 | TanStack Query |
| 입력 검증 | React Hook Form, Zod |
| 빌드 검증 | `tsc -b`, `vite build` |

## 2. 구조 원칙

- `pages`는 route entry와 화면 조립만 담당한다.
- 실제 business UI, API 호출, schema, type은 `features/<domain>` 안에 둔다.
- 공통 UI는 `components/ui`, layout은 `components/layout`에 둔다.
- API client, env parsing, QueryClient 설정은 `lib`에 둔다.
- 인증 token은 UI component에서 직접 다루지 않고 auth feature와 API client를 통해 접근한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.

## 3. 현재 라우트

현재 `FE/user-web/src/app/router/router.tsx` 기준:

- `/login`
- `/auth/callback`
- `/`
- `/companies`
- `/companies/new`
- `/companies/:companyId`
- `/contacts`
- `/contacts/scan`
- `/contacts/:contactId`
- `/products`
- `/products/new`
- `/products/:productId`
- `/deals`
- `/deals/new`
- `/deals/:dealId`
- `/schedules`
- `/schedules/week`
- `/schedules/:scheduleId`
- `/meeting-notes`
- `/meeting-notes/new`
- `/meeting-notes/:meetingNoteId`
- `/business-cards`
- `/notifications`
- `/import`
- `/export`
- `/trash`
- `/settings`
- `/more`

`/meeting-notes/new`는 현재 `/meeting-notes?create=1` 흐름으로 redirect한다.

## 4. 현재 Feature 폴더

현재 `FE/user-web/src/features` 기준:

- `auth`
- `business-card`
- `company`
- `contact`
- `deal`
- `deal-redesign`
- `import-export`
- `meeting-note`
- `notification`
- `product`
- `schedule`
- `search`
- `tag`
- `trash`

## 5. 현재 API 연동 상태

실제 Backend API 연동 완료:

- Auth/User: Supabase OAuth callback, Backend token exchange, refresh/logout, current user/profile/devices
- Home dashboard: 일정/딜/회의록 조합 조회
- Company: 목록/상세/생성/수정, 옵션, 메모, 개인 메모, 연결 Contact/Deal, xlsx export
- Contact: 목록/상세/생성/수정, 옵션, 메모, 개인 메모, 연결 Deal, xlsx export
- Product: 목록/상세/생성/수정, 옵션, 메모, 개인 메모, 연결 Deal, xlsx export
- Deal: 목록/상세/생성/수정, stage counts, 옵션, 다음 행동 로그, 메모 로그, xlsx export
- Schedule: 월/주 목록, 단건 상세, 생성, 수정, 삭제, deal options
- MeetingNote: 수동 목록/상세/생성/수정, filter options

Backend는 구현되었지만 Frontend 연결이 남은 항목:

- Search 최종 연결/UX 검수: `GET /api/search`
- MeetingNote AI draft: `POST /api/meeting-notes/ai-draft`
- MeetingNote STT draft: `POST /api/meeting-notes/stt-draft`

mock/placeholder 경계를 유지해야 하는 항목:

- BusinessCard OCR
- generic Import/Export job
- Notification
- Trash

## 6. Search 구현 기준

상단 통합검색은 `features/search`에 둔다.

- 두 글자 이상 입력 시 `GET /api/search`를 호출한다.
- 요청 query: `q`, optional `types`, optional `limit`.
- 응답은 도메인별 group과 item을 반환한다.
- item은 상세 화면 이동에 필요한 `targetType`, `targetId`, `href` 또는 이에 준하는 navigation metadata를 포함해야 한다.
- 전용 `/search` 라우트는 현재 없다. 상단 검색 UI 안에서 결과를 선택해 상세 화면으로 이동한다.
- 현재 최종 FE 연결과 loading/empty/error UX 검수는 `TODO/INTEGRATED_SEARCH_PLAN`의 `G02-FE-INTEGRATED-SEARCH`에서 진행 중이다.

## 7. MeetingNote AI/STT Frontend 후속 기준

회의록 AI/STT는 사용자가 직접 선택해야 하는 값과 AI가 생성할 값을 분리한다.

사용자가 선택:

- 회사
- 담당자
- 제품
- 딜
- 회의 일시

AI/STT가 생성:

- 회의 내용
- 다음 계획
- 필요 행동

Frontend는 draft API 결과를 자동 저장하지 않는다. 결과를 form field에 채우고 사용자가 수정한 뒤 기존 `POST /api/meeting-notes`로 저장한다. STT transcript는 검토용으로 표시하고 현재 범위에서는 저장하지 않는다.

## 8. Pagination 기준

- Company/Contact/Product/Deal/MeetingNote 목록은 page-number pagination을 사용한다.
- 기본 page size는 10이다.
- 서버 응답은 `totalCount`, `totalPages`, `page`, `pageSize` 기준으로 처리한다.
- cursor 기반 `hasNext`는 memo log 같은 infinite loading 영역에서만 사용한다.

## 9. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `TODO/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
