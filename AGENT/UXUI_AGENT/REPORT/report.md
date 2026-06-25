# UI Audit Report — onehand.sales (localhost:5173)

> **근거**: measurements.json 실측값 전용 (getComputedStyle · getBoundingClientRect · WCAG relativeLuminance)
> **측정 뷰포트**: 1280px (desktop), 390px (mobile)
> **Tier**: 1 (FilterChip, 모바일 Chip, FAB, PreviewPanel, PageHeader, Button, Badge/StageBadge, ListRowActions, Pagination)
> **미측정**: LoadingState, ErrorState, Toast, ListEmptyState, Button secondary/danger/ghost — 별도 세션 필요

---

## 요약 인덱스

| #   | 심각도 | 위반 내용                                                                     | 영향 범위                              | 작업량 |
| --- | ------ | ----------------------------------------------------------------------------- | -------------------------------------- | ------ |
| A-1 | **H**  | 강조색 분열 — 모바일 전체가 보라(#5e5ce6), 데스크톱은 파랑(#4880EE)           | 모바일 전 화면                         | M      |
| A-2 | **H**  | 클릭 타겟 28–30px — WCAG 2.5.5 44px 미달                                      | 전 라우트 PageHeader·LRA·Pagination    | M      |
| A-3 | **M**  | FilterChip 데스크톱 fw700 vs 모바일 fw500 불일치                              | companies/contacts/deals/meeting-notes | S      |
| A-4 | **M**  | PageHeader br=6px vs Button.primary br=8px 불일치                             | 전 라우트 + /settings                  | S      |
| A-5 | **M**  | StageBadge 높이 24px vs 20.5px 불일치                                         | /deals preview panel                   | S      |
| A-6 | **L**  | 모바일 FilterChip active 대비비 4.41:1 — WCAG AA(4.5:1) 미달                  | companies/contacts mobile              | S      |
| B-1 | —      | StageBadge border 없음(bw=0) vs 참조 상 Badge border 있음 — 계층 위계 모호    | /deals                                 | S      |
| B-2 | —      | 딜 파이프라인 탭 br=0px (flat) + 색상 혼용으로 모바일 활성 표시 시각 약함     | /deals mobile                          | S      |
| B-3 | —      | PreviewPanel 상세보기 link br=6px (패널 br=8px와 불일치) — 내외 radius 불통일 | preview panel 전체                     | S      |

---

## (A) 측정 가능한 객관적 불일치

---

### A-1 [H] 강조색 분열 — 보라 #5e5ce6 vs 파랑 #4880EE

**위반 규칙**: 앱 전체에서 "primary / 활성" 강조 의미는 `#4880EE` 단일 색으로 표현 (PageHeader primary, 데스크톱 FilterChip active, 데스크톱 딜탭 active 모두 #4880EE 확인)

**증거 (실측)**

| 요소                     | 뷰포트 | 라우트                      | 실측 색                 |
| ------------------------ | ------ | --------------------------- | ----------------------- |
| PageHeader + 추가 버튼   | 1280px | 전 라우트                   | `#4880EE` ✅            |
| FilterChip "전체" active | 1280px | companies/contacts/deals/mn | `#1d4ed8` (blue-700) ✅ |
| DealTab active underline | 1280px | /deals                      | `#4880EE` ✅            |
| FAB                      | 390px  | companies/contacts/deals    | `#5e5ce6` ❌            |
| FilterChip "전체" active | 390px  | companies/contacts          | `#5e5ce6` ❌            |
| DealTab active underline | 390px  | /deals                      | `#5e5ce6` ❌            |

데스크톱(1280px)은 파랑 계열 독점, 모바일(390px)은 보라 계열 독점. "새 항목 추가"와 "현재 활성 상태" 두 의미 모두 뷰포트에 따라 다른 색으로 렌더됨. 의도되지 않은 불일치로 확인됨.

**수정안**: FAB bg, 모바일 FilterChip active(bg/text/border), 모바일 DealTab active underline/text를 `#4880EE` 및 blue 계열(`#eaf2ff` bg, `#1d4ed8` text, `#c7d7fe` border)로 교체.

**작업량**: M — 3개 컴포넌트 × CSS 변수/클래스 교체 (FAB inline style 또는 Tailwind class 2–4곳)

---

### A-2 [H] 클릭 타겟 크기 — WCAG 2.5.5 (44×44px) 미달

**위반 규칙**: WCAG 2.5.5 Success Criterion — 포인터 입력 클릭 타겟 최소 44×44px (Level AA). 모바일에서 특히 중요.

**증거 (실측)**

| 요소                                  | 실측 크기 | 부족분  |
| ------------------------------------- | --------- | ------- |
| PageHeader default 버튼 (download 등) | 30×30px   | -14px   |
| PageHeader primary 버튼 (+추가)       | 30×30px   | -14px   |
| ListRowActions 상세 pill              | 46.8×28px | h -16px |
| ListRowActions trash 버튼             | 28×28px   | -16px   |
| Pagination prev/next 버튼             | 28×28px   | -16px   |
| FAB                                   | 52×52px   | ✅ 충족 |

라우트: 전 라우트 (PageHeader는 모든 페이지, LRA/Pagination은 목록 5개 페이지)

**수정안**:

- PageHeader 버튼: 실제 버튼 크기를 44px로 늘리거나 `padding` 또는 투명 hit-area(`::before`) 추가
- LRA trash: `h-7 w-7`(28px) → `h-9 w-9`(36px) 또는 hit-area 확장
- Pagination btn: 동일 방식
- LRA 상세 pill: h를 `h-7`(28) → `h-10`(40) 이상으로 높이거나 투명 padding 추가
- 대안: `min-h-[44px] min-w-[44px]`를 버튼 wrapper에 적용하되 시각적 크기는 유지 (`overflow: visible` hit-area 기법)

**작업량**: M — 3개 컴포넌트(PageHeader, LRA, Pagination) 개별 수정. 시각 크기 유지 방식으로 접근 시 Tailwind pseudo-element 추가.

---

### A-3 [M] FilterChip font-weight 불일치 — 데스크톱 700 vs 모바일 500

**위반 규칙**: "전체" 필터 버튼 active 상태의 폰트 굵기는 단일 값이어야 함 (비의도적 차이 확인됨)

**증거 (실측)**

| 뷰포트 | 라우트                      | font-weight    |
| ------ | --------------------------- | -------------- |
| 1280px | companies/contacts/deals/mn | `700` (bold)   |
| 390px  | companies/contacts          | `500` (medium) |

동일 "전체 활성" 상태인데 굵기가 다름. 데스크톱(700)이 더 강조되어 있음.

**수정안**: 모바일 FilterChip active의 `font-weight`를 `700`으로 통일. (또는 의도적으로 500 유지한다면 데스크톱도 500으로 낮춤 — 단, 700이 시각 계층상 더 명확하므로 700 통일 권장)

**작업량**: S — 모바일 chip active 클래스 1곳 수정

---

### A-4 [M] border-radius 불일치 — PageHeader btn 6px vs Button.primary 8px

**위반 규칙**: 같은 primary 색상(`#4880EE`) 버튼끼리 radius가 통일되어야 함

**증거 (실측)**

| 컴포넌트                      | 위치             | border-radius | 배경      |
| ----------------------------- | ---------------- | ------------- | --------- |
| PageHeader primary (+ 버튼)   | 전 라우트 topbar | `6px`         | `#4880EE` |
| Button.primary.sm (저장 버튼) | /settings        | `8px`         | `#4880EE` |

2px 차이이나 같은 primary variant가 다른 radius를 가짐.

**수정안**: 6px 또는 8px 중 하나로 통일. 앱 전반 `rounded-md`(6px) 사용이 더 빈번하므로 Button.primary도 6px로 맞추는 것이 변경 범위 최소.

**작업량**: S — button.tsx의 primary variant br 수정 1줄

---

### A-5 [M] StageBadge 높이 불일치 — 목록 24px vs 패널 내 20.5px

**위반 규칙**: 동일 컴포넌트(StageBadge)는 context에 무관하게 동일 크기여야 함

**증거 (실측)**

| 위치                    | 라우트        | 텍스트    | h        | px       |
| ----------------------- | ------------- | --------- | -------- | -------- |
| 딜 목록 행 내           | /deals 1280px | 초기 접촉 | `24px`   | `0 8px`  |
| Preview Panel 단계      | /deals 1280px | 초기 접촉 | `24px`   | `0 10px` |
| Preview Panel 액션 상태 | /deals 1280px | 진행 중   | `20.5px` | `0 8px`  |

"진행 중" 배지가 다른 StageBadge보다 3.5px 낮음. padding-x도 일부 인스턴스에서 8px vs 10px로 차이.

**수정안**: 패널 내 액션 상태 badge를 `h-6`(24px)으로 통일. padding-x도 `px-2`(8px)로 단일화.

**작업량**: S — StageBadge 또는 해당 사용 위치 클래스 1–2곳 수정

---

### A-6 [L] 모바일 FilterChip active 대비비 WCAG AA 미달

**위반 규칙**: WCAG 2.1 SC 1.4.3 — 일반 텍스트(18px 미만) 최소 대비비 4.5:1

**증거 (실측 WCAG relativeLuminance 계산)**

| 요소                     | 뷰포트 | 텍스트    | 배경      | 대비비     | 판정       |
| ------------------------ | ------ | --------- | --------- | ---------- | ---------- |
| FilterChip "전체" active | 390px  | `#5e5ce6` | `#eeeeff` | **4.41:1** | ❌ AA 미달 |
| FilterChip "전체" active | 1280px | `#1d4ed8` | `#eaf2ff` | **5.95:1** | ✅ AA 충족 |

차이: 0.09 (4.41 vs 4.5 임계값). 작은 차이지만 접근성 기준 위반.

**수정안**: A-1 강조색 통일(파랑으로 교체) 시 자동 해결됨. 데스크톱 blue 조합(#1d4ed8 on #eaf2ff = 5.95:1)으로 교체하면 이 문제도 동시 해결.

**작업량**: S (A-1 수정과 묶음 처리)

---

## (B) 반박 가능한 미적 제안 (trade-off 포함)

_이하 항목은 측정 근거가 있으나 디자인 의도에 따라 유지 가능. 주관적 판단 포함._

---

### B-1 StageBadge border 없음 — Badge와 시각 계층 위계 모호

**관찰**: StageBadge(딜 단계)는 `border-width: 0px`로 테두리가 없음. 참조 자료의 Badge 컴포넌트 설명은 "테두리 + 배경색 조합"을 명시. 실측에서 StageBadge는 bg 색상 채움만 있고 border 없음.

**trade-off**:

- 테두리 추가 시: 딜 단계 badge가 회사 분야/지역 Badge와 시각적으로 동일한 위계로 읽혀 구분 어려워질 수 있음
- 현행 유지 시: StageBadge = "상태", Badge = "분류" 로 암묵적 구분이 생겨 있음 — 이를 설계 의도로 볼 수 있음

**제안**: 설계 의도라면 명시적 문서화 권장 (StageBadge는 border 없음이 스펙). 아니라면 `border-width: 1px`로 다른 Badge와 통일.

**작업량**: S

---

### B-2 딜 파이프라인 탭 — flat tab(br=0) + 모바일 색상 혼용으로 활성 표시 약함

**관찰**: DealTab은 `border-radius: 0px`, `border-bottom: 2px solid` 방식. 데스크톱에서는 #4880EE 파랑 하단 선이 충분히 구분됨. 모바일에서는 동일 구조에 #5e5ce6 보라 — A-1이 수정되면 이 문제도 함께 개선됨.

**trade-off**: flat tab은 전통적 UI 패턴으로 기능상 문제는 없음. 다만 LRA/FilterChip 등이 모두 rounded-full이어서 탭만 flat이 시각적 이질감을 줄 수 있음.

**제안**: A-1 수정 후에도 탭 active 표시가 약하다고 판단되면 active tab에 `bg` 채움(예: `bg-blue-50`)을 추가하는 방안 검토. 현행 유지도 합리적.

**작업량**: S

---

### B-3 PreviewPanel 내부 상세보기 link br=6px — 패널 자체 br=8px와 미세 불일치

**관찰**: PreviewPanel 컨테이너 `br=8px`, 내부 상세보기 pill link `br=6px`. 시각적으로는 거의 구분되지 않으나 radius 체계 내 예외.

**trade-off**: 내부 요소가 컨테이너보다 작은 radius를 갖는 것은 일부 디자인 시스템(예: 카드 내 버튼)에서 의도적으로 사용됨. 현행 유지도 합리적.

**제안**: 통일한다면 상세보기 link를 `br=8px`로 변경. 혹은 `br=6px`를 Button 컴포넌트 기본값으로 확정하고 패널도 6px로 낮춤.

**작업량**: S

---

## 미측정 항목 (PHASE 3 범위 외)

| 항목                          | 사유                                       | 후속 조치                             |
| ----------------------------- | ------------------------------------------ | ------------------------------------- |
| LoadingState                  | API 응답 < 100ms — throttle 없이 캡처 불가 | 별도 세션(네트워크 throttle)에서 측정 |
| ErrorState                    | API 실패 인위 트리거 필요                  | 별도 세션(mock 또는 오프라인 테스트)  |
| Toast                         | 수ms 표시 — 자동화 캡처 필요               | Puppeteer/Playwright 기반 측정 권장   |
| ListEmptyState                | DB에 데이터 존재                           | 빈 테스트 계정 또는 DB 초기화 후 측정 |
| Button secondary/danger/ghost | 모달 내부 미열람                           | 모달 오픈 후 측정                     |

---

## 수정 우선순위 정리

| 우선순위 | 항목          | 이유                                               |
| -------- | ------------- | -------------------------------------------------- |
| 1        | **A-1 + A-6** | 강조색 통일 1회 수정으로 대비비 미달까지 동시 해결 |
| 2        | **A-2**       | 접근성 기준 위반 + 모바일 UX 직결                  |
| 3        | **A-3**       | FilterChip fw 통일 — 간단하고 즉시 수정 가능       |
| 4        | **A-4 + A-5** | 소규모 1줄 수정 — 배칭 처리 권장                   |
| 5        | **B-1 ~ B-3** | 미적 판단 필요 — 별도 검토                         |
