# Hiding sidebar 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ff646f32-f010-478e-a3bd-572ccc501292` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ff646f32-f010-478e-a3bd-572ccc501292) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

사이드바를 아이콘만 남기는 축소 모드로 바꾼다.

- 첫 화면과 이후2장은 업무 날짜/프로젝트 수가 다르다. 동일 연속 데이터 상태라고 보지 않는다.

- 상위 분석: [Dashboard](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Hiding sidebar`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a333622d5e8c45e0b19ff4c249dc0aca`](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대시보드 — 프로젝트 타임라인과 손익 요약](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>) | 사이드바 축소 제어가 보이는 대시보드로 이어진다. 날짜 변화 과정은 미수록. |
| 02 | [`sc_d177f0ef742b46daa0c1a96e7df49192`](https://gummble.com/screens/sc_d177f0ef742b46daa0c1a96e7df49192?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [사이드바 축소 전](<screens/02_sc_d177f0ef742b46daa0c1a96e7df49192.png>) | 좌상단 사이드바 축소 아이콘을 사용한다. |
| 03 | [`sc_afe21c01937c42ff92a872cf1a0b07c2`](https://gummble.com/screens/sc_afe21c01937c42ff92a872cf1a0b07c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [아이콘 사이드바](<screens/03_sc_afe21c01937c42ff92a872cf1a0b07c2.png>) | 아이콘 전용 사이드바와 확장된 본문을 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — 대시보드 — 프로젝트 타임라인과 손익 요약

- Screen ID: `sc_a333622d5e8c45e0b19ff4c249dc0aca`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a333622d5e8c45e0b19ff4c249dc0aca?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3532c829-b612-4d64-8d26-7e96473aa0a8.png)
- 로컬 이미지: [01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png](<screens/01_sc_a333622d5e8c45e0b19ff4c249dc0aca.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d177f0ef742b46daa0c1a96e7df49192`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고정된 왼쪽 사이드바, 상단 Search·Track Time·New, 날짜와 인사말 아래 2열 본문. 왼쪽은 Project Timeline과 Profit & Loss, 오른쪽은 2×2 빠른 생성 카드와 Workflow Plus 홍보 카드다.
- 입력 항목·필수 표시·기본값: Wednesday, February 14th / Good evening, Joe. 타임라인에 Consulting Project, Design Project with …, Rebranding Project가 있고 JAN 31·TODAY·FEB 28 축이 보인다. 손익 필터는 USD·Last 6 Months. 이 화면에 입력 폼이나 필수 표시는 없다.
- 버튼·메뉴·안내 문구: 사이드바 Dashboard·Clients·Projects·Tasks, Tools 아래 Invoices·Proposals·Contracts·Time Tracking·Services·Forms·Scheduling, Finances 아래 Bookkeeping. 하단 Invite Team·Get 1 Month Free. 빠른 실행은 Send an invoice·Draft a proposal·Create a contract·Add a form. 홍보 카드에는 X·캐러셀 점·START 14-DAY FREE TRIAL, 우하단 도움말 버튼이 있다.
- 확인된 상태: Dashboard가 선택되어 있으며 모달·오류·성공 토스트는 없다. 여러 플로우가 공유하는 동일한 시작 이미지다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트별 문서 아이콘과 손익 그래프를 한 화면에서 표시한다. 특정 메뉴를 실행했다는 근거는 다음 단계와 함께 판단한다. 홍보의 14일 문구를 계정 전체의 체험 기간으로 일반화하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜와 집계의 기준 시간대, 그래프 산식, 타임라인 아이콘의 정확한 날짜 의미, 역할별 접근 권한, 홍보 노출 조건은 이 이미지로 확인할 수 없다.

#### 모델링 영향

- 후보와 근거: 프로젝트·문서 참조, 기간·통화별 재무 집계, 빠른 생성 진입점 및 공통 내비게이션 후보. 메뉴 노출은 서버 권한의 증거와 구분한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 사이드바 축소 전

- Screen ID: `sc_d177f0ef742b46daa0c1a96e7df49192`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d177f0ef742b46daa0c1a96e7df49192?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9fc50ba1-1a3a-4a4e-bd27-f12808f967fe.png)
- 로컬 이미지: [02_sc_d177f0ef742b46daa0c1a96e7df49192.png](<screens/02_sc_d177f0ef742b46daa0c1a96e7df49192.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_a333622d5e8c45e0b19ff4c249dc0aca` → 현재 → `sc_afe21c01937c42ff92a872cf1a0b07c2`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 로고+텍스트 메뉴,상단로고옆 왼쪽 화살표 제어.
- 입력 항목·필수 표시·기본값: TuesdayFeb6/GoodmorningJoe,프로젝트1개. 이전 화면과 업무 날짜·데이터가 다르다.
- 버튼·메뉴·안내 문구: 사이드바 축소 아이콘,메뉴,빠른생성,통화/기간.
- 확인된 상태: 축소 제어가 노출된 상태.
- 단계 간 변화: 사이드바 축소 제어가 보이는 대시보드로 이어진다. 날짜 변화 과정은 미수록.

#### 동작과 데이터

- 화면 관찰: 레이아웃 조작 진입점.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: hover시에만 아이콘노출되는지 미확인.

#### 모델링 영향

- 후보와 근거: UI 선호 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 아이콘 사이드바

- Screen ID: `sc_afe21c01937c42ff92a872cf1a0b07c2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_afe21c01937c42ff92a872cf1a0b07c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/604c98fd-4409-458f-a60d-e297f1fde603.png)
- 로컬 이미지: [03_sc_afe21c01937c42ff92a872cf1a0b07c2.png](<screens/03_sc_afe21c01937c42ff92a872cf1a0b07c2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d177f0ef742b46daa0c1a96e7df49192` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 좁은 아이콘레일,본문이 왼쪽으로 확장된다.
- 입력 항목·필수 표시·기본값: 로고 심볼·메뉴아이콘·섹션구분선·초대/선물아이콘 유지.프로젝트/차트데이터는 직전과 동일.
- 버튼·메뉴·안내 문구: 아이콘 메뉴,상단검색/TrackTime/+New.
- 확인된 상태: 텍스트 메뉴·큰 로고가 숨고 본문폭이 늘어난다.
- 단계 간 변화: 좌상단 사이드바 축소 아이콘을 사용한다.

#### 동작과 데이터

- 화면 관찰: 레이아웃 변화만 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 확대복귀/영속화/모바일은 미확인.

#### 모델링 영향

- 후보와 근거: 사이드바 축소 여부 UI 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 축소해도 메뉴 아이콘과 초대/추천 아이콘은 남는다.
- [미확인] 사용자 설정 영속화·브라우저별 저장·모바일 반응형은 이3장으로 확인되지 않는다.

## 6. 공식 도움말과 API 대조

- [현재 홈 대시보드 도움말](https://help.hellobonsai.com/en/articles/16785043-customize-your-home-dashboard): 섹션·권한·개인별 배치와 대시보드에서 작업 완료를 설명한다. 2026-09-02 문서는 새 Home 구성으로, 캡처의 Project Timeline/Profit & Loss 화면과 차이가 있다. 현재 Home의 배치 저장 설명은 사이드바 축소 저장 규칙과 동일하다고 볼 수 없다.
- [공개 API](https://docs.hellobonsai.com/api): 사이드바 표시 상태 전용 endpoint는 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 사용자 UI 선호 후보. 업무 도메인 테이블 변경을 요구하는 근거는 아니다.

## 8. 미확인 사항과 검토 질문

- 다시 펼치기·hover tooltip·키보드 접근성·새로고침/재로그인 지속 여부를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 공유 화면의 설명을 진입 맥락과 분리하고 원본 이미지를 다시 대조 | 실제 계정 검증·8절 질문은 유지 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
