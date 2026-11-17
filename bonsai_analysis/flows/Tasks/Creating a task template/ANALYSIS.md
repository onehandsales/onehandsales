# Creating a task template 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `4c98a858-6ef7-4a6a-8e83-e626772a4df0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=4c98a858-6ef7-4a6a-8e83-e626772a4df0) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

재사용 작업 목록의 이름을 정해 빈 작업 템플릿을 만드는 흐름이다.

- 시작은 Templates 빈 상태. 종료는 Default Task 제목과 작업0개 안내·생성 성공 토스트.
- 이 단계는 템플릿 컨테이너를 만들며 실제 프로젝트 작업 생성은 Adding a task (template)에서 수행한다.

- 상위 분석: [Tasks](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_6ec51256385940f2bd7d36a76874d691`](https://gummble.com/screens/sc_6ec51256385940f2bd7d36a76874d691?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 템플릿 빈 상태 | New Task Template 모달 표시. |
| 02 | [`sc_f38d24ed977448da8e9f4a82a4403686`](https://gummble.com/screens/sc_f38d24ed977448da8e9f4a82a4403686?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 새 작업 템플릿 이름 입력 모달 | Template Name에 Default Task 입력. |
| 03 | [`sc_ca533f6c3a4e43759ed9b62cfad3a964`](https://gummble.com/screens/sc_ca533f6c3a4e43759ed9b62cfad3a964?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 템플릿 이름 입력 완료 | 템플릿 상세와 생성 성공 메시지로 전환. |
| 04 | [`sc_e6ee191223c2486caf3d9d87a12154e8`](https://gummble.com/screens/sc_e6ee191223c2486caf3d9d87a12154e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 빈 템플릿 생성 성공 | 작업 없는 템플릿 생성 완료. 내용 추가는 Editing a template task에서 확인. |

## 4. 화면별 상세 분석

### 단계 01 — 작업 템플릿 빈 상태

- Screen ID: `sc_6ec51256385940f2bd7d36a76874d691`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6ec51256385940f2bd7d36a76874d691?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/42fe693c-2c8d-48b2-a0b5-5eeb79e1115c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_f38d24ed977448da8e9f4a82a4403686`

#### 화면에서 직접 확인한 내용

- 레이아웃: Templates 탭 선택. 큰 소개 카드 왼쪽은 예시 그림, 오른쪽은 설명과 New Template.
- 입력 항목·필수 표시·기본값: 실제 입력 폼은 없다. 그림의 Research/Wireframes 등은 소개용 콘텐츠.
- 버튼·메뉴·안내 문구: Prefill Tasks With Templates, New Template, Contact Support.
- 확인된 상태: 관리할 템플릿 목록 대신 초기 안내를 보여준다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 템플릿 기능의 재사용 목적을 설명한다. 그림을 실제 저장 데이터로 읽지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 템플릿 보유 여부·사용 권한·빈 목록의 정확한 조건.

#### 모델링 영향

- 후보와 근거: 템플릿 정의와 빈 상태 플래그/조회 결과, 도움말 링크 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 새 작업 템플릿 이름 입력 모달

- Screen ID: `sc_f38d24ed977448da8e9f4a82a4403686`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f38d24ed977448da8e9f4a82a4403686?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5733cf05-48e8-49b6-a231-bf12884cfce5.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_6ec51256385940f2bd7d36a76874d691` → 현재 → `sc_ca533f6c3a4e43759ed9b62cfad3a964`

#### 화면에서 직접 확인한 내용

- 레이아웃: 배경을 어둡게 덮고 중앙 위쪽에 좁은 흰색 모달. 오른쪽 바깥에 닫기X, 아래 지원 링크.
- 입력 항목·필수 표시·기본값: Template Name 단일 입력. 회색 Default Project Tasks 예시. 필수 별표 없음.
- 버튼·메뉴·안내 문구: Create Template, 닫기X, Contact Support.
- 확인된 상태: 아직 값 미입력 상태로 보이지만 버튼은 초록색이다.
- 단계 간 변화: New Task Template 모달 표시.

#### 동작과 데이터

- 화면 관찰: 빈 폼 상태와 제출 버튼 존재를 확인. 클릭 가능·검증결과는 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 이름필수·중복·최대길이·닫기취소 의미.

#### 모델링 영향

- 후보와 근거: 템플릿 이름과 생성 폼의 입력/검증 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 템플릿 이름 입력 완료

- Screen ID: `sc_ca533f6c3a4e43759ed9b62cfad3a964`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ca533f6c3a4e43759ed9b62cfad3a964?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/35e1a459-73a2-4594-84fb-2774fa0189b6.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f38d24ed977448da8e9f4a82a4403686` → 현재 → `sc_e6ee191223c2486caf3d9d87a12154e8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 앞 모달과 같은 배치.
- 입력 항목·필수 표시·기본값: Template Name=Default Task.
- 버튼·메뉴·안내 문구: Create Template, 닫기X.
- 확인된 상태: 텍스트가 진한 색으로 입력되어 있다.
- 단계 간 변화: Template Name에 Default Task 입력.

#### 동작과 데이터

- 화면 관찰: 제출할 이름이 설정되었으나 아직 결과 화면이 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 엔터제출·중복요청 방지·생성권한.

#### 모델링 영향

- 후보와 근거: 생성요청 이름과 모달 로컬 입력 상태.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 빈 템플릿 생성 성공

- Screen ID: `sc_e6ee191223c2486caf3d9d87a12154e8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e6ee191223c2486caf3d9d87a12154e8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/de695714-2309-489c-868e-d882db2fb37f.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ca533f6c3a4e43759ed9b62cfad3a964` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Templates 탭 아래 Default Task 제목·연필 아이콘. 오른쪽 New Task. 가운데 큰 빈 목록 박스, 오른쪽 아래 토스트.
- 입력 항목·필수 표시·기본값: 작업0개. 입력 폼은 닫혔다.
- 버튼·메뉴·안내 문구: No tasks created yet / Create a new task, New Task, 이름 연필, 생성 성공 토스트 닫기.
- 확인된 상태: 이름이 있는 템플릿 상세와 성공 피드백.
- 단계 간 변화: 템플릿 상세와 생성 성공 메시지로 전환.

#### 동작과 데이터

- 화면 관찰: 템플릿 생성은 관찰되지만 구성 작업은 아직 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 연필 편집 결과·여러 템플릿 간 선택 방식.

#### 모델링 영향

- 후보와 근거: 템플릿 컨테이너와 작업 컬렉션의 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 이름을 넣고 생성한 후에도 작업 목록이 비어 있다. 템플릿과 그 구성 작업의 생성을 분리한다.
- 관찰: 회색 Default Project Tasks는 placeholder로 보이고 제출 이름은 Default Task다.
- 미확인: 빈 이름 제출·이름 중복·닫기 시 미저장 내용 처리.

## 6. 공식 도움말과 API 대조

- [Task templates 도움말](https://help.hellobonsai.com/en/articles/11488590-leveraging-task-templates): 템플릿은 여러 작업·하위 작업을 담는 재사용 목록이다. 현행 진입은 New Task의 Manage Templates이며 캡처의 Templates 탭과 다르다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): 공개 Templates는 현재 문서 템플릿을 대상으로 명시한다. Task Template 생성·편집 API로 오인하지 않는다.

## 7. 데이터 모델링 시사점

- 템플릿 ID/이름과 구성 작업 컬렉션 후보. 작업0개인 템플릿을 허용하는 UI가 관찰된다.
- 템플릿 이름 편집 아이콘·New Task·빈 목록·성공 토스트를 FE에 반영한다.

## 8. 미확인 사항과 검토 질문

- 중복 이름을 허용하는가? 같은 이름으로 두 번 생성해 확인한다.
- 템플릿 소유 범위와 편집권한은 개인/팀 중 무엇인가? 역할별 조회를 대조한다.
- 이름 입력 길이·공백 정규화·서버 오류 문구를 확인해야 한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
