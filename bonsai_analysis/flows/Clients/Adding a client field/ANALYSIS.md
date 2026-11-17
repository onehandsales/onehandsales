# Adding a client field 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `87c1f8ab-d786-4b2c-9861-d75e5813e639` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=87c1f8ab-d786-4b2c-9861-d75e5813e639) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

모든 고객 상세에서 사용할 추가 정보 필드의 이름을 관리 화면에서 정의한다.

- Clients > Settings의 Client Fields에서 시작한다.
- Email이라는 이름의 새 필드를 추가한다. 특정 고객 이메일 값을 입력하는 흐름은 아니다.

- 상위 분석: [Clients](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_cc68ecaccb72426b8573fca9ece52fc9`](https://gummble.com/screens/sc_cc68ecaccb72426b8573fca9ece52fc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 태그와 필드 설정 | Add New Field 후 빈 입력 행이 생기며 Fields 수가 3→4로 표시된다. |
| 02 | [`sc_175d01279ca24ead910995ea1cc957d3`](https://gummble.com/screens/sc_175d01279ca24ead910995ea1cc957d3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 새 고객 필드 빈 행 | 새 필드명 Email을 입력한다. |
| 03 | [`sc_c231351f09ab4afe865acaf6e68add0f`](https://gummble.com/screens/sc_c231351f09ab4afe865acaf6e68add0f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 필드명 Email 입력 | Done 후 입력이 표시 행으로 바뀌고 Edit/Delete가 생긴다. |
| 04 | [`sc_3d631d315dcb40969d26412f158df64c`](https://gummble.com/screens/sc_3d631d315dcb40969d26412f158df64c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 고객 필드 추가 완료 | 4개 필드가 나열된 설정 화면으로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — 고객 태그와 필드 설정

- Screen ID: `sc_cc68ecaccb72426b8573fca9ece52fc9`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cc68ecaccb72426b8573fca9ece52fc9?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/72d1e44d-bf39-49eb-854c-fa4dadc4f851.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_175d01279ca24ead910995ea1cc957d3`

#### 화면에서 직접 확인한 내용

- 레이아웃: Settings 탭. 위Client Tags표·New Client Tag, 아래Client Fields표·Add New Field.
- 입력 항목·필수 표시·기본값: 2Tags:Client(1Client),Lead(0Clients).3Fields:Company Title(문서프리필),Phone Number,Website.
- 버튼·메뉴·안내 문구: 태그/필드 행Edit·Delete, 추가버튼.
- 확인된 상태: 정의 목록과 사용 개수를 조회.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 필드 정의가 고객 값과 별도로 관리됨. 기본 필드처럼 보여도 삭제메뉴 존재.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 태그색·필드타입·삭제영향·권한.

#### 모델링 영향

- 후보와 근거: 태그정의/연결·필드정의/고객값 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 새 고객 필드 빈 행

- Screen ID: `sc_175d01279ca24ead910995ea1cc957d3`
- 원본: [화면 페이지](https://gummble.com/screens/sc_175d01279ca24ead910995ea1cc957d3?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b196b978-81d3-4791-83ba-fb203dcc63c8.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_cc68ecaccb72426b8573fca9ece52fc9` → 현재 → `sc_c231351f09ab4afe865acaf6e68add0f`

#### 화면에서 직접 확인한 내용

- 레이아웃: Settings 상단 Client Tags, 하단 Client Fields 표. 새 편집 행이 기존 필드 위에 삽입된다.
- 입력 항목·필수 표시·기본값: 빈 한 줄 입력에 포커스. Fields는 4. 별표·자료형 선택 없음.
- 버튼·메뉴·안내 문구: 행 오른쪽 Done, 상단 Add New Field. 기존 필드 Edit/Delete.
- 확인된 상태: 저장 전 편집 상태. 빈 행인데도 개수는 4로 표시.
- 단계 간 변화: Add New Field 후 빈 입력 행이 생기며 Fields 수가 3→4로 표시된다.

#### 동작과 데이터

- 화면 관찰: 필드 정의 추가 UI가 열렸으나 저장 성공은 아직 확인되지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 취소 방법·자동 임시 저장·빈 이름 검증 미확인.

#### 모델링 영향

- 후보와 근거: 필드 정의 편집 초안과 저장된 정의를 구분할 필요.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 고객 필드명 Email 입력

- Screen ID: `sc_c231351f09ab4afe865acaf6e68add0f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c231351f09ab4afe865acaf6e68add0f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5616ff68-6066-48c0-a43d-b57722872072.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_175d01279ca24ead910995ea1cc957d3` → 현재 → `sc_3d631d315dcb40969d26412f158df64c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 새 필드 입력 행과 기존 Company Title/Phone Number/Website가 함께 표시.
- 입력 항목·필수 표시·기본값: 필드명 Email. 이메일 주소를 넣는 값 입력이 아니다.
- 버튼·메뉴·안내 문구: Done 유지. 별도 Save All 버튼은 보이지 않음.
- 확인된 상태: 새 필드 이름 입력 중.
- 단계 간 변화: 새 필드명 Email을 입력한다.

#### 동작과 데이터

- 화면 관찰: 정의 이름이 입력되었으며 고객별 실제 값은 아직 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 같은 이름의 표준 이메일과 충돌 처리 미확인.

#### 모델링 영향

- 후보와 근거: 필드 식별자와 표시 이름을 분리할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 고객 필드 추가 완료

- Screen ID: `sc_3d631d315dcb40969d26412f158df64c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3d631d315dcb40969d26412f158df64c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/50c0d99f-fe31-4896-8973-55112d45b136.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c231351f09ab4afe865acaf6e68add0f` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Client Fields 4개 표시 행. Email이 첫 번째.
- 입력 항목·필수 표시·기본값: Email·Company Title·Phone Number·Website. 입력칸 대신 회색 이름 라벨.
- 버튼·메뉴·안내 문구: 각 행 Edit/Delete, Add New Field. 별도 성공 토스트는 보이지 않음.
- 확인된 상태: 편집 종료 상태. Email 필드가 표에 남는다.
- 단계 간 변화: Done 후 입력이 표시 행으로 바뀌고 Edit/Delete가 생긴다.

#### 동작과 데이터

- 화면 관찰: 입력행→표시행 전환으로 UI상 추가 완료를 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침 이후 지속성·고객 상세 반영 방식 미수록.

#### 모델링 영향

- 후보와 근거: 필드 정의 목록과 정렬. 삭제와 값 연쇄 영향 미확정.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 필드 개수는 빈 편집 행에서도 4로 표시되므로 이 숫자를 저장 완료 개수로 단정하지 않는다.
- [관찰] 이름 입력 외 자료형·필수값·기본값·중복 검사는 수록되지 않았다.
- [문서] 현재 회사 사용자 필드가 모든 회사에 적용됨을 설명하며, 사용자 필드 도움말은 고객 필드를 텍스트로 제한한다고 설명한다.

## 6. 공식 도움말과 API 대조

- [회사·연락처 도움말](https://help.hellobonsai.com/en/articles/452120-how-to-create-and-manage-companies-and-contacts): 현행 회사는 이름만 필수이며 회사·연락처를 독립적으로 생성하고 다중 회사 연결과 기본 연락처를 지원한다. 이 캡처의 담당자명·이메일 필수 폼과 버전 차이가 있다.
- [Custom fields](https://help.hellobonsai.com/en/articles/12078877-custom-fields): 2026-05-27 문서는 여러 대상의 필드 자료형을 설명하지만 고객 필드는 텍스트만 지원한다고 구분한다. 화면의 Email 이름만으로 이메일형 유효성 검사를 가정하지 않는다.
- [Companies API](https://docs.hellobonsai.com/api/tag/companies): GET/POST `/public-api/v1/companies`, GET/PATCH `/public-api/v1/companies/{id}`, GET `/public-api/v1/companies/{id}/activities`를 확인했다. 사용자 필드 정의/삭제 endpoint·값 구조는 별도 확인이 필요하다.

## 7. 데이터 모델링 시사점

- 계정 범위 필드 정의와 고객별 필드 값을 분리하는 후보. 이름 Email과 연락처의 표준 이메일 속성을 혼동하지 않는다.
- 정렬 순서·표시 여부·삭제된 필드의 값 보존은 화면으로 확정할 수 없다.

## 8. 미확인 사항과 검토 질문

- 빈 이름·중복 이름·기존 Company Title 삭제를 허용하는가? 실제 검증 결과와 기존 문서 영향 확인이 필요하다.
- 필드 삭제 시 모든 고객의 값도 사라지는가? 복구·이력 정책에 영향을 준다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
