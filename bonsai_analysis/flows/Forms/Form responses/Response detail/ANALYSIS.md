# Response detail 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `31b9d879-ab36-4255-a0e5-34cc4266ce9c` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=31b9d879-ab36-4255-a0e5-34cc4266ce9c) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

응답 목록에서 제출 답변을 읽고 인쇄 기능을 확인한다.

- Jane Studio 응답을 선택한다. 하위 Giving a response 입력 이름은 Amanda Soh지만 여기 제목은 Jane Studio여서 연결된 고객 표시 정보와 대조가 필요하다.

- 상위 분석: [Form responses](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_54a522cdaf524c81b83ad5dbccf32762`](https://gummble.com/screens/sc_54a522cdaf524c81b83ad5dbccf32762?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 응답 2건 목록 | 첫 응답 행의 … 메뉴를 연다. |
| 02 | [`sc_de5a2b4b4e9d4e70b1e8be3edfeb7c0f`](https://gummble.com/screens/sc_de5a2b4b4e9d4e70b1e8be3edfeb7c0f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 응답 행 메뉴 | View Response를 선택한다. |
| 03 | [`sc_bb49e1f780284ceb93f8148d856d4e21`](https://gummble.com/screens/sc_bb49e1f780284ceb93f8148d856d4e21?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 응답 상세 상단 | 상세 모달 내부/페이지를 아래로 스크롤한다. |
| 04 | [`sc_e92790c2b38f48f6bb97936a07ad05c9`](https://gummble.com/screens/sc_e92790c2b38f48f6bb97936a07ad05c9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 응답 상세 하단 | 하단 답변과 Print 버튼을 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — 응답 2건 목록

- Screen ID: `sc_54a522cdaf524c81b83ad5dbccf32762`
- 원본: [화면 페이지](https://gummble.com/screens/sc_54a522cdaf524c81b83ad5dbccf32762?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a28ab068-27a6-472a-94f8-1eec551c501b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_de5a2b4b4e9d4e70b1e8be3edfeb7c0f`

#### 화면에서 직접 확인한 내용

- 레이아웃: Responses 탭 아래 Date/Name/Email Address 테이블.
- 입력 항목·필수 표시·기본값: Feb 8 2024 7:15PM Jane Studio와 이메일; 7:14PM 이메일을 Name으로 사용하는 두 번째 행.
- 버튼·메뉴·안내 문구: Date 정렬 화살표, 각 행 …, 행 이름, Create.
- 확인된 상태: 최신 시각 행이 위에 있다. 기존 0건에서 생성 과정 없이 2건으로 바뀌었다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 서로 다른 응답 행과 제출 시각이 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 시간대·실시간 갱신·Name 대체 규칙은 미확인.

#### 모델링 영향

- 후보와 근거: 응답 식별자·제출시각·고객 참조/표시 스냅샷 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 응답 행 메뉴

- Screen ID: `sc_de5a2b4b4e9d4e70b1e8be3edfeb7c0f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_de5a2b4b4e9d4e70b1e8be3edfeb7c0f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f23ef4e4-92c2-48ba-b3c0-51af05384770.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_54a522cdaf524c81b83ad5dbccf32762` → 현재 → `sc_bb49e1f780284ceb93f8148d856d4e21`

#### 화면에서 직접 확인한 내용

- 레이아웃: 첫 행 우측 … 아래 작은 메뉴.
- 입력 항목·필수 표시·기본값: 선택 행은 Jane Studio/7:15PM.
- 버튼·메뉴·안내 문구: View Response, View Client, Delete Response.
- 확인된 상태: 응답 보기와 고객 보기가 분리되어 있다.
- 단계 간 변화: 첫 응답 행의 … 메뉴를 연다.

#### 동작과 데이터

- 화면 관찰: 응답에 고객 참조가 있을 가능성을 지지하지만 모든 응답 필수 관계는 미확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 삭제 확인·고객 이동 결과는 미수록.

#### 모델링 영향

- 후보와 근거: 응답과 고객의 독립 식별자 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 응답 상세 상단

- Screen ID: `sc_bb49e1f780284ceb93f8148d856d4e21`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bb49e1f780284ceb93f8148d856d4e21?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/40432726-9fa8-4f66-884f-f9a2789a67df.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_de5a2b4b4e9d4e70b1e8be3edfeb7c0f` → 현재 → `sc_e92790c2b38f48f6bb97936a07ad05c9`

#### 화면에서 직접 확인한 내용

- 레이아웃: 어두운 목록 위 긴 중앙 모달. 제목 Jane Studio, 좌상단 이전/다음 화살표.
- 입력 항목·필수 표시·기본값: Submission Date Feb8 2024 7:15PM, Email; 웹사이트/사업 법적 이름/제작물 답변 '-'; 매체 Logo/E-newsletter/Poster; 파일 PDF/.png; 기존 브랜드 재작업 선택.
- 버튼·메뉴·안내 문구: 이전(회색)/다음, 외부 X, 스크롤.
- 확인된 상태: 선택지 답변이 글머리 목록으로 보인다.
- 단계 간 변화: View Response를 선택한다.

#### 동작과 데이터

- 화면 관찰: 제출된 값과 미응답을 읽기 전용으로 표시한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객명과 제출자 이름의 연결·답변 수정 허용은 미확인.

#### 모델링 영향

- 후보와 근거: 질문별 선택 값 집합과 표시 라벨 스냅샷 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 응답 상세 하단

- Screen ID: `sc_e92790c2b38f48f6bb97936a07ad05c9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e92790c2b38f48f6bb97936a07ad05c9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cc955869-ca64-4021-bf26-658257f0feb4.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_bb49e1f780284ceb93f8148d856d4e21` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 긴 모달을 아래로 스크롤. 하단 footer에 Print.
- 입력 항목·필수 표시·기본값: 기존 디자인 파일 '-' ; 예산 200; 선호 결제 Credit card; 시작 날짜 '-'. 매체/파일/브랜드 답변도 일부 반복 노출.
- 버튼·메뉴·안내 문구: Print, 스크롤.
- 확인된 상태: 비어 있는 날짜도 항목과 '-'가 유지된다. 추가 문의 질문은 보이지 않는다.
- 단계 간 변화: 상세 모달 내부/페이지를 아래로 스크롤한다.

#### 동작과 데이터

- 화면 관찰: 숫자·단일선택·미응답·첨부 없음 표현을 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 인쇄 결과·전체 질문 버전과 추가 문의 누락 이유는 미확인.

#### 모델링 영향

- 후보와 근거: 응답 타입별 렌더링, 미응답 표현, 질문 버전 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] View Response/View Client/Delete Response가 서로 다른 메뉴다.
- [관찰] 다중 선택 답변은 목록, 미입력은 '-'로 표시된다.
- [관찰] 상세에 제출 이름 필드가 별도 노출되지 않으며 제목은 Jane Studio다.
- [미확인] Print·Delete·응답 간 이동은 실행 장면이 없다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 응답 내용과 제출일 조회를 설명한다.
- [공개 API 문서](https://docs.hellobonsai.com/api): 검토한 공개 리소스 목록에서 Forms/Questions/Responses 전용 endpoint와 필드 계약을 확인하지 못했다. Documents API를 폼 API로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 응답-질문-타입별 답변, 다중 선택 값 집합, 미응답/null 표현 후보.
- 응답과 고객 연결, 제출 시점 질문 스냅샷 및 인쇄 표현 후보.

## 8. 미확인 사항과 검토 질문

- 질문 삭제/수정 후 기존 답변 표시와 순서, 제출 이름 보존 위치를 확인한다.
- Delete Response가 고객 레코드에 미치는 영향·복구·권한·인쇄 범위를 확인한다.
- 마지막 '추가 문의' 질문이 여기 없는 이유가 폼 변경인지 생략인지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
