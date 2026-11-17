# Deleting a task 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `7ca1185e-e3a0-460c-825e-68035a603593` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=7ca1185e-e3a0-460c-825e-68035a603593) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

프로젝트 작업 보드에서 Untitled 작업을 영구 삭제하고 목록에서 제거된 결과를 확인하는 흐름이다.

- 첫 보드의 Initial Chat는2개, 메뉴 진입 시1개로 줄어 있어 별도 아카이브 흐름과 시점이 연결된다. Untitled 삭제만의 결과로 기존 Initial Chat 감소를 설명하지 않는다.
- 삭제 대상은 Untitled 카드다. 시간이 표시되는 다른 작업과 혼동하지 않는다.
- 이 자료는 Gummble 정적 화면이며 실제 계정 삭제는 실행하지 않았다.

- 상위 분석: [Adding a task](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_8557a3e41edc402a8ebdf39022ee8d44`](https://gummble.com/screens/sc_8557a3e41edc402a8ebdf39022ee8d44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 내부 작업 보드 | Untitled 카드 메뉴. Initial Chat가1개 줄어든 중간 상태는 별도 아카이브 흐름과 대조. |
| 02 | [`sc_633af570057e4f50bdad39ba5cd111b0`](https://gummble.com/screens/sc_633af570057e4f50bdad39ba5cd111b0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 카드 삭제 메뉴 | Confirm Deletion 모달. |
| 03 | [`sc_33f6ac508d6e4c7794180abee8fcf138`](https://gummble.com/screens/sc_33f6ac508d6e4c7794180abee8fcf138?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 영구 삭제 확인 | Untitled 카드가 사라지고 삭제 성공 토스트. |
| 04 | [`sc_0886d3bb0d904283bae05691331a1627`](https://gummble.com/screens/sc_0886d3bb0d904283bae05691331a1627?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 삭제 성공 | 삭제 결과로 종료. 복구·연관 데이터 조회는 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 내부 작업 보드

- Screen ID: `sc_8557a3e41edc402a8ebdf39022ee8d44`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8557a3e41edc402a8ebdf39022ee8d44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5cade96a-c8d7-447f-97ad-405b04b36070.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_633af570057e4f50bdad39ba5cd111b0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. Tasks 탭과 검색·필터·Board·New Task, 세 상태 열.
- 입력 항목·필수 표시·기본값: To Do에 Untitled/No due date1개. In Progress에 Initial Chat/Today/JD 카드2개.
- 버튼·메뉴·안내 문구: New Task 분할 버튼, 각 열 새 작업.
- 확인된 상태: 앞 개요의 빈 상태와 달리 작업3개가 이미 존재한다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 동일 제목의 작업2개가 보이며 제목의 유일성을 가정할 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Untitled의 실제빈제목/표시대체값 구분·중복 생성 경위.

#### 모델링 영향

- 후보와 근거: 프로젝트 필터된 작업 조회, 중복 제목 허용 후보, nullable기한.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 작업 카드 삭제 메뉴

- Screen ID: `sc_633af570057e4f50bdad39ba5cd111b0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_633af570057e4f50bdad39ba5cd111b0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/003b21c0-bf6e-4ecc-ad2f-fe3ea5b85283.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8557a3e41edc402a8ebdf39022ee8d44` → 현재 → `sc_33f6ac508d6e4c7794180abee8fcf138`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tasks 보드 Untitled 카드 우측 말줄임 아래 메뉴. 상단에는 일시정지 타이머7초.
- 입력 항목·필수 표시·기본값: Untitled/No due date, 다른 Initial Chat1개.
- 버튼·메뉴·안내 문구: Unfollow, Copy Link, Archive, Delete.
- 확인된 상태: 삭제 대상 카드의 액션 메뉴.
- 단계 간 변화: Untitled 카드 메뉴. Initial Chat가1개 줄어든 중간 상태는 별도 아카이브 흐름과 대조.

#### 동작과 데이터

- 화면 관찰: 첫 단계의 Initial Chat2개와 달리1개만 있다. Untitled는 아직 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 줄어든 다른 작업의 경위·행별 권한.

#### 모델링 영향

- 후보와 근거: 작업별 액션과 조회 상태 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 작업 영구 삭제 확인

- Screen ID: `sc_33f6ac508d6e4c7794180abee8fcf138`
- 원본: [화면 페이지](https://gummble.com/screens/sc_33f6ac508d6e4c7794180abee8fcf138?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7853fd91-7a4e-4ca2-8a29-c16449f1871a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_633af570057e4f50bdad39ba5cd111b0` → 현재 → `sc_0886d3bb0d904283bae05691331a1627`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 오버레이, 중앙 Confirm Deletion 모달.
- 입력 항목·필수 표시·기본값: 입력 항목 없음. 작업을 영구 삭제할지 묻는 문구.
- 버튼·메뉴·안내 문구: 빨간 Delete Task, 바깥 닫기X.
- 확인된 상태: 최종 삭제 전 확인 상태.
- 단계 간 변화: Confirm Deletion 모달.

#### 동작과 데이터

- 화면 관찰: 영구 삭제 의미가 직접 안내된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 확인 취소·중복 클릭·연관 데이터 경고 여부.

#### 모델링 영향

- 후보와 근거: 삭제 확인 UI와 서버 삭제 명령 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 작업 삭제 성공

- Screen ID: `sc_0886d3bb0d904283bae05691331a1627`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0886d3bb0d904283bae05691331a1627?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/739e6069-87d2-4468-8fbb-9327426e01bf.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_33f6ac508d6e4c7794180abee8fcf138` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 보드 To Do 열이 비고 In Progress의 Initial Chat는 유지. 우측 아래 토스트.
- 입력 항목·필수 표시·기본값: Untitled 카드 없음.
- 버튼·메뉴·안내 문구: Your task has been deleted, 토스트닫기, 각 열 New Task.
- 확인된 상태: 대상 카드 제거와 삭제 성공 피드백.
- 단계 간 변화: Untitled 카드가 사라지고 삭제 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 보드에서 대상이 제거된 결과를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서버 재조회·복구·연결 데이터 삭제 범위.

#### 모델링 영향

- 후보와 근거: 대상ID 기반 목록 갱신과 삭제 결과 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: Delete는 Archive와 다른 메뉴다.
- 관찰: 확인 모달은 영구 삭제라고 안내하며 빨간 Delete Task 버튼을 사용한다.
- 관찰: 확인 후 Untitled만 없어지고 남은 Initial Chat는 유지된다.
- 미확인: 대상 작업의 하위 항목·첨부·시간·댓글이 있을 경우 삭제 영향과 권한 오류.

## 6. 공식 도움말과 API 대조

- [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai): 작업 삭제를 영구 삭제로 설명한다. 이 캡처의 확인 문구와 일치한다.
- [Tasks API](https://docs.hellobonsai.com/api/tag/tasks): GET/POST `/public-api/v1/tasks`, GET/PATCH/DELETE `/public-api/v1/tasks/{uuid}`, GET `/public-api/v1/tasks/{task_id}/subtasks`가 공개되어 있다. 설명상 프로젝트·상위 작업 연결은 선택적이다. 이 페이지에서 개별 요청 필드는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 삭제 명령과 보관 상태 변경을 분리한다. 캡처/문서는 사용자가 복구할 수 없는 삭제를 설명하지만 DB 물리 삭제 여부는 알 수 없다.
- 연관 시간·청구·댓글·첨부·하위 작업의 처리 정책은 전체 연결 검토 후 결정한다.
- FE 후보: 카드 메뉴, 삭제 확인 오버레이, 처리 결과 토스트·보드에서 대상 제거.

## 8. 미확인 사항과 검토 질문

- 시간기록/청구된 작업을 삭제하면 연결 데이터는 남는가? 테스트 데이터와 공개 API 응답으로 확인한다.
- 취소는 X·바깥 클릭·Esc 중 무엇을 지원하는가? 포커스 복원도 확인한다.
- 삭제 권한이 없는 멤버는 메뉴가 숨겨지는가, 오류가 나오는가? 역할별 대조가 필요하다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
