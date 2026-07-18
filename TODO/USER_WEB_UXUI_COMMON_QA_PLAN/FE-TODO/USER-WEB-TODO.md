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
- 현재 목록은 이미 record table 구조에 가깝다. 새 구조로 갈아엎기보다 row density와 연결 record/업무 판단 정보 표현을 강화한다.
- 데스크톱 목록은 52~56px row height와 15개 기본 표시를 장기 목표로 보되, page size 숫자는 BE/API/test 계약과 함께 바꿀 때만 수정한다.
- 모바일 목록은 10개 내외 card/list를 유지하고, 15~20개 table을 억지로 노출하지 않는다.

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

- [x] 단계 탭/필터/검색/정렬 위치 확인
- [x] 딜명/회사/담당자/단계/금액/다음 행동/마감일/현재 응답에서 가능한 최근 활동 비교 가능성 확인
- [x] 등록일보다 마감일/다음 행동/현재 응답에서 가능한 최근 활동/연결 record가 우선 보이는지 확인
- [x] desktop row height 52~56px 수준 업무용 밀도 검토
- [x] page size 15개 필요성은 BE/API/test 계약 영향까지 확인하고 FE 단독 변경 금지
- [x] 최근 활동 또는 다음 행동 summary가 현재 API로 부족하면 BE/API 후속으로 기록
- [x] 다음 행동 가시성 개선
- [x] 딜 row/card가 Attio식 deal record와 linked company/contact/product 맥락을 보여주는지 확인
- [x] 상세 패널이 property-first, activity/Memo/일정/회의록 구분 기준을 따르는지 확인
- [x] 상세 패널/상세 진입 UX 확인
- [x] 긴 딜명과 긴 회사명 overflow 대응

G03 완료 기준으로 목록 row/card는 회사/담당자 linked record를 보여주고, 제품 linked record는 기존 상세 화면에서 확인한다. Deal list response에는 `products`가 없으므로 목록 제품 표시가 필요하면 BE/API 후속으로 분리한다.

### P1. Company/Contact/Product

- [x] 회사 목록에서 회사명/분야/지역/담당자/진행 딜/현재 응답에서 가능한 활동 확인
- [x] 담당자 목록에서 이름/회사/부서·직급/연락처/현재 응답에서 가능한 활동 확인
- [x] 제품 목록에서 제품명/카테고리·상태/연결 딜 수/현재 응답에서 가능한 활동 확인
- [x] 등록일이 연결 record/현재 응답에서 가능한 활동 맥락을 밀어내지 않는지 확인
- [x] 최근 활동 또는 다음 행동 summary가 현재 API로 부족하면 BE/API 후속으로 기록
- [x] desktop row height 52~56px 수준 업무용 밀도 검토
- [x] 생성 action과 export action 구분
- [x] 회사 생성 오른쪽 문서형 패널 확인
- [x] 담당자/제품 생성 panel 확인
- [x] 목록 row가 Notion database row처럼 열 수 있는 record로 보이는지 확인
- [x] 상세 기본 정보/연결 딜/메모 구분
- [x] 삭제/복구 UX 확인

G04 완료 기준으로 회사/담당자/제품 desktop row는 56px이고, 768px에서는 card/list를 유지한다. 회사/제품 list response에는 연결 record count가 있지만, 담당자 list response에는 연결 딜 수가 없고 세 도메인 list response에는 실제 최신 활동/다음 행동 summary가 부족하다. FE에서 임의 값을 만들지 않고 `COMMON/API-SPEC/README.md`와 `BE-TODO/API-TODO.md` 후속으로 기록했다.

### P1. Schedule/MeetingNote/BusinessCard/Import/Trash

- [ ] 일정 생성/수정 form 확인
- [ ] 일정/회의록에서 연결 딜/회사/담당자 맥락 확인
- [ ] 회의록 목록에서 제목/요약/연결 회사·담당자·딜/작성일/다음 행동 맥락 확인
- [ ] 명함 스캔/Trash 목록이 상태와 연결 record를 조밀하게 보여주는지 확인
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
- [x] G03 완료 전 `COMMON/GOAL-WORK-ORDER.md`의 `완료 후 필수 검토 게이트` 수행
- [x] G03 수정 diff 자체 검토
- [x] G03 `Notion + Attio Reference Gate` 수행
- [x] G03 대상 화면 재확인
- [x] G03 기준 `COMMON/ISSUE-LOG.md` 상태 최신화
- [x] G03 완료 보고에 검증, 검토 결과, 남은 리스크 기록
- [x] G04 완료 전 `COMMON/GOAL-WORK-ORDER.md`의 `완료 후 필수 검토 게이트` 수행
- [x] G04 수정 diff 자체 검토
- [x] G04 `Notion + Attio Reference Gate` 수행
- [x] G04 대상 화면 재확인
- [x] G04 기준 `COMMON/ISSUE-LOG.md` 상태 최신화
- [x] G04 완료 보고에 검증, 검토 결과, 남은 리스크 기록

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
