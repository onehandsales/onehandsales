# Editing status settings 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `9dcc612c-ab47-4cc3-a2bb-1c434c7da582` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=9dcc612c-ab47-4cc3-a2bb-1c434c7da582) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 6개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

작업 상태의 정의 설정을 열어 상태 색상을 변경하는 흐름이다.

- 개별 작업 상태 선택 메뉴의 Settings에서 Status Settings 모달로 진입한다.
- To Do 색상을 보라색에서 주황 계열로 바꾸고 상태 업데이트 성공 메시지를 확인한다.
- 작업 자체를 다른 상태로 옮기는 행동과 상태 정의를 편집하는 행동을 구분한다.

- 상위 분석: [Adding a task](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Project detail/Adding a task/Editing status settings`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_92611ceaf06340ae99ed8df9b666d850`](https://gummble.com/screens/sc_92611ceaf06340ae99ed8df9b666d850?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [하위 작업 추가 전 작업 상세](<screens/01_sc_92611ceaf06340ae99ed8df9b666d850.png>) | 작업 상태 메뉴. 하위 작업도 추가된 다른 시점 캡처. |
| 02 | [`sc_893799aa095540a68b4d739c0eebeb7d`](https://gummble.com/screens/sc_893799aa095540a68b4d739c0eebeb7d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [작업 상태 메뉴와 설정 진입](<screens/02_sc_893799aa095540a68b4d739c0eebeb7d.png>) | Settings 선택 결과로 Status Settings 모달. |
| 03 | [`sc_9fa72c1143e148d08f1013b91bb7248f`](https://gummble.com/screens/sc_9fa72c1143e148d08f1013b91bb7248f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [작업 상태 정의 목록](<screens/03_sc_9fa72c1143e148d08f1013b91bb7248f.png>) | To Do 인라인 입력·색상 팔레트 표시. |
| 04 | [`sc_8b0fe4d121a94ab596c14f3a58477a40`](https://gummble.com/screens/sc_8b0fe4d121a94ab596c14f3a58477a40?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [상태 이름·색상 편집](<screens/04_sc_8b0fe4d121a94ab596c14f3a58477a40.png>) | 주황 색상을 선택한 표시. |
| 05 | [`sc_7812844d48494c668fcbd1c2448f8ba4`](https://gummble.com/screens/sc_7812844d48494c668fcbd1c2448f8ba4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [상태 색상 변경 표시](<screens/05_sc_7812844d48494c668fcbd1c2448f8ba4.png>) | 팔레트 닫힘·상태 업데이트 성공 토스트. |
| 06 | [`sc_cd0b582b70d34ff5ab146bbd401e4b77`](https://gummble.com/screens/sc_cd0b582b70d34ff5ab146bbd401e4b77?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [상태 정의 업데이트 성공](<screens/06_sc_cd0b582b70d34ff5ab146bbd401e4b77.png>) | 설정 모달이 열린 채 종료. 다른 작업/보드 반영은 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 하위 작업 추가 전 작업 상세

- Screen ID: `sc_92611ceaf06340ae99ed8df9b666d850`
- 원본: [화면 페이지](https://gummble.com/screens/sc_92611ceaf06340ae99ed8df9b666d850?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1f793b7e-3ada-4276-baf3-ddff095d1f59.png)
- 로컬 이미지: [01_sc_92611ceaf06340ae99ed8df9b666d850.png](<screens/01_sc_92611ceaf06340ae99ed8df9b666d850.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_893799aa095540a68b4d739c0eebeb7d`

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

### 단계 02 — 작업 상태 메뉴와 설정 진입

- Screen ID: `sc_893799aa095540a68b4d739c0eebeb7d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_893799aa095540a68b4d739c0eebeb7d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ee956195-08b1-4a55-ac00-8b0a10494e81.png)
- 로컬 이미지: [02_sc_893799aa095540a68b4d739c0eebeb7d.png](<screens/02_sc_893799aa095540a68b4d739c0eebeb7d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_92611ceaf06340ae99ed8df9b666d850` → 현재 → `sc_9fa72c1143e148d08f1013b91bb7248f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 작업 패널의 상태 배지 아래 작은 메뉴.
- 입력 항목·필수 표시·기본값: To Do, In Progress, Done. 현재 작업 In Progress.
- 버튼·메뉴·안내 문구: Settings 톱니 아이콘 항목.
- 확인된 상태: 개별 상태 선택과 상태 관리 진입이 함께 있다.
- 단계 간 변화: 작업 상태 메뉴. 하위 작업도 추가된 다른 시점 캡처.

#### 동작과 데이터

- 화면 관찰: 하위 항목 수가 첫 단계와 달라 중간 작업이 생략되었다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Settings 권한·메뉴 키보드 접근.

#### 모델링 영향

- 후보와 근거: 현재 상태와 상태 정의 관리 기능 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 작업 상태 정의 목록

- Screen ID: `sc_9fa72c1143e148d08f1013b91bb7248f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9fa72c1143e148d08f1013b91bb7248f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3fcf5d9c-0c32-418f-b527-d7f66c39490b.png)
- 로컬 이미지: [03_sc_9fa72c1143e148d08f1013b91bb7248f.png](<screens/03_sc_9fa72c1143e148d08f1013b91bb7248f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_893799aa095540a68b4d739c0eebeb7d` → 현재 → `sc_8b0fe4d121a94ab596c14f3a58477a40`

#### 화면에서 직접 확인한 내용

- 레이아웃: 화면 중앙 좁은 Status Settings 모달, 어두운 배경. 두 상태 위쪽, Done은 구분선 아래.
- 입력 항목·필수 표시·기본값: To Do 보라색, In Progress 푸른 배경, Done 녹색.
- 버튼·메뉴·안내 문구: +Add Status, 바깥 닫기X.
- 확인된 상태: 상태 정의 관리 화면.
- 단계 간 변화: Settings 선택 결과로 Status Settings 모달.

#### 동작과 데이터

- 화면 관찰: 색상 배지와 별도 완료 구역처럼 보이는 구조.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 각 행 편집 가능 범위·계정별 공유 범위.

#### 모델링 영향

- 후보와 근거: 상태 정의 컬렉션과 완료 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 상태 이름·색상 편집

- Screen ID: `sc_8b0fe4d121a94ab596c14f3a58477a40`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8b0fe4d121a94ab596c14f3a58477a40?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/93b25426-5328-4633-a23d-dac49de638c8.png)
- 로컬 이미지: [04_sc_8b0fe4d121a94ab596c14f3a58477a40.png](<screens/04_sc_8b0fe4d121a94ab596c14f3a58477a40.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9fa72c1143e148d08f1013b91bb7248f` → 현재 → `sc_7812844d48494c668fcbd1c2448f8ba4`

#### 화면에서 직접 확인한 내용

- 레이아웃: To Do 입력에 커서, 아래 가로8개 색상 원 팔레트. In Progress 행 일부가 가려짐.
- 입력 항목·필수 표시·기본값: 이름 To Do 그대로, 보라색 선택 링.
- 버튼·메뉴·안내 문구: 색상 원, +Add Status, 닫기X.
- 확인된 상태: 인라인 편집·색상 선택 상태.
- 단계 간 변화: To Do 인라인 입력·색상 팔레트 표시.

#### 동작과 데이터

- 화면 관찰: 이름 변경은 없고 팔레트가 열렸다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한 색상 코드·텍스트 저장 방식.

#### 모델링 영향

- 후보와 근거: 상태 라벨과 색 토큰 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 상태 색상 변경 표시

- Screen ID: `sc_7812844d48494c668fcbd1c2448f8ba4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7812844d48494c668fcbd1c2448f8ba4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f28bfdc0-0994-4d6a-bdc3-1fd2af030f64.png)
- 로컬 이미지: [05_sc_7812844d48494c668fcbd1c2448f8ba4.png](<screens/05_sc_7812844d48494c668fcbd1c2448f8ba4.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8b0fe4d121a94ab596c14f3a58477a40` → 현재 → `sc_cd0b582b70d34ff5ab146bbd401e4b77`

#### 화면에서 직접 확인한 내용

- 레이아웃: To Do 배지 배경이 연한 주황, 점은 주황. 팔레트 주황 원에 선택 링.
- 입력 항목·필수 표시·기본값: 이름 To Do 유지. 왼쪽 드래그 손잡이 보임.
- 버튼·메뉴·안내 문구: 색상 선택, 순서 손잡이, +Add Status.
- 확인된 상태: 색 선택 반영 중.
- 단계 간 변화: 주황 색상을 선택한 표시.

#### 동작과 데이터

- 화면 관찰: 보라→주황 변경을 관찰. 색 토큰값은 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 순서 변경 결과·저장 요청·실패 처리.

#### 모델링 영향

- 후보와 근거: 상태 스타일 변경과 정렬 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 상태 정의 업데이트 성공

- Screen ID: `sc_cd0b582b70d34ff5ab146bbd401e4b77`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cd0b582b70d34ff5ab146bbd401e4b77?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4ac084c5-7fa9-40ef-8fa2-5fcdcdccbee0.png)
- 로컬 이미지: [06_sc_cd0b582b70d34ff5ab146bbd401e4b77.png](<screens/06_sc_cd0b582b70d34ff5ab146bbd401e4b77.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7812844d48494c668fcbd1c2448f8ba4` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 팔레트 닫힌 상태 목록과 우측 아래 성공 토스트.
- 입력 항목·필수 표시·기본값: To Do 연한 주황 배경, In Progress 푸른 배경, Done 녹색.
- 버튼·메뉴·안내 문구: Task status updated successfully, 닫기X, +Add Status.
- 확인된 상태: 상태 정의 변경 성공 피드백.
- 단계 간 변화: 팔레트 닫힘·상태 업데이트 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 완료 상태는 구분선 아래 유지. 캡처의 점 색은 렌더링 차이가 있어 HEX를 추정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 보드·다른 작업 반영·권한·이력.

#### 모델링 영향

- 후보와 근거: 상태 정의 저장과 참조 화면 갱신 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 상태 이름·색을 편집할 수 있는 UI와 +Add Status, 드래그 모양 손잡이가 있다.
- 관찰: Done은 구분선 아래에 놓인다. 완료 의미를 가진 특수 상태일 가능성은 있으나 삭제·이름변경 제한은 미확인.
- 관찰: 팔레트가 In Progress 행을 가리는 중간 화면을 상태 삭제로 해석하지 않는다.
- 관찰: 색 변경 성공 토스트는 있지만 정확한 색상 코드·정렬 저장·설정 적용 범위는 미확인.

## 6. 공식 도움말과 API 대조

- [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai): 사용자 정의 상태 추가 경로를 설명한다.
- [Task Statuses API](https://docs.hellobonsai.com/api/tag/task-statuses): GET `/public-api/v1/task_statuses`로 이름을 쓰기 요청에 필요한 ID로 연결한다. 색상/순서 편집 endpoint는 이 페이지에 없다.
- [Board Groups API](https://docs.hellobonsai.com/api/tag/board-groups): 거래·프로젝트 진행 단계용이며 작업 상태와 다른 그룹이다.

## 7. 데이터 모델링 시사점

- 상태 ID·라벨·색·순서·완료 의미 후보. 고정 세 값 enum으로 전체 구현을 제한하지 않는다.
- 작업의 현재 상태 참조와 상태 정의 변경 이력을 구분한다.
- FE 후보: 상태 메뉴→설정 모달, 인라인 이름, 팔레트 선택 표시, 순서 손잡이, 성공 토스트.

## 8. 미확인 사항과 검토 질문

- 상태 설정의 범위는 계정·팀·프로젝트 중 무엇인가? 다른 프로젝트 보드를 동시에 대조한다.
- Done의 이름/색/순서/삭제에 어떤 제한이 있는가? 완료 집계와 함께 검증한다.
- 새 상태 추가·삭제 시 기존 작업 재배정 정책은 무엇인가? API 오류와 확인 UI를 확인한다.
- 팔레트의 정확한 색상값과 드래그 저장은 원본 이미지·실제 DOM을 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
