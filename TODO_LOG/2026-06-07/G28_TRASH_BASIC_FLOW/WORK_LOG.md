# G28 Trash 기본 흐름

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

## 요구사항 체크
- `/api/trash` 조회 API를 구현한다.
- Company/Contact/Product/Deal/Schedule/MeetingNote 복구를 지원한다.
- 삭제일과 완전 삭제 예정일을 응답/화면에 표시한다.
- 30일 경과 리소스 자동 완전 삭제 job 기본 구조를 제공한다.
- User Web `/trash` 화면을 구현한다.
- 즉시 완전 삭제 API는 MVP 1차에서 차단한다.

## 제외 범위
- 사용자 즉시 완전 삭제 API와 UI
- 7일 전 실제 알림 발송
- Tag, TagAssignment 휴지통 노출

## 작업 로그
- G28 기준 문서와 Trash endpoint 계약을 확인했다.
- 주요 엔티티별 delete/restore use case가 이미 있음을 확인했다.
- 현재 User Web `/trash`는 placeholder임을 확인했다.
- Backend `TrashModule`을 추가하고 `AppModule`에 연결했다.
- `/api/trash` 목록 조회, `POST /api/trash/:targetType/:targetId/restore`, `DELETE /api/trash/:targetType/:targetId/permanent` endpoint를 구현했다.
- Company, Contact, Product, Deal, Schedule, MeetingNote와 CompanyLog, ContactLog, ProductLog, ProductConnection, DealActivity, PersonalMemo 휴지통 목록/복구를 구현했다.
- Tag, TagAssignment는 요구사항대로 휴지통 노출에서 제외했다.
- 사용자 즉시 완전 삭제는 `PermanentDeleteNotAllowed`로 차단하고, exception filter에서 409로 매핑했다.
- `TrashItemExpired`는 410으로 매핑하고, 복구 시 완전 삭제 예정일 경과 여부를 검사했다.
- 30일 경과 데이터 purge use case와 repository 기본 구조를 추가했다.
- `permanentDeleteAt`이 없는 legacy soft-delete 데이터도 `deletedAt + 30일` 기준으로 purge 대상이 되도록 보강했다.
- User Web `/trash` 화면을 구현하고, 유형 필터/삭제일/완전 삭제 예정일/복구 버튼/페이지네이션을 연결했다.
- 사이드바에 `휴지통` 링크를 추가했다.
- Trash use case 단위 테스트를 추가했다.

## 검토
- MVP 범위에서 사용자의 즉시 완전 삭제 UI는 제공하지 않고, API도 정책적으로 차단했다.
- 기본 조회는 주요 항목 중심으로 유지하고, targetType 필터를 선택하면 보조 soft-delete 항목도 조회/복구할 수 있다.
- 목록 응답은 본문/메모 전문을 노출하지 않고 제목, target id, 삭제일, 완전 삭제 예정일만 화면에 노출한다.
- Desktop 스크린샷에서 작업 열이 잘리는 문제가 있어 표 컬럼 폭과 브레이크포인트를 조정했다.

## 검증
- `cd BE && pnpm run typecheck`
- `cd BE && pnpm run lint`
- `cd BE && pnpm run build`
- `cd BE && pnpm run test -- trash`
- `cd BE && pnpm run test`
- `cd FE/user-web && pnpm run typecheck`
- `cd FE/user-web && pnpm run lint`
- `cd FE/user-web && pnpm run build`
- Playwright mock smoke: `/trash` 목록 조회, 복구 버튼, 유형 필터, desktop/mobile screenshot 확인
- 스크린샷: `/tmp/g28-trash-desktop.png`, `/tmp/g28-trash-mobile.png`
