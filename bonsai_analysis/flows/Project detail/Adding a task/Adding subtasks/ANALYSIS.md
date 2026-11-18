# Adding subtasks 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b8bd1036-63f8-4e27-b2b7-a76abf4d8f10` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b8bd1036-63f8-4e27-b2b7-a76abf4d8f10) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 10개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

실제 작업 Initial Chat에 두 하위 작업을 추가하고 첫 하위 작업의 담당자·완료 상태를 확인하는 흐름이다.

- 시작: In Progress 작업, Joe Doe 담당, Feb6 기한, 설명 Call Jane to have initial chat. 종료: Send invite 완료/JD, Prepare a deck 미완료.
- 하위 항목의 상세 편집은 Editing a subtask에 분리되어 있다.
- 단계2 이후 Files 위 붉은 가로선이 생기지만 오류 문구·권한 배지는 없다. 원본 주석 가능성을 남긴다.

- 상위 분석: [Adding a task](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Project detail/Adding a task/Adding subtasks`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_92611ceaf06340ae99ed8df9b666d850`](https://gummble.com/screens/sc_92611ceaf06340ae99ed8df9b666d850?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [하위 작업 추가 전 작업 상세](<screens/01_sc_92611ceaf06340ae99ed8df9b666d850.png>) | Files의 Add File 위 붉은 선이 나타난 캡처. 제품 상태 변화인지 미확인. |
| 02 | [`sc_046bdc5a1543433f933ca84d92579603`](https://gummble.com/screens/sc_046bdc5a1543433f933ca84d92579603?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [하위 작업 추가 전 표시 변화](<screens/02_sc_046bdc5a1543433f933ca84d92579603.png>) | Subtasks 새 입력행과 Save 표시, 패널 아래로 스크롤. |
| 03 | [`sc_92544e24c71a4c93b830a3d47c959b72`](https://gummble.com/screens/sc_92544e24c71a4c93b830a3d47c959b72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [첫 하위 작업 입력행](<screens/03_sc_92544e24c71a4c93b830a3d47c959b72.png>) | Send invite 입력. |
| 04 | [`sc_f8457681a6804fe39e695dfe885f882a`](https://gummble.com/screens/sc_f8457681a6804fe39e695dfe885f882a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [첫 하위 작업 제목 입력](<screens/04_sc_f8457681a6804fe39e695dfe885f882a.png>) | 첫 항목 목록 반영, +Add Subtask 복원. |
| 05 | [`sc_eeefe46c51154a1a90c08876ef418fc5`](https://gummble.com/screens/sc_eeefe46c51154a1a90c08876ef418fc5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [첫 하위 작업 목록 표시](<screens/05_sc_eeefe46c51154a1a90c08876ef418fc5.png>) | 두 번째 빈 입력행 표시. |
| 06 | [`sc_04fedc8d0016439eb35c5d23bda93a37`](https://gummble.com/screens/sc_04fedc8d0016439eb35c5d23bda93a37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [두 번째 하위 작업 입력행](<screens/06_sc_04fedc8d0016439eb35c5d23bda93a37.png>) | Prepare a deck 입력. |
| 07 | [`sc_ab5a7afb054844be96854877997e8065`](https://gummble.com/screens/sc_ab5a7afb054844be96854877997e8065?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [두 번째 하위 작업 제목 입력](<screens/07_sc_ab5a7afb054844be96854877997e8065.png>) | 두 번째 항목도 일반 목록으로 표시. |
| 08 | [`sc_cc86bdd7d2b14979983e89b4b1658a11`](https://gummble.com/screens/sc_cc86bdd7d2b14979983e89b4b1658a11?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [두 하위 작업 목록](<screens/08_sc_cc86bdd7d2b14979983e89b4b1658a11.png>) | 첫 행이 강조되며 담당자·삭제 아이콘 표시. |
| 09 | [`sc_589deed929294b86bd4e88e18604b436`](https://gummble.com/screens/sc_589deed929294b86bd4e88e18604b436?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [하위 작업 행 보조 액션](<screens/09_sc_589deed929294b86bd4e88e18604b436.png>) | 첫 항목 완료 체크와 JD 담당자 표시. 선택 메뉴·체크 동작은 생략. |
| 10 | [`sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf`](https://gummble.com/screens/sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [작업 활동과 빈 댓글 입력](<screens/10_sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf.png>) | 하위 작업 목록 상태로 종료. 댓글 흐름의 시작 화면과 같다. |

## 4. 화면별 상세 분석

### 단계 01 — 하위 작업 추가 전 작업 상세

- Screen ID: `sc_92611ceaf06340ae99ed8df9b666d850`
- 원본: [화면 페이지](https://gummble.com/screens/sc_92611ceaf06340ae99ed8df9b666d850?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1f793b7e-3ada-4276-baf3-ddff095d1f59.png)
- 로컬 이미지: [01_sc_92611ceaf06340ae99ed8df9b666d850.png](<screens/01_sc_92611ceaf06340ae99ed8df9b666d850.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_046bdc5a1543433f933ca84d92579603`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 패널 상단 속성과 설명·Files·Subtasks·Activity가 보인다.
- 입력 항목·필수 표시·기본값: Initial Chat / In Progress / Feb6 2024 / Joe Doe. 설명 Call Jane to have initial chat. 하위 항목 없음.
- 버튼·메뉴·안내 문구: +Add File, +Add Subtask, 말줄임, 상태·담당자·시간.
- 확인된 상태: 설명은 채워져 있고 하위 작업은 없는 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 부모 설명과 하위 항목 컬렉션은 별도 영역.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 설명 저장 시점·하위 항목 없음의 정확한 조회 상태.

#### 모델링 영향

- 후보와 근거: 부모 작업 설명과 자식 목록 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 하위 작업 추가 전 표시 변화

- Screen ID: `sc_046bdc5a1543433f933ca84d92579603`
- 원본: [화면 페이지](https://gummble.com/screens/sc_046bdc5a1543433f933ca84d92579603?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9186a495-feb4-47f4-84ff-708aca5bcbe9.png)
- 로컬 이미지: [02_sc_046bdc5a1543433f933ca84d92579603.png](<screens/02_sc_046bdc5a1543433f933ca84d92579603.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_92611ceaf06340ae99ed8df9b666d850` → 현재 → `sc_92544e24c71a4c93b830a3d47c959b72`

#### 화면에서 직접 확인한 내용

- 레이아웃: 앞 화면과 동일한 작업 패널.
- 입력 항목·필수 표시·기본값: 설명·상태·담당자 유지. 입력 항목 없음.
- 버튼·메뉴·안내 문구: +Add Subtask. Add File 위에 붉은 가로선.
- 확인된 상태: 붉은 선 외 업무 값 변화는 보이지 않음.
- 단계 간 변화: Files의 Add File 위 붉은 선이 나타난 캡처. 제품 상태 변화인지 미확인.

#### 동작과 데이터

- 화면 관찰: 선을 비활성화·오류·금지 규칙의 근거로 삼지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이미지 주석/캡처 도구 표시인지 실제 UI인지.

#### 모델링 영향

- 후보와 근거: 데이터 모델 변화 근거 없음; 시각적 미확인 항목으로 보존.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 첫 하위 작업 입력행

- Screen ID: `sc_92544e24c71a4c93b830a3d47c959b72`
- 원본: [화면 페이지](https://gummble.com/screens/sc_92544e24c71a4c93b830a3d47c959b72?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d9372478-4009-4829-bb00-3a3ab9c18544.png)
- 로컬 이미지: [03_sc_92544e24c71a4c93b830a3d47c959b72.png](<screens/03_sc_92544e24c71a4c93b830a3d47c959b72.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_046bdc5a1543433f933ca84d92579603` → 현재 → `sc_f8457681a6804fe39e695dfe885f882a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: Subtasks에 체크 해제 박스와 Enter your subtask… 빈 입력.
- 버튼·메뉴·안내 문구: 행 오른쪽 Save. 아래 Activity와 빈 댓글 입력.
- 확인된 상태: 첫 자식의 입력 모드.
- 단계 간 변화: Subtasks 새 입력행과 Save 표시, 패널 아래로 스크롤.

#### 동작과 데이터

- 화면 관찰: 항목 추가 버튼 대신 입력행이 나타난다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 빈 제목 저장·Enter/ESC·취소.

#### 모델링 영향

- 후보와 근거: 하위 항목 로컬 입력과 생성 요청 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 첫 하위 작업 제목 입력

- Screen ID: `sc_f8457681a6804fe39e695dfe885f882a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f8457681a6804fe39e695dfe885f882a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5c68f671-5f05-4460-9796-a436e9a93fb2.png)
- 로컬 이미지: [04_sc_f8457681a6804fe39e695dfe885f882a.png](<screens/04_sc_f8457681a6804fe39e695dfe885f882a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_92544e24c71a4c93b830a3d47c959b72` → 현재 → `sc_eeefe46c51154a1a90c08876ef418fc5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: Send invite 입력, 체크 해제.
- 버튼·메뉴·안내 문구: 행 Save, 댓글 Add Comment.
- 확인된 상태: 입력된 제목이 아직 입력행에 있다.
- 단계 간 변화: Send invite 입력.

#### 동작과 데이터

- 화면 관찰: 하위 작업에 보낼 내용이 설정됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 제목 길이·중복·저장 요청 중 상태.

#### 모델링 영향

- 후보와 근거: 자식 제목 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 첫 하위 작업 목록 표시

- Screen ID: `sc_eeefe46c51154a1a90c08876ef418fc5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_eeefe46c51154a1a90c08876ef418fc5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3a0a5681-e470-4b8f-8e12-0309c5f79c92.png)
- 로컬 이미지: [05_sc_eeefe46c51154a1a90c08876ef418fc5.png](<screens/05_sc_eeefe46c51154a1a90c08876ef418fc5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f8457681a6804fe39e695dfe885f882a` → 현재 → `sc_04fedc8d0016439eb35c5d23bda93a37`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: Send invite 한 항목, 미완료.
- 버튼·메뉴·안내 문구: +Add Subtask, 하위 항목 체크박스, 댓글 입력/Add Comment. Files의 Add File 위 붉은 가로선은 의미 미확인.
- 확인된 상태: 입력행이 목록으로 바뀌고 +Add Subtask가 다시 보임.
- 단계 간 변화: 첫 항목 목록 반영, +Add Subtask 복원.

#### 동작과 데이터

- 화면 관찰: 자식 한 항목이 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침 유지·정렬·수정 진입.

#### 모델링 영향

- 후보와 근거: 부모 아래 자식 목록과 개별 완료 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 두 번째 하위 작업 입력행

- Screen ID: `sc_04fedc8d0016439eb35c5d23bda93a37`
- 원본: [화면 페이지](https://gummble.com/screens/sc_04fedc8d0016439eb35c5d23bda93a37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a7ee7aad-595b-4abc-a1b8-f8922223ce36.png)
- 로컬 이미지: [06_sc_04fedc8d0016439eb35c5d23bda93a37.png](<screens/06_sc_04fedc8d0016439eb35c5d23bda93a37.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_eeefe46c51154a1a90c08876ef418fc5` → 현재 → `sc_ab5a7afb054844be96854877997e8065`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: 기존 Send invite 유지, 아래 Enter your subtask… 빈 행.
- 버튼·메뉴·안내 문구: 새 행 Save, 기존 체크박스.
- 확인된 상태: 기존 항목을 유지한 추가 입력 모드.
- 단계 간 변화: 두 번째 빈 입력행 표시.

#### 동작과 데이터

- 화면 관찰: 한 부모에 둘 이상의 자식을 만들 수 있는 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 복수 입력행 동시 열림·취소 시 기존 항목 영향.

#### 모델링 영향

- 후보와 근거: 일대다 자식 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 두 번째 하위 작업 제목 입력

- Screen ID: `sc_ab5a7afb054844be96854877997e8065`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ab5a7afb054844be96854877997e8065?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2b09d511-90f4-4564-8aa3-3ad2f2ba3fd4.png)
- 로컬 이미지: [07_sc_ab5a7afb054844be96854877997e8065.png](<screens/07_sc_ab5a7afb054844be96854877997e8065.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_04fedc8d0016439eb35c5d23bda93a37` → 현재 → `sc_cc86bdd7d2b14979983e89b4b1658a11`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: 새 입력 Prepare a deck. 기존 Send invite 미완료 유지.
- 버튼·메뉴·안내 문구: 새 행 Save.
- 확인된 상태: 두 번째 제목이 입력됨.
- 단계 간 변화: Prepare a deck 입력.

#### 동작과 데이터

- 화면 관찰: 기존 항목 수정과 새 항목 추가를 구분한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 중복 제출·입력 순서 저장.

#### 모델링 영향

- 후보와 근거: 생성 순서 또는 별도 정렬값 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 두 하위 작업 목록

- Screen ID: `sc_cc86bdd7d2b14979983e89b4b1658a11`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cc86bdd7d2b14979983e89b4b1658a11?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7a72c235-51ea-4490-bba0-3de260401819.png)
- 로컬 이미지: [08_sc_cc86bdd7d2b14979983e89b4b1658a11.png](<screens/08_sc_cc86bdd7d2b14979983e89b4b1658a11.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ab5a7afb054844be96854877997e8065` → 현재 → `sc_589deed929294b86bd4e88e18604b436`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: Send invite, Prepare a deck 두 행 모두 체크 해제.
- 버튼·메뉴·안내 문구: +Add Subtask, 하위 항목 체크박스, 댓글 입력/Add Comment. Files의 Add File 위 붉은 가로선은 의미 미확인.
- 확인된 상태: 두 항목이 일반 목록으로 표시된다.
- 단계 간 변화: 두 번째 항목도 일반 목록으로 표시.

#### 동작과 데이터

- 화면 관찰: 항목별 별도 체크박스 존재.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 부모 완료와 자식 상태 연동·다중선택.

#### 모델링 영향

- 후보와 근거: 독립 자식 완료 상태와 부모 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 하위 작업 행 보조 액션

- Screen ID: `sc_589deed929294b86bd4e88e18604b436`
- 원본: [화면 페이지](https://gummble.com/screens/sc_589deed929294b86bd4e88e18604b436?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1514ec55-f494-4eff-872d-31052dad3585.png)
- 로컬 이미지: [09_sc_589deed929294b86bd4e88e18604b436.png](<screens/09_sc_589deed929294b86bd4e88e18604b436.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_cc86bdd7d2b14979983e89b4b1658a11` → 현재 → `sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 작업 패널의 설명·Files·Subtasks·Activity 영역. 패널 내부 스크롤에 따라 상단 작업 속성은 뷰포트 밖으로 이동한다.
- 입력 항목·필수 표시·기본값: Send invite 행 테두리 강조, 두 항목 미완료.
- 버튼·메뉴·안내 문구: 첫 행 오른쪽 담당자 추가 아이콘·빨간 휴지통. 첫 체크박스 초록 테두리.
- 확인된 상태: 행 상호작용 상태로 보이나 hover/선택 종류는 미확인.
- 단계 간 변화: 첫 행이 강조되며 담당자·삭제 아이콘 표시.

#### 동작과 데이터

- 화면 관찰: 하위 항목별 할당·삭제 진입점이 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 담당자 선택 대상·삭제 확인·키보드 접근.

#### 모델링 영향

- 후보와 근거: 자식별 담당자·삭제 권한 및 행 액션 UI 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 작업 활동과 빈 댓글 입력

- Screen ID: `sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf`
- 원본: [화면 페이지](https://gummble.com/screens/sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7b6a0b72-b157-41ff-a87d-972cad915bcd.png)
- 로컬 이미지: [10_sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf.png](<screens/10_sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_589deed929294b86bd4e88e18604b436` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 패널 아래 부분. Files·Subtasks·Activity. 왼쪽 프로젝트 개요는 그대로.
- 입력 항목·필수 표시·기본값: Send invite 완료/JD, Prepare a deck 미완료. 댓글 입력 비어 있음. 기존 할당·진행 이벤트.
- 버튼·메뉴·안내 문구: Add a comment…, 연한 Add Comment, +Add Subtask. Add File 위 붉은 선.
- 확인된 상태: 댓글 작성 전. 자동 이벤트 두 항목이 위에 있다.
- 단계 간 변화: 첫 항목 완료 체크와 JD 담당자 표시. 선택 메뉴·체크 동작은 생략.

#### 동작과 데이터

- 화면 관찰: 기존 상태 이벤트와 새 사용자 입력 영역을 구분.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 붉은 선 의미·댓글 표시 범위·빈 제출 가능성.

#### 모델링 영향

- 후보와 근거: 활동 목록과 댓글 입력 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 각 하위 항목에 Save가 있고 입력 상태와 일반 목록 상태가 다르다.
- 관찰: 같은 부모 아래 완료와 미완료 항목이 함께 존재한다. 모든 자식 완료 시 부모 자동 완료 여부는 미확인.
- 관찰: 첫 행 강조 상태에서 담당자 추가와 삭제 아이콘이 노출된다. hover인지 선택/포커스인지는 정적 캡처만으로 확정하지 않는다.
- 관찰: 첫 하위 작업에 JD가 표시되지만 부모 담당자가 자동 상속되는지 수동 할당인지 중간 단계가 없다.

## 6. 공식 도움말과 API 대조

- [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai): 하위 항목 제목 입력·저장·체크박스 완료와 여러 단계 중첩을 설명한다. 이 캡처는 직접 자식 한 단계만 보여준다.
- [Tasks API](https://docs.hellobonsai.com/api/tag/tasks): GET/POST `/public-api/v1/tasks`, GET/PATCH/DELETE `/public-api/v1/tasks/{uuid}`, GET `/public-api/v1/tasks/{task_id}/subtasks`가 공개되어 있다. 설명상 프로젝트·상위 작업 연결은 선택적이다. 이 페이지에서 개별 요청 필드는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- Task의 부모 관계 또는 별도 하위 항목 엔티티 후보. 공식 문서의 중첩을 고려해야 하지만 실제 테이블 전략은 미정.
- 하위 항목별 제목·완료·담당자·순서·상위 연결 후보. 부모 상태와 자식 완료는 분리해서 검증한다.
- FE 후보: 인라인 항목 생성, 체크박스, 행별 보조 액션, 담당자 아바타, 패널 내부 스크롤.

## 8. 미확인 사항과 검토 질문

- 모든 하위 항목 완료 시 부모 상태는 변하는가? 부모가 여러 상태일 때 각각 재현한다.
- 하위 항목의 담당자·프로젝트·기한은 부모에서 상속되는가? 독립 변경과 부모 변경을 비교한다.
- 하위 삭제는 확인 모달·복구·손자/시간기록 처리 규칙이 있는가? 실제 계정의 테스트 데이터로 확인한다.
- 항목 순서 저장과 중첩 깊이 제한·순환 참조 방지는 어떤가? 공식 API 모델과 입력 검증을 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 10단계 재조회 및 원본 10개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
