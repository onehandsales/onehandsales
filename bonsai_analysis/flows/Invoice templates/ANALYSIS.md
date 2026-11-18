# Invoice templates 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **11/11단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a0181c28-2521-46d3-a0e6-3ead4851b2f9` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a0181c28-2521-46d3-a0e6-3ead4851b2f9) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 11단계 / 11단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 11개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

Templates 메뉴에서 공개 청구서 템플릿 페이지를 열어 파일 형식·업종별 예시·앱 기능 차이를 살펴본다.

- 메뉴2장+긴 소개 페이지9장으로 구성되며 실제 파일 다운로드·청구서 생성은 없다.
- Using invoice generator와 앱 Invoicing 진입을 별도로 제공한다.


- 폴더 위치: `bonsai_analysis/flows/Invoice templates`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_d68dbb7304bb45ac9755138b12ce3141`](https://gummble.com/screens/sc_d68dbb7304bb45ac9755138b12ce3141?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Templates 메가 메뉴 계약 기본](<screens/01_sc_d68dbb7304bb45ac9755138b12ce3141.png>) | Invoice Templates 메뉴 활성·추천 링크 교체 |
| 02 | [`sc_eac8d5a2e97d47c496455da557912622`](https://gummble.com/screens/sc_eac8d5a2e97d47c496455da557912622?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Invoice Templates 메뉴 선택](<screens/02_sc_eac8d5a2e97d47c496455da557912622.png>) | 청구서 템플릿 소개 페이지로 이동 |
| 03 | [`sc_ef526e3912f44ce29bac28e00edbae28`](https://gummble.com/screens/sc_ef526e3912f44ce29bac28e00edbae28?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [청구서 템플릿 소개 hero](<screens/03_sc_ef526e3912f44ce29bac28e00edbae28.png>) | 용도 설명·생성기 CTA로 스크롤 |
| 04 | [`sc_9cb41f708d1841bc9bb627e9adb69f59`](https://gummble.com/screens/sc_9cb41f708d1841bc9bb627e9adb69f59?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [청구서 템플릿 개념·생성기 링크](<screens/04_sc_9cb41f708d1841bc9bb627e9adb69f59.png>) | 다운로드 유형 소개로 스크롤 |
| 05 | [`sc_fb22ca5fac734f0bb6636d302b61fd2c`](https://gummble.com/screens/sc_fb22ca5fac734f0bb6636d302b61fd2c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [무료 템플릿 유형 설명](<screens/05_sc_fb22ca5fac734f0bb6636d302b61fd2c.png>) | 파일 형식별 카드 링크 노출 |
| 06 | [`sc_c1cf0b18c5da456ba7c29ddc416eab45`](https://gummble.com/screens/sc_c1cf0b18c5da456ba7c29ddc416eab45?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [형식별 다운로드 카드](<screens/06_sc_c1cf0b18c5da456ba7c29ddc416eab45.png>) | 형식별 설명으로 스크롤; 일부 카드 제목 미수록 |
| 07 | [`sc_0d63bd46b3304072b6f75589361c99b0`](https://gummble.com/screens/sc_0d63bd46b3304072b6f75589361c99b0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [파일 형식별 설명](<screens/07_sc_0d63bd46b3304072b6f75589361c99b0.png>) | 업종별 템플릿으로 스크롤 |
| 08 | [`sc_89b5c3a2a2be40109d8018d906853f1a`](https://gummble.com/screens/sc_89b5c3a2a2be40109d8018d906853f1a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [업종별 청구서 템플릿](<screens/08_sc_89b5c3a2a2be40109d8018d906853f1a.png>) | 추가 템플릿 카드로 이동; 중간 섹션 누락 가능 |
| 09 | [`sc_5902fc89beb849b4acb6be05de2f9f4c`](https://gummble.com/screens/sc_5902fc89beb849b4acb6be05de2f9f4c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [추가 청구서 템플릿 카드](<screens/09_sc_5902fc89beb849b4acb6be05de2f9f4c.png>) | 장점 카드로 스크롤 |
| 10 | [`sc_a094d29b4d2b453c8c46ee9ccb255d9f`](https://gummble.com/screens/sc_a094d29b4d2b453c8c46ee9ccb255d9f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [청구서 템플릿 장점](<screens/10_sc_a094d29b4d2b453c8c46ee9ccb255d9f.png>) | Word 장단점으로 이동; 일부 설명 누락 |
| 11 | [`sc_14cfb12034534421b6d0654f86236e3d`](https://gummble.com/screens/sc_14cfb12034534421b6d0654f86236e3d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Word 형식 장단점](<screens/11_sc_14cfb12034534421b6d0654f86236e3d.png>) | 비교 내용에서 기록 종료; 페이지 끝은 아님 |

## 4. 화면별 상세 분석

### 단계 01 — Templates 메가 메뉴 계약 기본

- Screen ID: `sc_d68dbb7304bb45ac9755138b12ce3141`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d68dbb7304bb45ac9755138b12ce3141?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/871c3613-2f38-4344-b6f2-eb6c4d9f233c.png)
- 로컬 이미지: [01_sc_d68dbb7304bb45ac9755138b12ce3141.png](<screens/01_sc_d68dbb7304bb45ac9755138b12ce3141.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_eac8d5a2e97d47c496455da557912622`

#### 화면에서 직접 확인한 내용

- 레이아웃: 헤더 아래 왼쪽 문서 유형 세로 메뉴·오른쪽 추천 계약 링크2열.
- 입력 항목·필수 표시·기본값: 배경 이메일 빈칸.
- 버튼·메뉴·안내 문구: Contract·Proposal·Invoice·Quote·Scope of Work·Brief·Form·All Templates, See all templates.
- 확인된 상태: Contract Templates 연녹색 활성·오른쪽 화살표, Featured contract templates.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 템플릿 메뉴를 열 때 계약 유형이 보이는 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기본 선택인지 이전 선택 유지인지 미확인.

#### 모델링 영향

- 후보와 근거: 메가 메뉴의 유형별 추천 링크 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Invoice Templates 메뉴 선택

- Screen ID: `sc_eac8d5a2e97d47c496455da557912622`
- 원본: [화면 페이지](https://gummble.com/screens/sc_eac8d5a2e97d47c496455da557912622?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/378377d9-61d1-4c07-b2d2-2369596c5a43.png)
- 로컬 이미지: [02_sc_eac8d5a2e97d47c496455da557912622.png](<screens/02_sc_eac8d5a2e97d47c496455da557912622.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d68dbb7304bb45ac9755138b12ce3141` → 현재 → `sc_ef526e3912f44ce29bac28e00edbae28`

#### 화면에서 직접 확인한 내용

- 레이아웃: 메가 메뉴 왼쪽 Invoice 활성, 오른쪽 추천 청구서 링크로 변경.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Basic·Contractor·Email·Pro Forma·Sample·Online Generator·Blank·Custom·Microsoft Word·Retainer·Work, See all templates.
- 확인된 상태: 같은 패널에서 유형별 목록만 바뀐다.
- 단계 간 변화: Invoice Templates 메뉴 활성·추천 링크 교체

#### 동작과 데이터

- 화면 관찰: 공개 청구서 자료와 생성기 진입점을 구분할 수 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: hover/click 동작·See all 대상 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 유형·추천 링크 그룹 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 청구서 템플릿 소개 hero

- Screen ID: `sc_ef526e3912f44ce29bac28e00edbae28`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ef526e3912f44ce29bac28e00edbae28?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5a94889f-e43c-4cd8-ad95-81af2d9f873f.png)
- 로컬 이미지: [03_sc_ef526e3912f44ce29bac28e00edbae28.png](<screens/03_sc_ef526e3912f44ce29bac28e00edbae28.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_eac8d5a2e97d47c496455da557912622` → 현재 → `sc_9cb41f708d1841bc9bb627e9adb69f59`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 제목·설명·CTA2개, 우측 청구서 예시 이미지. 아래 설명 제목.
- 입력 항목·필수 표시·기본값: 실제 입력 없음.
- 버튼·메뉴·안내 문구: Invoice with Bonsai, Get Template.
- 확인된 상태: 예시 문서에 발신/고객 정보·발행/기한·항목·총액·서명이 있다.
- 단계 간 변화: 청구서 템플릿 소개 페이지로 이동

#### 동작과 데이터

- 화면 관찰: 무료 파일 템플릿과 앱 사용을 나란히 안내한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: CTA 목적지·예시 서명 필요성·필수 필드 미확인.

#### 모델링 영향

- 후보와 근거: 파일 템플릿과 앱 문서 생성 경로 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 청구서 템플릿 개념·생성기 링크

- Screen ID: `sc_9cb41f708d1841bc9bb627e9adb69f59`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9cb41f708d1841bc9bb627e9adb69f59?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f5c1ee78-1b82-49ad-a554-1cccec67d4ba.png)
- 로컬 이미지: [04_sc_9cb41f708d1841bc9bb627e9adb69f59.png](<screens/04_sc_9cb41f708d1841bc9bb627e9adb69f59.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ef526e3912f44ce29bac28e00edbae28` → 현재 → `sc_fb22ca5fac734f0bb6636d302b61fd2c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 제목 아래 본문2열, 넓은 초록 생성기 CTA, 다음 다운로드 섹션 시작.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Online Invoice Generator 진입 버튼.
- 확인된 상태: 템플릿의 용도·대상·맞춤 편집을 설명한다.
- 단계 간 변화: 용도 설명·생성기 CTA로 스크롤

#### 동작과 데이터

- 화면 관찰: 파일 템플릿 대신 생성기로 이동하는 대안을 제공한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 버튼 후 동작은 Using invoice generator 흐름과 연결하되 같은 세션은 미확인.

#### 모델링 영향

- 후보와 근거: 관련 도구 링크·설명 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 무료 템플릿 유형 설명

- Screen ID: `sc_fb22ca5fac734f0bb6636d302b61fd2c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fb22ca5fac734f0bb6636d302b61fd2c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/13789aa5-d9ce-4acd-b019-d8bf220cbfde.png)
- 로컬 이미지: [05_sc_fb22ca5fac734f0bb6636d302b61fd2c.png](<screens/05_sc_fb22ca5fac734f0bb6636d302b61fd2c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9cb41f708d1841bc9bb627e9adb69f59` → 현재 → `sc_c1cf0b18c5da456ba7c29ddc416eab45`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 제목·설명, Blank·Custom·Printable3열 설명, 아래 예시 카드.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 각 유형 제목·본문 링크.
- 확인된 상태: Word/Excel·브랜딩·PDF/인쇄 등 용도별 설명.
- 단계 간 변화: 다운로드 유형 소개로 스크롤

#### 동작과 데이터

- 화면 관찰: 무료 파일 유형과 디자인 미리보기를 안내한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다운로드 형식별 내용·동일 템플릿 대응 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 용도·형식·미리보기 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 형식별 다운로드 카드

- Screen ID: `sc_c1cf0b18c5da456ba7c29ddc416eab45`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c1cf0b18c5da456ba7c29ddc416eab45?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8c03f3ae-2c72-47fb-a894-6448327a41ee.png)
- 로컬 이미지: [06_sc_c1cf0b18c5da456ba7c29ddc416eab45.png](<screens/06_sc_c1cf0b18c5da456ba7c29ddc416eab45.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fb22ca5fac734f0bb6636d302b61fd2c` → 현재 → `sc_0d63bd46b3304072b6f75589361c99b0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 카드. 첫 줄은 앱 추천·Invoice Template·Billing Template, 다음 줄 이미지 일부.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Try Bonsai; 각 파일 템플릿 Excel·Word·PDF·Google Sheets·Google Docs 링크.
- 확인된 상태: 첫 카드만 앱 가입CTA이고 나머지는 파일/외부문서 링크 묶음.
- 단계 간 변화: 파일 형식별 카드 링크 노출

#### 동작과 데이터

- 화면 관찰: 앱 문서 생성과 파일 획득 경로가 다르다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다운로드 성공·Google 복사/로그인 요구 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 하나에 여러 형식 자산·외부 URL 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 파일 형식별 설명

- Screen ID: `sc_0d63bd46b3304072b6f75589361c99b0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0d63bd46b3304072b6f75589361c99b0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8a24e832-72d8-41d0-ab2c-656dc92c72d6.png)
- 로컬 이미지: [07_sc_0d63bd46b3304072b6f75589361c99b0.png](<screens/07_sc_0d63bd46b3304072b6f75589361c99b0.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c1cf0b18c5da456ba7c29ddc416eab45` → 현재 → `sc_89b5c3a2a2be40109d8018d906853f1a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 위쪽 다운로드 링크 일부, 아래 Word·Google Docs·PDF·Excel 설명2열×2행.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 형식별 제목·설명.
- 확인된 상태: Word편집/PDF저장, Docs고객/날짜, PDF노트, Excel로고/세금계산 소개.
- 단계 간 변화: 형식별 설명으로 스크롤; 일부 카드 제목 미수록

#### 동작과 데이터

- 화면 관찰: 형식마다 기능 설명이 다르다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 파일의 계산식·필드·호환성은 내려받아 검증하지 않았다.

#### 모델링 영향

- 후보와 근거: 템플릿 형식별 기능 메타데이터 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 업종별 청구서 템플릿

- Screen ID: `sc_89b5c3a2a2be40109d8018d906853f1a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_89b5c3a2a2be40109d8018d906853f1a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6f5c227c-c8d0-44f0-9876-277de4914836.png)
- 로컬 이미지: [08_sc_89b5c3a2a2be40109d8018d906853f1a.png](<screens/08_sc_89b5c3a2a2be40109d8018d906853f1a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0d63bd46b3304072b6f75589361c99b0` → 현재 → `sc_5902fc89beb849b4acb6be05de2f9f4c`

#### 화면에서 직접 확인한 내용

- 레이아웃: Contractor와 Freelance 섹션을 이미지·본문 좌우 교차 배치.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 각 Get template·본문 링크.
- 확인된 상태: 두 템플릿의 색·항목·구성이 다르게 보인다.
- 단계 간 변화: 업종별 템플릿으로 스크롤

#### 동작과 데이터

- 화면 관찰: 분야별 템플릿 추천이며 앱 계정 유형 변경이 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 형식별 다운로드와 같은 자산인지 미확인.

#### 모델링 영향

- 후보와 근거: 업종별 템플릿 연결·미리보기 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 추가 청구서 템플릿 카드

- Screen ID: `sc_5902fc89beb849b4acb6be05de2f9f4c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5902fc89beb849b4acb6be05de2f9f4c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d570bacb-c0f1-4f6c-a790-8e0aed0b9b23.png)
- 로컬 이미지: [09_sc_5902fc89beb849b4acb6be05de2f9f4c.png](<screens/09_sc_5902fc89beb849b4acb6be05de2f9f4c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_89b5c3a2a2be40109d8018d906853f1a` → 현재 → `sc_a094d29b4d2b453c8c46ee9ccb255d9f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 카드 첫 줄3개·둘째 줄2개 일부.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Work·Retainer·Photography·Graphic Design·Pro Forma 템플릿 화살표.
- 확인된 상태: 카드 제목은 청구서지만 라벨은 Task management로 잘못 보이는 불일치.
- 단계 간 변화: 추가 템플릿 카드로 이동; 중간 섹션 누락 가능

#### 동작과 데이터

- 화면 관찰: Retainer 반복 청구·Pro Forma 선금 설명은 템플릿 소개다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 잘못된 라벨 원인·다운로드/앱 기능 범위 미확인.

#### 모델링 영향

- 후보와 근거: 카탈로그 라벨 검수; 반복 청구 규칙은 앱/API로 별도.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 청구서 템플릿 장점

- Screen ID: `sc_a094d29b4d2b453c8c46ee9ccb255d9f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a094d29b4d2b453c8c46ee9ccb255d9f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0c4b21d7-46b7-4417-b358-8361bf0e7b8a.png)
- 로컬 이미지: [10_sc_a094d29b4d2b453c8c46ee9ccb255d9f.png](<screens/10_sc_a094d29b4d2b453c8c46ee9ccb255d9f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5902fc89beb849b4acb6be05de2f9f4c` → 현재 → `sc_14cfb12034534421b6d0654f86236e3d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 제목·설명과3열×2행 카드. 둘째 줄 본문은 일부 잘린다.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 브랜딩 인상·추천·전문성·열람 추적·온라인 결제·시간 절약 제목.
- 확인된 상태: 무료 템플릿 설명과 앱 수준 기능 홍보가 같은 영역에 섞여 있다.
- 단계 간 변화: 장점 카드로 스크롤

#### 동작과 데이터

- 화면 관찰: 모든 기능이 다운로드 파일에 포함된다고 볼 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 둘째 줄 상세 조건·앱 전용 표시의 캡처 범위 미확인.

#### 모델링 영향

- 후보와 근거: 기능 설명의 제공 채널·권한 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — Word 형식 장단점

- Screen ID: `sc_14cfb12034534421b6d0654f86236e3d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_14cfb12034534421b6d0654f86236e3d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/40f3c613-0c03-4333-92aa-c9a2260b013a.png)
- 로컬 이미지: [11_sc_14cfb12034534421b6d0654f86236e3d.png](<screens/11_sc_14cfb12034534421b6d0654f86236e3d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a094d29b4d2b453c8c46ee9ccb255d9f` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 제목·설명 아래 Pros 연녹색 면과 Cons 초록 테두리 2열, 다음 Excel 제목.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 본문 invoicing software 링크.
- 확인된 상태: 쉬운 사용·비용·맞춤 편집과 오류·기능 제한·자동화/분석 부재 비교.
- 단계 간 변화: Word 장단점으로 이동; 일부 설명 누락

#### 동작과 데이터

- 화면 관찰: 파일 템플릿과 앱의 기능 경계를 설명한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 Word/Excel 파일 구성·현재 호환성은 검증하지 않았다.

#### 모델링 영향

- 후보와 근거: 파일 자산과 앱 기능을 분리하는 콘텐츠 모델 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 무료 파일 다운로드·외부 Google 문서·Bonsai 앱 사용은 서로 다른 경로다.
- Task management로 표시된 청구서 카드 라벨 오류를 업무 유형으로 반영하지 않는다.
- 열람 추적·자동 알림·온라인 수금 등 앱 기능을 Word/PDF 파일 자체 기능으로 확대하지 않는다.
- 자료의 예시 서명·항목·금액은 실제 입력 필수값이나 세금 정책을 확정하지 않는다.

## 6. 공식 도움말과 API 대조

- [공식 Invoice template](https://www.hellobonsai.com/invoice-template): 여러 파일 형식 링크와 업종별 소개를 확인했고 열람 추적을 앱 전용으로 명시한다. /templates/invoices는 이 경로로 이동했다. 파일 자체는 다운로드·검증하지 않았다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): GET `/public-api/v1/template_categories`, GET `/public-api/v1/templates`를 확인했다. 설명은 현재 documents 범위라고 명시하므로 폼 라이브러리 지원/필터 필드를 확정하지 않는다.
- [Invoices API](https://docs.hellobonsai.com/api/tag/invoices): GET/POST `/public-api/v1/invoices`, PATCH/DELETE `/public-api/v1/invoices/{id}`, POST `/public-api/v1/invoices/{invoice_id}/invoice_items`, PATCH/DELETE 해당 항목 `/{id}`, DELETE `/public-api/v1/invoices/{invoice_id}/recurrence`를 확인했다. 요청 필드·계정 설정·수동 입금 전용 endpoint는 이 그룹 페이지에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 공개 템플릿·파일 형식별 자산 URL·용도/업종·미리보기·추천 순서 후보.
- 앱 Invoice·계정별 템플릿 복제·문서 발행·다운로드 이력은 별도 동작 근거가 필요하다.

## 8. 미확인 사항과 검토 질문

- Get Template의 앵커 이동·파일 링크의 다운로드/새 탭/복사 동작을 확인한다.
- 미수록 중간 카드·페이지 하단·Excel비교·모바일 레이아웃을 추가 확인한다.
- 공개 카탈로그·파일·API 템플릿의 ID 대응은 미확인이다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 11개와 실제 이미지 11개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 11단계 재조회 및 원본 11개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
