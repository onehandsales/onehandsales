# Reordering projects 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `c5e982aa-007d-4e20-8c8b-1fe3c276acc8` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=c5e982aa-007d-4e20-8c8b-1fe3c276acc8) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

프로젝트 카드를 드래그하여 다른 진행 단계로 옮기는 흐름이다.

- 이름은 Reordering projects지만 실제 이미지에서는 In Progress에서 Contract Signed로 열이 변경된다.
- Sample 태그와 고객은 유지되고 단계별 개수도 이동에 맞게 바뀐다.
- 같은 열 안의 순서 변경은 이3개 캡처에서 확인할 수 없다.

- 상위 분석: [Projects](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_aac14308ef5b42d39dacf9db53326aea`](https://gummble.com/screens/sc_aac14308ef5b42d39dacf9db53326aea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 카드의 태그 표시 | Consulting Project 카드가 원래 열에서 떠서 왼쪽으로 이동한 상태. |
| 02 | [`sc_616919a626c34dc588a29b736eab8ef0`](https://gummble.com/screens/sc_616919a626c34dc588a29b736eab8ef0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 카드 드래그 중 | Contract Signed 열에 카드 배치, 양쪽 개수 변경. |
| 03 | [`sc_e98507c9007c4f0cb127e058f7130ae4`](https://gummble.com/screens/sc_e98507c9007c4f0cb127e058f7130ae4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 다른 진행 단계로 이동 완료 | 열 간 이동 결과로 종료. 저장 피드백/실패는 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 카드의 태그 표시

- Screen ID: `sc_aac14308ef5b42d39dacf9db53326aea`
- 원본: [화면 페이지](https://gummble.com/screens/sc_aac14308ef5b42d39dacf9db53326aea?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e4f2e678-2e98-43d6-8271-73662293bf49.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_616919a626c34dc588a29b736eab8ef0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달 닫힘. Consulting Project 카드의 고객명 아래 보라색 Sample 칩.
- 입력 항목·필수 표시·기본값: 제목·고객·상태 유지. 태그 추가로 카드 높이 증가.
- 버튼·메뉴·안내 문구: 카드 진입, New Project.
- 확인된 상태: 카드 요약에 태그가 반영됨.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 태그는 진행 단계와 독립적으로 표시된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 태그 필터·색상 공유·렌더링 줄바꿈.

#### 모델링 영향

- 후보와 근거: 프로젝트 요약의 태그 배열 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 카드 드래그 중

- Screen ID: `sc_616919a626c34dc588a29b736eab8ef0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_616919a626c34dc588a29b736eab8ef0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e532e290-6089-445b-abff-987efb750606.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_aac14308ef5b42d39dacf9db53326aea` → 현재 → `sc_e98507c9007c4f0cb127e058f7130ae4`

#### 화면에서 직접 확인한 내용

- 레이아웃: Consulting Project 카드가 In Progress 열의 정렬선에서 벗어나 아래·왼쪽에 떠 있는 모습.
- 입력 항목·필수 표시·기본값: 기존 In Progress1, Contract Signed0. Sample태그 유지.
- 버튼·메뉴·안내 문구: 열+·말줄임·가로 스크롤바.
- 확인된 상태: 드래그 중으로 해석되는 위치 이동 캡처.
- 단계 간 변화: Consulting Project 카드가 원래 열에서 떠서 왼쪽으로 이동한 상태.

#### 동작과 데이터

- 화면 관찰: 아직 열 개수는 이전 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 포인터/드래그 핸들·자동 스크롤·드롭 가능 영역.

#### 모델링 영향

- 후보와 근거: 임시 드래그 위치와 저장된 단계 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 다른 진행 단계로 이동 완료

- Screen ID: `sc_e98507c9007c4f0cb127e058f7130ae4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e98507c9007c4f0cb127e058f7130ae4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/98ebae21-5ee2-4043-a6c3-402823b626e0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_616919a626c34dc588a29b736eab8ef0` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 카드가 Contract Signed 아래에 정렬됨.
- 입력 항목·필수 표시·기본값: Contract Signed1, In Progress0. 고객·태그 유지.
- 버튼·메뉴·안내 문구: 각 열 New Project.
- 확인된 상태: 새 열 배치와 개수 반영.
- 단계 간 변화: Contract Signed 열에 카드 배치, 양쪽 개수 변경.

#### 동작과 데이터

- 화면 관찰: 단순 순서 재배치뿐 아니라 단계 변경을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 영속 저장·실제 계약 상태와의 연결·활동 이력.

#### 모델링 영향

- 후보와 근거: 프로젝트 단계 변경과 열별 개수 갱신 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 이동 전 In Progress1/Contract Signed0 → 이동 후0/1.
- 관찰: 카드 제목·고객·Sample태그는 유지된다.
- 미확인: Contract Signed로 이동했다고 실제 계약 서명이 발생한 것은 아니다. 프로젝트 단계와 문서 서명을 분리한다.

## 6. 공식 도움말과 API 대조

- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 현행 도움말은 제목·날짜 자동 저장과 별도 설정 메뉴를 설명한다. 이 캡처는 Settings 탭과 Save Changes 방식으로 서로 다르다.
- [Board Groups API](https://docs.hellobonsai.com/api/tag/board-groups): GET `/public-api/v1/board_groups`는 거래·프로젝트 단계의 이름을 쓰기 요청에 쓰는 ID로 연결한다. 보드 레이아웃의 저장 범위나 정렬 규칙은 이 페이지로 알 수 없다.

## 7. 데이터 모델링 시사점

- 프로젝트의 단계 참조 변경과 열 내부 정렬을 별도 후보로 본다.
- 드래그 시작·이동·드롭·저장중·실패복원의 FE 상태 후보. 이 캡처에서는 성공으로 보이는 배치 결과만 관찰했다.

## 8. 미확인 사항과 검토 질문

- 다른 열 이동은 어떤 API 필드를 바꾸는가? board_group ID와 정렬값을 확인한다.
- 드롭 저장 실패 시 원위치로 복원되는가? 네트워크 실패 상태를 재현한다.
- 같은 열의 여러 카드를 재정렬하고 새로고침해 순서 저장 범위를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
