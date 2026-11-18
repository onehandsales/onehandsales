# Affiliate Program 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `fcb41661-2520-40ac-842c-b463a7891093` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=fcb41661-2520-40ac-842c-b463a7891093) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

방문자가 제휴 소개·보상·귀속 기간을 읽고 외부 신청 또는 문의로 이동한다.

- Copying referral link의 무료 구독 보상과 Affiliate의 금전 수수료를 구분한다.
- 신청서·승인·대시보드·지급은 수록되지 않았다.


- 폴더 위치: `bonsai_analysis/flows/Affiliate Program`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_277957a51da546839a56826df24b84f9`](https://gummble.com/screens/sc_277957a51da546839a56826df24b84f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제휴 프로그램 소개](<screens/01_sc_277957a51da546839a56826df24b84f9.png>) | 신청·공유·지급 설명으로 스크롤 |
| 02 | [`sc_29f3c01990d545efb7c6b3f03fdb3022`](https://gummble.com/screens/sc_29f3c01990d545efb7c6b3f03fdb3022?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제휴 3단계 안내](<screens/02_sc_29f3c01990d545efb7c6b3f03fdb3022.png>) | 혜택·수수료·귀속 기간 카드로 스크롤 |
| 03 | [`sc_55853ebfc2fa4f928d98bfb0653248a3`](https://gummble.com/screens/sc_55853ebfc2fa4f928d98bfb0653248a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제휴 혜택·보상 설명](<screens/03_sc_55853ebfc2fa4f928d98bfb0653248a3.png>) | 최종 가입·문의 CTA로 스크롤 |
| 04 | [`sc_6a6de983773e41c1a0256eede9bab7d3`](https://gummble.com/screens/sc_6a6de983773e41c1a0256eede9bab7d3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제휴 최종 CTA](<screens/04_sc_6a6de983773e41c1a0256eede9bab7d3.png>) | CTA에서 종료; 신청·문의 실행 없음 |

## 4. 화면별 상세 분석

### 단계 01 — 제휴 프로그램 소개

- Screen ID: `sc_277957a51da546839a56826df24b84f9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_277957a51da546839a56826df24b84f9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/65ec1c1f-39b4-4feb-ba30-1415a6cbfad6.png)
- 로컬 이미지: [01_sc_277957a51da546839a56826df24b84f9.png](<screens/01_sc_277957a51da546839a56826df24b84f9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_29f3c01990d545efb7c6b3f03fdb3022`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 큰 제목·설명·Apply now, 우측 노트북을 사용하는 인물 사진.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Apply now, 공통 헤더.
- 확인된 상태: 방문자를 소개하고 수수료를 받는 프로그램 홍보.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 앱의 무료 한 달 referral과 다른 금전 보상 프로그램이다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 신청 승인·국가·지급 조건 미확인.

#### 모델링 영향

- 후보와 근거: 제휴 프로그램 콘텐츠·외부 신청 링크 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 제휴 3단계 안내

- Screen ID: `sc_29f3c01990d545efb7c6b3f03fdb3022`
- 원본: [화면 페이지](https://gummble.com/screens/sc_29f3c01990d545efb7c6b3f03fdb3022?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4b52e92c-4b43-4d92-bb71-e1b64af4fee8.png)
- 로컬 이미지: [02_sc_29f3c01990d545efb7c6b3f03fdb3022.png](<screens/02_sc_29f3c01990d545efb7c6b3f03fdb3022.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_277957a51da546839a56826df24b84f9` → 현재 → `sc_55853ebfc2fa4f928d98bfb0653248a3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 Apply online→Share with your audience→Get paid, 오른쪽 제휴 정보 목업.
- 입력 항목·필수 표시·기본값: 실제 입력 없음. 목업 Business Model Content/Reviews, Property Type 토글.
- 버튼·메뉴·안내 문구: Apply now.
- 확인된 상태: 비사용자도 신청, 고유 링크 공유, 첫 월납부액200%·연간30% CPA 설명.
- 단계 간 변화: 신청·공유·지급 설명으로 스크롤

#### 동작과 데이터

- 화면 관찰: 가입·공유·보상 전환 구조를 문구로 관찰한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 승인 시점·쿠키 귀속·환불 시 취소·세금 미확인.

#### 모델링 영향

- 후보와 근거: 제휴자·링크·전환·보상 규칙 버전 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 제휴 혜택·보상 설명

- Screen ID: `sc_55853ebfc2fa4f928d98bfb0653248a3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_55853ebfc2fa4f928d98bfb0653248a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/bb796b42-8415-4705-a7ed-764c22ae9138.png)
- 로컬 이미지: [03_sc_55853ebfc2fa4f928d98bfb0653248a3.png](<screens/03_sc_55853ebfc2fa4f928d98bfb0653248a3.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_29f3c01990d545efb7c6b3f03fdb3022` → 현재 → `sc_6a6de983773e41c1a0256eede9bab7d3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열×2행 혜택 카드.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 평균수입 홍보·Monthly payouts·전담 매니저·High commissions·60-day cookie window·Real-time reporting.
- 확인된 상태: 고정 보상 표: Starter 월50/연65, Professional 월75/연115, Business 월150/연200 달러. 앞 비율 설명과 정확히 일치한다고 단정할 수 없다.
- 단계 간 변화: 혜택·수수료·귀속 기간 카드로 스크롤

#### 동작과 데이터

- 화면 관찰: 월 지급·60일 귀속 홍보가 있지만 지급 완료는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고정금액과 비율의 우선순위·통화·승인 조건 미확인.

#### 모델링 영향

- 후보와 근거: 제휴 보상 정책 버전·귀속 기간·정산 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 제휴 최종 CTA

- Screen ID: `sc_6a6de983773e41c1a0256eede9bab7d3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6a6de983773e41c1a0256eede9bab7d3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/274d88c9-dc41-4a48-9420-ff5525fc3717.png)
- 로컬 이미지: [04_sc_6a6de983773e41c1a0256eede9bab7d3.png](<screens/04_sc_6a6de983773e41c1a0256eede9bab7d3.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_55853ebfc2fa4f928d98bfb0653248a3` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 짙은 녹색 배너 중앙 Ready to join?·설명·버튼 두 개, 아래 공통 푸터.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Get started, Contact us.
- 확인된 상태: 앞의 가입 CTA와 문의 대안을 반복한다.
- 단계 간 변화: 최종 가입·문의 CTA로 스크롤

#### 동작과 데이터

- 화면 관찰: 신청·연락 결과는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 외부 신청서·문의 목적지 미수록.

#### 모델링 영향

- 후보와 근거: 전환 CTA·문의 링크 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 캡처는 월 첫결제200%/연30% 설명과 플랜별 고정 보상표를 함께 보여준다. 둘의 정확한 관계는 미확인이다.
- 60일 쿠키와 월 지급은 홍보 설명이며 실제 귀속·취소·환불 정책은 보이지 않는다.
- 평균 월$2,000 홍보를 보장 수입이나 실제 정산 데이터로 기록하지 않는다.

## 6. 공식 도움말과 API 대조

- [공식 Affiliate 소개](https://www.hellobonsai.com/affiliates): 현재도 고유 링크·유료 전환 보상·60일 귀속·월 지급 설명이 있다. CTA는 FirstPromoter로 연결되고 캡처의 고정 플랜별 금액 대신 비율 중심으로 표시한다. 별도 제휴 약관은 이 분석에서 전문 대조하지 않았다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 제휴 프로그램·신청자·추적 링크·전환·보상·지급 후보. 실제 스키마는 외부 제휴 플랫폼 계약과 대조 필요.
- 앱 사용자 추천 무료기간과 제휴 정산을 같은 보상 테이블로 합칠지는 미정.

## 8. 미확인 사항과 검토 질문

- 고정 보상표와 비율 설명의 적용 시점·우선순위를 확인한다.
- 귀속·승인·환불 취소·지급 통화·세금·부정 추천 정책은 미확인이다.
- 신청 CTA와 문의의 외부 이동·계정 필요 여부를 추가 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
