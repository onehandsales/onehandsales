# Downloading expenses 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `a8f62075-1597-47e6-855d-c5fd51194c1c` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=a8f62075-1597-47e6-855d-c5fd51194c1c) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

비용 목록에서 CSV 생성을 요청하고 파일 준비 상태와 다운로드 진입점을 확인한다.

- 시작: Expenses 목록. 종료: 파일 준비 완료 모달의 Download 버튼.
- 실제 CSV 파일을 열어보거나 다운로드 실행 결과를 확인한 기록은 없다.
- 프론트 구현: 목록 더보기, 생성 중 상태, 준비 완료 버튼, 모달 닫기.

- 상위 분석: [Bookkeeping](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Bookkeeping/Downloading expenses`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_762c1f934fdf40c0a61898b036cf4616`](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Expenses 등록 목록](<screens/01_sc_762c1f934fdf40c0a61898b036cf4616.png>) | 목록 더보기 메뉴 열림. |
| 02 | [`sc_0aea5419beca4597bc2631434e77dbc4`](https://gummble.com/screens/sc_0aea5419beca4597bc2631434e77dbc4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 CSV 메뉴](<screens/02_sc_0aea5419beca4597bc2631434e77dbc4.png>) | Download Expenses 생성 중 모달 표시. |
| 03 | [`sc_231320e1054d4ea694ca0ff0c0d0014a`](https://gummble.com/screens/sc_231320e1054d4ea694ca0ff0c0d0014a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 파일 생성 중](<screens/03_sc_231320e1054d4ea694ca0ff0c0d0014a.png>) | 생성 대기 문구가 준비 완료 안내와 Download 버튼으로 변경. |
| 04 | [`sc_72d3718c1c2147a18580bc6a1a33d659`](https://gummble.com/screens/sc_72d3718c1c2147a18580bc6a1a33d659?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [비용 파일 준비 완료](<screens/04_sc_72d3718c1c2147a18580bc6a1a33d659.png>) | 준비 완료에서 기록 종료. 실제 파일 수신은 미확인. |

## 4. 화면별 상세 분석

### 단계 01 — Expenses 등록 목록

- Screen ID: `sc_762c1f934fdf40c0a61898b036cf4616`
- 원본: [화면 페이지](https://gummble.com/screens/sc_762c1f934fdf40c0a61898b036cf4616?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/549dc499-2f3b-4b0d-9534-73c488617a77.png)
- 로컬 이미지: [01_sc_762c1f934fdf40c0a61898b036cf4616.png](<screens/01_sc_762c1f934fdf40c0a61898b036cf4616.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_0aea5419beca4597bc2631434e77dbc4`

#### 화면에서 직접 확인한 내용

- 레이아웃: Expenses 탭, 검색·Filters·더보기·New Expense, Name/Date/Category/Amount 테이블.
- 입력 항목·필수 표시·기본값: 비용 세 행, Non-billable 보조 문구, Personal/Advertising 분류 칩과 금액, 영수증·반복처럼 보이는 상태 아이콘.
- 버튼·메뉴·안내 문구: 검색, Filters, New Expense, 목록 및 행의 더보기.
- 확인된 상태: 실데이터가 있는 목록. 이전 시작 안내와 달리 세 비용을 표시한다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 전후 이미지 사이에 등록 과정이 빠져 있다. 앞선 CTA를 누르기만 하면 세 항목이 자동 생성된다고 해석하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아이콘의 정확한 의미, 정렬·검색 범위, 청구 연결과 세금.

#### 모델링 영향

- 후보와 근거: 비용·분류·프로젝트 청구 상태·첨부·반복 관련 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 비용 CSV 메뉴

- Screen ID: `sc_0aea5419beca4597bc2631434e77dbc4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0aea5419beca4597bc2631434e77dbc4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8d6ac7f7-30de-42c0-b273-09bc926b9738.png)
- 로컬 이미지: [02_sc_0aea5419beca4597bc2631434e77dbc4.png](<screens/02_sc_0aea5419beca4597bc2631434e77dbc4.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_762c1f934fdf40c0a61898b036cf4616` → 현재 → `sc_231320e1054d4ea694ca0ff0c0d0014a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 비용 세 행 위 목록 더보기 팝오버.
- 입력 항목·필수 표시·기본값: 추가 입력 없음.
- 버튼·메뉴·안내 문구: Edit Multiple / Import Expenses / Manage Categories / Download CSV / Delete All.
- 확인된 상태: 메뉴 열린 상태.
- 단계 간 변화: 목록 더보기 메뉴 열림.

#### 동작과 데이터

- 화면 관찰: Download CSV 진입점이 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색·필터·선택 여부에 따른 내보내기 범위.

#### 모델링 영향

- 후보와 근거: 내보내기 요청 조건 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 비용 파일 생성 중

- Screen ID: `sc_231320e1054d4ea694ca0ff0c0d0014a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_231320e1054d4ea694ca0ff0c0d0014a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c55d0cf6-5615-4f40-8075-80d8de79c7db.png)
- 로컬 이미지: [03_sc_231320e1054d4ea694ca0ff0c0d0014a.png](<screens/03_sc_231320e1054d4ea694ca0ff0c0d0014a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0aea5419beca4597bc2631434e77dbc4` → 현재 → `sc_72d3718c1c2147a18580bc6a1a33d659`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Download Expenses 모달, 일러스트·녹색 상태 박스.
- 입력 항목·필수 표시·기본값: 입력 폼 없음.
- 버튼·메뉴·안내 문구: 닫기. 생성 중 안내와 점형 진행 표시.
- 확인된 상태: Generating file, please wait... 상태.
- 단계 간 변화: Download Expenses 생성 중 모달 표시.

#### 동작과 데이터

- 화면 관찰: 파일 생성 대기 UI가 존재한다. 실제 백엔드 비동기 작업 큐 사용은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 오류·타임아웃·닫은 후 작업 유지·재시도.

#### 모델링 영향

- 후보와 근거: 준비 상태를 표현하는 내보내기 작업 후보; 큐 구현은 미확정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 비용 파일 준비 완료

- Screen ID: `sc_72d3718c1c2147a18580bc6a1a33d659`
- 원본: [화면 페이지](https://gummble.com/screens/sc_72d3718c1c2147a18580bc6a1a33d659?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/00c73261-2c2a-4090-b7c8-90b302af486d.png)
- 로컬 이미지: [04_sc_72d3718c1c2147a18580bc6a1a33d659.png](<screens/04_sc_72d3718c1c2147a18580bc6a1a33d659.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_231320e1054d4ea694ca0ff0c0d0014a` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달의 상태 박스에 Download 버튼.
- 입력 항목·필수 표시·기본값: 입력 폼 없음.
- 버튼·메뉴·안내 문구: Download / 닫기.
- 확인된 상태: Your file is ready to be downloaded.
- 단계 간 변화: 생성 대기 문구가 준비 완료 안내와 Download 버튼으로 변경.

#### 동작과 데이터

- 화면 관찰: 준비 완료는 보이지만 파일을 받은 후 내용은 수록되지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: CSV 열·인코딩·다운로드 URL 만료·대상 범위.

#### 모델링 영향

- 후보와 근거: 준비된 파일 참조와 만료/권한 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 생성 중과 준비 완료는 서로 다른 UI 상태다.
- 관찰: Download 버튼은 준비 완료 화면에서 제공된다.
- 미확인: 메뉴 선택부터 준비까지 소요 시간·오류·취소·재요청·파일 내용.
- 설계 가정: 네트워크 요청 실패·준비 중 닫기·다운로드 만료 등을 별도 상태로 검토해야 한다. 제품에서 확인된 상태로 기록하지 않는다.

## 6. 공식 도움말과 API 대조

- 공식 도움말에서 이 CSV 다운로드 모달의 상태·내보내기 열·필터 반영을 직접 설명하는 문서는 이번 조사에서 확인하지 못했다.
- [공식 API 목록](https://docs.hellobonsai.com/api)에서 비용 CSV 내보내기 계약은 미확인. 화면의 생성 중 상태만으로 작업 큐·폴링·이메일 발송을 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 설계 가정: 내보내기 요청 조건, 생성 상태, 파일 참조와 만료 후보.
- UI 표시용 작업 상태가 필요하다는 것과 별도 DB Job 테이블이 필요하다는 것은 구분한다.
- 통화·날짜·영수증·분류 필터가 CSV에 반영되는지 확인한 뒤 export 계약을 정한다.

## 8. 미확인 사항과 검토 질문

- 현재 필터 결과만 내려받는가 전체 비용인가? 같은 데이터로 필터 전후 CSV 비교.
- 준비 중 닫은 뒤 다시 열면 작업을 재사용하는가? 중복 생성·취소 관찰.
- 파일 URL의 유효기간·인증·다른 사용자 접근 범위는 무엇인가? 응답과 권한 시험.
- 인코딩·날짜·금액 정밀도·개인 정보 열은 무엇인가? 실제 CSV 검사.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
