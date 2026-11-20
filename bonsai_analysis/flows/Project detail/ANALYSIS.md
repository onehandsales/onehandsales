# Project detail 플로우 분석

검토 상태: **R2 누락·내용 재검토 완료(정적 캡처 범위)**. 실제 이미지 재확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 캡처에서 직접 본 내용, 문서 확인은 현재 공식 도움말·공개 API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재·성공 안내·실제 서버 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `669a7507-38b3-41aa-89a2-146530c42240` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=669a7507-38b3-41aa-89a2-146530c42240) |
| 카탈로그 버전 | MCP 재조회 `Latest`, version ID `2146` |
| 제품 빌드 | 개별 화면의 제품 빌드 미확인. 카탈로그 버전을 제품 버전으로 사용하지 않음 |
| 조회일 / 이미지 재검토일 | 2026-11-20 KST. R1 확인일은 4절·9절의 기존 기록 유지; 개별 이미지 분·초 미기록 |
| 캡처일 | 미확인. 화면의 업무·청구·기사·약관 날짜는 캡처일이 아님 |
| 화면 수 / 이미지 확인 | 6단계 / 6단계. 공통 이미지는 고유 Screen ID 기준 재검토 후 각 흐름의 문맥과 대조 |
| 이미지 검토 방식 | R1: 기존 단계별 확인 기록. R2: 원본 PNG를 장당 1280×800으로 축소한 번호 포함 2×2 비교 시트에서 시각 재검토. 전체 642개 고유 이미지·754단계 |
| 크기·환경 | MCP 1440×900 / 원본 PNG 2880×1800 px. 기기·OS·브라우저·DPR·배율·국가·계정 권한은 별도 증거 없으면 미확인 |
| 계정 재현 | 미수행. 로그인·생성·발송·서명·구매·삭제·외부 연결을 직접 실행하지 않음 |
| 공식 문서 | 2026-11-20 KST 조회. 6절에서 기능별 직접 대조 범위·미확인 범위 및 [공통 출처](<../../SOURCES.md>) 연결 |
| 원본·문서 무결성 | MCP 단계 ID·순서·원본 URL 대조, 로컬 PNG 디코딩·크기·CDN 원본과 SHA-256 대조. [전체 검토 기록](<../../review/2026-11-20/REPORT.md>) |

## 2. 플로우 목적과 연결

프로젝트 목록에서 상세에 들어가 개요·작업·시간·팀·설정을 확인하는 업무 중심 화면이다.

- 목록의 Design Project with Doe Studio와 상세의 Design Project with Doe는 이름이 다르다. 이름 편집 시점이 섞인 캡처일 수 있어 동일한 연속 세션으로 단정하지 않는다.
- Overview는 비어 있지만 후속 Tasks와 Time Tracking에는 기록이 있다. 중간 생성 과정이 생략된 개요 흐름이다.
- Invoices 탭은 존재하지만 이 6단계에서는 선택한 내부 화면이 없다. 별도 인보이스 플로우로 대조한다.
- FE에서는 공통 프로젝트 헤더와 탭별 업무 영역을 나누고 상단 상태와 작업 상태를 구분한다.

- 하위 흐름: [Editing project name](Editing%20project%20name/ANALYSIS.md), [Updating project status](Updating%20project%20status/ANALYSIS.md), [Editing project settings](Editing%20project%20settings/ANALYSIS.md), [Adding a task](Adding%20a%20task/ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Project detail`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.
- 상위 흐름: 없음. Gummble 최상위 분류.

### 진입 조건과 확인된 종료 범위

- 진입: 첫 캡처는 **프로젝트 보드 목록**이다. 상태별 카드와 개수. 가로로 더 있는 열은 현재 뷰포트 밖. 이 화면 이전의 인증·권한·클릭 경로는 캡처에 보이는 범위만 인정한다.
- 종료: 마지막 캡처는 **프로젝트 설정 상단**이다. 기한일 없는 설정, 설명 선택항목. 기록 종료를 전체 업무의 성공·서버 저장 완료로 확대하지 않는다.
- 관련 흐름: [Adding a task](<Adding a task/ANALYSIS.md>), [Editing project name](<Editing project name/ANALYSIS.md>), [Editing project settings](<Editing project settings/ANALYSIS.md>)
- 관련 흐름은 기능 연결점이다. 서로 다른 캡처를 같은 계정·같은 시각의 연속 실행으로 합치지 않는다.

## 3. 전체 단계표

MCP가 반환한 순서다. 스크롤·메뉴·입력·로딩도 각각 한 단계이며 캡처 사이의 클릭·저장·네트워크가 모두 기록되었다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 캡처와의 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_3ade80505ba3458cb239c839815b3750`](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 보드 목록](<screens/01_sc_3ade80505ba3458cb239c839815b3750.png>) | 프로젝트 상세의 빈 개요 — 프로젝트 생성 활동1개와 빈 업무 영역. |
| 02 | [`sc_adeac0011d87480980cfd58e53e4d751`](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 상세의 빈 개요](<screens/02_sc_adeac0011d87480980cfd58e53e4d751.png>) | 프로젝트 내부 작업 보드 — 앞 개요의 빈 상태와 달리 작업3개가 이미 존재한다. |
| 03 | [`sc_8557a3e41edc402a8ebdf39022ee8d44`](https://gummble.com/screens/sc_8557a3e41edc402a8ebdf39022ee8d44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 내부 작업 보드](<screens/03_sc_8557a3e41edc402a8ebdf39022ee8d44.png>) | 프로젝트 미청구 시간과 타임시트 — 아직 청구된 타임시트 없음. |
| 04 | [`sc_995163a7f1db42968cbc2e3906ddcbe5`](https://gummble.com/screens/sc_995163a7f1db42968cbc2e3906ddcbe5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 미청구 시간과 타임시트](<screens/04_sc_995163a7f1db42968cbc2e3906ddcbe5.png>) | 프로젝트 팀과 협업자 안내 — 협업자는 제한적 기능을 사용하고 회사데이터·프로젝트문서에 접근하지 못한다는 캡처 문구. |
| 05 | [`sc_468c2bc67b614813b0ac89ab5b72b018`](https://gummble.com/screens/sc_468c2bc67b614813b0ac89ab5b72b018?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 팀과 협업자 안내](<screens/05_sc_468c2bc67b614813b0ac89ab5b72b018.png>) | 프로젝트 설정 상단 — 기한일 없는 설정, 설명 선택항목. |
| 06 | [`sc_b07eafa421cb44f3aa1081d935d5d1a3`](https://gummble.com/screens/sc_b07eafa421cb44f3aa1081d935d5d1a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 설정 상단](<screens/06_sc_b07eafa421cb44f3aa1081d935d5d1a3.png>) | 이 흐름의 기록 종료; 2절의 종료 범위 참조 |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 보드 목록

- Screen ID: `sc_3ade80505ba3458cb239c839815b3750`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/640cef91-a4b8-48f4-b2db-8cbaf7232903.png)
- 로컬 이미지: [01_sc_3ade80505ba3458cb239c839815b3750.png](<screens/01_sc_3ade80505ba3458cb239c839815b3750.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 123, 고유 이미지 S491, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_adeac0011d87480980cfd58e53e4d751`

#### 화면에서 직접 확인한 내용

- 레이아웃: Projects 제목, Board View/List View 탭, 검색·Filters·New Project. 상태 열이 가로로 길게 이어져 오른쪽이 잘림.
- 입력 항목·필수 표시·기본값: New Lead1개 Design Project with Doe Studio/Doe Company; Proposal Sent0, Contract Signed0, In Progress1개 Consulting Project/Sample Client/Sample태그.
- 버튼·메뉴·안내 문구: 각 열 +New Project, New Project, 뷰 탭.
- 확인된 상태: 상태별 카드와 개수. 가로로 더 있는 열은 현재 뷰포트 밖.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 카드의 고객·태그와 상태 열 연결을 관찰. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 열 수·가로스크롤 방식·드래그·필터.

#### 모델링 영향

- 후보와 근거: 프로젝트 상태/보드 그룹과 고객·태그 투영 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 전체 열 수·가로스크롤 방식·드래그·필터. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 상세의 빈 개요

- Screen ID: `sc_adeac0011d87480980cfd58e53e4d751`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4562b3e8-1ba5-461e-81bd-766674cf2aed.png)
- 로컬 이미지: [02_sc_adeac0011d87480980cfd58e53e4d751.png](<screens/02_sc_adeac0011d87480980cfd58e53e4d751.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 026, 고유 이미지 S102, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_3ade80505ba3458cb239c839815b3750` → 현재 → `sc_8557a3e41edc402a8ebdf39022ee8d44`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 본문 좌측 Tasks와 Recent Activity, 우측 Documents & Links, Invoices/Expenses 요약 카드.
- 입력 항목·필수 표시·기본값: Design Project with Doe, Doe Company, New Lead. 작업·문서 없음. 청구·비용 수치0.
- 버튼·메뉴·안내 문구: Tasks 새 작업/템플릿, 각 영역+; Send Email, Forwarding Email, Automations.
- 확인된 상태: 프로젝트 생성 활동1개와 빈 업무 영역.
- 단계 간 변화: 프로젝트 상세 Overview. 목록/상세 명칭 차이 있음. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 생성 이력에 주체·제목·시각이 표시된다. 이메일 발송은 실행하지 않았다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트 기본정보, 활동이력, 관련 업무 집계 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 내부 작업 보드

- Screen ID: `sc_8557a3e41edc402a8ebdf39022ee8d44`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8557a3e41edc402a8ebdf39022ee8d44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5cade96a-c8d7-447f-97ad-405b04b36070.png)
- 로컬 이미지: [03_sc_8557a3e41edc402a8ebdf39022ee8d44.png](<screens/03_sc_8557a3e41edc402a8ebdf39022ee8d44.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 120, 고유 이미지 S478, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_adeac0011d87480980cfd58e53e4d751` → 현재 → `sc_995163a7f1db42968cbc2e3906ddcbe5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. Tasks 탭과 검색·필터·Board·New Task, 세 상태 열.
- 입력 항목·필수 표시·기본값: To Do에 Untitled/No due date1개. In Progress에 Initial Chat/Today/JD 카드2개.
- 버튼·메뉴·안내 문구: New Task 분할 버튼, 각 열 새 작업.
- 확인된 상태: 앞 개요의 빈 상태와 달리 작업3개가 이미 존재한다.
- 단계 간 변화: Tasks 탭에 이미 생성된 작업들이 보인다. 생성 과정은 하위 흐름. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 동일 제목의 작업2개가 보이며 제목의 유일성을 가정할 수 없다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Untitled의 실제빈제목/표시대체값 구분·중복 생성 경위.

#### 모델링 영향

- 후보와 근거: 프로젝트 필터된 작업 조회, 중복 제목 허용 후보, nullable기한. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: Untitled의 실제빈제목/표시대체값 구분·중복 생성 경위. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 미청구 시간과 타임시트

- Screen ID: `sc_995163a7f1db42968cbc2e3906ddcbe5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_995163a7f1db42968cbc2e3906ddcbe5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/46095998-4c82-4275-9e93-52959e3973f1.png)
- 로컬 이미지: [04_sc_995163a7f1db42968cbc2e3906ddcbe5.png](<screens/04_sc_995163a7f1db42968cbc2e3906ddcbe5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 123, 고유 이미지 S492, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8557a3e41edc402a8ebdf39022ee8d44` → 현재 → `sc_468c2bc67b614813b0ac89ab5b72b018`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 왼쪽 Unbilled Hours 목록·Timesheets 빈영역, 오른쪽 합계·Invoice Unbilled Hours·멤버 요약.
- 입력 항목·필수 표시·기본값: Feb6기록7초와1시간, 각$20.00표시/JD/Initial Chat. 요약1.00Hours·$20.04, This Week/Total1.00Hours.
- 버튼·메뉴·안내 문구: 시간추가+, 행펼침, Invoice Unbilled Hours. 고객은 청구된 시간만 볼 수 있다는 안내.
- 확인된 상태: 아직 청구된 타임시트 없음.
- 단계 간 변화: Time Tracking 탭의 미청구 시간과 요약 조회. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 초단위 원본과 소수시간 표시가 다르다. 1.00Hours를 정확히3600초로 역산하면7초를 잃는다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 요약 반올림·개별금액 의미·청구범위·외부가시성.

#### 모델링 영향

- 후보와 근거: 시간 원본·표시 반올림·청구 연결·멤버별 집계 분리 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 요약 반올림·개별금액 의미·청구범위·외부가시성. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 프로젝트 팀과 협업자 안내

- Screen ID: `sc_468c2bc67b614813b0ac89ab5b72b018`
- 원본: [화면 페이지](https://gummble.com/screens/sc_468c2bc67b614813b0ac89ab5b72b018?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8d395e95-fd1c-4e68-b70a-1321d13a30d7.png)
- 로컬 이미지: [05_sc_468c2bc67b614813b0ac89ab5b72b018.png](<screens/05_sc_468c2bc67b614813b0ac89ab5b72b018.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 124, 고유 이미지 S493, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_995163a7f1db42968cbc2e3906ddcbe5` → 현재 → `sc_b07eafa421cb44f3aa1081d935d5d1a3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 좌측 Project Team 목록, 우측 Project Collaborators 설명 카드.
- 입력 항목·필수 표시·기본값: Joe Doe 멤버1명과 이메일 표시. 편집 입력은 없음.
- 버튼·메뉴·안내 문구: 팀추가+, 멤버휴지통, See Details.
- 확인된 상태: 협업자는 제한적 기능을 사용하고 회사데이터·프로젝트문서에 접근하지 못한다는 캡처 문구.
- 단계 간 변화: Team 탭의 프로젝트 멤버와 협업자 안내. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 참여자 목록과 협업 역할 안내가 구분된다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 역할별삭제권한·자기자신제거·팀멤버와외부협업자차이.

#### 모델링 영향

- 후보와 근거: 프로젝트 참여 관계와 역할/접근 범위 후보; 이메일중복보관불필요. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 역할별삭제권한·자기자신제거·팀멤버와외부협업자차이. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 프로젝트 설정 상단

- Screen ID: `sc_b07eafa421cb44f3aa1081d935d5d1a3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b07eafa421cb44f3aa1081d935d5d1a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aef33650-ce6e-4eac-8ab6-28653117873e.png)
- 로컬 이미지: [06_sc_b07eafa421cb44f3aa1081d935d5d1a3.png](<screens/06_sc_b07eafa421cb44f3aa1081d935d5d1a3.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- R2 이미지 재검토: 2026-11-20 KST · 원본 PNG의 번호 포함 2×2 비교 시트에서 시각 확인 (시트 124, 고유 이미지 S494, 장당 1280×800). 공통 이미지는 동일 관찰을 각 흐름의 앞뒤 단계와 대조
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_468c2bc67b614813b0ac89ab5b72b018` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 왼쪽 설정 폼, 오른쪽 Reminder Settings.
- 입력 항목·필수 표시·기본값: Project Title=Design Project with Doe; Payment Type=Hourly Rate, US$20.00/USD. Description회색예시·Optional/Markdown. StartFeb6 2024, End미선택. 자동리마인더체크.
- 버튼·메뉴·안내 문구: 결제유형·통화선택, 날짜입력, 자동리마인더. 저장버튼은 아래 뷰포트 밖.
- 확인된 상태: 기한일 없는 설정, 설명 선택항목.
- 단계 간 변화: Settings 탭의 프로젝트 기본값 확인. 캡처 사이의 정확한 클릭·요청·저장 순서는 별도 관찰하지 않았다.

#### 동작과 데이터

- 화면 관찰: 리마인더는 미지급 인보이스·만료될 제안서·서명대기 계약 관련 안내를 포함한다. 정적 캡처의 UI 상태이며 실제 요청 성공·서버 영속성은 독립 검증하지 않았다.
- 공식 문서 확인: 6절에서 기능별 출처·현재 규칙·과거 화면과의 차이를 대조한다. 이 화면의 내부 API 호출은 관찰하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기본요율 상속·알림빈도·Save범위·Payment Type다른선택지.

#### 모델링 영향

- 후보와 근거: 프로젝트 청구설정·공개설명·업무기간·문서알림설정 후보. 위 표시 데이터와 상태를 근거로 검토할 후보이며 확정 스키마가 아니다.
- 확정 전 확인: 기본요율 상속·알림빈도·Save범위·Payment Type다른선택지. 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

| 단계 | 관찰된 상태·값 | 근거의 한계 |
| --- | --- | --- |
| 01 | 상태별 카드와 개수. 가로로 더 있는 열은 현재 뷰포트 밖. — New Lead1개 Design Project with Doe Studio/Doe Company; Proposal Sent0, Contract Signed0, In Progress1개 Consulting Project/Sample Client/Sample태그. | 전체 열 수·가로스크롤 방식·드래그·필터. |
| 02 | 프로젝트 생성 활동1개와 빈 업무 영역. — Design Project with Doe, Doe Company, New Lead. 작업·문서 없음. 청구·비용 수치0. | 주체 JS/JD 표기의 관계·시간대·활동 공개 범위. |
| 03 | 앞 개요의 빈 상태와 달리 작업3개가 이미 존재한다. — To Do에 Untitled/No due date1개. In Progress에 Initial Chat/Today/JD 카드2개. | Untitled의 실제빈제목/표시대체값 구분·중복 생성 경위. |
| 04 | 아직 청구된 타임시트 없음. — Feb6기록7초와1시간, 각$20.00표시/JD/Initial Chat. 요약1.00Hours·$20.04, This Week/Total1.00Hours. | 요약 반올림·개별금액 의미·청구범위·외부가시성. |
| 05 | 협업자는 제한적 기능을 사용하고 회사데이터·프로젝트문서에 접근하지 못한다는 캡처 문구. — Joe Doe 멤버1명과 이메일 표시. 편집 입력은 없음. | 역할별삭제권한·자기자신제거·팀멤버와외부협업자차이. |
| 06 | 기한일 없는 설정, 설명 선택항목. — Project Title=Design Project with Doe; Payment Type=Hourly Rate, US$20.00/USD. Description회색예시·Optional/Markdown. StartFeb6 2024, End미선택. 자동리마인더체크. | 기본요율 상속·알림빈도·Save범위·Payment Type다른선택지. |

위 표는 화면에서 보이는 상태·값이다. 성공 토스트가 있어도 수신자 접근·영수증·서버 저장을 독립 검증한 것은 아니다.

### R2 재검토에서 보완한 해석

목록의 프로젝트명에는 Studio가 있지만 상세 초기 제목에는 없어 캡처 시점을 하나로 합치지 않는다. Time Tracking은 7초와 1시간을 별도 행으로 표시하고 합계 1.00 Hours/$20.04를 보여준다. 각 행 $20.00를 행 청구액으로 합산하지 않는다. 고객은 청구된 시간만 볼 수 있다는 안내와 협업자의 문서 접근 제한은 캡처 문구이며 실제 권한 시험은 없다.

### 업무 규칙과 연결 시 주의점

- 관찰: 프로젝트의 New Lead 상태와 작업의 To Do/In Progress/Done은 서로 다른 상태다.
- 관찰: 작업 없는 개요의 새 작업/템플릿 링크와 문서 없는 개요의 추가 버튼이 서로 독립적이다.
- 관찰: 시간 목록의 7초 행과1시간 행에 모두$20.00이 표시되며 합계는$20.04다. 개별 표시값은 단가로 해석 가능하지만 열 제목이 없어 확정하지 않는다.
- 관찰: 시간 페이지의 고객 가시성 안내와 Team의 협업자 제한 안내는 해당 캡처 버전의 문구다. 전체 권한표로 확대하지 않는다.
- 관찰: 설정 Description은 Optional이며 고객·계약자·협업자에게 보이고 Markdown 지원이라고 명시한다.

## 6. 공식 도움말과 API 대조

공식 자료는 **2026-11-20 KST** 조회한 현재 문서이며 과거 캡처와 시점이 다를 수 있다. 아래 출처의 제한된 범위를 대조했고, 실제 계정이나 내부 API를 실행하지 않았다.

- [All about Projects](https://help.hellobonsai.com/en/articles/12783206-all-about-projects): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S021 공통 대조](<../../SOURCES.md#s021>)에 기록했다.
- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S022 공통 대조](<../../SOURCES.md#s022>)에 기록했다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S023 공통 대조](<../../SOURCES.md#s023>)에 기록했다.
- [시간 청구 상태](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time): 반환된 본문 범위 대조. 직접 확인한 규칙과 적용 한계는 [S043 공통 대조](<../../SOURCES.md#s043>)에 기록했다.

화면과 대조할 때는 5절의 R2 해석 및 8절의 미확인 항목을 함께 적용한다. 현재 문서에만 있는 필수값·요금제·역할·새 UI를 과거 화면의 동작으로 확정하지 않는다.

- [API 검토 범위](<../../SOURCES.md#api>): 이 흐름의 내부 endpoint·실제 요청/응답·DB 스키마는 확인하지 않았다. 공개 API 목록에 없는 기능의 미지원 여부도 확정하지 않는다.

## 7. 데이터 모델링 시사점

다음은 관찰에 기반한 OneHandSales 구현 후보다. 기능 채택·스키마·업무 정책으로 확정하지 않는다.

- 프로젝트 → 고객, 작업, 시간기록, 문서/링크, 청구서, 비용, 멤버 연결 후보. 화면은 관계의 최대 개수나 DB 외래키 정책을 공개하지 않는다.
- 프로젝트 상태·이름·설명·시작/종료일·청구 방식·통화/요율·알림 설정 후보. 업무 메타데이터와 요약 수치는 분리한다.
- 활동 이벤트는 주체·대상·시각·동작을 표시하므로 이력 조회 모델 후보가 필요하다.
- 역할별 가시성과 프로젝트 참여 권한은 별도 검증 대상이다. 고객 공개 필드와 내부 협업 데이터를 분리할 후보.

### 단계별 모델링 근거

- 단계 01: 프로젝트 상태/보드 그룹과 고객·태그 투영 후보.
- 단계 02: 프로젝트 기본정보, 활동이력, 관련 업무 집계 후보.
- 단계 03: 프로젝트 필터된 작업 조회, 중복 제목 허용 후보, nullable기한.
- 단계 04: 시간 원본·표시 반올림·청구 연결·멤버별 집계 분리 후보.
- 단계 05: 프로젝트 참여 관계와 역할/접근 범위 후보; 이메일중복보관불필요.
- 단계 06: 프로젝트 청구설정·공개설명·업무기간·문서알림설정 후보.

## 8. 미확인 사항과 검토 질문

**원본에 없는 분기·남은 범위:** 헤더의 고객·멤버·상태가 서로 다른 캡처 시점을 어떻게 반영하는가? 로컬 원본 순서와 각 하위 흐름을 대조한다. 상세 Invoices·문서/링크 추가·Automations·이메일은 어떤 화면으로 이어지는가? 이 루트의 미수록 범위를 별도 자료로 보완한다.

- 헤더의 고객·멤버·상태가 서로 다른 캡처 시점을 어떻게 반영하는가? 로컬 원본 순서와 각 하위 흐름을 대조한다.
- 상세 Invoices·문서/링크 추가·Automations·이메일은 어떤 화면으로 이어지는가? 이 루트의 미수록 범위를 별도 자료로 보완한다.
- $20.00은 시간 요율인가? 열 설명 또는 기록 편집 폼·API로 확인한다.
- 고객/협업자 Preview로 탭·필드·문서 접근을 비교하고 실제 권한 모델을 정한다.

### 단계별 미확인 사항

- 단계 01: 전체 열 수·가로스크롤 방식·드래그·필터.
- 단계 02: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위.
- 단계 03: Untitled의 실제빈제목/표시대체값 구분·중복 생성 경위.
- 단계 04: 요약 반올림·개별금액 의미·청구범위·외부가시성.
- 단계 05: 역할별삭제권한·자기자신제거·팀멤버와외부협업자차이.
- 단계 06: 기본요율 상속·알림빈도·Save범위·Payment Type다른선택지.

- 같은 계정·제품 빌드에서 시작 상태를 맞춘 뒤 해당 업무의 정상·취소·실패·재진입 결과를 검증해야 한다. 화면 목록과 이미지 검토 완료는 제품 전체 기능의 의미적 완전성이나 구현 검증 완료를 뜻하지 않는다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
| R2 전수 재검토 | 2026-11-20 KST | Gummble MCP 6단계 ID·순서·원본 URL 재조회 및 이미지 6/6단계 재검토. 진입·종료·단계별 상태표·미확인 사항과 5절 해석 보완. 현재 공식 자료 재대조 | 실제 계정·원본에 없는 분기·8절 항목 |
| 문서·원본 무결성 점검 | 2026-11-20 KST | 전체 134문서·754단계의 9개 절, 단계 순서·화면 ID·로컬 링크·PNG 크기·SHA-256 및 고유 642개 CDN 원본 대조. [검토 기록](<../../review/2026-11-20/REPORT.md>) | 기계 점검이며 추가 시각 검토나 계정 재현으로 계산하지 않음 |
