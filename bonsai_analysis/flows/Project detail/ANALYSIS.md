# Project detail 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `669a7507-38b3-41aa-89a2-146530c42240` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=669a7507-38b3-41aa-89a2-146530c42240) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

프로젝트 목록에서 상세에 들어가 개요·작업·시간·팀·설정을 확인하는 업무 중심 화면이다.

- 목록의 Design Project with Doe Studio와 상세의 Design Project with Doe는 이름이 다르다. 이름 편집 시점이 섞인 캡처일 수 있어 동일한 연속 세션으로 단정하지 않는다.
- Overview는 비어 있지만 후속 Tasks와 Time Tracking에는 기록이 있다. 중간 생성 과정이 생략된 개요 흐름이다.
- Invoices 탭은 존재하지만 이 6단계에서는 선택한 내부 화면이 없다. 별도 인보이스 플로우로 대조한다.
- FE에서는 공통 프로젝트 헤더와 탭별 업무 영역을 나누고 상단 상태와 작업 상태를 구분한다.

- 하위 플로우: [Editing project name](Editing%20project%20name/ANALYSIS.md), [Updating project status](Updating%20project%20status/ANALYSIS.md), [Editing project settings](Editing%20project%20settings/ANALYSIS.md), [Adding a task](Adding%20a%20task/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_3ade80505ba3458cb239c839815b3750`](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 보드 목록 | 프로젝트 상세 Overview. 목록/상세 명칭 차이 있음. |
| 02 | [`sc_adeac0011d87480980cfd58e53e4d751`](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 상세의 빈 개요 | Tasks 탭에 이미 생성된 작업들이 보인다. 생성 과정은 하위 흐름. |
| 03 | [`sc_8557a3e41edc402a8ebdf39022ee8d44`](https://gummble.com/screens/sc_8557a3e41edc402a8ebdf39022ee8d44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 내부 작업 보드 | Time Tracking 탭의 미청구 시간과 요약 조회. |
| 04 | [`sc_995163a7f1db42968cbc2e3906ddcbe5`](https://gummble.com/screens/sc_995163a7f1db42968cbc2e3906ddcbe5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 미청구 시간과 타임시트 | Team 탭의 프로젝트 멤버와 협업자 안내. |
| 05 | [`sc_468c2bc67b614813b0ac89ab5b72b018`](https://gummble.com/screens/sc_468c2bc67b614813b0ac89ab5b72b018?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 팀과 협업자 안내 | Settings 탭의 프로젝트 기본값 확인. |
| 06 | [`sc_b07eafa421cb44f3aa1081d935d5d1a3`](https://gummble.com/screens/sc_b07eafa421cb44f3aa1081d935d5d1a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 설정 상단 | 설정 상단에서 기록 종료. 저장 동작은 Editing project settings에 별도 수록. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 보드 목록

- Screen ID: `sc_3ade80505ba3458cb239c839815b3750`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/640cef91-a4b8-48f4-b2db-8cbaf7232903.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_adeac0011d87480980cfd58e53e4d751`

#### 화면에서 직접 확인한 내용

- 레이아웃: Projects 제목, Board View/List View 탭, 검색·Filters·New Project. 상태 열이 가로로 길게 이어져 오른쪽이 잘림.
- 입력 항목·필수 표시·기본값: New Lead1개 Design Project with Doe Studio/Doe Company; Proposal Sent0, Contract Signed0, In Progress1개 Consulting Project/Sample Client/Sample태그.
- 버튼·메뉴·안내 문구: 각 열 +New Project, New Project, 뷰 탭.
- 확인된 상태: 상태별 카드와 개수. 가로로 더 있는 열은 현재 뷰포트 밖.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 카드의 고객·태그와 상태 열 연결을 관찰.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 열 수·가로스크롤 방식·드래그·필터.

#### 모델링 영향

- 후보와 근거: 프로젝트 상태/보드 그룹과 고객·태그 투영 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 상세의 빈 개요

- Screen ID: `sc_adeac0011d87480980cfd58e53e4d751`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4562b3e8-1ba5-461e-81bd-766674cf2aed.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3ade80505ba3458cb239c839815b3750` → 현재 → `sc_8557a3e41edc402a8ebdf39022ee8d44`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 본문 좌측 Tasks와 Recent Activity, 우측 Documents & Links, Invoices/Expenses 요약 카드.
- 입력 항목·필수 표시·기본값: Design Project with Doe, Doe Company, New Lead. 작업·문서 없음. 청구·비용 수치0.
- 버튼·메뉴·안내 문구: Tasks 새 작업/템플릿, 각 영역+; Send Email, Forwarding Email, Automations.
- 확인된 상태: 프로젝트 생성 활동1개와 빈 업무 영역.
- 단계 간 변화: 프로젝트 상세 Overview. 목록/상세 명칭 차이 있음.

#### 동작과 데이터

- 화면 관찰: 프로젝트 생성 이력에 주체·제목·시각이 표시된다. 이메일 발송은 실행하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트 기본정보, 활동이력, 관련 업무 집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 내부 작업 보드

- Screen ID: `sc_8557a3e41edc402a8ebdf39022ee8d44`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8557a3e41edc402a8ebdf39022ee8d44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5cade96a-c8d7-447f-97ad-405b04b36070.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_adeac0011d87480980cfd58e53e4d751` → 현재 → `sc_995163a7f1db42968cbc2e3906ddcbe5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. Tasks 탭과 검색·필터·Board·New Task, 세 상태 열.
- 입력 항목·필수 표시·기본값: To Do에 Untitled/No due date1개. In Progress에 Initial Chat/Today/JD 카드2개.
- 버튼·메뉴·안내 문구: New Task 분할 버튼, 각 열 새 작업.
- 확인된 상태: 앞 개요의 빈 상태와 달리 작업3개가 이미 존재한다.
- 단계 간 변화: Tasks 탭에 이미 생성된 작업들이 보인다. 생성 과정은 하위 흐름.

#### 동작과 데이터

- 화면 관찰: 동일 제목의 작업2개가 보이며 제목의 유일성을 가정할 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Untitled의 실제빈제목/표시대체값 구분·중복 생성 경위.

#### 모델링 영향

- 후보와 근거: 프로젝트 필터된 작업 조회, 중복 제목 허용 후보, nullable기한.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 미청구 시간과 타임시트

- Screen ID: `sc_995163a7f1db42968cbc2e3906ddcbe5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_995163a7f1db42968cbc2e3906ddcbe5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/46095998-4c82-4275-9e93-52959e3973f1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8557a3e41edc402a8ebdf39022ee8d44` → 현재 → `sc_468c2bc67b614813b0ac89ab5b72b018`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 왼쪽 Unbilled Hours 목록·Timesheets 빈영역, 오른쪽 합계·Invoice Unbilled Hours·멤버 요약.
- 입력 항목·필수 표시·기본값: Feb6기록7초와1시간, 각$20.00표시/JD/Initial Chat. 요약1.00Hours·$20.04, This Week/Total1.00Hours.
- 버튼·메뉴·안내 문구: 시간추가+, 행펼침, Invoice Unbilled Hours. 고객은 청구된 시간만 볼 수 있다는 안내.
- 확인된 상태: 아직 청구된 타임시트 없음.
- 단계 간 변화: Time Tracking 탭의 미청구 시간과 요약 조회.

#### 동작과 데이터

- 화면 관찰: 초단위 원본과 소수시간 표시가 다르다. 1.00Hours를 정확히3600초로 역산하면7초를 잃는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 요약 반올림·개별금액 의미·청구범위·외부가시성.

#### 모델링 영향

- 후보와 근거: 시간 원본·표시 반올림·청구 연결·멤버별 집계 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 프로젝트 팀과 협업자 안내

- Screen ID: `sc_468c2bc67b614813b0ac89ab5b72b018`
- 원본: [화면 페이지](https://gummble.com/screens/sc_468c2bc67b614813b0ac89ab5b72b018?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8d395e95-fd1c-4e68-b70a-1321d13a30d7.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_995163a7f1db42968cbc2e3906ddcbe5` → 현재 → `sc_b07eafa421cb44f3aa1081d935d5d1a3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 좌측 Project Team 목록, 우측 Project Collaborators 설명 카드.
- 입력 항목·필수 표시·기본값: Joe Doe 멤버1명과 이메일 표시. 편집 입력은 없음.
- 버튼·메뉴·안내 문구: 팀추가+, 멤버휴지통, See Details.
- 확인된 상태: 협업자는 제한적 기능을 사용하고 회사데이터·프로젝트문서에 접근하지 못한다는 캡처 문구.
- 단계 간 변화: Team 탭의 프로젝트 멤버와 협업자 안내.

#### 동작과 데이터

- 화면 관찰: 프로젝트 참여자 목록과 협업 역할 안내가 구분된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 역할별삭제권한·자기자신제거·팀멤버와외부협업자차이.

#### 모델링 영향

- 후보와 근거: 프로젝트 참여 관계와 역할/접근 범위 후보; 이메일중복보관불필요.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 프로젝트 설정 상단

- Screen ID: `sc_b07eafa421cb44f3aa1081d935d5d1a3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b07eafa421cb44f3aa1081d935d5d1a3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/aef33650-ce6e-4eac-8ab6-28653117873e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_468c2bc67b614813b0ac89ab5b72b018` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 왼쪽 설정 폼, 오른쪽 Reminder Settings.
- 입력 항목·필수 표시·기본값: Project Title=Design Project with Doe; Payment Type=Hourly Rate, US$20.00/USD. Description회색예시·Optional/Markdown. StartFeb6 2024, End미선택. 자동리마인더체크.
- 버튼·메뉴·안내 문구: 결제유형·통화선택, 날짜입력, 자동리마인더. 저장버튼은 아래 뷰포트 밖.
- 확인된 상태: 기한일 없는 설정, 설명 선택항목.
- 단계 간 변화: Settings 탭의 프로젝트 기본값 확인.

#### 동작과 데이터

- 화면 관찰: 리마인더는 미지급 인보이스·만료될 제안서·서명대기 계약 관련 안내를 포함한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기본요율 상속·알림빈도·Save범위·Payment Type다른선택지.

#### 모델링 영향

- 후보와 근거: 프로젝트 청구설정·공개설명·업무기간·문서알림설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 프로젝트의 New Lead 상태와 작업의 To Do/In Progress/Done은 서로 다른 상태다.
- 관찰: 작업 없는 개요의 새 작업/템플릿 링크와 문서 없는 개요의 추가 버튼이 서로 독립적이다.
- 관찰: 시간 목록의 7초 행과1시간 행에 모두$20.00이 표시되며 합계는$20.04다. 개별 표시값은 단가로 해석 가능하지만 열 제목이 없어 확정하지 않는다.
- 관찰: 시간 페이지의 고객 가시성 안내와 Team의 협업자 제한 안내는 해당 캡처 버전의 문구다. 전체 권한표로 확대하지 않는다.
- 관찰: 설정 Description은 Optional이며 고객·계약자·협업자에게 보이고 Markdown 지원이라고 명시한다.

## 6. 공식 도움말과 API 대조

- [All about Projects](https://help.hellobonsai.com/en/articles/12783206-all-about-projects): 프로젝트가 작업·시간·청구·비용·문서·팀을 묶는 업무 단위임을 대조했다. 현재 문서의 새 탭 구성과 캡처의 탭 구성은 버전 차이를 유지한다.
- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 현행 도움말은 제목·날짜 자동 저장과 별도 설정 메뉴를 설명한다. 이 캡처는 Settings 탭과 Save Changes 방식으로 서로 다르다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.
- [시간 청구 도움말](https://help.hellobonsai.com/en/articles/1898575-invoicing-your-tracked-time): 프로젝트에서 미청구 시간을 인보이스로 추가하는 연결을 확인했다. 버튼 노출과 실제 생성·발송은 분리한다.

## 7. 데이터 모델링 시사점

- 프로젝트 → 고객, 작업, 시간기록, 문서/링크, 청구서, 비용, 멤버 연결 후보. 화면은 관계의 최대 개수나 DB 외래키 정책을 공개하지 않는다.
- 프로젝트 상태·이름·설명·시작/종료일·청구 방식·통화/요율·알림 설정 후보. 업무 메타데이터와 요약 수치는 분리한다.
- 활동 이벤트는 주체·대상·시각·동작을 표시하므로 이력 조회 모델 후보가 필요하다.
- 역할별 가시성과 프로젝트 참여 권한은 별도 검증 대상이다. 고객 공개 필드와 내부 협업 데이터를 분리할 후보.

## 8. 미확인 사항과 검토 질문

- 헤더의 고객·멤버·상태가 서로 다른 캡처 시점을 어떻게 반영하는가? 로컬 원본 순서와 각 하위 흐름을 대조한다.
- 상세 Invoices·문서/링크 추가·Automations·이메일은 어떤 화면으로 이어지는가? 이 루트의 미수록 범위를 별도 자료로 보완한다.
- $20.00은 시간 요율인가? 열 설명 또는 기록 편집 폼·API로 확인한다.
- 고객/협업자 Preview로 탭·필드·문서 접근을 비교하고 실제 권한 모델을 정한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
