# Switching to list view 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `c9dfa93e-36ea-436f-bdef-bc876f4897c5` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=c9dfa93e-36ea-436f-bdef-bc876f4897c5) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

프로젝트 보드를 표 형태로 전환하고 프로젝트별 요약 정보·행 메뉴를 조회한다.

- 같은 두 프로젝트의 보드→List View. 표에서는 고객·태그·시작일·금액을 한 줄에 비교한다.
- 마지막은 Consulting Project 행의 액션 메뉴를 확인하는 상태이며 실행 결과는 없다.

- 상위 분석: [Projects](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_3ade80505ba3458cb239c839815b3750`](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 보드 목록 | List View 탭 선택, 프로젝트 두 행 표시. |
| 02 | [`sc_4ff59456df244ec089728cd491719a8e`](https://gummble.com/screens/sc_4ff59456df244ec089728cd491719a8e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 목록 표 | 첫 행 말줄임 메뉴 열림. |
| 03 | [`sc_e4e08776c0b942a18b26dc14fd258318`](https://gummble.com/screens/sc_e4e08776c0b942a18b26dc14fd258318?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 프로젝트 목록 행 메뉴 | 메뉴 조회로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 보드 목록

- Screen ID: `sc_3ade80505ba3458cb239c839815b3750`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3ade80505ba3458cb239c839815b3750?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/640cef91-a4b8-48f4-b2db-8cbaf7232903.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_4ff59456df244ec089728cd491719a8e`

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

### 단계 02 — 프로젝트 목록 표

- Screen ID: `sc_4ff59456df244ec089728cd491719a8e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4ff59456df244ec089728cd491719a8e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/46214860-21f7-49d1-952f-467fc02f4fe1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_3ade80505ba3458cb239c839815b3750` → 현재 → `sc_e4e08776c0b942a18b26dc14fd258318`

#### 화면에서 직접 확인한 내용

- 레이아웃: List View 활성. 검색·Filters·New Project 아래 표.
- 입력 항목·필수 표시·기본값: Title, Client, Tags, Start Date, Due, Paid. Consulting Project/Sample Client/Sample/Feb7 2024/$0/$0; Design Project with Doe Studio/Doe Company/Feb6/$0/$0.
- 버튼·메뉴·안내 문구: 제목·시작일 정렬 아이콘, 행 말줄임, Board View.
- 확인된 상태: 프로젝트2개 표 조회.
- 단계 간 변화: List View 탭 선택, 프로젝트 두 행 표시.

#### 동작과 데이터

- 화면 관찰: Due가 화폐 값임을 확인. 제목 앞 색 점은 상태 표현으로 보인다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 색 점 툴팁·금액 산식·통화·페이지네이션.

#### 모델링 영향

- 후보와 근거: 목록 요약 필드와 청구 집계 투영.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 목록 행 메뉴

- Screen ID: `sc_e4e08776c0b942a18b26dc14fd258318`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e4e08776c0b942a18b26dc14fd258318?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c22587ed-6696-4a37-b9d3-cd2de03db18a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_4ff59456df244ec089728cd491719a8e` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 첫 행 오른쪽 말줄임 아래 흰색 메뉴.
- 입력 항목·필수 표시·기본값: 표 값은 유지.
- 버튼·메뉴·안내 문구: View Project, Mark Completed, Archive Project, Delete Project.
- 확인된 상태: 행 액션 조회 상태.
- 단계 간 변화: 첫 행 말줄임 메뉴 열림.

#### 동작과 데이터

- 화면 관찰: 조회와 수명주기 작업이 구분되어 있다. 실행은 없음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 행별 권한·태그 편집 경로·확인 모달.

#### 모델링 영향

- 후보와 근거: 행 컨텍스트에 따른 액션 메뉴 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: Due는 날짜가 아니라 $0.00 금액 열이다. 작업 기한 또는 프로젝트 종료일로 오인하지 않는다.
- 관찰: Title과 Start Date에 정렬 아이콘이 있다. 현재 정렬 기준·다중 정렬 지원은 미확인.
- 관찰: 목록 메뉴는 View Project/완료/보관/삭제이며 보드 카드의 Tags 메뉴와 구성이 다르다.

## 6. 공식 도움말과 API 대조

- [Project settings](https://help.hellobonsai.com/en/articles/1284945-editing-your-project-s-settings): 현행 도움말은 제목·날짜 자동 저장과 별도 설정 메뉴를 설명한다. 이 캡처는 Settings 탭과 Save Changes 방식으로 서로 다르다.
- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 동일 프로젝트의 보드/목록 조회 모델. 보기 변경이 새 데이터 객체를 만드는 것은 아니다.
- 청구 잔액 Due와 Paid 집계는 프로젝트의 시작일·종료일과 분리한다. 구체 집계 정의는 인보이스와 대조한다.
- 사용자별 뷰·정렬·열 구성 저장 후보; 현재 화면만으로 저장 범위는 미확정.

## 8. 미확인 사항과 검토 질문

- Due/Paid의 정확한 포함 상태·통화 환산·환불 처리는 무엇인가? 인보이스 데이터를 달리하여 확인한다.
- 태그가 표에서 직접 편집 가능한가? 보드 메뉴와 비교한다.
- 정렬·열 너비·표시 열 설정은 사용자별로 저장되는가? 재진입·다른 멤버로 검증한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
