# Record payment 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `085fa1f3-f846-4dac-9bbd-0b65f000a427` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=085fa1f3-f846-4dac-9bbd-0b65f000a427) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

청구 담당자가 외부 입금을 기록하려 시도하지만 구독 인보이스의 결제 설정 조건에 막히는 경로다.

- 금액70.04의 Drafted 구독형 인보이스에서 시작한다.
- 이 흐름은 입금 기록 성공이 아니다. 결제 입력 필드도 나타나지 않는다.

- 상위 분석: [Adding a new invoice](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_1111f74eeb134598ba67aa4fb5da3e37`](https://gummble.com/screens/sc_1111f74eeb134598ba67aa4fb5da3e37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 시간 포함된 구독 인보이스 초안 | 우상단 … 메뉴를 연다. |
| 02 | [`sc_bdce9a3c2622478dafde0a8fa71686a7`](https://gummble.com/screens/sc_bdce9a3c2622478dafde0a8fa71686a7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 인보이스 추가 작업 메뉴 | Record Payment 선택 후 차단 안내 모달이 나타난다. |
| 03 | [`sc_345d0cb29e704618862dfa24727d000e`](https://gummble.com/screens/sc_345d0cb29e704618862dfa24727d000e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 입금 기록 차단 모달 | 카드 결제를 활성화하라는 안내에서 종료. 지급 상태 변경 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 시간 포함된 구독 인보이스 초안

- Screen ID: `sc_1111f74eeb134598ba67aa4fb5da3e37`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1111f74eeb134598ba67aa4fb5da3e37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f04ccc1e-f69d-4d06-bb17-fceebb9105f1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_bdce9a3c2622478dafde0a8fa71686a7`

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

### 단계 02 — 인보이스 추가 작업 메뉴

- Screen ID: `sc_bdce9a3c2622478dafde0a8fa71686a7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bdce9a3c2622478dafde0a8fa71686a7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/63cd9e59-e7f6-4c1c-9876-1678c86a2121.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1111f74eeb134598ba67aa4fb5da3e37` → 현재 → `sc_345d0cb29e704618862dfa24727d000e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 … 아래 오른쪽 드롭다운이 요약 패널 일부를 가림.
- 입력 항목·필수 표시·기본값: 폼 입력 없음.
- 버튼·메뉴·안내 문구: Record Payment, Download PDF, Duplicate, Invoice Settings, Manage Reminders, Delete.
- 확인된 상태: 메뉴 열림 상태.
- 단계 간 변화: 우상단 … 메뉴를 연다.

#### 동작과 데이터

- 화면 관찰: 다양한 문서 작업이 같은 메뉴에 있으며 각각 별도 동작이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Duplicate 복사 범위·Delete 영향·Reminder 규칙은 이 메뉴만으로 미확인.

#### 모델링 영향

- 후보와 근거: 문서 작업 권한과 상태별 가능 동작 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 입금 기록 차단 모달

- Screen ID: `sc_345d0cb29e704618862dfa24727d000e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_345d0cb29e704618862dfa24727d000e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4624f842-ef48-4216-88ee-113a92717b78.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_bdce9a3c2622478dafde0a8fa71686a7` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 편집 화면 위 중앙 Record Invoice Payment 모달. 외곽 X.
- 입력 항목·필수 표시·기본값: 금액·방법·날짜 입력 없음.
- 버튼·메뉴·안내 문구: 인보이스를 완성하라는 회색 안내와 카드 결제를 켜라는 빨간 안내. 닫기 X만 보임.
- 확인된 상태: 검증 차단 상태. 성공 알림·Paid 표시 없음.
- 단계 간 변화: Record Payment 선택 후 차단 안내 모달이 나타난다.

#### 동작과 데이터

- 화면 관찰: 입금 동작에 진입했지만 입력·저장으로 진행되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 카드 요구가 구독 특수조건인지 당시 버전 전체조건인지 미확인.

#### 모델링 영향

- 후보와 근거: 작업 전제조건과 검증 오류. 입금 레코드를 생성했다고 기록하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 인보이스 완성 후 지급 표시하라는 문구와 credit card payments 활성화 요구가 함께 나온다.
- [미확인] 이 제한은 구독형/현재 설정/당시 버전 중 무엇 때문인지 확정하지 않는다. 모든 수동 입금에 카드가 필요하다고 일반화하지 않는다.
- [문서] 현행 외부 입금은 완납·부분납, 방법·금액·날짜·선택적 고객 통지를 지원한다. 캡처의 차단 화면에서는 검증할 수 없다.

## 6. 공식 도움말과 API 대조

- [수동 입금 도움말](https://help.hellobonsai.com/en/articles/2899880-how-to-manually-mark-invoices-as-paid): 2026-08-14 기준 Receive Payment를 통해 외부 입금을 기록하고 Income에 반영한다. 이 흐름에는 해당 입력·완료 화면이 없다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 입금 이벤트·청구 잔액·문서 상태·알림을 별개 후보로 둔다. 입금기록과 실제 자금 이체도 구분한다.
- 문서 유형 및 결제수단에 따른 작업 가능 조건과 검증 오류 후보.

## 8. 미확인 사항과 검토 질문

- 동일 계정에서 Single/Recurring/Subscription 각각 수동 입금을 비교해 카드 요구 조건을 좁혀야 한다.
- 부분납·환불·입금취소·과지급 시 금액과 Bookkeeping 연결 규칙을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
