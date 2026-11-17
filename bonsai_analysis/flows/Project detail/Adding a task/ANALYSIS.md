# Adding a task 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ee93ca39-d45a-4937-8ee6-7193c985b590` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ee93ca39-d45a-4937-8ee6-7193c985b590) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

프로젝트 개요에서 작업 패널을 열고 제목·상태·기한·담당자를 입력하는 흐름이다.

- 시작 프로젝트 Overview의 빈 Tasks 영역. 끝은 Initial Chat / In Progress / Feb6 2024 / Joe Doe가 설정된 패널.
- 끝 화면에서도 뒤의 개요가 빈 상태를 유지한다. 패널 상태 변경과 배경 집계 갱신을 분리한다.
- 하위 흐름에서 설명·하위 작업·댓글·시간·아카이브·삭제·상태 정의를 상세히 확인한다.

- 상위 분석: [Project detail](../ANALYSIS.md)
- 하위 플로우: [Adding a comment](Adding%20a%20comment/ANALYSIS.md), [Adding a time entry](Adding%20a%20time%20entry/ANALYSIS.md), [Deleting a task](Deleting%20a%20task/ANALYSIS.md), [Editing status settings](Editing%20status%20settings/ANALYSIS.md), [Adding subtasks](Adding%20subtasks/ANALYSIS.md), [Continue tracking time](Continue%20tracking%20time/ANALYSIS.md), [Archiving a task](Archiving%20a%20task/ANALYSIS.md), [Editing a subtask](Editing%20a%20subtask/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_adeac0011d87480980cfd58e53e4d751`](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 상세의 빈 개요 | 빈 작업 패널이 오른쪽에 열림. |
| 02 | [`sc_6400e9620c7b4e29856292f30cce1c60`](https://gummble.com/screens/sc_6400e9620c7b4e29856292f30cce1c60?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 새 작업의 빈 상세 패널 | 제목 Initial Chat 입력. |
| 03 | [`sc_e0d23728f830469c8e36b7ce26cb4102`](https://gummble.com/screens/sc_e0d23728f830469c8e36b7ce26cb4102?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 제목 입력 | 상태 In Progress와 기한 Feb6가 표시됨. 선택 UI는 생략. |
| 04 | [`sc_7a647748d2d2495db3926d2b7b13188d`](https://gummble.com/screens/sc_7a647748d2d2495db3926d2b7b13188d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 상태와 기한 반영 | 담당자 드롭다운 펼침. |
| 05 | [`sc_f36eea1be7f14442b9aa8e9ca89532e3`](https://gummble.com/screens/sc_f36eea1be7f14442b9aa8e9ca89532e3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 팀에서 담당자 선택 | Joe Doe 담당자 표시. |
| 06 | [`sc_12595f0282da469b919de850906c592c`](https://gummble.com/screens/sc_12595f0282da469b919de850906c592c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 담당자 반영 | 입력된 작업 패널에서 종료. 패널 닫힘·목록 복귀는 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 상세의 빈 개요

- Screen ID: `sc_adeac0011d87480980cfd58e53e4d751`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4562b3e8-1ba5-461e-81bd-766674cf2aed.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_6400e9620c7b4e29856292f30cce1c60`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 본문 좌측 Tasks와 Recent Activity, 우측 Documents & Links, Invoices/Expenses 요약 카드.
- 입력 항목·필수 표시·기본값: Design Project with Doe, Doe Company, New Lead. 작업·문서 없음. 청구·비용 수치0.
- 버튼·메뉴·안내 문구: Tasks 새 작업/템플릿, 각 영역+; Send Email, Forwarding Email, Automations.
- 확인된 상태: 프로젝트 생성 활동1개와 빈 업무 영역.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 생성 이력에 주체·제목·시각이 표시된다. 이메일 발송은 실행하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트 기본정보, 활동이력, 관련 업무 집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 새 작업의 빈 상세 패널

- Screen ID: `sc_6400e9620c7b4e29856292f30cce1c60`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6400e9620c7b4e29856292f30cce1c60?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a9b34614-05d9-4371-809c-0315232f0dec.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_adeac0011d87480980cfd58e53e4d751` → 현재 → `sc_e0d23728f830469c8e36b7ce26cb4102`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 절반을 작업 상세 패널이 덮는다. 왼쪽 경계에 닫힘 화살표, 위 제목·말줄임, 두 열 속성, 설명·Files·Subtasks·Activity를 세로 배치.
- 입력 항목·필수 표시·기본값: Add title to your task, To Do, Design Project with Doe, Unassigned, No due date, Does not repeat, No hours added. 설명·첨부·하위 항목·댓글 모두 비어 있음.
- 버튼·메뉴·안내 문구: 상태·프로젝트·담당자·기한·반복·시간 진입, +Add File, +Add Subtask, 말줄임.
- 확인된 상태: 필수 별표 없이 빈 새 작업 패널.
- 단계 간 변화: 빈 작업 패널이 오른쪽에 열림.

#### 동작과 데이터

- 화면 관찰: 프로젝트 문맥은 미리 채워져 있다. 빈 제목의 실제 저장 여부는 모른다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새 레코드 생성 시점·초깃값의 계정별 차이.

#### 모델링 영향

- 후보와 근거: 작업 초안과 표시 기본값 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 작업 제목 입력

- Screen ID: `sc_e0d23728f830469c8e36b7ce26cb4102`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e0d23728f830469c8e36b7ce26cb4102?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1a25ab62-83ba-4e61-b721-f51f7892e7e0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_6400e9620c7b4e29856292f30cce1c60` → 현재 → `sc_7a647748d2d2495db3926d2b7b13188d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 절반을 작업 상세 패널이 덮는다. 왼쪽 경계에 닫힘 화살표, 위 제목·말줄임, 두 열 속성, 설명·Files·Subtasks·Activity를 세로 배치.
- 입력 항목·필수 표시·기본값: 제목 Initial Chat. 상태To Do·미지정 담당자·기한 없음 유지.
- 버튼·메뉴·안내 문구: 동일 속성·첨부·하위 항목·댓글 진입.
- 확인된 상태: 제목만 채워진 상태.
- 단계 간 변화: 제목 Initial Chat 입력.

#### 동작과 데이터

- 화면 관찰: 제목이 일반 헤더 형태로 표시되지만 저장 피드백은 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 입력 확정 시점·제목 길이·중복.

#### 모델링 영향

- 후보와 근거: 제목 필드와 편집 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 작업 상태와 기한 반영

- Screen ID: `sc_7a647748d2d2495db3926d2b7b13188d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7a647748d2d2495db3926d2b7b13188d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e3450440-9b05-4b50-adab-c249b3d76dc2.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e0d23728f830469c8e36b7ce26cb4102` → 현재 → `sc_f36eea1be7f14442b9aa8e9ca89532e3`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 절반을 작업 상세 패널이 덮는다. 왼쪽 경계에 닫힘 화살표, 위 제목·말줄임, 두 열 속성, 설명·Files·Subtasks·Activity를 세로 배치.
- 입력 항목·필수 표시·기본값: Initial Chat, In Progress, Feb6 2024, Unassigned; 설명 없음.
- 버튼·메뉴·안내 문구: 상태 선택, 날짜, 나머지 속성.
- 확인된 상태: Activity에 Joe Doe가 진행 중으로 표시한 이벤트.
- 단계 간 변화: 상태 In Progress와 기한 Feb6가 표시됨. 선택 UI는 생략.

#### 동작과 데이터

- 화면 관찰: 이전 To Do/기한 없음에서 두 값이 바뀌었다. 캘린더와 상태 메뉴는 이 단계 사이에 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 상태 변경과 기한 변경의 각각 저장 결과.

#### 모델링 영향

- 후보와 근거: 상태·기한 변경과 상태 이벤트 기록 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 프로젝트 팀에서 담당자 선택

- Screen ID: `sc_f36eea1be7f14442b9aa8e9ca89532e3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f36eea1be7f14442b9aa8e9ca89532e3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/81ac15e6-fa3d-4565-896b-6597110367be.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_7a647748d2d2495db3926d2b7b13188d` → 현재 → `sc_12595f0282da469b919de850906c592c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 절반을 작업 상세 패널이 덮는다. 왼쪽 경계에 닫힘 화살표, 위 제목·말줄임, 두 열 속성, 설명·Files·Subtasks·Activity를 세로 배치. 담당자 자리 아래 드롭다운.
- 입력 항목·필수 표시·기본값: PROJECT TEAM 섹션 Joe Doe 한 행. 나머지 상태·기한 유지.
- 버튼·메뉴·안내 문구: Select… 입력과 Joe Doe 선택지.
- 확인된 상태: 선택 메뉴가 열린 상태.
- 단계 간 변화: 담당자 드롭다운 펼침.

#### 동작과 데이터

- 화면 관찰: 프로젝트 팀 문맥의 할당 선택을 제공한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색·다중선택·외부 멤버·권한.

#### 모델링 영향

- 후보와 근거: 작업 할당과 프로젝트 참여 관계의 검증 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 작업 담당자 반영

- Screen ID: `sc_12595f0282da469b919de850906c592c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_12595f0282da469b919de850906c592c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ebffb145-ab1f-4e47-a824-1d578f14be64.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f36eea1be7f14442b9aa8e9ca89532e3` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 절반을 작업 상세 패널이 덮는다. 왼쪽 경계에 닫힘 화살표, 위 제목·말줄임, 두 열 속성, 설명·Files·Subtasks·Activity를 세로 배치.
- 입력 항목·필수 표시·기본값: 담당자 Joe Doe와 JD 아이콘. 상태In Progress·기한Feb6·제목 유지.
- 버튼·메뉴·안내 문구: 담당자·상태·시간·설명 편집, 말줄임.
- 확인된 상태: 드롭다운이 닫히고 담당자가 표시된다.
- 단계 간 변화: Joe Doe 담당자 표시.

#### 동작과 데이터

- 화면 관찰: 담당자가 선택된 결과. 배경 Tasks는 아직 비어 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 목록 반영·알림·권한·영속 저장.

#### 모델링 영향

- 후보와 근거: 담당자 참조와 배경 조회 갱신 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 새 패널에는 제목 없음, To Do, 프로젝트 연결, 담당자 미지정, 기한 없음, 반복 없음, 시간 없음이 표시된다.
- 관찰: 상태를 바꾸면 Activity에 주체·상대시각·변경 이벤트가 보인다.
- 관찰: 담당자 선택 목록은 PROJECT TEAM 구역에 Joe Doe를 보여준다. 프로젝트 밖 멤버 선택 가능성은 미확인.
- 미확인: 전체 Save 버튼 없이 편집된 결과가 보이지만 모든 필드의 자동 저장 시점·초안 생성 여부는 확정하지 않는다.

## 6. 공식 도움말과 API 대조

- [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai): 작업 생성·하위 항목·상태 변경을 설명한다. 현재 도움말의 Save 절차와 이 캡처의 패널 편집 형태를 구분한다.
- [Tasks API](https://docs.hellobonsai.com/api/tag/tasks): GET/POST `/public-api/v1/tasks`, GET/PATCH/DELETE `/public-api/v1/tasks/{uuid}`, GET `/public-api/v1/tasks/{task_id}/subtasks`가 공개되어 있다. 설명상 프로젝트·상위 작업 연결은 선택적이다. 이 페이지에서 개별 요청 필드는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- Task의 제목·상태·프로젝트·담당자·기한·반복 설정·설명·첨부·하위 관계·활동 후보.
- 상태·담당자 변경 이력과 사용자 댓글은 표시 형식과 생성 원인이 다르므로 이벤트 종류를 구분한다.
- FE 후보: 패널 열림/닫힘·개별 필드 편집·멤버 선택·하위 영역 스크롤·배경 목록 재조회.

## 8. 미확인 사항과 검토 질문

- 빈 패널을 열고 바로 닫으면 Untitled 레코드가 남는가? 신규 작업 생성 시점을 네트워크로 확인한다.
- 제목·상태·기한·담당자는 각각 언제 저장되는가? 포커스 변경·엔터·패널 닫기를 나눠 검증한다.
- 담당자를 여러 명 선택할 수 있는가? 단일 표시만으로 관계 수를 확정하지 않는다.
- 뒤 개요가 비어 있는 것은 갱신 지연인가? 패널 닫기·새로고침 후 집계를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
