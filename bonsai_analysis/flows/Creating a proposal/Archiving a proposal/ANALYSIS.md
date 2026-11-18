# Archiving a proposal 플로우 분석

검토 상태: **R1 이미지 검토·문서 대조 완료 / R2 교차 검토 반영**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `2ea53e4d-6f67-4621-bb41-c56eeb054811` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=2ea53e4d-6f67-4621-bb41-c56eeb054811) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

수락된 제안서를 보관 처리해 기본 목록에서 숨긴다.

- Accepted 제안서에서 시작한다.
- 보관 후에도 상세의 Accepted 표시는 유지된다. 보관과 승인 상태는 다른 축일 가능성을 시사한다.

- 상위 분석: [Creating a proposal](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a proposal/Archiving a proposal`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_8afa6c0d651c411eb077be375ebba010`](https://gummble.com/screens/sc_8afa6c0d651c411eb077be375ebba010?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수락된 제안서 상세](<screens/01_sc_8afa6c0d651c411eb077be375ebba010.png>) | …에서Archive를선택한다. |
| 02 | [`sc_d059484fefee4e13852c74367787201d`](https://gummble.com/screens/sc_d059484fefee4e13852c74367787201d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수락된 제안서 작업 메뉴](<screens/02_sc_d059484fefee4e13852c74367787201d.png>) | Archive Proposal확인모달을표시한다. |
| 03 | [`sc_7e84530d09a34d2fb6e42242498e7216`](https://gummble.com/screens/sc_7e84530d09a34d2fb6e42242498e7216?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 보관 확인](<screens/03_sc_7e84530d09a34d2fb6e42242498e7216.png>) | 확정 후 보관 성공 토스트가 나타난다. |
| 04 | [`sc_b50015926d1245a89e5e7b1baf9dcda7`](https://gummble.com/screens/sc_b50015926d1245a89e5e7b1baf9dcda7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [제안서 보관 성공 상세](<screens/04_sc_b50015926d1245a89e5e7b1baf9dcda7.png>) | Proposals목록으로 이동하면 빈 목록이 된다. |
| 05 | [`sc_5ca3afbf1e4d4f78a6e462789220bc75`](https://gummble.com/screens/sc_5ca3afbf1e4d4f78a6e462789220bc75?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [보관 후 기본 목록 빈 상태](<screens/05_sc_5ca3afbf1e4d4f78a6e462789220bc75.png>) | 기본목록에서숨김완료.복원경로는미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 수락된 제안서 상세

- Screen ID: `sc_8afa6c0d651c411eb077be375ebba010`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8afa6c0d651c411eb077be375ebba010?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/155608a1-1a52-4e95-8175-cead6b011155.png)
- 로컬 이미지: [01_sc_8afa6c0d651c411eb077be375ebba010.png](<screens/01_sc_8afa6c0d651c411eb077be375ebba010.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d059484fefee4e13852c74367787201d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 표현편집제어없는Cover문서,우측Overview/Payments/Activity.
- 입력 항목·필수 표시·기본값: Accepted5255 SingleOption,Sent/AcceptedFeb8,USD UpfrontPaymentNone.
- 버튼·메뉴·안내 문구: Automation·Download PDF·…·Activity펼침.
- 확인된 상태: 수락된문서읽기상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 수락일과발송일·선수금정보가분리표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 수락주체/법적 동의 증거는 이미지로 미확인.

#### 모델링 영향

- 후보와 근거: 문서상태·수락이벤트·지급조건분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 수락된 제안서 작업 메뉴

- Screen ID: `sc_d059484fefee4e13852c74367787201d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d059484fefee4e13852c74367787201d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/36a3e35b-17cd-4385-af21-bf35a377e4a2.png)
- 로컬 이미지: [02_sc_d059484fefee4e13852c74367787201d.png](<screens/02_sc_d059484fefee4e13852c74367787201d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_8afa6c0d651c411eb077be375ebba010` → 현재 → `sc_7e84530d09a34d2fb6e42242498e7216`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우상단…아래4개메뉴. 상단Download PDF는별도버튼.
- 입력 항목·필수 표시·기본값: Accepted문서. 금액/결제정보유지.
- 버튼·메뉴·안내 문구: Duplicate,Save As Template,Archive,Delete.
- 확인된 상태: Sent메뉴와달리Edit/Mark Accepted없음.
- 단계 간 변화: …에서Archive를선택한다.

#### 동작과 데이터

- 화면 관찰: 수락 상태에 따라 가능 작업이 달라짐.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 권한별메뉴차이·템플릿복사범위미확인.

#### 모델링 영향

- 후보와 근거: 상태별작업규칙후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 제안서 보관 확인

- Screen ID: `sc_7e84530d09a34d2fb6e42242498e7216`
- 원본: [화면 페이지](https://gummble.com/screens/sc_7e84530d09a34d2fb6e42242498e7216?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a47c37ff-b216-41ee-8d22-9f10b068e6e6.png)
- 로컬 이미지: [03_sc_7e84530d09a34d2fb6e42242498e7216.png](<screens/03_sc_7e84530d09a34d2fb6e42242498e7216.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d059484fefee4e13852c74367787201d` → 현재 → `sc_b50015926d1245a89e5e7b1baf9dcda7`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙Archive Proposal모달,질문·빨간버튼·외곽X.
- 입력 항목·필수 표시·기본값: 입력없음.
- 버튼·메뉴·안내 문구: Yes, I'm Sure, X.
- 확인된 상태: 보관확인전.
- 단계 간 변화: Archive Proposal확인모달을표시한다.

#### 동작과 데이터

- 화면 관찰: 파괴적느낌색을쓰지만Delete와다른작업임.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 취소후상태·복원 가능성은 이 모달에 설명 없음.

#### 모델링 영향

- 후보와 근거: 확인단계및보관명령후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 제안서 보관 성공 상세

- Screen ID: `sc_b50015926d1245a89e5e7b1baf9dcda7`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b50015926d1245a89e5e7b1baf9dcda7?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ee7821bc-f783-40f4-a63d-137c9fbc9c66.png)
- 로컬 이미지: [04_sc_b50015926d1245a89e5e7b1baf9dcda7.png](<screens/04_sc_b50015926d1245a89e5e7b1baf9dcda7.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_7e84530d09a34d2fb6e42242498e7216` → 현재 → `sc_5ca3afbf1e4d4f78a6e462789220bc75`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달닫힘,Accepted상세유지·우하단성공알림.
- 입력 항목·필수 표시·기본값: Accepted5255,Sent/AcceptedFeb8,USD·UpfrontNone.
- 버튼·메뉴·안내 문구: Your proposal has been archived. Download PDF·Automation·…유지.
- 확인된 상태: 보관성공표시.
- 단계 간 변화: 확정 후 보관 성공 토스트가 나타난다.

#### 동작과 데이터

- 화면 관찰: 보관 후에도 업무 상태와 문서 내용은 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Archive후메뉴내용·고객링크영향미확인.

#### 모델링 영향

- 후보와 근거: 보관과업무상태독립후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 보관 후 기본 목록 빈 상태

- Screen ID: `sc_5ca3afbf1e4d4f78a6e462789220bc75`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5ca3afbf1e4d4f78a6e462789220bc75?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b2d171e6-e8f6-44fe-aecb-0642d6141c21.png)
- 로컬 이미지: [05_sc_5ca3afbf1e4d4f78a6e462789220bc75.png](<screens/05_sc_5ca3afbf1e4d4f78a6e462789220bc75.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_b50015926d1245a89e5e7b1baf9dcda7` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Proposals목록에No proposals here yet카드,검색/Filters/탭유지.
- 입력 항목·필수 표시·기본값: 행없음. 검색비어있음.
- 버튼·메뉴·안내 문구: New Proposal,Filters,My Templates.
- 확인된 상태: 필터 기본 목록에서 문서가 안 보임.
- 단계 간 변화: Proposals목록으로 이동하면 빈 목록이 된다.

#### 동작과 데이터

- 화면 관찰: 보관 문서가 일반 목록에서 제외됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 보관자료접근필터·검색범위·복원미수록.

#### 모델링 영향

- 후보와 근거: 기본 목록 필터와 보관 기록 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Archive와Delete가별도메뉴로존재한다.
- [관찰] 성공토스트후에도상세는Accepted를유지한다. 하나의상태enum으로 덮어쓰기한다고 단정하지 않는다.
- [문서] 문서 보관은 자료를 남기고 기본 목록에서 분리하는 방식이며 영구 삭제와 다르다.
- [교차 관찰] [Searching Bonsai 단계 05](../../Searching%20Bonsai/ANALYSIS.md)의 `sc_0772af4321ef49babd9c81dd8b573721`에서 같은 Creative Design Brief의 archived(6:45:41 PM)·restored(6:46:40 PM) 활동과 accepted 표시를 확인했다. 따라서 복원 이벤트가 존재한다는 근거는 확보됐지만 조작 화면·권한·연쇄 영향은 여전히 미확인이다.

## 6. 공식 도움말과 API 대조

- [문서 삭제·보관 도움말](https://help.hellobonsai.com/en/articles/1638417-exploring-if-a-deleted-document-can-be-recovered): 제안서/계약은 보관해 접근 가능하게 유지할 수 있다고 설명한다. 프로젝트 전체 보관과 개별 제안서 보관의 영향은 혼동하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인. 제안서 보관/복원 전용 endpoint는 공개 그룹에서 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 업무상태 Accepted와 목록노출/보관상태를 독립적으로 표현할 후보.
- 보관시각·처리자·복원 이력·고객접근/검색필터 정책 후보.

## 8. 미확인 사항과 검토 질문

- 복원 이벤트의 존재는 다른 플로우에서 확인했다. 이 흐름에 없는 Archived 필터·복원 메뉴·실행 확인창과 복원 전후 공유 URL·다운로드·포털 접근 조건을 추가 확인한다.
- 연결 프로젝트와 자동 생성 인보이스·자동화 예약이 영향받는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| R2 | 2026-11-18 KST | 다른 플로우의 문서 활동을 교차 연결하고 복원·서명·발송의 확인 범위와 미수록 조작을 구분 | 실제 계정 검증·8절 질문은 유지 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
