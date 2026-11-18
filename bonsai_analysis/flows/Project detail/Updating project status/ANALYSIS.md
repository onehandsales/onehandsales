# Updating project status 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ac1750e4-906b-47f6-ad41-18c1861d4f71` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ac1750e4-906b-47f6-ad41-18c1861d4f71) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

프로젝트의 진행 단계를 선택하고 별도의 완료·보관·삭제 메뉴를 확인하는 흐름이다.

- 시작 New Lead 개요 → 상태 선택 → Proposal Sent 표시 → 추가 액션 메뉴.
- 마지막 캡처는 다시 New Lead이며 되돌린 동작이 수록되지 않았다. 상태 변경 실패로 단정하지 않는다.
- 프로젝트 진행 단계와 완료/아카이브 액션은 UI 위치와 의미가 다르다.

- 상위 분석: [Project detail](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Project detail/Updating project status`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_adeac0011d87480980cfd58e53e4d751`](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 상세의 빈 개요](<screens/01_sc_adeac0011d87480980cfd58e53e4d751.png>) | 상태 배지의 선택 메뉴를 펼침. |
| 02 | [`sc_ca52e796b2db4941927f959822ce3ff6`](https://gummble.com/screens/sc_ca52e796b2db4941927f959822ce3ff6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 상태 드롭다운](<screens/02_sc_ca52e796b2db4941927f959822ce3ff6.png>) | Proposal Sent 표시 상태. |
| 03 | [`sc_7b0550836abf4b1fbb2ef374011e6538`](https://gummble.com/screens/sc_7b0550836abf4b1fbb2ef374011e6538?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 진행 상태 변경 표시](<screens/03_sc_7b0550836abf4b1fbb2ef374011e6538.png>) | 추가 액션 메뉴. 상태는 New Lead로 달라짐; 되돌림 과정 미수록. |
| 04 | [`sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef`](https://gummble.com/screens/sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로젝트 추가 액션 메뉴](<screens/04_sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef.png>) | 메뉴 관찰로 종료. 완료·보관·삭제 실행 결과는 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 프로젝트 상세의 빈 개요

- Screen ID: `sc_adeac0011d87480980cfd58e53e4d751`
- 원본: [화면 페이지](https://gummble.com/screens/sc_adeac0011d87480980cfd58e53e4d751?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4562b3e8-1ba5-461e-81bd-766674cf2aed.png)
- 로컬 이미지: [01_sc_adeac0011d87480980cfd58e53e4d751.png](<screens/01_sc_adeac0011d87480980cfd58e53e4d751.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_ca52e796b2db4941927f959822ce3ff6`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단에 프로젝트 제목·연필, 고객명·Automations, 우측 상태·말줄임·멤버 추가. 아래 Overview/Invoices/Tasks/Time Tracking/Team/Settings 탭과 고정 왼쪽 내비게이션. 본문 좌측 Tasks와 Recent Activity, 우측 Documents & Links, Invoices/Expenses 요약 카드.
- 입력 항목·필수 표시·기본값: Design Project with Doe, Doe Company, New Lead. 작업·문서 없음. 청구·비용 수치0.
- 버튼·메뉴·안내 문구: Tasks 새 작업/템플릿, 각 영역+; Send Email, Forwarding Email, Automations.
- 확인된 상태: 프로젝트 생성 활동1개와 빈 업무 영역.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 프로젝트 생성 이력에 주체·제목·시각이 표시된다. 이메일 발송은 실행하지 않았다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 주체 JS/JD 표기의 관계·시간대·활동 공개 범위.

#### 모델링 영향

- 후보와 근거: 프로젝트 기본정보, 활동이력, 관련 업무 집계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 프로젝트 상태 드롭다운

- Screen ID: `sc_ca52e796b2db4941927f959822ce3ff6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ca52e796b2db4941927f959822ce3ff6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fe5448e2-491b-4104-b515-e6b0443726bc.png)
- 로컬 이미지: [02_sc_ca52e796b2db4941927f959822ce3ff6.png](<screens/02_sc_ca52e796b2db4941927f959822ce3ff6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_adeac0011d87480980cfd58e53e4d751` → 현재 → `sc_7b0550836abf4b1fbb2ef374011e6538`

#### 화면에서 직접 확인한 내용

- 레이아웃: 헤더 오른쪽 New Lead 아래 세로 메뉴. 본문 Overview는 유지.
- 입력 항목·필수 표시·기본값: New Lead, Proposal Sent, Contract Signed, In Progress, In Review의 색상 배지.
- 버튼·메뉴·안내 문구: 각 상태 선택 행, 메뉴 닫힘 화살표.
- 확인된 상태: 현재 New Lead. 단계 라벨 목록이 펼쳐진 상태.
- 단계 간 변화: 상태 배지의 선택 메뉴를 펼침.

#### 동작과 데이터

- 화면 관찰: 프로젝트 상태의 후보 목록을 직접 확인했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 사용자 정의 여부·선택 권한·다른 상태가 스크롤 아래 있는지.

#### 모델링 영향

- 후보와 근거: 상태 정의 ID·이름·색·순서와 프로젝트 현재 단계 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 프로젝트 진행 상태 변경 표시

- Screen ID: `sc_7b0550836abf4b1fbb2ef374011e6538`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7b0550836abf4b1fbb2ef374011e6538?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e531ff26-1ebd-4b37-9633-054451f484b3.png)
- 로컬 이미지: [03_sc_7b0550836abf4b1fbb2ef374011e6538.png](<screens/03_sc_7b0550836abf4b1fbb2ef374011e6538.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_ca52e796b2db4941927f959822ce3ff6` → 현재 → `sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef`

#### 화면에서 직접 확인한 내용

- 레이아웃: 선택 메뉴가 닫히고 헤더에 Proposal Sent의 주황 배지.
- 입력 항목·필수 표시·기본값: Tasks/문서 비어 있음, 나머지 금액0.
- 버튼·메뉴·안내 문구: Proposal Sent 드롭다운, 말줄임.
- 확인된 상태: 상태 표시만 바뀌었으며 명시적 토스트는 없음.
- 단계 간 변화: Proposal Sent 표시 상태.

#### 동작과 데이터

- 화면 관찰: 문서 없음과 Proposal Sent 라벨이 동시에 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 영속 저장·자동 알림·프로젝트 보드 동기화.

#### 모델링 영향

- 후보와 근거: 진행 단계와 제안서 실제 전송 상태를 분리하는 근거.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 프로젝트 추가 액션 메뉴

- Screen ID: `sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef`
- 원본: [화면 페이지](https://gummble.com/screens/sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8238886d-ec5a-4bfe-9e7b-ae1b91b74246.png)
- 로컬 이미지: [04_sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef.png](<screens/04_sc_84ce1c2cec9c4e9d9fd6b9bcda62e9ef.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7b0550836abf4b1fbb2ef374011e6538` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 말줄임 아래 흰색 메뉴, 상태 배지는 다시 New Lead.
- 입력 항목·필수 표시·기본값: 입력 폼 없음.
- 버튼·메뉴·안내 문구: Preview as Client, Preview as Collaborator, Mark Completed, Archive, Delete.
- 확인된 상태: 추가 액션을 열어 본 상태. 실행 결과는 없음.
- 단계 간 변화: 추가 액션 메뉴. 상태는 New Lead로 달라짐; 되돌림 과정 미수록.

#### 동작과 데이터

- 화면 관찰: 역할 미리보기·완료·보관·삭제의 존재를 확인. Proposal Sent에서 되돌린 과정은 생략.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 확인 모달·복구·연관 문서와 시간기록의 영향.

#### 모델링 영향

- 후보와 근거: 역할별 화면 미리보기와 수명주기 액션 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 드롭다운에 New Lead, Proposal Sent, Contract Signed, In Progress, In Review가 보인다. 전체 계정 공통 고정값인지 미확인.
- 관찰: 상태를 Proposal Sent로 바꾼 화면에도 문서 없음 안내가 유지된다. 실제 제안서 발송과 동일한 이벤트로 간주하지 않는다.
- 관찰: Preview as Client/Collaborator, Mark Completed, Archive, Delete는 말줄임 메뉴에 별도로 있다.
- 문서 확인: 완료·보관·삭제는 데이터 보존과 접근 결과가 다르다. 캡처에서는 실행하지 않았다.

## 6. 공식 도움말과 API 대조

- [Projects API](https://docs.hellobonsai.com/api/tag/projects): GET/POST `/public-api/v1/projects`, PATCH `/public-api/v1/projects/{id}`와 별도 budget 생성·수정·삭제 작업을 확인했다. 프로젝트는 고객 업무를 묶고 작업·시간·인보이스를 연결하는 리소스다. 개별 요청 필드와 내부 저장 구조는 이 그룹 설명으로 확정하지 않는다.
- [완료·보관·삭제 도움말](https://help.hellobonsai.com/en/articles/1867536-completing-archiving-or-deleting-a-project): 완료/보관 복원과 영구 삭제를 구분하며 완료가 태그·진행 상태를 자동 변경하지 않는다고 설명한다. 보관 관련 본문은 고객 문서 접근 유지, FAQ는 보관 프로젝트의 고객 포털 비노출을 설명하므로 문서 링크 직접 접근과 포털 목록 접근을 나눠 재검증한다.

## 7. 데이터 모델링 시사점

- 진행 단계와 완료/보관 수명주기를 별도 개념으로 검토한다. 하나의 enum에 섞기 전에 상호 조합을 확인한다.
- 상태 라벨·색·순서·프로젝트 연결 후보. 제안서 발송 여부는 실제 문서의 상태에서 확인한다.
- 삭제 영향은 공식 설명과 전체 연관 리소스를 대조한 후 결정하며 현 단계에서 cascade를 확정하지 않는다.

## 8. 미확인 사항과 검토 질문

- 진행 상태는 사용자 정의 가능한가? 보드 상태 설정과 공개 Board Groups API를 대조한다.
- 상태 선택의 저장 피드백·권한 오류·되돌림 이력이 있는가? 네트워크와 활동 영역을 확인한다.
- 보관 후 포털 목록과 기존 공유 문서 링크 접근은 각각 어떻게 되는가? 별도 테스트 계정으로 확인한다.
- Mark Completed 뒤 기존 New Lead가 유지되는지 확인하고 수명주기와 진행 상태의 관계를 결정한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
