# Preview invoice 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `3170e524-0da8-4acd-aaaa-33c3d0217288` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=3170e524-0da8-4acd-aaaa-33c3d0217288) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

인보이스가 고객에게 보일 문서·결제 안내·시간표 링크를 미리 확인한다.

- 편집 화면의 Preview에서 진입한다.
- 화면 상단에 Invoice Preview와 Share Invoice 안내가 있어 실제 고객 수신/결제 화면을 재현했다고 보지 않는다.

- 상위 분석: [Adding a new invoice](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_1111f74eeb134598ba67aa4fb5da3e37`](https://gummble.com/screens/sc_1111f74eeb134598ba67aa4fb5da3e37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 시간 포함된 구독 인보이스 초안 | 편집 패널이 없어지고 좌 문서·우 결제 안내의 미리보기가 나타난다. |
| 02 | [`sc_542047183c0446baa1b440c03a12018e`](https://gummble.com/screens/sc_542047183c0446baa1b440c03a12018e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 고객 미리보기 상단 | 아래로 스크롤해 두 항목과 합계·시간표·PDF 다운로드를 확인한다. |
| 03 | [`sc_6959caea78a643fd84fd7723b5f6fbd2`](https://gummble.com/screens/sc_6959caea78a643fd84fd7723b5f6fbd2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 미리보기 하단 | 미리보기 하단에서 종료. 공유·다운로드 실행은 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 시간 포함된 구독 인보이스 초안

- Screen ID: `sc_1111f74eeb134598ba67aa4fb5da3e37`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1111f74eeb134598ba67aa4fb5da3e37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f04ccc1e-f69d-4d06-bb17-fceebb9105f1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_542047183c0446baa1b440c03a12018e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 그라데이션 헤더와 로고가 있는 문서, 오른쪽 요약과 설정. Foundation 형태로 로고왼쪽·제목오른쪽.
- 입력 항목·필수 표시·기본값: Drafted $70.04, Every2Weeks/Mar21종료. Flyer Design1×$50/hr, 수신자JaneDoe, 발행Feb7/만기Mar8.
- 버튼·메뉴·안내 문구: Preview·Automation·Send Now/달력·…·Add Recipient·Enable Online Payments. 헤더파일명 일부 및 제거 X.
- 확인된 상태: 초안이며 결제수단 활성화 버튼이 남아 있다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 금액70.04와 항목을 확인. 시간추가흐름에서는50→70.04 변경의 결과다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이 화면 자체는 입금/발송 성공을 뜻하지 않는다. /item→/hr 변경 경위 미수록.

#### 모델링 영향

- 후보와 근거: 문서 초안·구독 시리즈·항목합계·결제구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 인보이스 고객 미리보기 상단

- Screen ID: `sc_542047183c0446baa1b440c03a12018e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_542047183c0446baa1b440c03a12018e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/253e9c1f-78ab-48f3-ac49-2754c726e14a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1111f74eeb134598ba67aa4fb5da3e37` → 현재 → `sc_6959caea78a643fd84fd7723b5f6fbd2`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 검은 Invoice Preview 배너, 왼쪽 문서·오른쪽 금액/자동청구 안내 카드. 관리 사이드바 없음.
- 입력 항목·필수 표시·기본값: Joe Studio70.04, DueMar8, #1001, 발행Feb7. From/To 표기와 그라데이션·로고.
- 버튼·메뉴·안내 문구: Share Invoice. 카드 저장 후 자동청구·사전알림·로그인해 취소 가능하다는 설명. Learn More.
- 확인된 상태: 미리보기, 실제 청구 성공 화면 아님.
- 단계 간 변화: 편집 패널이 없어지고 좌 문서·우 결제 안내의 미리보기가 나타난다.

#### 동작과 데이터

- 화면 관찰: 문서와 결제 안내를 나란히 확인한다. 하단 첫 항목은Project Hours Worked.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 카드입력 부재 원인·Share Invoice 동작·고객 인증 미확인.

#### 모델링 영향

- 후보와 근거: 미리보기 모드와 고객 결제 안내 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 인보이스 미리보기 하단

- Screen ID: `sc_6959caea78a643fd84fd7723b5f6fbd2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6959caea78a643fd84fd7723b5f6fbd2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f65e41e2-c55c-406c-8f7a-6a02759ba801.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_542047183c0446baa1b440c03a12018e` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 하단 항목·합계·시간표·결제안내·Powered by Bonsai. 하단 중앙 Download PDF.
- 입력 항목·필수 표시·기본값: Project Hours Worked1.002×20/hr=20.04, Flyer Design1×50/hr=50, 합계70.04USD.
- 버튼·메뉴·안내 문구: 기간표시 Timesheet 링크, 결제 문의 이메일, Download PDF.
- 확인된 상태: 읽기 전용 문서 표현. 입력 제어 없음.
- 단계 간 변화: 아래로 스크롤해 두 항목과 합계·시간표·PDF 다운로드를 확인한다.

#### 동작과 데이터

- 화면 관찰: 원시간표 링크와 금액 합계를 고객용 형태로 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 링크 내용/다운로드 성공/접근제한은 미확인.

#### 모델링 영향

- 후보와 근거: 시간표·PDF 공개 표현과 문서 항목 정렬 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 고객은 카드 저장으로 향후 자동청구를 사용할 수 있다는 설명을 보지만 실제 카드 입력은 이 캡처에 없다.
- [관찰] 시간 항목20.04와 서비스50 합계70.04. 편집 화면과 미리보기의 항목 순서가 다르다.
- [관찰] Download PDF·Timesheet·Share Invoice 버튼이 있어도 링크 접근권한이나 발송 성공은 확인되지 않았다.

## 6. 공식 도움말과 API 대조

- [반복과 구독 청구](https://help.hellobonsai.com/en/articles/1065297-understanding-the-difference-between-subscription-and-recurring-invoices): 반복 청구서는 주기에 따라 복제되며 발송 설정이 별개다. 구독 자동 결제는 고객의 결제수단 저장·동의가 필요하다.
- [결제 페이지 레이아웃](https://help.hellobonsai.com/en/articles/6537018-payment-page-layouts-on-client-invoices): 문서와 결제 양식이 양옆인 레이아웃과 일치한다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 관리자 편집·미리보기·공유 고객 페이지를 서로 다른 표현/권한 상태로 관리할 후보.
- 시간표 링크·PDF·고객 결제 동의/저장 수단은 문서 상태와 별개 후보.

## 8. 미확인 사항과 검토 질문

- 항목 순서가 다른 이유가 정렬 정책인지 캡처 사이 편집인지 확인해야 한다.
- 고객 공유 URL과 미리보기 URL의 인증·만료·다운로드 권한을 확인한다.
- 결제수단 미활성 상태에서 실제 발송/카드 저장이 가능한지 별도 재현한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
