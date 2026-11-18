# Industries (Consulting) 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `7fcadde8-35c9-4b36-9c76-ec2d4432f20e` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=7fcadde8-35c9-4b36-9c76-ec2d4432f20e) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 8개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

업종 메뉴에서 Consulting 소개를 열고 프로젝트·청구·협업·재무·시간 기능을 살펴본다.

- 동일 공개 레이아웃의 업종별 콘텐츠 변형이다.
- 실제 앱 Projects·Invoicing·Client portal·Time Tracking과 비교할 목업을 포함한다.


- 폴더 위치: `bonsai_analysis/flows/Industries (Consulting)`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b71347cc8821454593507a2b9cb4a512`](https://gummble.com/screens/sc_b71347cc8821454593507a2b9cb4a512?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Industries 메가 메뉴](<screens/01_sc_b71347cc8821454593507a2b9cb4a512.png>) | Consulting 소개로 이동 |
| 02 | [`sc_18d96f6f4370489881038eb5fd0ce939`](https://gummble.com/screens/sc_18d96f6f4370489881038eb5fd0ce939?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Consulting hero](<screens/02_sc_18d96f6f4370489881038eb5fd0ce939.png>) | 대시보드 목업으로 스크롤 |
| 03 | [`sc_17109313d7c7495696383774136ec3d5`](https://gummble.com/screens/sc_17109313d7c7495696383774136ec3d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [컨설팅 대시보드 목업](<screens/03_sc_17109313d7c7495696383774136ec3d5.png>) | 6가지 기능 설명으로 스크롤 |
| 04 | [`sc_52e04cf0980e4d4fa09fd9ebf5030aad`](https://gummble.com/screens/sc_52e04cf0980e4d4fa09fd9ebf5030aad?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [기능 소개 6항목](<screens/04_sc_52e04cf0980e4d4fa09fd9ebf5030aad.png>) | 고객 후기로 스크롤 |
| 05 | [`sc_e334305ace2d4dd7af619fbd99c79394`](https://gummble.com/screens/sc_e334305ace2d4dd7af619fbd99c79394?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [컨설턴트 후기](<screens/05_sc_e334305ace2d4dd7af619fbd99c79394.png>) | 청구 소개로 스크롤 |
| 06 | [`sc_aefad7c41b8744a4a130c333ea3281ef`](https://gummble.com/screens/sc_aefad7c41b8744a4a130c333ea3281ef?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [컨설팅 청구 소개](<screens/06_sc_aefad7c41b8744a4a130c333ea3281ef.png>) | 고객 협업 소개로 스크롤 |
| 07 | [`sc_7fd1d40a6eba4e6ab8f3f7935b66a130`](https://gummble.com/screens/sc_7fd1d40a6eba4e6ab8f3f7935b66a130?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 협업 소개](<screens/07_sc_7fd1d40a6eba4e6ab8f3f7935b66a130.png>) | 재무·시간 소개로 이동; 중간 섹션 누락 가능 |
| 08 | [`sc_3df44f1b73064a85abb348c9b25eb6f2`](https://gummble.com/screens/sc_3df44f1b73064a85abb348c9b25eb6f2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [재무·시간 기능 카드](<screens/08_sc_3df44f1b73064a85abb348c9b25eb6f2.png>) | 두 기능 CTA에서 기록 종료 |

## 4. 화면별 상세 분석

### 단계 01 — Industries 메가 메뉴

- Screen ID: `sc_b71347cc8821454593507a2b9cb4a512`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b71347cc8821454593507a2b9cb4a512?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/85c22cc0-9f97-424b-be43-19cfaf6cc384.png)
- 로컬 이미지: [01_sc_b71347cc8821454593507a2b9cb4a512.png](<screens/01_sc_b71347cc8821454593507a2b9cb4a512.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_18d96f6f4370489881038eb5fd0ce939`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정 헤더 아래 업종 링크 4열, 배경 hero 일부가 가려진다.
- 입력 항목·필수 표시·기본값: 배경 이메일 빈 입력.
- 버튼·메뉴·안내 문구: Business Services: Consulting·Marketing·Recruiting·Virtual Assistant; Creative and Digital: Design·Photography·Software Development·Writing; Professional Services: Coaching·Architecture·Accounting·Legal; Other services: Event Planning·Interior Design·Real-Estate; 각 More.
- 확인된 상태: 업종별 공개 소개를 선택하는 메뉴.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 개인 계정의 업종 설정을 변경하는 화면이 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 메뉴 열림 트리거·More 목적지 미확인.

#### 모델링 영향

- 후보와 근거: 업종 탐색 분류와 계정 업종 속성을 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Consulting hero

- Screen ID: `sc_18d96f6f4370489881038eb5fd0ce939`
- 원본: [화면 페이지](https://gummble.com/screens/sc_18d96f6f4370489881038eb5fd0ce939?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4060de5c-80ac-4919-9df2-498d72145932.png)
- 로컬 이미지: [02_sc_18d96f6f4370489881038eb5fd0ce939.png](<screens/02_sc_18d96f6f4370489881038eb5fd0ce939.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b71347cc8821454593507a2b9cb4a512` → 현재 → `sc_17109313d7c7495696383774136ec3d5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 제목·설명·이메일 CTA, 우측 인물 사진·수금/비용 배지.
- 입력 항목·필수 표시·기본값: Enter your work email 빈칸; 필수·오류 없음.
- 버튼·메뉴·안내 문구: Start free, 상단 고객군 보조 메뉴.
- 확인된 상태: 컨설턴트의 고객·프로젝트·재무 통합 관리 소개.
- 단계 간 변화: Consulting 소개로 이동

#### 동작과 데이터

- 화면 관찰: 가입하지 않은 공개 랜딩 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: CTA의 업종 파라미터 전달 미확인.

#### 모델링 영향

- 후보와 근거: 업종별 카피·이미지·추천 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 컨설팅 대시보드 목업

- Screen ID: `sc_17109313d7c7495696383774136ec3d5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_17109313d7c7495696383774136ec3d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/40d13472-72a3-4bc0-8a06-cb0f7733fffa.png)
- 로컬 이미지: [03_sc_17109313d7c7495696383774136ec3d5.png](<screens/03_sc_17109313d7c7495696383774136ec3d5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_18d96f6f4370489881038eb5fd0ce939` → 현재 → `sc_52e04cf0980e4d4fa09fd9ebf5030aad`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 큰 브라우저 목업, 아래 내용으로 이어지는 스크롤.
- 입력 항목·필수 표시·기본값: 목업 안 작업·메시지·시간 표시; 실제 입력 없음.
- 버튼·메뉴·안내 문구: 목업 Overview·Scheduling·Invoices·Time Tracking·Collaborators·Settings 탭과 Invite.
- 확인된 상태: Digital Transformation Project의 작업·문서·청구·비용을 함께 보여준다.
- 단계 간 변화: 대시보드 목업으로 스크롤

#### 동작과 데이터

- 화면 관찰: 업종에 맞춘 샘플 프로젝트이며 실제 앱 상태의 증거는 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 업종 선택이 실제 메뉴를 바꾸는지 미확인.

#### 모델링 영향

- 후보와 근거: 업종 데모 데이터와 실제 프로젝트 집계를 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 기능 소개 6항목

- Screen ID: `sc_52e04cf0980e4d4fa09fd9ebf5030aad`
- 원본: [화면 페이지](https://gummble.com/screens/sc_52e04cf0980e4d4fa09fd9ebf5030aad?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/83c22653-647d-4884-909a-486e5f0ba8b5.png)
- 로컬 이미지: [04_sc_52e04cf0980e4d4fa09fd9ebf5030aad.png](<screens/04_sc_52e04cf0980e4d4fa09fd9ebf5030aad.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_17109313d7c7495696383774136ec3d5` → 현재 → `sc_e334305ace2d4dd7af619fbd99c79394`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열×2행 아이콘·제목·설명, 하단 중앙 체험 버튼.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Task management·Time tracking·Client portal·Contracts·Finance tracking·Time tracking, Try it for free.
- 확인된 상태: Task management 아래 반복 청구 설명, 두 번째 Time tracking 아래 협업 초대 설명으로 제목과 내용이 맞지 않는다.
- 단계 간 변화: 6가지 기능 설명으로 스크롤

#### 동작과 데이터

- 화면 관찰: 원본의 카피 불일치를 그대로 기록하며 작업=반복청구라는 규칙으로 해석하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 원본 편집 오류인지 캡처 시점 문제인지 미확인.

#### 모델링 영향

- 후보와 근거: 콘텐츠 검수 항목; 도메인 매핑은 실제 앱 기능으로 확인.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 컨설턴트 후기

- Screen ID: `sc_e334305ace2d4dd7af619fbd99c79394`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e334305ace2d4dd7af619fbd99c79394?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/eb49f20f-ec73-4d95-a0b4-1177710b650c.png)
- 로컬 이미지: [05_sc_e334305ace2d4dd7af619fbd99c79394.png](<screens/05_sc_e334305ace2d4dd7af619fbd99c79394.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_52e04cf0980e4d4fa09fd9ebf5030aad` → 현재 → `sc_aefad7c41b8744a4a130c333ea3281ef`

#### 화면에서 직접 확인한 내용

- 레이아웃: 사진과 Alison 후기 가로 카드, 아래 청구 소개 시작.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Try it for free.
- 확인된 상태: Landing page에도 등장하는 같은 작성자·직무의 후기.
- 단계 간 변화: 고객 후기로 스크롤

#### 동작과 데이터

- 화면 관찰: 여러 랜딩에서 후기 재사용 가능성을 보여준다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 같은 콘텐츠 ID인지 자산만 재사용했는지 미확인.

#### 모델링 영향

- 후보와 근거: 공유 후기 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 컨설팅 청구 소개

- Screen ID: `sc_aefad7c41b8744a4a130c333ea3281ef`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aefad7c41b8744a4a130c333ea3281ef?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/afe1e4e0-4c64-46d7-b426-59bc274cce1b.png)
- 로컬 이미지: [06_sc_aefad7c41b8744a4a130c333ea3281ef.png](<screens/06_sc_aefad7c41b8744a4a130c333ea3281ef.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e334305ace2d4dd7af619fbd99c79394` → 현재 → `sc_7fd1d40a6eba4e6ab8f3f7935b66a130`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 청구서·Send invoice 목업, 우측 세 가지 체크 설명과 가입 CTA.
- 입력 항목·필수 표시·기본값: 목업의 Recurring·Hourly billing 드롭다운과 결제수단 로고는 실제 입력이 아니다.
- 버튼·메뉴·안내 문구: Get started; 목업 Send Invoice.
- 확인된 상태: 선불 계약·시간/프로젝트 단위 청구·자동 알림을 홍보.
- 단계 간 변화: 청구 소개로 스크롤

#### 동작과 데이터

- 화면 관찰: 청구서 발행이나 자동 결제가 실행되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 목업의 서로 다른 금액·실제 계산 규칙은 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 반복 청구·시간 연결 후보는 Invoicing/Time Tracking 흐름에서 검증.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 고객 협업 소개

- Screen ID: `sc_7fd1d40a6eba4e6ab8f3f7935b66a130`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7fd1d40a6eba4e6ab8f3f7935b66a130?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/13fc1169-7cba-4c70-9944-d7f75d3591bf.png)
- 로컬 이미지: [07_sc_7fd1d40a6eba4e6ab8f3f7935b66a130.png](<screens/07_sc_7fd1d40a6eba4e6ab8f3f7935b66a130.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_aefad7c41b8744a4a130c333ea3281ef` → 현재 → `sc_3df44f1b73064a85abb348c9b25eb6f2`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 설명·체크 3항목과 버튼, 우측 Bob Philipps 포털 목업.
- 입력 항목·필수 표시·기본값: 목업 작업 체크·담당자; 실제 입력 없음.
- 버튼·메뉴·안내 문구: Get started; 목업 Active Tasks·Time Tracking.
- 확인된 상태: 작업·기한 공유, 시간 보고, 파일·메시지를 소개한다.
- 단계 간 변화: 고객 협업 소개로 스크롤

#### 동작과 데이터

- 화면 관찰: 샘플 완료 작업 2개와 미완료 작업이 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객별 공개 설정·담당자 노출·편집 권한 미확인.

#### 모델링 영향

- 후보와 근거: 작업 공개·시간 공유·파일 메시지 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 재무·시간 기능 카드

- Screen ID: `sc_3df44f1b73064a85abb348c9b25eb6f2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3df44f1b73064a85abb348c9b25eb6f2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/30247df3-62ff-4bbc-8b03-ca578d47e3c2.png)
- 로컬 이미지: [08_sc_3df44f1b73064a85abb348c9b25eb6f2.png](<screens/08_sc_3df44f1b73064a85abb348c9b25eb6f2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7fd1d40a6eba4e6ab8f3f7935b66a130` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 크기 2열 카드에 차트 목업·큰 제목·설명·가입 버튼.
- 입력 항목·필수 표시·기본값: 입력 없음; 숫자·기간·차트는 이미지.
- 버튼·메뉴·안내 문구: 각 Get started.
- 확인된 상태: Income & Expenses 선차트와 Time Tracked 막대차트, Billed Amount 배지.
- 단계 간 변화: 재무·시간 소개로 이동; 중간 섹션 누락 가능

#### 동작과 데이터

- 화면 관찰: 수입·이익·비용과 시간·청구금액을 시각화한다고 소개한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 집계 기간·통화·청구 상태·시간 산식 미확인.

#### 모델링 영향

- 후보와 근거: 재무·시간 집계 뷰 후보; 표시 샘플로 계산식을 만들지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 4단계 Task management 설명은 반복 청구이고 Time tracking 제목이 중복된다. 카피 불일치이므로 도메인 규칙으로 해석하지 않는다.
- 목업의 작업·시간·수입은 샘플이며 실계정 저장·공유는 관찰되지 않는다.
- 고객에게 모든 작업을 공유한다는 홍보 문구는 실제 포털 공개 설정·권한과 별도 대조한다.

## 6. 공식 도움말과 API 대조

- [공식 Consulting 소개](https://www.hellobonsai.com/software/consulting): 현재 고객·프로젝트·재무·시간·포털 통합을 설명하지만 캡처의 구성과 문구는 달라졌다.
- [Client Portal 도움말](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal)
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 공개 업종 분류·섹션·추천 콘텐츠 후보.
- 실제 데이터는 프로젝트별 작업·시간·청구·비용 관계로 검증하되 업종 전용 테이블이 필요하다고 단정하지 않는다.

## 8. 미확인 사항과 검토 질문

- 업종 선택이 계정 초기 설정에 반영되는지 확인한다.
- 홍보 카피 오류와 실제 기능 범위를 구분한다.
- 고객 포털 작업 공개 범위·시간 공유 권한은 실제 기능 흐름에서 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 8단계 재조회 및 원본 8개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
