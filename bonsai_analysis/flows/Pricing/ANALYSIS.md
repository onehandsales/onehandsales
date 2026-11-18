# Pricing 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `981ffcc3-d6c0-4038-8db3-4ac8753aace4` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=981ffcc3-d6c0-4038-8db3-4ac8753aace4) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

공개 가격 페이지에서 연간 결제 요금제·포함 기능·추가 상품을 비교한다.

- 로그인된 것으로 보이는 Go to dashboard 헤더지만 계정·구독 변경은 하지 않는다.
- Subscribing과 Settings/Subscription 흐름의 구형 요금제에 연결해 비교한다.


- 폴더 위치: `bonsai_analysis/flows/Pricing`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_6b53199f35cb4bc69306b8e615e55dd7`](https://gummble.com/screens/sc_6b53199f35cb4bc69306b8e615e55dd7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [연간 가격 선택](<screens/01_sc_6b53199f35cb4bc69306b8e615e55dd7.png>) | 연간 요금제 카드 아래 기능 목록으로 스크롤 |
| 02 | [`sc_c435c9f093d34fddabe4fa83dd022786`](https://gummble.com/screens/sc_c435c9f093d34fddabe4fa83dd022786?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [요금제 포함 기능 비교](<screens/02_sc_c435c9f093d34fddabe4fa83dd022786.png>) | 추가 상품 카드로 스크롤 |
| 03 | [`sc_963ddd0939f7412cb81390d58c8cb401`](https://gummble.com/screens/sc_963ddd0939f7412cb81390d58c8cb401?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [추가 상품 2종](<screens/03_sc_963ddd0939f7412cb81390d58c8cb401.png>) | 추가 상품 소개에서 종료; 플랜 선택·결제 없음 |

## 4. 화면별 상세 분석

### 단계 01 — 연간 가격 선택

- Screen ID: `sc_6b53199f35cb4bc69306b8e615e55dd7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6b53199f35cb4bc69306b8e615e55dd7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3d55912c-c4fb-4c35-b78c-3c104ba0d318.png)
- 로컬 이미지: [01_sc_6b53199f35cb4bc69306b8e615e55dd7.png](<screens/01_sc_6b53199f35cb4bc69306b8e615e55dd7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_c435c9f093d34fddabe4fa83dd022786`

#### 화면에서 직접 확인한 내용

- 레이아웃: 큰 중앙 제목·Monthly/Yearly 세그먼트, 3열 요금제 카드. Professional 주황 테두리 강조.
- 입력 항목·필수 표시·기본값: Yearly 활성, 2 months for free 배지.
- 버튼·메뉴·안내 문구: Starter·Professional·Business 각 Start for free; Go to dashboard 헤더.
- 확인된 상태: 연간 결제 월 환산 $21/$32/$66, Professional Best value for money.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 상품 비교만 보이며 구독 변경은 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 월간 전환·실제 연간 총액·세금 미확인.

#### 모델링 영향

- 후보와 근거: 플랜 가격과 주기·추천 배지 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 요금제 포함 기능 비교

- Screen ID: `sc_c435c9f093d34fddabe4fa83dd022786`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c435c9f093d34fddabe4fa83dd022786?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8187e997-3fc5-41e0-ada7-92bab2b2e9f6.png)
- 로컬 이미지: [02_sc_c435c9f093d34fddabe4fa83dd022786.png](<screens/02_sc_c435c9f093d34fddabe4fa83dd022786.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6b53199f35cb4bc69306b8e615e55dd7` → 현재 → `sc_963ddd0939f7412cb81390d58c8cb401`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 3열 카드가 길게 이어져 체크 목록·하단 CTA가 보인다.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Starter: 템플릿·무제한 고객/프로젝트·청구·제안/계약·예약·작업/시간·CRM·폼·비용. Professional: 브랜딩 제거·자동화·브랜드 포털·무제한 예약·QB/Calendly/Zapier. Business: 외주관리·채용계약·온보딩·인재풀·무제한 외주.
- 확인된 상태: 상위 플랜은 이전 플랜 전체 기능 포함 문구.
- 단계 간 변화: 연간 요금제 카드 아래 기능 목록으로 스크롤

#### 동작과 데이터

- 화면 관찰: 기능 권한의 계층형 홍보를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 제한 수·예외·현재 권한 조건 미확인.

#### 모델링 영향

- 후보와 근거: 기능 entitlement 및 요금제 버전 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 추가 상품 2종

- Screen ID: `sc_963ddd0939f7412cb81390d58c8cb401`
- 원본: [화면 페이지](https://gummble.com/screens/sc_963ddd0939f7412cb81390d58c8cb401?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bd117857-3118-489f-866a-657c08f82dc9.png)
- 로컬 이미지: [03_sc_963ddd0939f7412cb81390d58c8cb401.png](<screens/03_sc_963ddd0939f7412cb81390d58c8cb401.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c435c9f093d34fddabe4fa83dd022786` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 제목 아래 Team Seat·Bonsai Tax 카드 2열.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Tax Learn more.
- 확인된 상태: 각 $10/month; 좌석은 협업·시간·고객 관리, Tax는 비용·공제·분기 추정세 소개.
- 단계 간 변화: 추가 상품 카드로 스크롤

#### 동작과 데이터

- 화면 관찰: 부가 상품 소개만 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 좌석 역할별 과금·세금 국가 제한·구매 결과 미확인.

#### 모델링 영향

- 후보와 근거: 좌석·부가 기능 가격 후보; 세금 엔진 설계 근거는 부족.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- Yearly 선택이며 $21/$32/$66는 월 환산 표시이고 billed annually다. 월별 결제 금액으로 기록하지 않는다.
- Starter→Professional→Business의 포함 기능 상속을 문구로 확인한다.
- Team Seat와 Bonsai Tax는 당시 각 $10/month 추가 상품이다. 구매 수량·세금·최소 인원은 미확인.
- 공개 가격과 현재 앱 청구 계약을 동일시하지 않는다.

## 6. 공식 도움말과 API 대조

- [현재 공식 가격](https://www.hellobonsai.com/pricing): Basic·Essentials·Premium·Elite의 사용자당 요금 구조를 확인했다. 캡처의 Starter·Professional·Business와 플랜 명칭·과금 단위·기능 구성이 달라 구형 가격은 역사 자료로만 기록한다.
- [플랜 변경](https://help.hellobonsai.com/en/articles/2003194-how-to-change-your-subscription-plan): 월·연 결제와 플랜 변경, 기간 중 차액 조정·별도 부가 상품을 설명한다. 캡처의25/39/79달러를 현재 가격으로 취급하지 않는다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 요금제 버전·청구 주기·월 환산 가격·실제 청구액·기능 권한·추가 상품 후보.
- 정액/사용자당 요금과 과거 계약을 구분해야 하며 현재 정책을 임의 적용하지 않는다.

## 8. 미확인 사항과 검토 질문

- Monthly 전환 결과·세금·국가·통화·최소 좌석 조건은 미수록이다.
- 공개 CTA의 가입/기존 계정 구독 변경 라우팅을 확인한다.
- 구형 캡처 재현과 현재 비즈니스 가격 정책 중 구현 기준은 별도 결정한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
