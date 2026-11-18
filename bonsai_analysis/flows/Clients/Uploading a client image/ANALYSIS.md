# Uploading a client image 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `44e00e8a-aa9f-41f1-b9bc-682789c80985` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=44e00e8a-aa9f-41f1-b9bc-682789c80985) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

고객 상세의 대표 이미지를 업로드해 고객 식별 표시를 바꾼다.

- 새 고객 Doe Company 상세에서 시작한다. 대표 이미지가 JS 이니셜로 나타난다.
- 파일 선택창·자르기 화면은 없으며 hover 표시와 최종 교체 이미지가 기록됐다.

- 상위 분석: [Clients](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Clients/Uploading a client image`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_b1619b6b9fc3405e8ad67fd26f405b62`](https://gummble.com/screens/sc_b1619b6b9fc3405e8ad67fd26f405b62?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 생성 완료 상세](<screens/01_sc_b1619b6b9fc3405e8ad67fd26f405b62.png>) | 대표 이미지 위에 Update Image 오버레이가 나타난다. |
| 02 | [`sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e`](https://gummble.com/screens/sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [대표 이미지 변경 진입](<screens/02_sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e.png>) | 파일 선택 과정 없이 인물 그림으로 교체되고 고객 업데이트 성공 알림이 나타난다. |
| 03 | [`sc_7a2bb697a852495e8fd9be9fe6563b0a`](https://gummble.com/screens/sc_7a2bb697a852495e8fd9be9fe6563b0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 대표 이미지 교체 완료](<screens/03_sc_7a2bb697a852495e8fd9be9fe6563b0a.png>) | 변경된 고객 상세에서 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 고객 생성 완료 상세

- Screen ID: `sc_b1619b6b9fc3405e8ad67fd26f405b62`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b1619b6b9fc3405e8ad67fd26f405b62?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d9454e4f-6a97-48e2-a6b3-193652751095.png)
- 로컬 이미지: [01_sc_b1619b6b9fc3405e8ad67fd26f405b62.png](<screens/01_sc_b1619b6b9fc3405e8ad67fd26f405b62.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 아바타·Doe Company·Client태그. 왼쪽Projects/Notes/Invoices, 오른쪽Active·연락처카드·AdditionalInfo/Forms.
- 입력 항목·필수 표시·기본값: Jane Doe 기본 연락처, 이메일, Active. 프로젝트/노트없음. JS아바타의 생성규칙 미확인.
- 버튼·메뉴·안내 문구: Add New Contact, 연락처/고객말줄임, 프로젝트+, NotesEdit, Edit Fields, 생성성공토스트.
- 확인된 상태: 1client추가성공과 빈 업무 상세.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 한 고객에 추가 연락처를 연결할 수 있는 진입점과 기본 연락처 표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아바타이니셜·추가연락처카디널리티·기본연락처정책.

#### 모델링 영향

- 후보와 근거: 회사와 기본/추가 연락처, 상태·태그·연관업무 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 대표 이미지 변경 진입

- Screen ID: `sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7ffaa133-909e-4df1-ac69-7f66e4ebe673.png)
- 로컬 이미지: [02_sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e.png](<screens/02_sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b1619b6b9fc3405e8ad67fd26f405b62` → 현재 → `sc_7a2bb697a852495e8fd9be9fe6563b0a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고객 제목 왼쪽 정사각형 이미지 영역 위에 회색 hover 오버레이. 본문 두 열 구성 유지.
- 입력 항목·필수 표시·기본값: 입력 폼 없음. 현재 고객 Doe Company, 연락처 Jane Doe, 상태 Active.
- 버튼·메뉴·안내 문구: Update Image 오버레이와 우상단 X. Projects +, Notes Edit, Edit Fields도 유지.
- 확인된 상태: 파일 선택 전 진입 상태. OS 파일 선택창은 보이지 않는다.
- 단계 간 변화: 대표 이미지 위에 Update Image 오버레이가 나타난다.

#### 동작과 데이터

- 화면 관찰: 이니셜 영역에서 업로드 진입 제어를 확인했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: hover인지 클릭 후 상태인지는 정적 화면만으로 확정할 수 없다. 파일 검증 미수록.

#### 모델링 영향

- 후보와 근거: 고객 대표 이미지 제어·호버 상태·제거 affordance 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 고객 대표 이미지 교체 완료

- Screen ID: `sc_7a2bb697a852495e8fd9be9fe6563b0a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7a2bb697a852495e8fd9be9fe6563b0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ae6fa3b5-203d-4dab-8914-192a4754559e.png)
- 로컬 이미지: [03_sc_7a2bb697a852495e8fd9be9fe6563b0a.png](<screens/03_sc_7a2bb697a852495e8fd9be9fe6563b0a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_1a5d9cd5fb3c48fd97c2c8a8d3d7019e` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 고객명 왼쪽 이미지가 보라색 배경 인물 그림으로 교체. 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: 다른 고객 기본값과 빈 목록은 유지. 필수 입력 추가 없음.
- 버튼·메뉴·안내 문구: Your client has been successfully updated. 이미지 X와 상세 편집 버튼.
- 확인된 상태: 업로드 후 성공 표시. 이미지 원본 파일명은 보이지 않는다.
- 단계 간 변화: 파일 선택 과정 없이 인물 그림으로 교체되고 고객 업데이트 성공 알림이 나타난다.

#### 동작과 데이터

- 화면 관찰: 고객 대표 이미지 표시가 바뀌었고 업데이트 알림이 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 업로드 처리시간·영구 URL·압축·실패 복구 미확인.

#### 모델링 영향

- 후보와 근거: 고객 이미지 참조 변경 및 성공 알림. 미디어와 고객의 연결 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 고객명·기본 연락처·빈 프로젝트와 노트는 유지된 채 대표 이미지만 바뀐다.
- [관찰] 이미지 우상단 X가 있지만 삭제 실행·확인·기본 이미지 복원은 수록되지 않았다.
- [미확인] 업로드 크기·종류·리사이즈 정책은 이 캡처에 없다.

## 6. 공식 도움말과 API 대조

- [회사·연락처 도움말](https://help.hellobonsai.com/en/articles/452120-how-to-create-and-manage-companies-and-contacts): 현행 회사는 이름만 필수이며 회사·연락처를 독립적으로 생성하고 다중 회사 연결과 기본 연락처를 지원한다. 이 캡처의 담당자명·이메일 필수 폼과 버전 차이가 있다.
- [Companies API](https://docs.hellobonsai.com/api/tag/companies): GET/POST `/public-api/v1/companies`, GET/PATCH `/public-api/v1/companies/{id}`, GET `/public-api/v1/companies/{id}/activities`를 확인했다. 대표 이미지 업로드의 전용 계약은 그룹 페이지로 확인하지 못했다.
- [포털 도움말](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal)의 헤더 이미지 제한은 포털 대상이다. 고객 대표 이미지에 동일 제한을 적용할 근거로 사용하지 않는다.

## 7. 데이터 모델링 시사점

- 고객 대표 이미지 참조·이니셜 대체 표시·파일 업로드 상태 후보. 담당자 프로필 사진과 고객 대표 이미지를 분리한다.
- 원본/썸네일 저장, 제거 후 복원, 접근 권한은 미확정.

## 8. 미확인 사항과 검토 질문

- X를 누르면 즉시 삭제되는가? 취소·오류·재업로드·새로고침 후 표시를 확인해야 한다.
- 지원 형식·최대 크기·자르기 비율은 업로드 입력 및 실패 화면으로 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
