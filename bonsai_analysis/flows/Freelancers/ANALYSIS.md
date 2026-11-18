# Freelancers 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `2eeced8d-a39f-4cf1-8f38-0a5b8f989c54` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=2eeced8d-a39f-4cf1-8f38-0a5b8f989c54) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

MCP는 Freelancers로 분류하지만 실제 네 화면은 Small businesses 소개·관련 글 목록을 보여준다. 원래 폴더명은 보존하고 불일치를 명시한다.

- 공개 고객군 소개에서 가입·데모·블로그로 이동할 수 있다.
- 2→3 사이 헤더가 Go to dashboard로 바뀌며 인증 경위는 수록되지 않았다.


- 폴더 위치: `bonsai_analysis/flows/Freelancers`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_bfa0b33d9265420d8ee7dc4403432d86`](https://gummble.com/screens/sc_bfa0b33d9265420d8ee7dc4403432d86?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Small business 소개 hero](<screens/01_sc_bfa0b33d9265420d8ee7dc4403432d86.png>) | 후기 영역으로 스크롤; 중간 본문 미수록 |
| 02 | [`sc_d84e927c4d784ac4aa7758d247026c9a`](https://gummble.com/screens/sc_d84e927c4d784ac4aa7758d247026c9a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [소규모 사업자 후기](<screens/02_sc_d84e927c4d784ac4aa7758d247026c9a.png>) | 관련 글 목록으로 이동/스크롤; 헤더 인증 표시도 변경 |
| 03 | [`sc_1ee835c6516e4e7eb88872fb06dbc3b3`](https://gummble.com/screens/sc_1ee835c6516e4e7eb88872fb06dbc3b3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Small businesses 관련 글](<screens/03_sc_1ee835c6516e4e7eb88872fb06dbc3b3.png>) | 기사 목록 아래와 페이지 이동 표시 노출 |
| 04 | [`sc_3487023dac064b8c8d2ad37168c4de69`](https://gummble.com/screens/sc_3487023dac064b8c8d2ad37168c4de69?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [관련 글 목록 하단](<screens/04_sc_3487023dac064b8c8d2ad37168c4de69.png>) | 1/2 페이지에서 종료; Next 실행 없음 |

## 4. 화면별 상세 분석

### 단계 01 — Small business 소개 hero

- Screen ID: `sc_bfa0b33d9265420d8ee7dc4403432d86`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bfa0b33d9265420d8ee7dc4403432d86?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a811ce70-43b6-4597-aed9-65c85187fb50.png)
- 로컬 이미지: [01_sc_bfa0b33d9265420d8ee7dc4403432d86.png](<screens/01_sc_bfa0b33d9265420d8ee7dc4403432d86.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d84e927c4d784ac4aa7758d247026c9a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 제목·설명·CTA, 우측 두 사람이 일하는 사진과 수금/폼 배지, 잎 장식.
- 입력 항목·필수 표시·기본값: 입력 필드 없음.
- 버튼·메뉴·안내 문구: Start free, Book a demo; 보조 메뉴 Small businesses·Agencies·Freelancers.
- 확인된 상태: flow 이름은 Freelancers지만 실제 제목은 Small business management software다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 캡처 내용을 기준으로 소규모 사업자 소개로 기록한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: MCP 분류 오류인지 경로 전환 누락인지 미확인.

#### 모델링 영향

- 후보와 근거: 고객군 랜딩 콘텐츠 후보; flow 이름을 업무 세그먼트로 강제하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 소규모 사업자 후기

- Screen ID: `sc_d84e927c4d784ac4aa7758d247026c9a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d84e927c4d784ac4aa7758d247026c9a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aa6d7816-8051-4062-9980-5a7108c82c27.png)
- 로컬 이미지: [02_sc_d84e927c4d784ac4aa7758d247026c9a.png](<screens/02_sc_d84e927c4d784ac4aa7758d247026c9a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_bfa0b33d9265420d8ee7dc4403432d86` → 현재 → `sc_1ee835c6516e4e7eb88872fb06dbc3b3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 사진+후기 가로 카드와 아래 계약 기능 영역 시작.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 상단 Try it for free, 고정 메뉴.
- 확인된 상태: Kimberly, Small business owner 후기, 아래 계약 목업 Draft/Sign.
- 단계 간 변화: 후기 영역으로 스크롤; 중간 본문 미수록

#### 동작과 데이터

- 화면 관찰: 스크롤 사이 여러 본문 섹션이 빠져 있을 수 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 페이지 길이·생략된 기능 섹션 미확인.

#### 모델링 영향

- 후보와 근거: 후기와 기능 설명 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Small businesses 관련 글

- Screen ID: `sc_1ee835c6516e4e7eb88872fb06dbc3b3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1ee835c6516e4e7eb88872fb06dbc3b3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4ee22784-982d-4bce-8091-15ed652b8b8d.png)
- 로컬 이미지: [03_sc_1ee835c6516e4e7eb88872fb06dbc3b3.png](<screens/03_sc_1ee835c6516e4e7eb88872fb06dbc3b3.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d84e927c4d784ac4aa7758d247026c9a` → 현재 → `sc_3487023dac064b8c8d2ad37168c4de69`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열×2행 글 카드, 이미지·카테고리·제목·저자.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 기사 카드 링크; 헤더가 Go to dashboard로 변경.
- 확인된 상태: 프로젝트 관리·청구서 이메일·직원 교육·미수금·Proforma·Net30 글.
- 단계 간 변화: 관련 글 목록으로 이동/스크롤; 헤더 인증 표시도 변경

#### 동작과 데이터

- 화면 관찰: 로그인 CTA에서 대시보드 링크로 바뀌었지만 로그인 과정은 수록되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 세션 변경 이유 및 기사 추천 기준 미확인.

#### 모델링 영향

- 후보와 근거: 글·분류·저자·고객군 연결, 로그인 인식 내비게이션 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 관련 글 목록 하단

- Screen ID: `sc_3487023dac064b8c8d2ad37168c4de69`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3487023dac064b8c8d2ad37168c4de69?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c08a40b7-6755-4a28-aab2-be9849d5addf.png)
- 로컬 이미지: [04_sc_3487023dac064b8c8d2ad37168c4de69.png](<screens/04_sc_3487023dac064b8c8d2ad37168c4de69.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1ee835c6516e4e7eb88872fb06dbc3b3` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 3열 기사 카드 마지막 부분 아래 넓은 초록 Next와 중앙 1/2 표시.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Next; Invoice Generator·S-Signature·소기업 청구·대출·CRM·회계사용 폼 관련 글.
- 확인된 상태: Go to dashboard 헤더 유지, 일부 카드 저자가 보이지 않는다.
- 단계 간 변화: 기사 목록 아래와 페이지 이동 표시 노출

#### 동작과 데이터

- 화면 관찰: 목록 페이지 수 2와 현재 첫 페이지를 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Next 결과·스크롤 복원·저자 미표시 조건 미확인.

#### 모델링 영향

- 후보와 근거: 페이지네이션 및 선택적 저자 표시 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- flow 이름보다 실제 화면 내용을 우선한다.
- 가입·데모 예약·기사 열람 완료 증거는 없다.
- 기사 목록은 페이지네이션이 있으나 페이지당 전체 개수는 캡처만으로 미확인이다.

## 6. 공식 도움말과 API 대조

- [공식 Small businesses 소개](https://www.hellobonsai.com/software/small-businesses)와 [Freelancing 소개](https://www.hellobonsai.com/software/freelancing): 공식 검색 결과에서도 별도 페이지로 확인된다. 캡처는 전자의 제목에 해당하며 현재 본문 구성은 달라졌다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 고객군별 랜딩·추천 글·저자·분류·페이지네이션 후보.
- 공개 랜딩의 고객군과 가입 설문 선택값을 자동으로 동일시하지 않는다.

## 8. 미확인 사항과 검토 질문

- MCP flow명과 실제 페이지가 다른 이유를 로컬 캡처 URL로 재확인한다.
- 헤더 인증 표시 변경이 실제 로그인인지 캡처 세션 혼합인지 확인한다.
- 생략된 본문과 2페이지 내용·모바일 배치를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
