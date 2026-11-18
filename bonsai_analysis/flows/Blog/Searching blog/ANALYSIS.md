# Searching blog 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `d9c648a4-1d8f-47a7-b53e-ea08055e1e7e` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=d9c648a4-1d8f-47a7-b53e-ea08055e1e7e) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

방문자가 Start a business 분류를 고른 상태에서 marketing 검색으로 글을 좁힌다.

- 상위 Blog의 공개 기사 검색이며 앱 통합 검색과 다르다.
- 결과 클릭·검색어 지우기·결과 없음 상태는 미수록이다.

- 상위 분석: [Blog](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Blog/Searching blog`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_6523185471cd431aae909650125ca79c`](https://gummble.com/screens/sc_6523185471cd431aae909650125ca79c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [분류 변경 중 희미한 목록](<screens/01_sc_6523185471cd431aae909650125ca79c.png>) | 희미한 콘텐츠·빈 이미지에서 정상 카드로 바뀜 |
| 02 | [`sc_d9ab19c1590d43e99432b10f85607cd0`](https://gummble.com/screens/sc_d9ab19c1590d43e99432b10f85607cd0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Start a business 결과](<screens/02_sc_d9ab19c1590d43e99432b10f85607cd0.png>) | marketing 입력 후 한 개 결과로 좁혀짐; 제출 방식 미확인 |
| 03 | [`sc_94b98a51d45a4cc0b25c5553ce66bb60`](https://gummble.com/screens/sc_94b98a51d45a4cc0b25c5553ce66bb60?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [marketing 검색 결과](<screens/03_sc_94b98a51d45a4cc0b25c5553ce66bb60.png>) | 검색 결과 1/1에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — 분류 변경 중 희미한 목록

- Screen ID: `sc_6523185471cd431aae909650125ca79c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6523185471cd431aae909650125ca79c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1776cf47-d23c-49bf-b25f-957e9b566016.png)
- 로컬 이미지: [01_sc_6523185471cd431aae909650125ca79c.png](<screens/01_sc_6523185471cd431aae909650125ca79c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d9ab19c1590d43e99432b10f85607cd0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 검색·분류는 정상, 아래 카드 텍스트가 희미하고 이미지 영역은 비어 있다.
- 입력 항목·필수 표시·기본값: Search 빈칸, Start a business 연한 강조.
- 버튼·메뉴·안내 문구: 8개 분류 메뉴.
- 확인된 상태: 임원 코칭·사진 시작·좋은 컨설턴트 글 텍스트가 있으나 로딩/전환처럼 보인다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 결과 없음 화면이 아니라 콘텐츠가 부분적으로 보이는 상태다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 로딩 상태인지 애니메이션인지 미확인.

#### 모델링 영향

- 후보와 근거: 목록 전환·이미지 로딩 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Start a business 결과

- Screen ID: `sc_d9ab19c1590d43e99432b10f85607cd0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d9ab19c1590d43e99432b10f85607cd0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3faf64fd-637a-4f91-a2f3-acc6ee605cb5.png)
- 로컬 이미지: [02_sc_d9ab19c1590d43e99432b10f85607cd0.png](<screens/02_sc_d9ab19c1590d43e99432b10f85607cd0.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6523185471cd431aae909650125ca79c` → 현재 → `sc_94b98a51d45a4cc0b25c5553ce66bb60`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 그리드에 세 기사 이미지·텍스트·저자 정상 표시.
- 입력 항목·필수 표시·기본값: 빈 검색, Start a business 초록 활성.
- 버튼·메뉴·안내 문구: 기사·저자 링크.
- 확인된 상태: 코칭·사진·컨설턴트 글과 다음 행 이미지.
- 단계 간 변화: 희미한 콘텐츠·빈 이미지에서 정상 카드로 바뀜

#### 동작과 데이터

- 화면 관찰: 선택 분류와 카드 분류가 일치한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 결과 전체 개수·페이징 미확인.

#### 모델링 영향

- 후보와 근거: 분류별 기사 조회 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — marketing 검색 결과

- Screen ID: `sc_94b98a51d45a4cc0b25c5553ce66bb60`
- 원본: [화면 페이지](https://gummble.com/screens/sc_94b98a51d45a4cc0b25c5553ce66bb60?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d7fd590d-2fc2-4c34-95af-04432b3f1db9.png)
- 로컬 이미지: [03_sc_94b98a51d45a4cc0b25c5553ce66bb60.png](<screens/03_sc_94b98a51d45a4cc0b25c5553ce66bb60.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d9ab19c1590d43e99432b10f85607cd0` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 검색 초록 테두리, 왼쪽 결과 1개·넓은 빈 여백, 하단1/1.
- 입력 항목·필수 표시·기본값: 검색어 marketing; Start a business 유지.
- 버튼·메뉴·안내 문구: 7 steps to launching your digital marketing agency, 저자 CJ Haughey.
- 확인된 상태: 결과 카드1개, 페이지1/1. 요약의2018과 현재 캡처시점은 별개.
- 단계 간 변화: marketing 입력 후 한 개 결과로 좁혀짐; 제출 방식 미확인

#### 동작과 데이터

- 화면 관찰: 검색으로 표시 목록이 좁아졌다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 제목/본문 검색범위·정렬·네트워크 방식 미확인.

#### 모델링 영향

- 후보와 근거: 검색어+분류+페이지 상태·결과 카드 재사용 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 검색 중에도 Start a business 선택이 유지된다.
- 한 결과 관찰은 이 검색어의 당시 결과이며 검색 알고리즘·AND 필터 구현을 확정하지 않는다.
- 첫 화면은 로딩/전환으로 보이지만 명시적 spinner는 없다.

## 6. 공식 도움말과 API 대조

- [공식 Blog](https://www.hellobonsai.com/blog): 현재도 기사·분류·검색 진입을 확인했다. 목록·카피·레이아웃은 캡처와 달라 동일 시점 데이터로 취급하지 않는다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 분류 ID·검색어·페이지 상태 후보; 검색 대상 필드·정렬은 미확정.
- 로딩/빈 결과/오류를 별도 UX 상태로 설계할 후보가 있다.

## 8. 미확인 사항과 검토 질문

- 입력 즉시 검색인지 Enter 제출인지 debounce·URL query·뒤로가기 복원을 확인한다.
- 분류+검색 결합 범위·부분일치·대소문자·검색어 초기화를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
