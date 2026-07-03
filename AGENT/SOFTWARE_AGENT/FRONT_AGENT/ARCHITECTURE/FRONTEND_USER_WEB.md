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
- `/contacts/scan` -> `/business-cards` redirect. 명함 스캔 legacy route
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
- `/notifications` -> `/` redirect. Notification Backend 구현 전까지 숨김
- `/import`
- `/import/:importUserLogId`
- `/export` -> `/` redirect. Generic Export는 현재 정본 흐름이 아니므로 숨김
- `/trash`
- `/settings`
- `/more`

`/meeting-notes/new`는 현재 `/meeting-notes?create=1` 흐름으로 redirect한다.
`/schedules/week`는 현재 `/schedules`로 redirect한다. 별도 주간 보고서 화면은 후속 범위다.
`import-export` feature 중 `/import`는 실제 Backend API와 연결되어 있고, `/export` route는 root로 redirect한다. 현재 Export 정본 흐름은 회사/담당자/제품/딜 각 목록 화면의 엑셀 다운로드다.
현재 사이드바는 `/import`를 `데이터 업로드` 메뉴로 노출한다. `/export`와 `/notifications`는 route가 있어도 navigation에서 숨긴다.

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
- Company: 목록/상세/생성/수정/삭제, 옵션, 메모, 개인 메모, 연결 Contact/Deal, xlsx export
- Contact: 목록/상세/생성/수정/삭제, 옵션, 메모, 개인 메모, 연결 Deal, xlsx export
- BusinessCard OCR: `/business-cards`, `POST/GET /api/business-card-scans`, 명함스캔 모달, 확인/수정 후 회사/담당자 저장
- Product: 목록/상세/생성/수정/삭제, 옵션, 메모, 개인 메모, 연결 Deal, xlsx export
- Deal: 목록/상세/생성/수정/삭제, stage counts, 옵션, 다음 행동 로그, 메모 로그, xlsx export
- Schedule: 월/주 목록, 단건 상세, 생성, 수정, 삭제, deal options
- MeetingNote: 목록/상세/생성/수정, filter options, AI text draft, STT+AI draft, 저장 후 딜 추가 연동
- Search: 상단/모바일 GlobalSearch, `GET /api/search`, 결과 `targetPath` 이동
- 삭제 UX: 회사/담당자/제품/딜 본문과 로그 삭제는 빨간 휴지통 아이콘 클릭 후 중앙 확인 모달을 열고, 성공 시 중앙 성공 모달로 `삭제가 완료되었습니다.`와 7일 복구 안내를 보여준다.
- Trash: `/trash` 화면에서 `GET /api/trash` 목록, `GET /api/trash/:targetType/:targetId` 상세 모달, `POST /api/trash/:targetType/:targetId/restore` 복구를 연동한다. 목록 row 클릭으로 상세 모달을 열고, 복구는 모달 내부 버튼에서만 수행한다.
- DataImport: `/import` 화면에서 활성 양식 목록/다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, mapping 수정, row 수정/검증, 확정 저장, 성공 내역 목록을 연동한다. `/import/:importUserLogId`는 성공 내역 상세와 row snapshot을 조회한다.

도메인별 export 기준:

- Company: `GET /api/companies/export/xlsx`, 표시 문구 `엑셀 다운로드`
- Contact: `GET /api/contacts/export/xlsx`, 표시 문구 `엑셀 다운로드`
- Product: `GET /api/products/export/xlsx`, 표시 문구 `엑셀 다운로드`
- Deal: `GET /api/deals/export/xlsx`, 표시 문구 `엑셀 다운로드`

도메인 구분은 버튼 문구가 아니라 사용자가 보고 있는 목록 화면과 호출 API로 판단한다. 각 목록의 `Download` icon action은 공통 tooltip/aria-label `엑셀 다운로드`를 사용한다.
- export 요청은 현재 목록 검색어/필터/정렬을 반영하고 `page`는 제외한다.

Backend는 구현되었지만 Frontend 연결이 남은 항목:

- 없음

mock/placeholder 경계를 유지해야 하는 항목:

- `/api/exports` 기반 generic Export job. 현재 Export 정책은 도메인별 xlsx 다운로드이므로 route를 숨기고 신규 작업에서 generic Export 화면/API를 확장하지 않는다.
- Notification. FE feature는 있으나 route와 진입 버튼은 Backend module/API 구현 전까지 숨긴다.

## 5A. BusinessCard OCR Frontend 기준

명함 스캔 route는 `/business-cards`다. 사이드바와 모바일 더보기 메뉴에서는 `명함 스캔`으로 노출하고, 아이콘은 lucide `Camera`를 사용한다. `/contacts/scan`은 legacy redirect만 유지한다.

목록 UX:

- 등록일 최신순 고정. 별도 정렬 select를 만들지 않는다.
- 상태 필터는 담당자 목록의 회사 필터와 같은 multi-select combobox 패턴을 사용한다.
- 상태 필터 안에는 `상태 초기화` 액션을 둔다.
- 전체 상태로 되돌리는 상단 액션은 회사 목록의 reset icon 버튼 패턴을 따른다.

`명함스캔` 모달 UX:

- 최초 상태에서는 이미지 업로드만 보여준다.
- 사용자가 `명함스캔`을 누르면 OCR 요청을 보내고 이미지 영역에 `명함스캔 중` 진행 표시를 올린다.
- 요청 중에는 파일 교체/삭제와 모달 닫기를 막는다.
- OCR 성공 후에는 추출 결과 확인/수정 폼만 보여준다.
- 수정 필드는 회사명, 회사분야, 회사지역, 담당자명, 휴대폰, 이메일, 부서, 직급이다.
- 휴대폰은 Frontend에서 `010-0000-0000` 형태로 포맷한다.
- 같은 모달에서 재촬영/재시도 흐름은 제공하지 않는다.

## 6. Search 구현 기준

상단 통합검색은 `features/search`에 둔다.

- 두 글자 이상 입력 시 `GET /api/search`를 호출한다.
- 요청 query: `q`, optional `types`, optional `limit`.
- 응답은 도메인별 group과 item을 반환한다.
- item은 상세 화면 이동에 필요한 `targetType`, `targetId`, `targetPath`를 포함한다.
- 전용 `/search` 라우트는 현재 없다. 상단 검색 UI 안에서 결과를 선택해 상세 화면으로 이동한다.
- User Web GlobalSearch는 `GET /api/search`와 연결되어 있으며 loading, empty, error 상태를 처리한다.
- 일정 검색 결과는 `/schedules/:scheduleId` route로 이동하고 일정 상세 화면에서 `GET /api/schedules/{scheduleId}`를 호출한다.

## 7. MeetingNote AI/STT Frontend 기준

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

Frontend는 draft API 결과를 자동 저장하지 않는다. 결과를 form field에 채우고 사용자가 수정한 뒤 기존 `POST /api/meeting-notes`로 저장한다. STT transcript는 검토용으로 표시하고 현재 범위에서는 저장하지 않는다. 직접 작성 저장은 AI/STT draft API를 호출하지 않고 `sourceType: MANUAL`로 저장한다.

Backend는 AI 초안 provider와 STT provider를 분리한다. Frontend는 provider 종류를 직접 알 필요가 없고, `ai-draft`와 `stt-draft` API 계약만 유지하면 된다.

## 8. Pagination 기준

- Company/Contact/Product/Deal/MeetingNote/Trash 목록은 page-number pagination을 사용한다.
- 기본 page size는 10이고, Trash 목록은 화면 밀도 기준으로 `pageSize=12`를 사용한다.
- 서버 응답은 `totalCount`, `totalPages`, `page`, `pageSize` 기준으로 처리한다.
- cursor 기반 `hasNext`는 memo log 같은 infinite loading 영역에서만 사용한다.

## 9. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md`
- `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
