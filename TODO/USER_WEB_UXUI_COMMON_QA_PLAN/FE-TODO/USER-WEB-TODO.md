# User Web TODO

## 1. 목적

`FE/user-web`의 UX/UI 공통 QA와 수정 작업을 바로 실행 가능한 단위로 정리한다.

## 2. 공통 수정 기준

- Tailwind CSS와 기존 UI 컴포넌트 패턴을 우선 사용한다.
- feature-first 구조를 유지한다.
- 페이지 컴포넌트는 조립을 담당하고, 복잡한 상태와 API 호출은 feature hook/API로 둔다.
- API client는 `src/lib/api-client.ts`를 사용한다.
- 직접 `fetch`를 page/component에서 호출하지 않는다.
- `any`를 사용하지 않는다.
- 사용자 노출 문구는 `UX_WRITING_GUIDE.md`를 따른다.
- icon-only button에는 `aria-label` 또는 tooltip을 둔다.
- 화면 UX/UI 기준은 `Notion식 작업공간 UX + Attio식 CRM record 관계 UX`다.
- Company/Contact/Product/Deal/Schedule/MeetingNote는 custom object가 아니라 고정 sales record로 다룬다.
- list row/card는 열 수 있는 record처럼 동작하고, detail은 property-first와 linked record 맥락을 보여준다.

## 3. 작업 목록

### P0. Audit baseline

- [x] 1440px, 1280px, 768px, 125% 확대 기준 P0/P1 화면 점검
- [x] `COMMON/ISSUE-LOG.md` 작성
- [x] S0/S1/S2 분류

### P0. App shell/home

- [x] `/app` 홈 정보 우선순위 정리
- [x] Sidebar/TopBar/MobileAppHeader/BottomTabBar 기본 상태 확인
- [x] workspace/sidebar/page 구조가 Notion식 작업공간 기준을 따르는지 확인
- [x] 홈의 딜/일정/회의록 항목이 linked record entry point처럼 동작하는지 확인
- [x] 빠른 실행 link가 보호 앱 route로 이어지는지 확인
- [x] icon-only action 접근성 확인
- [x] 긴 텍스트와 125% 확대 layout 확인

### P0. Deal pipeline

- [ ] 단계 탭/필터/검색/정렬 위치 확인
- [ ] 딜명/회사/담당자/금액/단계/다음 행동/마감일 비교 가능성 확인
- [ ] 다음 행동 가시성 개선
- [ ] 딜 row/card가 Attio식 deal record와 linked company/contact/product 맥락을 보여주는지 확인
- [ ] 상세 패널이 property-first, activity/Memo/일정/회의록 구분 기준을 따르는지 확인
- [ ] 상세 패널/상세 진입 UX 확인
- [ ] 긴 딜명과 긴 회사명 overflow 대응

### P1. Company/Contact/Product

- [ ] 목록 핵심 비교 정보 확인
- [ ] 생성 action과 export action 구분
- [ ] 회사 생성 오른쪽 문서형 패널 확인
- [ ] 담당자/제품 생성 modal/panel 확인
- [ ] 목록 row가 Notion database row처럼 열 수 있는 record로 보이는지 확인
- [ ] 상세 기본 정보/연결 딜/메모 구분
- [ ] 삭제/복구 UX 확인

### P1. Schedule/MeetingNote/BusinessCard/Import/Trash

- [ ] 일정 생성/수정 form 확인
- [ ] 일정/회의록에서 연결 딜/회사/담당자 맥락 확인
- [ ] 회의록 긴 입력과 AI/STT 보조 action 확인
- [ ] 명함스캔 upload/progress/success/failure/confirm 상태 확인
- [ ] Import upload/mapping/validation/confirm 단계 확인
- [ ] Trash list/detail/restore 상태 확인

### P0. Writing/states/a11y closeout

- [ ] `습니다`, `되었습니다`, `없습니다`, `필요합니다` 등 사용자 문구 검색
- [ ] empty/loading/error/success 상태 확인
- [ ] validation message 확인
- [ ] delete confirm 확인
- [ ] icon-only `aria-label` 또는 tooltip 확인
- [ ] Notion/Attio brand/copy/layout 복제 후보 확인
- [ ] custom object/custom field builder로 오해되는 노출 문구 확인
- [ ] 최종 검증 명령 실행

### P0. Goal closeout review

- [x] G02 완료 전 `COMMON/GOAL-WORK-ORDER.md`의 `완료 후 필수 검토 게이트` 수행
- [x] G02 수정 diff 자체 검토
- [x] G02 `Notion + Attio Reference Gate` 수행
- [x] G02 대상 화면 재확인
- [x] G02 기준 `COMMON/ISSUE-LOG.md` 상태 최신화
- [x] G02 완료 보고에 검증, 검토 결과, 남은 리스크 기록

## 4. 검증 명령

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 5. 완료 기준

- G01~G06 완료
- 각 goal 완료 후 검토 게이트 통과
- S0/S1/S2 UX/UI 이슈 없음 또는 명시적 보류
- 주요 화면 1440px, 1280px, 768px, 125% 확대 사용 가능
- `COMMON/ISSUE-LOG.md` 최신화
