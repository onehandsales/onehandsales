# G18 Schedule User Web Screen

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P3-G17-G20-SCHEDULE-MEETING.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`

## 요구사항 체크
- `/schedules`에서 월간 캘린더를 기본 화면으로 제공한다.
- 같은 화면에서 월간/주간 view mode를 전환할 수 있어야 한다.
- 월/주 이동, 오늘 이동, 일정 생성 버튼, 일정 카드가 필요하다.
- 일정 생성/수정 form은 제목, 시작일시, 종료일시를 필수로 받는다.
- 장소, 딜, 회사, 담당자, 알림 시간, 메모 입력을 제공한다.
- `GET/POST/PATCH/DELETE /api/schedules`와 `GET /api/schedules/week`를 연결한다.
- 일정 없음 상태에는 빈 캘린더와 생성 CTA를 보여준다.
- Google source 일정은 출처 배지를 표시한다.
- `/schedules/week` 주간 보고서 화면으로 이동할 수 있어야 한다.

## 제외 범위
- Google Calendar import
- PDF/Excel 다운로드

## 작업 로그
- G18 기준 문서와 일정 FE TODO를 확인했다.
- 현재 `/schedules`는 placeholder이고 schedule feature는 빈 상태임을 확인했다.
- 기존 Deal 검색 필드와 회사/담당자/딜 API 패턴을 재사용해 연결 UI를 구성한다.
- Schedule API client, query key, 조회/mutation 훅, 타입, form schema를 추가했다.
- `/schedules`를 월간 기본 캘린더 화면으로 교체했다.
- 같은 화면에서 월간/주간 view mode 전환, 월/주 이동, 오늘 이동, 일정 생성 CTA를 구현했다.
- 일정 생성/수정 dialog에 제목, 시작/종료일시, 종일, 장소, 딜/회사/담당자 검색 연결, 알림 시간, 메모 입력을 추가했다.
- 일정 수정 dialog에서 상세 조회와 삭제 액션을 연결했다.
- `/schedules/week` 주간 보고서 화면과 라우트를 추가했다.
- Google source 일정은 월간 pill과 주간 카드/보고서에서 출처를 표시하도록 했다.

## 검토
- G18 제외 범위인 Google Calendar import와 PDF/Excel 다운로드는 구현하지 않았다.
- 일정은 딜 없이 생성 가능하며, 딜 선택 시 회사/담당자 입력이 기본 상속되도록 했다.
- 월간 캘린더는 데스크톱/모바일에서 같은 그리드를 사용하며, 모바일에서는 가로 스크롤로 전체 요일을 확인한다.
- 주간 보고서는 별도 화면에서 `GET /api/schedules/week` 결과를 날짜별 preview로 표시한다.
- 종료일시는 시작일시보다 늦어야 한다는 form validation을 추가했다.

## 검증
- `pnpm run typecheck` 통과
- `pnpm run lint` 통과
- `pnpm run build` 통과
- `git diff --check` 통과
- Playwright API mock 스모크 통과
  - `/schedules`: 월간 기본 조회, 주간 전환, 생성 dialog, 수정 dialog, 삭제 흐름 확인
  - `/schedules/week`: 주간 보고서 조회 확인
  - 모바일 `/schedules`: 월간 캘린더와 Google source 일정 표시 확인
  - 스크린샷: `/tmp/g18-schedules-desktop.png`, `/tmp/g18-schedules-week.png`, `/tmp/g18-schedules-mobile.png`

## 참고
- 첫 Playwright 스모크는 삭제 재검증에서 알림 문구를 일정 카드로 잘못 잡는 locator 문제로 실패했다. 일정 카드 button selector로 수정해 생성/수정/삭제 흐름을 확인했다.
- 이후 주간 보고서 검증은 삭제 후 공유 mock 상태와 주간 범위가 맞지 않아 실패했으며, fresh mock으로 분리해 `/schedules/week`와 모바일 화면을 재검증했다.

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G18 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
