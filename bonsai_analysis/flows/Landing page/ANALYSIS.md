# Landing page 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **11/11단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `f1a89cc0-4dc8-4576-b912-78231a2a7b1a` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=f1a89cc0-4dc8-4576-b912-78231a2a7b1a) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 11단계 / 11단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 11개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

익명 방문자가 제품 소개·후기·체험·지원·관련 페이지를 탐색한다. 11장은 한 공개 페이지의 스크롤과 후기 상태이며 가입 완료 흐름이 아니다.

- 공개 홈페이지 상단 hero는 이 flow에 없다. Logging in / Onboarding 시작 화면과 연결해 전체 페이지를 구성한다.
- Products (CRM), Pricing, Reviews, Help Center, Contact Us, 템플릿 및 법적 문서 흐름으로 연결되는 탐색을 제공한다.


- 폴더 위치: `bonsai_analysis/flows/Landing page`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_f832f286d2d74611a3f6486b79cb36ec`](https://gummble.com/screens/sc_f832f286d2d74611a3f6486b79cb36ec?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드·모바일 폼 소개 이미지](<screens/01_sc_f832f286d2d74611a3f6486b79cb36ec.png>) | 아래로 스크롤하여 기능 분류 노출 |
| 02 | [`sc_337ce046f7184e07b2f841009066cf95`](https://gummble.com/screens/sc_337ce046f7184e07b2f841009066cf95?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [업무 영역별 기능 링크](<screens/02_sc_337ce046f7184e07b2f841009066cf95.png>) | 후기 영역으로 스크롤 |
| 03 | [`sc_2acfdf88f60f4638b4f3f97b6023c9cc`](https://gummble.com/screens/sc_2acfdf88f60f4638b4f3f97b6023c9cc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 후기 슬라이드](<screens/03_sc_2acfdf88f60f4638b4f3f97b6023c9cc.png>) | 후기 작성자·사진·활성 표시 변경; 전환 동작 미수록 |
| 04 | [`sc_fe9ef5d8bdf049cbabad33e42a6529c1`](https://gummble.com/screens/sc_fe9ef5d8bdf049cbabad33e42a6529c1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [후기 슬라이드 전환](<screens/04_sc_fe9ef5d8bdf049cbabad33e42a6529c1.png>) | 재무 기능으로 스크롤 |
| 05 | [`sc_b36874f940ae40f085f0df38ee4a95cd`](https://gummble.com/screens/sc_b36874f940ae40f085f0df38ee4a95cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [재무 기능 소개](<screens/05_sc_b36874f940ae40f085f0df38ee4a95cd.png>) | 고객 경험 소개로 스크롤; 중간 영역 누락 가능 |
| 06 | [`sc_b410b2592edd40b99c423c2af0f73f6f`](https://gummble.com/screens/sc_b410b2592edd40b99c423c2af0f73f6f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [브랜딩·고객 경험 소개](<screens/06_sc_b410b2592edd40b99c423c2af0f73f6f.png>) | 평점·후기 모음으로 스크롤 |
| 07 | [`sc_c817e4443d78499394491227920ac96b`](https://gummble.com/screens/sc_c817e4443d78499394491227920ac96b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [평점·짧은 후기 모음](<screens/07_sc_c817e4443d78499394491227920ac96b.png>) | 지원·체험 설명으로 스크롤 |
| 08 | [`sc_81b8d00c272c4f709e9a04919113069b`](https://gummble.com/screens/sc_81b8d00c272c4f709e9a04919113069b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객지원·체험 안내](<screens/08_sc_81b8d00c272c4f709e9a04919113069b.png>) | 하단 CTA·푸터 노출 |
| 09 | [`sc_33704472c1d54fda8c9605958d1af9d9`](https://gummble.com/screens/sc_33704472c1d54fda8c9605958d1af9d9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [하단 가입 CTA와 푸터](<screens/09_sc_33704472c1d54fda8c9605958d1af9d9.png>) | 푸터 전체 링크 노출 |
| 10 | [`sc_a1fa28afd409416f88fe3625082ddfac`](https://gummble.com/screens/sc_a1fa28afd409416f88fe3625082ddfac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [푸터 전체 링크](<screens/10_sc_a1fa28afd409416f88fe3625082ddfac.png>) | 최하단 고지 노출 |
| 11 | [`sc_f5d10f7c06c44873bf3b7048ad5e4566`](https://gummble.com/screens/sc_f5d10f7c06c44873bf3b7048ad5e4566?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [푸터 법적 고지](<screens/11_sc_f5d10f7c06c44873bf3b7048ad5e4566.png>) | 페이지 하단에서 종료; 가입·문의 실행 없음 |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드·모바일 폼 소개 이미지

- Screen ID: `sc_f832f286d2d74611a3f6486b79cb36ec`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f832f286d2d74611a3f6486b79cb36ec?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1e32d253-a982-4aa4-903e-bea367d455bd.png)
- 로컬 이미지: [01_sc_f832f286d2d74611a3f6486b79cb36ec.png](<screens/01_sc_f832f286d2d74611a3f6486b79cb36ec.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_337ce046f7184e07b2f841009066cf95`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 고정 내비게이션 아래 데스크톱 대시보드 목업과 오른쪽 모바일 폼이 겹친다. 본 흐름은 페이지 최상단이 아닌 중간 스크롤에서 시작한다.
- 입력 항목·필수 표시·기본값: 사용자 입력창이 아니라 이미지 속 샘플 폼·금액·타임라인이다.
- 버튼·메뉴·안내 문구: Product·Industries·Templates·Pricing·Resources·Reviews, Log in, Start free.
- 확인된 상태: Jane 인사말, Project Timeline, Income & Expenses, Activity 및 모바일 Client Intake Form 목업.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 데스크톱·모바일 지원을 소개하는 시각 자료이며 실제 로그인 데이터가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 목업 내부 버튼이 작동하는지, 모바일 앱 제공 범위는 미확인.

#### 모델링 영향

- 후보와 근거: 공개 페이지 섹션·반응형 이미지 자산 후보. 샘플 금액을 실제 재무 데이터로 저장하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 업무 영역별 기능 링크

- Screen ID: `sc_337ce046f7184e07b2f841009066cf95`
- 원본: [화면 페이지](https://gummble.com/screens/sc_337ce046f7184e07b2f841009066cf95?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/11685bf1-a4ee-4b25-b4f7-c163cebd5196.png)
- 로컬 이미지: [02_sc_337ce046f7184e07b2f841009066cf95.png](<screens/02_sc_337ce046f7184e07b2f841009066cf95.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f832f286d2d74611a3f6486b79cb36ec` → 현재 → `sc_2acfdf88f60f4638b4f3f97b6023c9cc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정 헤더 아래 Manage clients / projects / finances 3열과 세로 구분선, 초록 선 아이콘.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Clients: Contracts·Forms·Scheduling·Client CRM. Projects: Collaboration·Invoicing·Time Tracking·Project Management. Finances: Payments·Expense Tracking·Tax Helper·Banking.
- 확인된 상태: 아래에 후기 카드 상단이 나타난다.
- 단계 간 변화: 아래로 스크롤하여 기능 분류 노출

#### 동작과 데이터

- 화면 관찰: 제품 기능을 세 업무 영역에 묶은 공개 탐색 구조.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 링크 목적지와 현재 제공 기능·국가 조건 미확인.

#### 모델링 영향

- 후보와 근거: 기능 카탈로그와 분류·링크 순서 후보. 금융 기능 테이블을 화면만으로 확정하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 고객 후기 슬라이드

- Screen ID: `sc_2acfdf88f60f4638b4f3f97b6023c9cc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2acfdf88f60f4638b4f3f97b6023c9cc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5cdbf766-c3a3-4b99-8130-2c3631fc6dd5.png)
- 로컬 이미지: [03_sc_2acfdf88f60f4638b4f3f97b6023c9cc.png](<screens/03_sc_2acfdf88f60f4638b4f3f97b6023c9cc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_337ce046f7184e07b2f841009066cf95` → 현재 → `sc_fe9ef5d8bdf049cbabad33e42a6529c1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 짙은 녹색 큰 둥근 카드에 후기와 작성자, 오른쪽 사진. 아래 다음 재무 섹션 제목.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 01·02·03 슬라이드 표시와 진행 막대.
- 확인된 상태: Alexandre, Business Consultant 후기; 세 번째 위치의 긴 초록 막대.
- 단계 간 변화: 후기 영역으로 스크롤

#### 동작과 데이터

- 화면 관찰: 후기 콘텐츠와 작성자·직무·이미지가 함께 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동 재생·클릭 전환 및 동의/출처 검증 미확인.

#### 모델링 영향

- 후보와 근거: 후기 슬라이드 콘텐츠·표시 순서 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 후기 슬라이드 전환

- Screen ID: `sc_fe9ef5d8bdf049cbabad33e42a6529c1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fe9ef5d8bdf049cbabad33e42a6529c1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aa032748-07bc-4b02-9f11-4f6a8821de92.png)
- 로컬 이미지: [04_sc_fe9ef5d8bdf049cbabad33e42a6529c1.png](<screens/04_sc_fe9ef5d8bdf049cbabad33e42a6529c1.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_2acfdf88f60f4638b4f3f97b6023c9cc` → 현재 → `sc_b36874f940ae40f085f0df38ee4a95cd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 녹색 카드에서 텍스트·인물 사진만 변경된다.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 01 활성 막대, 02·03 짧은 표시.
- 확인된 상태: Alison, Business Consultant 후기로 바뀐다.
- 단계 간 변화: 후기 작성자·사진·활성 표시 변경; 전환 동작 미수록

#### 동작과 데이터

- 화면 관찰: 3→1 순환 형태가 관찰되지만 자동 재생인지 클릭인지는 알 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전환 주기·키보드 조작·정지 기능 미확인.

#### 모델링 영향

- 후보와 근거: 슬라이드 활성 인덱스는 화면 상태 후보; 사용자 업무 데이터와 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 재무 기능 소개

- Screen ID: `sc_b36874f940ae40f085f0df38ee4a95cd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b36874f940ae40f085f0df38ee4a95cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/acedb8ff-c221-4f78-a96f-c2822a42cca3.png)
- 로컬 이미지: [05_sc_b36874f940ae40f085f0df38ee4a95cd.png](<screens/05_sc_b36874f940ae40f085f0df38ee4a95cd.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_fe9ef5d8bdf049cbabad33e42a6529c1` → 현재 → `sc_b410b2592edd40b99c423c2af0f73f6f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 청구서 목업, 우측 Invoicing·Banking·Accounting 설명 세로 배치.
- 입력 항목·필수 표시·기본값: 이미지 내부 청구서 값은 샘플.
- 버튼·메뉴·안내 문구: 기능별 Learn more 링크, Invoicing 옆 왼쪽 화살표.
- 확인된 상태: 청구서 목업에 수금 배지, Banking의 예금보험 홍보 문구가 있다.
- 단계 간 변화: 재무 기능으로 스크롤

#### 동작과 데이터

- 화면 관찰: 기능 소개이며 금융 계좌 개설·입금은 실행되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 금융 기능의 현재 지원 국가·약관·보험 적용은 확인하지 않았다.

#### 모델링 영향

- 후보와 근거: 기능 설명·이미지·링크 콘텐츠 후보. 홍보 문구를 제품의 도메인 제약으로 확정하지 않는다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 브랜딩·고객 경험 소개

- Screen ID: `sc_b410b2592edd40b99c423c2af0f73f6f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b410b2592edd40b99c423c2af0f73f6f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a8601c14-af29-40ee-9424-6776828fa396.png)
- 로컬 이미지: [06_sc_b410b2592edd40b99c423c2af0f73f6f.png](<screens/06_sc_b410b2592edd40b99c423c2af0f73f6f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b36874f940ae40f085f0df38ee4a95cd` → 현재 → `sc_c817e4443d78499394491227920ac96b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 편집기·브랜딩·고객 포털 목업이 가로로 겹치고 아래 3열 설명.
- 입력 항목·필수 표시·기본값: 샘플 Company logo·Header Image·Brand color가 이미지 안에 있다.
- 버튼·메뉴·안내 문구: Client CRM·Doc templates·White labelled 설명과 가로 막대.
- 확인된 상태: White labelled가 짙고 중앙 Brand Settings 목업이 강조된다.
- 단계 간 변화: 고객 경험 소개로 스크롤; 중간 영역 누락 가능

#### 동작과 데이터

- 화면 관찰: 브랜딩 설정을 홍보하는 이미지이며 이 페이지에서 설정을 변경한 것은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동 슬라이드 여부, 문서별 브랜딩 적용 범위는 Settings 흐름과 대조 필요.

#### 모델링 영향

- 후보와 근거: 공개 소개 자산과 실제 브랜딩 설정 모델 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 평점·짧은 후기 모음

- Screen ID: `sc_c817e4443d78499394491227920ac96b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c817e4443d78499394491227920ac96b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ee5ad125-8449-4ba2-be92-6dd54330e203.png)
- 로컬 이미지: [07_sc_c817e4443d78499394491227920ac96b.png](<screens/07_sc_c817e4443d78499394491227920ac96b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b410b2592edd40b99c423c2af0f73f6f` → 현재 → `sc_81b8d00c272c4f709e9a04919113069b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정 헤더 아래 중앙 제목·별 다섯 개·리뷰 플랫폼 로고, 여러 줄의 연녹색 후기 칩.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 개별 칩의 클릭 가능 여부는 표시만으로 알 수 없다.
- 확인된 상태: 1,000+ reviews 홍보와 다수의 짧은 후기 문구.
- 단계 간 변화: 평점·후기 모음으로 스크롤

#### 동작과 데이터

- 화면 관찰: 평점·후기 집계는 홍보 콘텐츠로 관찰되며 원본 리뷰는 열지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 평점 산식·최신성·실시간 연동 미확인.

#### 모델링 영향

- 후보와 근거: 후기 인용·플랫폼·집계 기준일 콘텐츠 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 고객지원·체험 안내

- Screen ID: `sc_81b8d00c272c4f709e9a04919113069b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_81b8d00c272c4f709e9a04919113069b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f7d40e52-a0d4-4790-b65c-3b5d1d60613c.png)
- 로컬 이미지: [08_sc_81b8d00c272c4f709e9a04919113069b.png](<screens/08_sc_81b8d00c272c4f709e9a04919113069b.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c817e4443d78499394491227920ac96b` → 현재 → `sc_33704472c1d54fda8c9605958d1af9d9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌측 채팅 목업, 우측 지원 소개와 구분선 아래 체험 안내.
- 입력 항목·필수 표시·기본값: 폼 없음; 채팅은 이미지.
- 버튼·메뉴·안내 문구: Contact us, Get started.
- 확인된 상태: 7일 체험과 첫 2주 내 환불 보장 홍보가 보인다.
- 단계 간 변화: 지원·체험 설명으로 스크롤

#### 동작과 데이터

- 화면 관찰: 해당 페이지에서는 문의나 체험을 실제 시작하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 환불 조건·기산일은 별도 정책 대조 필요.

#### 모델링 영향

- 후보와 근거: 지원 링크·체험 CTA와 정책 버전 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 하단 가입 CTA와 푸터

- Screen ID: `sc_33704472c1d54fda8c9605958d1af9d9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_33704472c1d54fda8c9605958d1af9d9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cc73830d-c327-4882-a9ef-12efdee23187.png)
- 로컬 이미지: [09_sc_33704472c1d54fda8c9605958d1af9d9.png](<screens/09_sc_33704472c1d54fda8c9605958d1af9d9.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_81b8d00c272c4f709e9a04919113069b` → 현재 → `sc_a1fa28afd409416f88fe3625082ddfac`

#### 화면에서 직접 확인한 내용

- 레이아웃: 짙은 녹색 가로 배너 오른쪽 버튼, 아래 5열 푸터 시작.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Start free trial now; Company·Products·Business Types·Resources·Templates 링크.
- 확인된 상태: 30초 시작·7일 무료 홍보, 템플릿 항목은 화살표가 있다.
- 단계 간 변화: 하단 CTA·푸터 노출

#### 동작과 데이터

- 화면 관찰: 페이지 하단에서 가입과 관련 콘텐츠 탐색을 제공한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿 화살표 동작은 다음 캡처로 대조.

#### 모델링 영향

- 후보와 근거: 푸터 탐색 그룹·중첩 링크·CTA 배치 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 푸터 전체 링크

- Screen ID: `sc_a1fa28afd409416f88fe3625082ddfac`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a1fa28afd409416f88fe3625082ddfac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7596857b-7211-4fd2-9c3c-508c450becab.png)
- 로컬 이미지: [10_sc_a1fa28afd409416f88fe3625082ddfac.png](<screens/10_sc_a1fa28afd409416f88fe3625082ddfac.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_33704472c1d54fda8c9605958d1af9d9` → 현재 → `sc_f5d10f7c06c44873bf3b7048ad5e4566`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정 헤더 아래 5열 링크와 하단 구분선·SNS 아이콘.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: Help center·Contact us·Privacy·Terms and conditions·Careers·Affiliate Program; 제품·업종·자료·템플릿 그룹. LinkedIn·Twitter.
- 확인된 상태: Templates 하위 8종과 Comparisons에 닫힌 화살표; 하단 FDIC 홍보.
- 단계 간 변화: 푸터 전체 링크 노출

#### 동작과 데이터

- 화면 관찰: 현재 화면에서는 어떤 링크도 열린 결과가 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아코디언 펼침과 각 목적지 라우팅 미확인.

#### 모델링 영향

- 후보와 근거: 공유 푸터 컴포넌트·메뉴 트리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 11 — 푸터 법적 고지

- Screen ID: `sc_f5d10f7c06c44873bf3b7048ad5e4566`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f5d10f7c06c44873bf3b7048ad5e4566?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/65ab2649-4eb9-4962-9956-2b1a32c74c84.png)
- 로컬 이미지: [11_sc_f5d10f7c06c44873bf3b7048ad5e4566.png](<screens/11_sc_f5d10f7c06c44873bf3b7048ad5e4566.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a1fa28afd409416f88fe3625082ddfac` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 푸터를 조금 더 아래로 스크롤하여 작은 회색 각주 노출.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: SNS 아이콘, 기존 푸터 링크.
- 확인된 상태: 2023 저작권, 결제·은행 제휴 및 샘플 데이터·법률 서비스 관련 고지가 작게 보인다.
- 단계 간 변화: 최하단 고지 노출

#### 동작과 데이터

- 화면 관찰: 시각 예시가 실제 제품과 다를 수 있음을 고지한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 현재 법적 조건·은행 제휴는 이 캡처로 확정하지 않는다.

#### 모델링 영향

- 후보와 근거: 지역·시점별 고지 콘텐츠와 버전 관리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 홍보 목업 내부의 데이터·버튼을 실제 앱의 조작 가능한 상태로 해석하지 않는다.
- 후기 전환은 관찰되나 자동 재생·클릭 원인은 미확인이다.
- 7일 체험 및 환불 홍보는 당시 문구다. 구독 해지 문서와 환불 정책 사이 조건 차이도 별도 검토한다.
- 푸터의 2023 저작권·업무 날짜는 화면 캡처일을 확정하는 근거가 아니다.

## 6. 공식 도움말과 API 대조

- [Bonsai 공식 홈페이지](https://www.hellobonsai.com/): 현재 페이지의 고객·프로젝트·재무 영역 소개를 확인했다. 캡처와 카피·메뉴·기능 구성이 달라 동일 버전으로 취급하지 않는다.
- [무료 체험 도움말](https://help.hellobonsai.com/en/articles/4303058-how-our-free-trial-works): 현재 체험의 카드 등록·자동 갱신 조건이 있으므로 화면의 무료 홍보만으로 결제 조건을 생략하지 않는다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 공개 페이지 섹션·탐색 링크·후기·자산·정책 버전은 콘텐츠 모델 후보이며 CRM 업무 데이터와 분리한다.
- 가입 CTA의 유입 경로 추적은 설계 후보일 뿐 실제 추적 구현은 미확인이다.

## 8. 미확인 사항과 검토 질문

- 페이지 최상단·섹션 사이 누락 영역은 로컬 이미지 추가 시 확인한다.
- 모바일 반응형·후기 자동 전환·내비게이션 드롭다운·접근성 상태를 실제 브라우저에서 확인한다.
- 은행·세금 등 캡처 당시 홍보 기능의 현재 지원 여부를 구현 범위 결정 전에 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 11개와 실제 이미지 11개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 11단계 재조회 및 원본 11개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
