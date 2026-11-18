# Reordering questions 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **3/3단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `68ec72c2-b771-428b-98b7-256018628743` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=68ec72c2-b771-428b-98b7-256018628743) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 3단계 / 3단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 3개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

폼의 날짜 질문과 추가 문의 질문 순서를 바꾼다.

- 추가 질문이 이미 있는 편집기 하단에서 시작한다.

- 상위 분석: [Forms](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Forms/Reordering questions`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_d1b24e0b191f46eaa9c392aeca812d49`](https://gummble.com/screens/sc_d1b24e0b191f46eaa9c392aeca812d49?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [날짜 질문 추가](<screens/01_sc_d1b24e0b191f46eaa9c392aeca812d49.png>) | 추가 문의 질문의 도구를 표시한다. |
| 02 | [`sc_af5dbdf023694612a80512cb0ecbbe4c`](https://gummble.com/screens/sc_af5dbdf023694612a80512cb0ecbbe4c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [질문 이동 도구 노출](<screens/02_sc_af5dbdf023694612a80512cb0ecbbe4c.png>) | 이동 화살표를 사용한 것으로 이어지지만 클릭 자체는 미수록. |
| 03 | [`sc_3ebb421578544410aa1a06eea0f95a0c`](https://gummble.com/screens/sc_3ebb421578544410aa1a06eea0f95a0c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [질문 순서 변경 결과](<screens/03_sc_3ebb421578544410aa1a06eea0f95a0c.png>) | 날짜 질문이 추가 문의 질문 위로 이동한다. |

## 4. 화면별 상세 분석

### 단계 01 — 날짜 질문 추가

- Screen ID: `sc_d1b24e0b191f46eaa9c392aeca812d49`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d1b24e0b191f46eaa9c392aeca812d49?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/4349c7fb-e347-400b-99f5-e81d75ea85ab.png)
- 로컬 이미지: [01_sc_d1b24e0b191f46eaa9c392aeca812d49.png](<screens/01_sc_d1b24e0b191f46eaa9c392aeca812d49.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_af5dbdf023694612a80512cb0ecbbe4c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 기존 새 텍스트 질문 아래 날짜 질문이 생겼다.
- 입력 항목·필수 표시·기본값: When are you planning to kickstart the project?; 날짜 placeholder YYYY-MM-DD와 달력 아이콘. 위 질문 유지.
- 버튼·메뉴·안내 문구: Submit, Date Select Question, 목록 하단 Phone Number도 보인다.
- 확인된 상태: 짧은 텍스트 다음 날짜 순서가 확인된다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 두 질문 정의가 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 날짜 제한·시간대·기본 날짜·필수값 및 저장은 미확인.

#### 모델링 영향

- 후보와 근거: 날짜 전용 답변 타입과 질문 순서 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 질문 이동 도구 노출

- Screen ID: `sc_af5dbdf023694612a80512cb0ecbbe4c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_af5dbdf023694612a80512cb0ecbbe4c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a09059c8-1834-433d-aa7e-85bfcef69410.png)
- 로컬 이미지: [02_sc_af5dbdf023694612a80512cb0ecbbe4c.png](<screens/02_sc_af5dbdf023694612a80512cb0ecbbe4c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d1b24e0b191f46eaa9c392aeca812d49` → 현재 → `sc_3ebb421578544410aa1a06eea0f95a0c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 추가 문의 질문 오른쪽에 세로 도구막대.
- 입력 항목·필수 표시·기본값: 추가 문의 → 프로젝트 시작 날짜 순서. 답변란은 비어 있다.
- 버튼·메뉴·안내 문구: 설정, 위/아래 삼각형, 삭제, Submit.
- 확인된 상태: 질문 내용은 유지되고 이동 도구가 보인다.
- 단계 간 변화: 추가 문의 질문의 도구를 표시한다.

#### 동작과 데이터

- 화면 관찰: 순서 조작 진입 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: hover인지 선택인지 정확한 트리거는 미확인.

#### 모델링 영향

- 후보와 근거: 선택/hover UI와 영속 순서값 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 질문 순서 변경 결과

- Screen ID: `sc_3ebb421578544410aa1a06eea0f95a0c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3ebb421578544410aa1a06eea0f95a0c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d566946b-b130-4648-b4b5-e6921d5d0c04.png)
- 로컬 이미지: [03_sc_3ebb421578544410aa1a06eea0f95a0c.png](<screens/03_sc_3ebb421578544410aa1a06eea0f95a0c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_af5dbdf023694612a80512cb0ecbbe4c` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 날짜 질문이 위, 추가 문의가 아래에 배치된다.
- 입력 항목·필수 표시·기본값: 날짜 placeholder YYYY-MM-DD; 텍스트 답변 placeholder 유지.
- 버튼·메뉴·안내 문구: Submit 및 Content 목록.
- 확인된 상태: 기존 마지막 두 요소가 서로 자리를 바꿨다.
- 단계 간 변화: 이동 화살표를 사용한 것으로 이어지지만 클릭 자체는 미수록.

#### 동작과 데이터

- 화면 관찰: 질문 타입·내용을 유지한 순서 변경이 확인된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 저장 완료·공개 폼 반영 시점은 미확인.

#### 모델링 영향

- 후보와 근거: 안정적인 질문 ID+정렬 값 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 질문별 위/아래 화살표와 삭제/설정 도구가 있다.
- [관찰] 마지막 두 질문의 순서만 바뀌고 질문 내용/타입은 유지된다.
- [미확인] 드래그 정렬·키보드 조작은 화면에 없다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 질문을 위아래로 이동하는 편집 기능을 설명한다.
- [공개 API 문서](https://docs.hellobonsai.com/api): 검토한 공개 리소스 목록에서 Forms/Questions/Responses 전용 endpoint와 필드 계약을 확인하지 못했다. Documents API를 폼 API로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 질문 식별자와 순서를 분리하고 순서 변경으로 기존 응답 참조가 바뀌지 않게 할 후보.

## 8. 미확인 사항과 검토 질문

- 첫/마지막 요소의 이동 제한, 기본 연락처 필드 위치 변경 가능 여부, 동시 편집 충돌을 확인한다.
- 순서 변경이 공개 폼에 반영되는 시점과 응답 조회 순서 정책을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 3개와 실제 이미지 3개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 3단계 재조회 및 원본 3개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
