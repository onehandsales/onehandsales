# Adding a service to library 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `023d6e51-ce87-40a9-a628-cf7b39cd3b14` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=023d6e51-ce87-40a9-a628-cf7b39cd3b14) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

공용 서비스 템플릿을 업종별로 탐색해 계정의 서비스 라이브러리에 추가한다.

- Services > View Templates에서 시작한다.
- Product 분류에서 Product feature prioritization and backlog management를 추가한다.
- 성공 토스트는 있지만 새로 추가된 서비스 편집 화면은 수록되지 않았다.

- 상위 분석: [Services](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Services/Adding a service to library`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_059762fd20fc473f9ef5b1f15f270ed6`](https://gummble.com/screens/sc_059762fd20fc473f9ef5b1f15f270ed6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [서비스 라이브러리 목록](<screens/01_sc_059762fd20fc473f9ef5b1f15f270ed6.png>) | Service Templates전체화면을연다. |
| 02 | [`sc_6a26ba7d25ab489087736b3ce8e1de20`](https://gummble.com/screens/sc_6a26ba7d25ab489087736b3ce8e1de20?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [서비스 템플릿 전체목록](<screens/02_sc_6a26ba7d25ab489087736b3ce8e1de20.png>) | Product필터로6개결과를선택한다. |
| 03 | [`sc_11e7b415167549558366c614315fc76d`](https://gummble.com/screens/sc_11e7b415167549558366c614315fc76d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Product 서비스 템플릿 필터](<screens/03_sc_11e7b415167549558366c614315fc76d.png>) | 해당항목+위에Add to library툴팁을확인한다. |
| 04 | [`sc_096b52c9f4f24987abfca9c5f3132f6c`](https://gummble.com/screens/sc_096b52c9f4f24987abfca9c5f3132f6c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [라이브러리 추가 버튼 툴팁](<screens/04_sc_096b52c9f4f24987abfca9c5f3132f6c.png>) | +선택후Service added토스트가나타난다. |
| 05 | [`sc_46a7bbbe6f2f407cbb037c08e36e9e57`](https://gummble.com/screens/sc_46a7bbbe6f2f407cbb037c08e36e9e57?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [서비스 추가 성공 알림](<screens/05_sc_46a7bbbe6f2f407cbb037c08e36e9e57.png>) | 템플릿 목록을 유지한 채 종료. Click to edit는미실행. |

## 4. 화면별 상세 분석

### 단계 01 — 서비스 라이브러리 목록

- Screen ID: `sc_059762fd20fc473f9ef5b1f15f270ed6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_059762fd20fc473f9ef5b1f15f270ed6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/05d4f069-6e42-4088-b7d3-e95c1250381e.png)
- 로컬 이미지: [01_sc_059762fd20fc473f9ef5b1f15f270ed6.png](<screens/01_sc_059762fd20fc473f9ef5b1f15f270ed6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_6a26ba7d25ab489087736b3ce8e1de20`

#### 화면에서 직접 확인한 내용

- 레이아웃: Services/Categories탭,검색·Filters·View Templates·New Service,서비스명/가격/분류표.
- 입력 항목·필수 표시·기본값: 10행: Brand2500, BusinessCard100, Deck200, Flyer50/item, Icon1000, Logo800, Poster250/item, UX5000, Website150/hour, WebsiteRedesign800/day. 분류Branding/Graphic Design/Design/Marketing.
- 버튼·메뉴·안내 문구: 각행…·열정렬·템플릿조회·신규서비스.
- 확인된 상태: 샘플서비스목록. 빈상태아님.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 서비스별가격과단위·분류를목록에서비교가능.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서비스설명은목록에없음. 표시 통화와 계정 통화 관계 미확인.

#### 모델링 영향

- 후보와 근거: 서비스카탈로그·분류·요금단위후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 서비스 템플릿 전체목록

- Screen ID: `sc_6a26ba7d25ab489087736b3ce8e1de20`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6a26ba7d25ab489087736b3ce8e1de20?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/011d31bb-c35c-4fc1-a4aa-5818904680fa.png)
- 로컬 이미지: [02_sc_6a26ba7d25ab489087736b3ce8e1de20.png](<screens/02_sc_6a26ba7d25ab489087736b3ce8e1de20.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_059762fd20fc473f9ef5b1f15f270ed6` → 현재 → `sc_11e7b415167549558366c614315fc76d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좌업종필터,우상단검색,우측템플릿이름/설명/가격/분류/+ 목록.우상단X.
- 입력 항목·필수 표시·기본값: All Templates371. Architecture71·Marketing66·Accounting41·Legal35·Design29·Coaching24·Consulting20등. 검색비어있음. 예:1:1Coaching100/hour,3DDesign100/hour.
- 버튼·메뉴·안내 문구: 필터·검색 clear X·행+·전체닫기X.
- 확인된 상태: 공용템플릿탐색.
- 단계 간 변화: Service Templates전체화면을연다.

#### 동작과 데이터

- 화면 관찰: 계정 라이브러리 목록과 별도인 공용 카탈로그다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필터조합·검색매칭·결과페이지분할미확인.

#### 모델링 영향

- 후보와 근거: 공용 템플릿과 업종 탐색 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Product 서비스 템플릿 필터

- Screen ID: `sc_11e7b415167549558366c614315fc76d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_11e7b415167549558366c614315fc76d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/532db356-86f1-4929-9c82-19348f6a91d6.png)
- 로컬 이미지: [03_sc_11e7b415167549558366c614315fc76d.png](<screens/03_sc_11e7b415167549558366c614315fc76d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6a26ba7d25ab489087736b3ce8e1de20` → 현재 → `sc_096b52c9f4f24987abfca9c5f3132f6c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽Product6선택배경.오른쪽 제품 업무 서비스 목록.
- 입력 항목·필수 표시·기본값: 팀관리120/hour,Persona1000/item,우선순위/백로그100/hour,출시계획10000,로드맵5000등. 각Product Management라벨.
- 버튼·메뉴·안내 문구: 각+·검색·닫기.6개중화면에는5개주요행이보임.
- 확인된 상태: 업종필터결과.
- 단계 간 변화: Product필터로6개결과를선택한다.

#### 동작과 데이터

- 화면 관찰: 업종Product와서비스카테고리Product Management명칭이달라분리필요.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 6번째 항목은 화면 밖이므로 내용 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 업종과 계정 서비스 카테고리 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 라이브러리 추가 버튼 툴팁

- Screen ID: `sc_096b52c9f4f24987abfca9c5f3132f6c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_096b52c9f4f24987abfca9c5f3132f6c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/66eedb6d-0efb-4807-8300-5cc8befe3d5b.png)
- 로컬 이미지: [04_sc_096b52c9f4f24987abfca9c5f3132f6c.png](<screens/04_sc_096b52c9f4f24987abfca9c5f3132f6c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_11e7b415167549558366c614315fc76d` → 현재 → `sc_46a7bbbe6f2f407cbb037c08e36e9e57`

#### 화면에서 직접 확인한 내용

- 레이아웃: Product목록중우선순위/백로그항목+위검은툴팁.
- 입력 항목·필수 표시·기본값: 해당서비스100/hour,제품관리분류,백로그/개발우선순위설명.
- 버튼·메뉴·안내 문구: Add to library 툴팁·+.
- 확인된 상태: 추가전hover/포커스.
- 단계 간 변화: 해당항목+위에Add to library툴팁을확인한다.

#### 동작과 데이터

- 화면 관찰: +가 미리보기 아닌 라이브러리 추가 기능임을 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭 시 확인 모달 유무 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿→계정서비스복사작업후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 서비스 추가 성공 알림

- Screen ID: `sc_46a7bbbe6f2f407cbb037c08e36e9e57`
- 원본: [화면 페이지](https://gummble.com/screens/sc_46a7bbbe6f2f407cbb037c08e36e9e57?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/11f0b22b-c18a-4302-8760-14f85b84f24b.png)
- 로컬 이미지: [05_sc_46a7bbbe6f2f407cbb037c08e36e9e57.png](<screens/05_sc_46a7bbbe6f2f407cbb037c08e36e9e57.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_096b52c9f4f24987abfca9c5f3132f6c` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 목록유지,우하단초록토스트.
- 입력 항목·필수 표시·기본값: Product필터와371전체개수유지. 추가대상+도계속보임.
- 버튼·메뉴·안내 문구: Service added to your library. Click to edit. 닫기X.
- 확인된 상태: 라이브러리추가성공.
- 단계 간 변화: +선택후Service added토스트가나타난다.

#### 동작과 데이터

- 화면 관찰: 추가 성공 토스트가 직접 근거.서비스값편집은미수록.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 생성ID·복사필드·중복추가규칙미확인.

#### 모델링 영향

- 후보와 근거: 계정 서비스 생성과 편집 후속 경로 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 캡처의템플릿총수371,Product6은 이 시점 표시값이며 현재 고정 상수 아님.
- [관찰] 추가후에도+가보이므로중복추가허용/방지여부는미확인.
- [문서] 템플릿을 라이브러리에 넣고 계정 서비스로 수정해 문서에 활용한다.

## 6. 공식 도움말과 API 대조

- [Services library](https://help.hellobonsai.com/en/articles/12824095-services-library): 이름·설명·가격·유형·분류를 관리하고 제안서/인보이스에 가져온다. 라이브러리 수정은 이미 문서에 들어간 항목을 소급 변경하지 않는다.
- [Templates API](https://docs.hellobonsai.com/api/tag/templates): 문서 템플릿 그룹으로 확인했으며 서비스 템플릿 조회/추가 계약과 동일하다고 보지 않는다.

## 7. 데이터 모델링 시사점

- 공용템플릿·업종분류·계정서비스복사·서비스 카테고리의 서로 다른 개념 후보.
- 원 템플릿 출처 추적과 복사 시점 값 보존은 설계 후보,실제내부저장은미확인.

## 8. 미확인 사항과 검토 질문

- 템플릿 추가 시 새 카테고리가 자동 생성되는가? 계정 분류 목록 전후 비교 필요.
- 같은 템플릿을 두 번 추가할 때 중복 검사와 이름 충돌 정책을 확인한다.
- 템플릿 갱신이 이미 복사한 서비스에 반영되는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
