# Archiving a task 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=cb1a0f7a-140a-42c9-a1a1-cae4c5d2fc9e) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

시간 기록이 있는 작업의 상세 메뉴에서 아카이브하여 활성 보드에서 숨기는 흐름이다.

- 대상 Initial Chat의 패널에7초와1시간 기록이 보인다. 뒤 보드에는 같은 이름 카드가2개라 레코드 식별에 주의한다.
- 마지막 보드에는 Initial Chat1개가 남고 보관 성공 메시지가 보인다. 동일 제목의 나머지 작업까지 보관한 것은 아니다.
- 삭제 확인 흐름과 별도로 비교하며 실제 계정 보관은 실행하지 않았다.

- 상위 분석: [Adding a task](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_ea042f68264945369fcad12326916b22`](https://gummble.com/screens/sc_ea042f68264945369fcad12326916b22?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 보관할 작업의 시간 기록 상세 | 작업 상세 말줄임 메뉴 열림. |
| 02 | [`sc_687782a0c44149d1963c1ff835f730fd`](https://gummble.com/screens/sc_687782a0c44149d1963c1ff835f730fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 상세 보관 메뉴 | 패널이 닫히고 보드에서 한 Initial Chat가 사라짐, 아카이브 성공 토스트. |
| 03 | [`sc_4146f54be90443f8b6b7e1a98b3f74d9`](https://gummble.com/screens/sc_4146f54be90443f8b6b7e1a98b3f74d9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 보관 성공 | 활성 보드 결과로 종료. 아카이브 조회·복원은 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 보관할 작업의 시간 기록 상세

- Screen ID: `sc_ea042f68264945369fcad12326916b22`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ea042f68264945369fcad12326916b22?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/daa9a1f8-ab47-418d-97e3-f86f8114174c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_687782a0c44149d1963c1ff835f730fd`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tasks 보드 위 오른쪽 작업 패널. 시간 합계 아래 펼친 두 기록, 설명·Files·Subtasks.
- 입력 항목·필수 표시·기본값: Initial Chat/In Progress/Feb6/Joe Doe, 총01:00:07.7초와1시간 기록 모두 Joe Doe/Feb6.
- 버튼·메뉴·안내 문구: 작업 말줄임, 시간 펼침/접기, Add File, Add Subtask.
- 확인된 상태: 시간이 있는 작업 상세. 배경에 같은 제목 카드2개.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 시간 기록이 연결된 작업이라는 맥락이 중요하다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 두 같은 제목 카드의ID·어떤 작업이 시간기록 보유인지.

#### 모델링 영향

- 후보와 근거: 작업ID와 시간기록 연결·보관 영향 검토 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 작업 상세 보관 메뉴

- Screen ID: `sc_687782a0c44149d1963c1ff835f730fd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_687782a0c44149d1963c1ff835f730fd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/069576ef-7091-43db-8720-97bab90d5e8e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ea042f68264945369fcad12326916b22` → 현재 → `sc_4146f54be90443f8b6b7e1a98b3f74d9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 패널 오른쪽 위 말줄임 아래 메뉴. 시간 목록은 유지.
- 입력 항목·필수 표시·기본값: 입력 항목 없음.
- 버튼·메뉴·안내 문구: Unfollow, Copy Link, Archive, Delete.
- 확인된 상태: 아카이브 선택 전 메뉴 상태.
- 단계 간 변화: 작업 상세 말줄임 메뉴 열림.

#### 동작과 데이터

- 화면 관찰: 활성 작업을 보관하는 진입점과 삭제를 구분한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 보관 확인·권한·실패 안내.

#### 모델링 영향

- 후보와 근거: 보관 액션과 삭제 액션 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 작업 보관 성공

- Screen ID: `sc_4146f54be90443f8b6b7e1a98b3f74d9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4146f54be90443f8b6b7e1a98b3f74d9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/05f7c0ca-92db-4666-b18e-7b1044059c6e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_687782a0c44149d1963c1ff835f730fd` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 패널 닫힘, Tasks 보드의 Initial Chat가2개에서1개. Untitled는 유지. 우측 아래 토스트.
- 입력 항목·필수 표시·기본값: 남은 Initial Chat In Progress/Today/JD.
- 버튼·메뉴·안내 문구: Your task has been archived, New Task.
- 확인된 상태: 활성 보드에서 대상 제외.
- 단계 간 변화: 패널이 닫히고 보드에서 한 Initial Chat가 사라짐, 아카이브 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 보관 성공을 피드백과 카드 수 변화로 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아카이브 조회·복구·시간기록/보고서 유지.

#### 모델링 영향

- 후보와 근거: 활성 조회 필터와 작업 보관 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: Archive와 Delete가 다른 선택지다.
- 관찰: 시간기록이 표시된 작업에서 Archive 메뉴를 사용할 수 있다.
- 관찰: 중간 확인 모달은 이3개 캡처에 없다. 제품에 확인 과정이 전혀 없다고 단정하지 않는다.
- 미확인: 기록·청구·첨부·하위 항목의 유지, 보고서 포함 여부, 복원 경로.

## 6. 공식 도움말과 API 대조

- [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai): 작업 관리에서 Archive와 영구 Delete를 별도로 제공한다. 세부 보관 복원 규칙은 이 문서만으로 확정하지 않는다.
- [Tasks API](https://docs.hellobonsai.com/api/tag/tasks): GET/POST `/public-api/v1/tasks`, GET/PATCH/DELETE `/public-api/v1/tasks/{uuid}`, GET `/public-api/v1/tasks/{task_id}/subtasks`가 공개되어 있다. 설명상 프로젝트·상위 작업 연결은 선택적이다. 이 페이지에서 개별 요청 필드는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 작업의 진행 상태와 아카이브 상태를 구분할 후보. 보관을 Done 전환 또는 삭제로 처리하면 관찰된 액션 차이를 잃는다.
- 이름 대신 작업ID로 대상과 연관 시간기록을 연결해야 한다.
- FE 후보: 상세 패널 메뉴→닫힘→활성 보드 대상 제외→성공 토스트.

## 8. 미확인 사항과 검토 질문

- 보관 작업의 시간·청구 합계는 계속 포함되는가? 보관 전후 Time Tracking/인보이스를 대조한다.
- 복원 메뉴·필터와 복원 후 이전 상태·순서·담당자 보존을 확인한다.
- 동일 제목 두 작업 중 어떤 ID가 보관됐는지 로컬 캡처/실계정으로 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
