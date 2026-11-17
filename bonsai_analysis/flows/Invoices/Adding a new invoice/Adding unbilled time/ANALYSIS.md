# Adding unbilled time 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `9a40f1e9-2362-4d00-a603-3f48febb5438` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=9a40f1e9-2362-4d00-a603-3f48febb5438) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

프로젝트 미청구 시간을 기간·반올림 옵션으로 골라 기존 인보이스에 청구 항목으로 추가한다.

- Flyer Design50의 초안에서 시작한다.
- 1시간7초의 시간 내역이20.04로 추가되어 총70.04가 되는 경로다.

- 상위 분석: [Adding a new invoice](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_3588b6b5ac2447fdbc7ecb2454855fcf`](https://gummble.com/screens/sc_3588b6b5ac2447fdbc7ecb2454855fcf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Flyer Design 항목 적용 | Add Unbilled Time 관련 확인 모달이 나타난다. |
| 02 | [`sc_efbb1d52a1324265b421c8ad7ae50e7e`](https://gummble.com/screens/sc_efbb1d52a1324265b421c8ad7ae50e7e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 미청구 시간 추가 확인 | Add My Hours 후 날짜 범위·반올림 설정을 표시한다. |
| 03 | [`sc_390428a45a5343a5b6aa5ad7cac920c5`](https://gummble.com/screens/sc_390428a45a5343a5b6aa5ad7cac920c5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 기간과 반올림 선택 | 시간 추가 후 문서 상단 Amount70.04가 보인다. |
| 04 | [`sc_1111f74eeb134598ba67aa4fb5da3e37`](https://gummble.com/screens/sc_1111f74eeb134598ba67aa4fb5da3e37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 시간 포함된 구독 인보이스 초안 | 아래로 스크롤하면 Project Hours Worked와 시간표 링크를 확인한다. |
| 05 | [`sc_fae51741ec5b4f258991ebd929cd3b65`](https://gummble.com/screens/sc_fae51741ec5b4f258991ebd929cd3b65?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 시간 항목과 시간표가 추가된 초안 | 시간을 포함한 초안으로 종료. 발송·Paid는 아님. |

## 4. 화면별 상세 분석

### 단계 01 — Flyer Design 항목 적용

- Screen ID: `sc_3588b6b5ac2447fdbc7ecb2454855fcf`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3588b6b5ac2447fdbc7ecb2454855fcf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cce6a84f-0a83-4c8a-ade7-0a0cb700b762.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_efbb1d52a1324265b421c8ad7ae50e7e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 드롭다운 닫힌 항목 표, 오른쪽 요약 Amount50.
- 입력 항목·필수 표시·기본값: Flyer Design, 설명은 브랜드 가이드 기반 전단 디자인/레이아웃/카피와 원본 파일 제공. QTY1·PRICE50/item·TOTAL50, 소계/합계50USD, Tax0.
- 버튼·메뉴·안내 문구: Add New Row/Add Unbilled Time/가격단위 드롭다운, 할인·비용 추가.
- 확인된 상태: 이름 오류 테두리가 사라진 정상 입력 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 카탈로그 선택 후 설명과 가격까지 채워지고 계산값이50으로 바뀜.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 별도 저장 버튼이 없어도 서버 저장 방식은 단정하지 않는다.

#### 모델링 영향

- 후보와 근거: 카탈로그 값의 문서별 스냅샷 및 수량×단가 계산 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 미청구 시간 추가 확인

- Screen ID: `sc_efbb1d52a1324265b421c8ad7ae50e7e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_efbb1d52a1324265b421c8ad7ae50e7e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4385aea4-7197-4aa5-a6b8-df19997991b1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3588b6b5ac2447fdbc7ecb2454855fcf` → 현재 → `sc_390428a45a5343a5b6aa5ad7cac920c5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Add Unbilled Time 모달, 어두운 문서 배경.
- 입력 항목·필수 표시·기본값: 입력 없이 프로젝트에 미청구 시간이 있다는 안내.
- 버튼·메뉴·안내 문구: Add My Hours, Skip Adding Hours, 외곽 X.
- 확인된 상태: 시간 포함 여부 선택 전.
- 단계 간 변화: Add Unbilled Time 관련 확인 모달이 나타난다.

#### 동작과 데이터

- 화면 관찰: 시간을 자동 포함하지 않고 선택 단계를 둔다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동으로 열린 것인지 링크 클릭인지 정확한 트리거 미확인.

#### 모델링 영향

- 후보와 근거: 선택적 청구 시간 포함·취소 분기 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 기간과 반올림 선택

- Screen ID: `sc_390428a45a5343a5b6aa5ad7cac920c5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_390428a45a5343a5b6aa5ad7cac920c5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/430d2bf3-930d-4e80-b3d7-77e531f75801.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_efbb1d52a1324265b421c8ad7ae50e7e` → 현재 → `sc_1111f74eeb134598ba67aa4fb5da3e37`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달에 날짜·선택·집계·확정 버튼.
- 입력 항목·필수 표시·기본값: Feb6 2024→Feb6 2024. Don't round my time entries. Total Time01:00:07, Total Billed20.04.
- 버튼·메뉴·안내 문구: Add Unbilled Time, 날짜범위, 반올림 드롭다운, X. 시간과 금액을 올림하지 않는다는 안내.
- 확인된 상태: 추가 전 금액 미리보기.
- 단계 간 변화: Add My Hours 후 날짜 범위·반올림 설정을 표시한다.

#### 동작과 데이터

- 화면 관찰: 대상 기간과 청구 계산 옵션을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 드롭다운 전체 옵션·다중 프로젝트·세금 포함 여부 미확인.

#### 모델링 영향

- 후보와 근거: 원시간·청구시간·요율·기간·반올림 정책 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 시간 포함된 구독 인보이스 초안

- Screen ID: `sc_1111f74eeb134598ba67aa4fb5da3e37`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1111f74eeb134598ba67aa4fb5da3e37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f04ccc1e-f69d-4d06-bb17-fceebb9105f1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_390428a45a5343a5b6aa5ad7cac920c5` → 현재 → `sc_fae51741ec5b4f258991ebd929cd3b65`

#### 화면에서 직접 확인한 내용

- 레이아웃: 그라데이션 헤더와 로고가 있는 문서, 오른쪽 요약과 설정. Foundation 형태로 로고왼쪽·제목오른쪽.
- 입력 항목·필수 표시·기본값: Drafted $70.04, Every2Weeks/Mar21종료. Flyer Design1×$50/hr, 수신자JaneDoe, 발행Feb7/만기Mar8.
- 버튼·메뉴·안내 문구: Preview·Automation·Send Now/달력·…·Add Recipient·Enable Online Payments. 헤더파일명 일부 및 제거 X.
- 확인된 상태: 초안이며 결제수단 활성화 버튼이 남아 있다.
- 단계 간 변화: 시간 추가 후 문서 상단 Amount70.04가 보인다.

#### 동작과 데이터

- 화면 관찰: 금액70.04와 항목을 확인. 시간추가흐름에서는50→70.04 변경의 결과다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 화면 자체는 입금/발송 성공을 뜻하지 않는다. /item→/hr 변경 경위 미수록.

#### 모델링 영향

- 후보와 근거: 문서 초안·구독 시리즈·항목합계·결제구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 시간 항목과 시간표가 추가된 초안

- Screen ID: `sc_fae51741ec5b4f258991ebd929cd3b65`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fae51741ec5b4f258991ebd929cd3b65?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d0796364-d588-47d9-9d5c-a0f54c411a72.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1111f74eeb134598ba67aa4fb5da3e37` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 본문에 기존 서비스와 Project Hours Worked 두 행, 하단 Timesheets. 오른쪽 요약70.04.
- 입력 항목·필수 표시·기본값: 시간 항목QTY1.002·20/hr·20.04, 기존Flyer1·50/hr·50, 소계/전체70.04USD·Tax0. 시간표기간Feb6~Feb6.
- 버튼·메뉴·안내 문구: Edit Timesheet, Add New Row, 할인·비용 추가. 미청구 추가 대신 시간표 편집 링크.
- 확인된 상태: 초안 작성 완료. 지급완료 아님.
- 단계 간 변화: 아래로 스크롤하면 Project Hours Worked와 시간표 링크를 확인한다.

#### 동작과 데이터

- 화면 관찰: 시간 항목과 기간별 시간표 연결이 추가되어 합계가 증가.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 원본기록 개별ID·표시순서·편집/삭제 영향 미확인.

#### 모델링 영향

- 후보와 근거: 청구 항목과 원본 시간기록 연결 및 시간표 공개 뷰 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 기간Feb6~Feb6, 반올림 안 함, 총01:00:07/20.04.
- [관찰] 추가 후 항목 수량1.002×20/hr=표시20.04, 원시간은3607초다. 표시 소수와 실제 계산 정밀도를 구분한다.
- [관찰] 기존 Flyer Design 단위가/item에서/hr로 바뀌지만 변경 동작은 미수록. 시간 추가가 원인이라고 단정하지 않는다.
- [문서] 인보이스용 반올림은 원래 시간 기록을 바꾸지 않는다. Billed는 지급완료와 별개다.

## 6. 공식 도움말과 API 대조

- [시간 청구](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time): 초안 포함 시간과 발송된 청구 시간을 구분하며 지급 여부와도 다르다.
- [청구 시간 반올림](https://help.hellobonsai.com/en/articles/7050494-rounding-time-tracking-entries-on-invoices): 2026-08-27 기준 원시간을 유지하고 청구 표시 단계에 적용한다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 원본 시간기록→청구 포함 연결→인보이스 표시 항목의 단계별 데이터 후보.
- 기간·반올림·적용단가·시간표 공개 범위·중복청구 방지·문서 삭제 시 연결 해제 정책 후보.

## 8. 미확인 사항과 검토 질문

- 같은 시간기록을 여러 초안에 추가할 수 있는지와 발송 시 중복 방지 규칙을 확인한다.
- 3607초가1.002로 표시될 때 계산에 사용하는 원 정밀도와 항목/합계 반올림 순서를 확인한다.
- 이미 추가된 시간의 수정·삭제·요율 변경이 초안과 발송본에 어떻게 반영되는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
