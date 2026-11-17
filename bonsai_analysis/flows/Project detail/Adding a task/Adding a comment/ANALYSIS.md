# Adding a comment 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `1a0794d4-deb5-4eb3-b391-c7371c60e684` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=1a0794d4-deb5-4eb3-b391-c7371c60e684) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

작업 Activity에 업무 댓글을 작성하여 사용자·시각과 함께 이력에 추가하는 흐름이다.

- 작업 패널을 아래로 스크롤한 상태에서 시작한다. 하위 작업2개와 기존 할당/상태 이벤트가 있다.
- 댓글 내용은 통화 후 제안서 준비 메모다. 작성 결과는 활동 목록에 추가되고 입력창은 비워진다.
- 이 플로우의 Files 위 붉은 가로선은 원본 이미지의 표시다. 제품 UI인지 캡처 주석인지 미확인이라 구현 요구로 확정하지 않는다.

- 상위 분석: [Adding a task](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf`](https://gummble.com/screens/sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 활동과 빈 댓글 입력 | 빈 댓글 입력창에 내용 입력. |
| 02 | [`sc_afa221beae71493fa547575acdcfbcee`](https://gummble.com/screens/sc_afa221beae71493fa547575acdcfbcee?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 댓글 입력 완료 | 입력한 댓글이 활동에 추가되고 입력창은 비워짐. |
| 03 | [`sc_f9353ec9e656421a9adf022fa0fd02ed`](https://gummble.com/screens/sc_f9353ec9e656421a9adf022fa0fd02ed?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 댓글 추가 결과 | 댓글 작성 결과로 종료. 알림 수신·편집·삭제는 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 작업 활동과 빈 댓글 입력

- Screen ID: `sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf`
- 원본: [화면 페이지](https://gummble.com/screens/sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7b6a0b72-b157-41ff-a87d-972cad915bcd.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_afa221beae71493fa547575acdcfbcee`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 패널 아래 부분. Files·Subtasks·Activity. 왼쪽 프로젝트 개요는 그대로.
- 입력 항목·필수 표시·기본값: Send invite 완료/JD, Prepare a deck 미완료. 댓글 입력 비어 있음. 기존 할당·진행 이벤트.
- 버튼·메뉴·안내 문구: Add a comment…, 연한 Add Comment, +Add Subtask. Add File 위 붉은 선.
- 확인된 상태: 댓글 작성 전. 자동 이벤트 두 항목이 위에 있다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 기존 상태 이벤트와 새 사용자 입력 영역을 구분.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 붉은 선 의미·댓글 표시 범위·빈 제출 가능성.

#### 모델링 영향

- 후보와 근거: 활동 목록과 댓글 입력 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 작업 댓글 입력 완료

- Screen ID: `sc_afa221beae71493fa547575acdcfbcee`
- 원본: [화면 페이지](https://gummble.com/screens/sc_afa221beae71493fa547575acdcfbcee?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fe7d4132-91fd-4806-a7f7-572b8d52fd5a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_dfaae9980c7c49f5b05aa2d3f0f3a1bf` → 현재 → `sc_f9353ec9e656421a9adf022fa0fd02ed`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 스크롤 위치와 구성.
- 입력 항목·필수 표시·기본값: To prepare a proposal after this call 입력.
- 버튼·메뉴·안내 문구: 진한 초록 Add Comment.
- 확인된 상태: 댓글이 입력창에만 존재.
- 단계 간 변화: 빈 댓글 입력창에 내용 입력.

#### 동작과 데이터

- 화면 관찰: 입력 후 제출 버튼의 시각적 상태가 바뀌었다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 엔터 제출·글자 제한·자동 초안 저장.

#### 모델링 영향

- 후보와 근거: 댓글 초안과 제출 요청 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 작업 댓글 추가 결과

- Screen ID: `sc_f9353ec9e656421a9adf022fa0fd02ed`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f9353ec9e656421a9adf022fa0fd02ed?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a83aeedb-1989-4ce3-ad3b-fff5d8d22a06.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_afa221beae71493fa547575acdcfbcee` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 기존 활동 아래 Joe Doe·상대시각·댓글 한 행. 아래에 빈 입력창이 다시 보임.
- 입력 항목·필수 표시·기본값: 저장된 댓글 표시 내용은 입력과 같음. 입력창은 비워짐.
- 버튼·메뉴·안내 문구: 댓글 우측 말줄임, 연한 Add Comment.
- 확인된 상태: 새 댓글 표시와 입력 초기화.
- 단계 간 변화: 입력한 댓글이 활동에 추가되고 입력창은 비워짐.

#### 동작과 데이터

- 화면 관찰: 댓글 작성 성공을 목록 변화로 확인. 별도 토스트·알림 수신은 없음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 재조회 영속성·행 메뉴·전달된 알림.

#### 모델링 영향

- 후보와 근거: 댓글 레코드와 이벤트 정렬·입력 초기화 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 빈 입력의 Add Comment는 연한 초록, 내용 입력 후 진한 초록이다. 실제 disabled 속성은 미확인.
- 관찰: 사용자 댓글에는 본문과 말줄임이 있고 기존 자동 이벤트는 회색 기울임 문구다.
- 미확인: 댓글 공개 범위·알림·멘션·편집/삭제·빈 공백 제출 처리.

## 6. 공식 도움말과 API 대조

- [Comments API](https://docs.hellobonsai.com/api/tag/comments): GET/POST `/public-api/v1/tasks/{task_id}/comments`를 확인했다. 설명은 작업/거래 토론과 자동 활동 항목을 함께 다룬다. 메시지 본문 필드 이름·수정/삭제 작업은 이 그룹 페이지에서 확인하지 못했다.
- [작업 생성·추적 도움말](https://help.hellobonsai.com/en/articles/5182750-how-to-create-and-track-tasks-with-bonsai): 작업·하위 작업 기능을 대조했으나 댓글 알림 상세 규칙은 이 검토의 출처로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 작업에 귀속된 댓글 ID·작성자·본문·작성시각·활동 유형 후보.
- 사용자 댓글과 시스템 이벤트의 표현을 구분하고 권한·수정 이력을 별도 검토한다.
- FE 후보: 댓글 로컬 입력·제출 가능 표시·전송 후 초기화·활동 목록 추가·행 메뉴.

## 8. 미확인 사항과 검토 질문

- 댓글이 프로젝트 고객·외부 협업자에게도 보이는가? Preview와 역할 계정으로 검증한다.
- 말줄임에는 수정/삭제가 있는가? 작성자와 다른 멤버의 메뉴를 비교한다.
- 멘션·첨부·Markdown·줄바꿈·중복 요청 처리를 추가 캡처와 API로 확인한다.
- 붉은 선이 원본 캡처 주석인지 실제 UI인지 사용자 다운로드 원본과 대조한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
