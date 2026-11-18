# Turning off card payments 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **2/2단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `565b66ad-85f3-48ce-a384-fb856c5dd782` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=565b66ad-85f3-48ce-a384-fb856c5dd782) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 2단계 / 2단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 2개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

연결된 Stripe 계정에서 기본 카드 결제 허용을 끈다.

- Stripe가 연결된 Payment Methods 모달에서 시작한다.
- Stripe 연결 해제와는 구분된다. Off 이후에도 Stripe Dashboard 링크와 공급자 카드가 남아 있다.

- 상위 분석: [Connecting to Stripe](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Invoices/Connecting to Stripe/Turning off card payments`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_c012403e6cdc45fd97c6f08848af4952`](https://gummble.com/screens/sc_c012403e6cdc45fd97c6f08848af4952?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [연결된 결제수단 유지](<screens/01_sc_c012403e6cdc45fd97c6f08848af4952.png>) | Card Payments를 off로 바꾸면 기본 결제수단 업데이트 토스트가 나타난다. |
| 02 | [`sc_7e7ebb3090b54bc9a5249f647865130e`](https://gummble.com/screens/sc_7e7ebb3090b54bc9a5249f647865130e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [기본 카드 결제 비활성화](<screens/02_sc_7e7ebb3090b54bc9a5249f647865130e.png>) | 카드허용 off 상태로 종료. 공급자 연결 해제 증거 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 연결된 결제수단 유지

- Screen ID: `sc_c012403e6cdc45fd97c6f08848af4952`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c012403e6cdc45fd97c6f08848af4952?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/963610f4-7d6f-4b8a-bb84-af69a2e364c1.png)
- 로컬 이미지: [01_sc_c012403e6cdc45fd97c6f08848af4952.png](<screens/01_sc_c012403e6cdc45fd97c6f08848af4952.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_7e7ebb3090b54bc9a5249f647865130e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 Payment Methods 모달, 성공 토스트 없음.
- 입력 항목·필수 표시·기본값: Stripe Card Payments on, PayPal 연결 전.
- 버튼·메뉴·안내 문구: Fees·Stripe Dashboard·…·Connect to PayPal·X.
- 확인된 상태: 연결 후 안정상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 연결 토스트가 사라진 이후 설정 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침영속성·해제메뉴 내용 미확인.

#### 모델링 영향

- 후보와 근거: 연결 상태와 기본 결제 허용 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 기본 카드 결제 비활성화

- Screen ID: `sc_7e7ebb3090b54bc9a5249f647865130e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7e7ebb3090b54bc9a5249f647865130e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/26b8b310-6126-43a6-973c-4ea5d213bbb5.png)
- 로컬 이미지: [02_sc_7e7ebb3090b54bc9a5249f647865130e.png](<screens/02_sc_7e7ebb3090b54bc9a5249f647865130e.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c012403e6cdc45fd97c6f08848af4952` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Stripe카드는 유지되고 토글만 회색off. 우하단성공토스트.
- 입력 항목·필수 표시·기본값: Card Payments off, PayPal 미연결.
- 버튼·메뉴·안내 문구: 기본결제수단 업데이트 성공알림. Stripe Dashboard/…/Fees/Connect PayPal 유지.
- 확인된 상태: 설정 성공. 연결해제와다름.
- 단계 간 변화: Card Payments를 off로 바꾸면 기본 결제수단 업데이트 토스트가 나타난다.

#### 동작과 데이터

- 화면 관찰: 기본 카드 허용이 꺼진 직접 증거.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기존인보이스·구독·저장카드·다른수단영향 미확인.

#### 모델링 영향

- 후보와 근거: provider연결과결제허용정책분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 토스트는 default payment methods 업데이트라고 명시한다.
- [미확인] 이미 발송한 문서·예약/구독 자동결제까지 중지되는지는 이 캡처로 확인되지 않는다.

## 6. 공식 도움말과 API 대조

- [Stripe 연결 도움말](https://help.hellobonsai.com/en/articles/13521627-how-to-connect-stripe-payments-in-bonsai): 2026-07-15 기준 Invoices > Edit Payment Methods에서 연결하며 지급 관리는 Stripe 대시보드를 사용한다. Bonsai Payments 사용 시 해제가 먼저 필요할 수 있다고 설명한다.
- [지원 결제수단 도움말](https://help.hellobonsai.com/en/articles/1867512-the-integrated-payment-methods-supported-by-bonsai): 목록과 개별 인보이스에서 결제수단을 조정할 수 있다. 기본값과 문서별 설정 우선순위는 추가 확인한다.

## 7. 데이터 모델링 시사점

- 연결 보유 여부와 카드 허용 bool을 분리할 후보.
- 문서별 허용 결제수단과 계정 기본값 상속·기존 구독 영향 후보.

## 8. 미확인 사항과 검토 질문

- off 이후 기존 링크의 카드폼과 저장카드 자동청구가 각각 어떻게 달라지는지 재현한다.
- 다시 on으로 바꿀 때 재인증·수수료조건 동의가 필요한지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 2개와 실제 이미지 2개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 2단계 재조회 및 원본 2개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
