# Editing a template task 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **8/8단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `91a75fcf-9857-41ff-85c2-c2de0bae87d9` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=91a75fcf-9857-41ff-85c2-c2de0bae87d9) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 8단계 / 8단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

템플릿 안의 작업 제목·첨부·하위 작업을 편집하고 템플릿 작업 목록에 반영하는 흐름이다.

- 시작 화면은 작업이 없는 Default Task 템플릿이다. 다음 화면의 모달 제목은 Edit Template Task다.
- 빈 템플릿에서 편집 모달로 이어지는 진입 과정을 모두 포착한 것은 아니므로 기존 작업 생성인지 새 항목 편집인지 단정하지 않는다.
- 종료: Update company guideline 한 행이 템플릿에 표시된다. 실제 프로젝트 적용은 별도다.

- 상위 분석: [Tasks](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_e6ee191223c2486caf3d9d87a12154e8`](https://gummble.com/screens/sc_e6ee191223c2486caf3d9d87a12154e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 빈 템플릿 생성 성공 | Edit Template Task 모달. 새 항목 생성 중간 과정은 미수록. |
| 02 | [`sc_3088f428e5f84ace8f8cc9d9826275f6`](https://gummble.com/screens/sc_3088f428e5f84ace8f8cc9d9826275f6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 템플릿 작업 편집 모달 | 작업 제목을 Update company guideline으로 입력. |
| 03 | [`sc_5d0895da618a47a4a2f0a2da3bfe2f7f`](https://gummble.com/screens/sc_5d0895da618a47a4a2f0a2da3bfe2f7f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 템플릿 작업 제목 입력 | Files에 이미지 파일 카드가 생긴다. |
| 04 | [`sc_1d39460fb10d405593f5c080ed7d6df1`](https://gummble.com/screens/sc_1d39460fb10d405593f5c080ed7d6df1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 템플릿 작업 파일 첨부 카드 | 파일 미리보기와 하위 작업 입력 상태로 이동하며 아래로 스크롤. |
| 05 | [`sc_821e823e6105444082ad4c65794640fc`](https://gummble.com/screens/sc_821e823e6105444082ad4c65794640fc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 하위 작업 첫 항목 입력 | 첫 하위 작업이 입력칸에서 목록 항목으로 전환. |
| 06 | [`sc_330426d10b684bcd95b8f55415c0957c`](https://gummble.com/screens/sc_330426d10b684bcd95b8f55415c0957c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 첫 하위 작업 목록 반영 | Prepare proposal 두 번째 하위 작업이 추가됨. 입력 중간 화면은 생략. |
| 07 | [`sc_ce3533bae1e9437a9649f05418b21537`](https://gummble.com/screens/sc_ce3533bae1e9437a9649f05418b21537?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 하위 작업 두 항목 | 모달이 닫히고 템플릿에 작업 한 행 표시. |
| 08 | [`sc_cd414dd8295f418b979e3494a1cfd1eb`](https://gummble.com/screens/sc_cd414dd8295f418b979e3494a1cfd1eb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 템플릿 작업 목록에 반영 | 템플릿 작업 편집 종료. 프로젝트 작업은 아직 생성되지 않음. |

## 4. 화면별 상세 분석

### 단계 01 — 빈 템플릿 생성 성공

- Screen ID: `sc_e6ee191223c2486caf3d9d87a12154e8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e6ee191223c2486caf3d9d87a12154e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de695714-2309-489c-868e-d882db2fb37f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_3088f428e5f84ace8f8cc9d9826275f6`

#### 화면에서 직접 확인한 내용

- 레이아웃: Templates 탭 아래 Default Task 제목·연필 아이콘. 오른쪽 New Task. 가운데 큰 빈 목록 박스, 오른쪽 아래 토스트.
- 입력 항목·필수 표시·기본값: 작업0개. 입력 폼은 닫혔다.
- 버튼·메뉴·안내 문구: No tasks created yet / Create a new task, New Task, 이름 연필, 생성 성공 토스트 닫기.
- 확인된 상태: 이름이 있는 템플릿 상세와 성공 피드백.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 템플릿 생성은 관찰되지만 구성 작업은 아직 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 연필 편집 결과·여러 템플릿 간 선택 방식.

#### 모델링 영향

- 후보와 근거: 템플릿 컨테이너와 작업 컬렉션의 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 템플릿 작업 편집 모달

- Screen ID: `sc_3088f428e5f84ace8f8cc9d9826275f6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3088f428e5f84ace8f8cc9d9826275f6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6041aad6-2706-424b-a58c-9343007c7139.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e6ee191223c2486caf3d9d87a12154e8` → 현재 → `sc_5d0895da618a47a4a2f0a2da3bfe2f7f`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 위 넓은 세로 Edit Template Task 모달. Title·Description, Files, Subtasks, 하단 Delete Task/Save Task 순서. 내용 증가 시 세로 스크롤.
- 입력 항목·필수 표시·기본값: Title 회색 Update company branding and style guide, 빈 Description, 빈 Files, 하위 작업 입력칸. 필수 별표 없음.
- 버튼·메뉴·안내 문구: 닫기X, +Add File, 하위 작업 Save 또는 +Add Subtask, Delete Task, Save Task.
- 확인된 상태: 초기 입력 상태. 제목의 회색 글씨는 저장된 값으로 단정하지 않는다.
- 단계 간 변화: Edit Template Task 모달. 새 항목 생성 중간 과정은 미수록.

#### 동작과 데이터

- 화면 관찰: 실제 프로젝트·담당자·기한 필드는 이 화면에 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 신규/기존 항목 여부와 입력 기본값.

#### 모델링 영향

- 후보와 근거: 템플릿 항목 제목·설명·첨부·하위 항목 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 템플릿 작업 제목 입력

- Screen ID: `sc_5d0895da618a47a4a2f0a2da3bfe2f7f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5d0895da618a47a4a2f0a2da3bfe2f7f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/35ecfe27-606a-4e26-9340-66e45e24d1ac.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3088f428e5f84ace8f8cc9d9826275f6` → 현재 → `sc_1d39460fb10d405593f5c080ed7d6df1`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 위 넓은 세로 Edit Template Task 모달. Title·Description, Files, Subtasks, 하단 Delete Task/Save Task 순서. 내용 증가 시 세로 스크롤.
- 입력 항목·필수 표시·기본값: Title=Update company guideline. 설명·첨부·하위 항목은 비어 있다.
- 버튼·메뉴·안내 문구: 닫기X, +Add File, 하위 작업 Save 또는 +Add Subtask, Delete Task, Save Task.
- 확인된 상태: 제목이 진한 입력값으로 바뀐다.
- 단계 간 변화: 작업 제목을 Update company guideline으로 입력.

#### 동작과 데이터

- 화면 관찰: 아직 전체 저장 전 입력 단계.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 제목 필수 여부·중복 제한·입력 길이.

#### 모델링 영향

- 후보와 근거: 템플릿 항목의 제목과 로컬 초안 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 템플릿 작업 파일 첨부 카드

- Screen ID: `sc_1d39460fb10d405593f5c080ed7d6df1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1d39460fb10d405593f5c080ed7d6df1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/94020922-8057-4e0a-8c21-6812dc780ff4.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_5d0895da618a47a4a2f0a2da3bfe2f7f` → 현재 → `sc_821e823e6105444082ad4c65794640fc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 위 넓은 세로 Edit Template Task 모달. Title·Description, Files, Subtasks, 하단 Delete Task/Save Task 순서. 내용 증가 시 세로 스크롤.
- 입력 항목·필수 표시·기본값: 제목 유지. Files 아래 gradienta-…-unsplash.jpg 파일 카드1개. 설명은 비어 있다.
- 버튼·메뉴·안내 문구: 닫기X, +Add File, 하위 작업 Save 또는 +Add Subtask, Delete Task, Save Task. 파일 카드의 제거X와 구름 아이콘.
- 확인된 상태: 파일명이 보이는 카드가 생기며 모달이 길어졌다.
- 단계 간 변화: Files에 이미지 파일 카드가 생긴다.

#### 동작과 데이터

- 화면 관찰: 파일 선택 결과가 UI에 표시된다. 서버 업로드 완료 여부는 글씨만으로 확정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 파일 카드 상태별 아이콘·첨부 권한·스토리지 참조.

#### 모델링 영향

- 후보와 근거: 첨부 업로드 상태, 파일명·미디어 참조와 템플릿 항목 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 하위 작업 첫 항목 입력

- Screen ID: `sc_821e823e6105444082ad4c65794640fc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_821e823e6105444082ad4c65794640fc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e43728d0-b2ea-4a69-b66c-d88ebba4153f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1d39460fb10d405593f5c080ed7d6df1` → 현재 → `sc_330426d10b684bcd95b8f55415c0957c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 위 넓은 세로 Edit Template Task 모달. Title·Description, Files, Subtasks, 하단 Delete Task/Save Task 순서. 내용 증가 시 세로 스크롤. 본문 아래로 스크롤해 하단 버튼이 보인다.
- 입력 항목·필수 표시·기본값: 색상 이미지 미리보기. 하위 작업 입력=Send invite for initial chat, 왼쪽 체크박스 미선택.
- 버튼·메뉴·안내 문구: 하위 Save, Save Task, Delete Task, +Add File, 이미지 제거X.
- 확인된 상태: 하위 항목이 입력 상태이고 자체 Save가 보인다.
- 단계 간 변화: 파일 미리보기와 하위 작업 입력 상태로 이동하며 아래로 스크롤.

#### 동작과 데이터

- 화면 관찰: 파일명 카드가 미리보기로 바뀌었다. 하위 항목 추가와 전체 저장이 분리된 UI.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 미리보기 렌더링과 실제 업로드 완료의 관계·하위 Save의 저장 범위.

#### 모델링 영향

- 후보와 근거: 하위 항목 입력 상태와 전체 템플릿 편집 상태 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 첫 하위 작업 목록 반영

- Screen ID: `sc_330426d10b684bcd95b8f55415c0957c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_330426d10b684bcd95b8f55415c0957c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de3ae460-e8f6-47dc-82dd-57ca6d58e205.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_821e823e6105444082ad4c65794640fc` → 현재 → `sc_ce3533bae1e9437a9649f05418b21537`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 위 넓은 세로 Edit Template Task 모달. Title·Description, Files, Subtasks, 하단 Delete Task/Save Task 순서. 내용 증가 시 세로 스크롤.
- 입력 항목·필수 표시·기본값: Send invite for initial chat가 미선택 체크박스 옆 일반 텍스트. 이미지 유지.
- 버튼·메뉴·안내 문구: +Add Subtask가 나타남. 하위 Save는 없어지고 전체 Save Task가 남음.
- 확인된 상태: 하위 입력칸이 목록으로 전환.
- 단계 간 변화: 첫 하위 작업이 입력칸에서 목록 항목으로 전환.

#### 동작과 데이터

- 화면 관찰: 첫 하위 항목이 편집 목록에 반영되었으나 전체 저장 여부는 아직 불명.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 체크박스가 템플릿의 기본 완료값인지 실제 실행 상태인지.

#### 모델링 영향

- 후보와 근거: 하위 템플릿 항목 컬렉션과 편집/표시 모드 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 하위 작업 두 항목

- Screen ID: `sc_ce3533bae1e9437a9649f05418b21537`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ce3533bae1e9437a9649f05418b21537?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/36de1fdd-c4c3-4af0-92e5-1717539e8f7b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_330426d10b684bcd95b8f55415c0957c` → 현재 → `sc_cd414dd8295f418b979e3494a1cfd1eb`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이 위 넓은 세로 Edit Template Task 모달. Title·Description, Files, Subtasks, 하단 Delete Task/Save Task 순서. 내용 증가 시 세로 스크롤.
- 입력 항목·필수 표시·기본값: Send invite for initial chat, Prepare proposal 두 항목 모두 체크 해제. 제목·이미지 유지.
- 버튼·메뉴·안내 문구: +Add Subtask, Save Task, Delete Task, 파일 제거X.
- 확인된 상태: 하위 항목 수가1→2. 두 번째 입력 과정은 캡처되지 않았다.
- 단계 간 변화: Prepare proposal 두 번째 하위 작업이 추가됨. 입력 중간 화면은 생략.

#### 동작과 데이터

- 화면 관찰: 순서 있는 하위 목록 두 항목을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 드래그 정렬·하위 항목 삭제·다중 깊이 지원 여부.

#### 모델링 영향

- 후보와 근거: 템플릿 항목 순서 및 부모 관계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 템플릿 작업 목록에 반영

- Screen ID: `sc_cd414dd8295f418b979e3494a1cfd1eb`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cd414dd8295f418b979e3494a1cfd1eb?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cab3f849-fbca-4a4c-bdf7-84d039c44a49.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ce3533bae1e9437a9649f05418b21537` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Templates 탭의 Default Task 제목과 New Task. 아래 Update company guideline 한 행과 우측 펼침 화살표.
- 입력 항목·필수 표시·기본값: 편집 모달은 닫혔고 한 작업만 표시.
- 버튼·메뉴·안내 문구: New Task, 템플릿 이름 연필, 작업 펼침 화살표.
- 확인된 상태: 빈 목록이 한 작업 목록으로 바뀜. 별도 성공 토스트는 이 캡처에 없음.
- 단계 간 변화: 모달이 닫히고 템플릿에 작업 한 행 표시.

#### 동작과 데이터

- 화면 관찰: 하위2개와 첨부는 접힌 목록에 보이지 않는다. 실제 저장 유지 여부는 재진입 확인 필요.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 펼친 상세 내용·새로고침 후 첨부와 하위 항목 보존.

#### 모델링 영향

- 후보와 근거: 템플릿 상세의 작업 요약과 펼침 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 하위 작업의 Save와 전체 Save Task가 구분된다. 하위 Save만으로 서버 저장되는지는 확인하지 못했다.
- 관찰: 첨부 파일 카드에 제거X와 구름 모양 아이콘이 있다. 아이콘의 업로드/다운로드 의미는 툴팁 없이 확정하지 않는다.
- 관찰: 제목 입력, 첨부1개, 미완료 하위 작업2개 이후 템플릿 목록에 한 작업이 나타난다.
- 미확인: 템플릿 변경이 이미 적용한 프로젝트 작업에 전파되는지, Delete Task의 범위와 복구.

## 6. 공식 도움말과 API 대조

- [Task templates 도움말](https://help.hellobonsai.com/en/articles/11488590-leveraging-task-templates): 템플릿은 여러 작업·하위 작업을 담는 재사용 목록이다. 현행 진입은 New Task의 Manage Templates이며 캡처의 Templates 탭과 다르다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): 공개 Templates는 현재 문서 템플릿을 대상으로 명시한다. Task Template 생성·편집 API로 오인하지 않는다.
- [Tasks/subtasks API](https://docs.hellobonsai.com/api/tag/tasks): 일반 작업의 부모·하위 관계는 공개되어 있지만 템플릿의 구성 항목과 같은 리소스라는 근거는 없다.

## 7. 데이터 모델링 시사점

- 템플릿 → 템플릿 작업 → 템플릿 하위 작업과 첨부 참조 후보. 실제 작업과 같은 테이블 사용 여부는 미정.
- 작업 제목과 설명·첨부는 별도 필드/관계 후보이며 설명 없이 저장된 것으로 보이는 상태를 관찰했다.
- FE 후보: 긴 모달 스크롤, 파일의 업로드/미리보기 상태, 하위 항목 로컬 추가와 전체 저장.

## 8. 미확인 사항과 검토 질문

- 빈 템플릿에서 Edit 모달이 뜨는 정확한 진입은 무엇인가? New Task 클릭부터 재현해 누락 단계를 보완한다.
- 하위 Save 후 모달을 닫으면 항목이 남는가? 저장 범위·취소 의미를 검증한다.
- 템플릿에서 첨부 삭제·작업 삭제 시 이미 생성한 실제 작업은 어떻게 되는가? 복제/공유 정책을 확인한다.
- 첨부 파일 형식·크기·실패·여러 개 업로드 상태를 추가 이미지로 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 8개와 실제 이미지 8개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
