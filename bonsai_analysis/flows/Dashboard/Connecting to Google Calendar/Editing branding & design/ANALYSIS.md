# Editing branding & design 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `d9ed6982-0264-44ed-bb1a-82ad16b0e89f` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=d9ed6982-0264-44ed-bb1a-82ad16b0e89f) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 10개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

예약 페이지 테마와 프로필 이미지를 설정하고 이벤트 유형 생성을 마친다.

- 마법사4단계에서 시작해 생성 완료와 유형 목록으로 끝난다.
- 회사 전체 로고 설정과 별도 Add Custom Profile Image가 있다. 상속 관계는 미확인.

- 상위 분석: [Connecting to Google Calendar](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Dashboard/Connecting to Google Calendar/Editing branding & design`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_4a74288006d54ecd949b1c814b0abc38`](https://gummble.com/screens/sc_4a74288006d54ecd949b1c814b0abc38?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Branding & Design 초기](<screens/01_sc_4a74288006d54ecd949b1c814b0abc38.png>) | 테마 목록을 연다. |
| 02 | [`sc_2610a8a87df6426aa534536c6eacbe4d`](https://gummble.com/screens/sc_2610a8a87df6426aa534536c6eacbe4d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [예약 페이지 테마 목록](<screens/02_sc_2610a8a87df6426aa534536c6eacbe4d.png>) | Sunrise를 가리킨다. |
| 03 | [`sc_5219247100dc4cae868c35418dc0f1d5`](https://gummble.com/screens/sc_5219247100dc4cae868c35418dc0f1d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Sunrise hover](<screens/03_sc_5219247100dc4cae868c35418dc0f1d5.png>) | Sunrise를 선택한다. |
| 04 | [`sc_c4a9ad050271457a99e7f27a5c97ac63`](https://gummble.com/screens/sc_c4a9ad050271457a99e7f27a5c97ac63?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Sunrise 적용](<screens/04_sc_c4a9ad050271457a99e7f27a5c97ac63.png>) | Sky로 바꾼다. |
| 05 | [`sc_4f10bb8170af46e4a15d99547ce30256`](https://gummble.com/screens/sc_4f10bb8170af46e4a15d99547ce30256?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Sky 적용](<screens/05_sc_4f10bb8170af46e4a15d99547ce30256.png>) | 프로필 이미지 업로드를 시작한다. 파일 선택창은 미수록. |
| 06 | [`sc_50bd5e961133492089170f6ce8722f14`](https://gummble.com/screens/sc_50bd5e961133492089170f6ce8722f14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이미지 업로드 시작](<screens/06_sc_50bd5e961133492089170f6ce8722f14.png>) | 업로드 진행 막대가 채워진다. |
| 07 | [`sc_686dd66afa034c4aa2d4873c645d8a3a`](https://gummble.com/screens/sc_686dd66afa034c4aa2d4873c645d8a3a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이미지 전송 진행](<screens/07_sc_686dd66afa034c4aa2d4873c645d8a3a.png>) | 파일명과 이미지 미리보기가 나타난다. |
| 08 | [`sc_3e3731a8434b4afaa36517cfb8b669db`](https://gummble.com/screens/sc_3e3731a8434b4afaa36517cfb8b669db?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이미지 업로드 완료 표시](<screens/08_sc_3e3731a8434b4afaa36517cfb8b669db.png>) | Finish로 유형을 생성한다. |
| 09 | [`sc_0ee8dbe38fe54aa381a2c4384015c6c4`](https://gummble.com/screens/sc_0ee8dbe38fe54aa381a2c4384015c6c4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [이벤트 유형 생성 완료](<screens/09_sc_0ee8dbe38fe54aa381a2c4384015c6c4.png>) | Close로 관리 목록에 복귀한다. |
| 10 | [`sc_529048e78b304f66937c84b12cbc8a07`](https://gummble.com/screens/sc_529048e78b304f66937c84b12cbc8a07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [생성된 유형 목록](<screens/10_sc_529048e78b304f66937c84b12cbc8a07.png>) | Consultation call 유형 생성 결과를 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — Branding & Design 초기

- Screen ID: `sc_4a74288006d54ecd949b1c814b0abc38`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4a74288006d54ecd949b1c814b0abc38?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/38795298-f890-46c6-afc7-9c22de6cd842.png)
- 로컬 이미지: [01_sc_4a74288006d54ecd949b1c814b0abc38.png](<screens/01_sc_4a74288006d54ecd949b1c814b0abc38.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_2610a8a87df6426aa534536c6eacbe4d`

#### 화면에서 직접 확인한 내용

- 레이아웃: 마법사4단계, 왼쪽 단계 목록, 중앙 테마/이미지 설정·우측 작은 미리보기.
- 입력 항목·필수 표시·기본값: Booking Page Theme Standard; 사용자 이미지 없음; Bonsai Branding off. 최소160px 정사각 이미지 권장.
- 버튼·메뉴·안내 문구: Finish, Cancel, 테마 선택, Add Custom Profile Image, Branding 토글.
- 확인된 상태: 3단계를 벗어나 마지막 디자인 설정에 도달했다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 유형 생성 완료 전 디자인 입력 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 브랜딩 off의 요금제 권한·이미지 제한은 미확인.

#### 모델링 영향

- 후보와 근거: 유형별 테마/이미지/브랜딩 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 예약 페이지 테마 목록

- Screen ID: `sc_2610a8a87df6426aa534536c6eacbe4d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2610a8a87df6426aa534536c6eacbe4d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8c3c2842-1cd8-4b67-8d26-a3693bfb75fe.png)
- 로컬 이미지: [02_sc_2610a8a87df6426aa534536c6eacbe4d.png](<screens/02_sc_2610a8a87df6426aa534536c6eacbe4d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4a74288006d54ecd949b1c814b0abc38` → 현재 → `sc_5219247100dc4cae868c35418dc0f1d5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 테마 드롭다운을 펼친 상태. 오른쪽 작은 레이아웃 미리보기.
- 입력 항목·필수 표시·기본값: Standard 선택; 목록 Standard/Classic/Sunrise/Sky/Coffee/Olive/Custom Theme, 각 테마 색상 점.
- 버튼·메뉴·안내 문구: 테마 선택, Finish, Cancel, Branding off.
- 확인된 상태: 7개 선택지를 확인한다.
- 단계 간 변화: 테마 목록을 연다.

#### 동작과 데이터

- 화면 관찰: 표시 테마 정의 선택 기능.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Custom Theme 상세는 미수록.

#### 모델링 영향

- 후보와 근거: 테마 이름과 실제 스타일 토큰 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Sunrise hover

- Screen ID: `sc_5219247100dc4cae868c35418dc0f1d5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5219247100dc4cae868c35418dc0f1d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/93dd1062-ca10-4f89-990e-f5b078c81543.png)
- 로컬 이미지: [03_sc_5219247100dc4cae868c35418dc0f1d5.png](<screens/03_sc_5219247100dc4cae868c35418dc0f1d5.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_2610a8a87df6426aa534536c6eacbe4d` → 현재 → `sc_c4a9ad050271457a99e7f27a5c97ac63`

#### 화면에서 직접 확인한 내용

- 레이아웃: 드롭다운 유지.
- 입력 항목·필수 표시·기본값: 입력 표시값은 Standard, Sunrise 행 초록 강조.
- 버튼·메뉴·안내 문구: Sunrise 항목, Finish/Cancel.
- 확인된 상태: 미리보기는 아직 Standard 색이다. hover를 적용 결과로 오독하지 않는다.
- 단계 간 변화: Sunrise를 가리킨다.

#### 동작과 데이터

- 화면 관찰: 선택 전 강조 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 키보드/hover 트리거는 미확인.

#### 모델링 영향

- 후보와 근거: 임시 UI 강조와 저장값 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Sunrise 적용

- Screen ID: `sc_c4a9ad050271457a99e7f27a5c97ac63`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c4a9ad050271457a99e7f27a5c97ac63?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/08e4eb6e-df48-49a9-92b9-455db32a0a25.png)
- 로컬 이미지: [04_sc_c4a9ad050271457a99e7f27a5c97ac63.png](<screens/04_sc_c4a9ad050271457a99e7f27a5c97ac63.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5219247100dc4cae868c35418dc0f1d5` → 현재 → `sc_4f10bb8170af46e4a15d99547ce30256`

#### 화면에서 직접 확인한 내용

- 레이아웃: 드롭다운 닫힘, 우측 미리보기 색 변경.
- 입력 항목·필수 표시·기본값: 테마 Sunrise, 주황 사이드패널·노란 버튼 미리보기. 이미지 없음, Branding off.
- 버튼·메뉴·안내 문구: 테마 선택, Add Custom Profile Image, Finish, Cancel.
- 확인된 상태: 선택값과 미리보기 모두 Sunrise로 바뀌었다.
- 단계 간 변화: Sunrise를 선택한다.

#### 동작과 데이터

- 화면 관찰: 테마 변경 결과.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한 색 hex는 화면에서 제공되지 않는다.

#### 모델링 영향

- 후보와 근거: 프리셋 색 구성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Sky 적용

- Screen ID: `sc_4f10bb8170af46e4a15d99547ce30256`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4f10bb8170af46e4a15d99547ce30256?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f93cfc9f-7e5e-4e04-8f9b-c0c7a4952f6e.png)
- 로컬 이미지: [05_sc_4f10bb8170af46e4a15d99547ce30256.png](<screens/05_sc_4f10bb8170af46e4a15d99547ce30256.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_c4a9ad050271457a99e7f27a5c97ac63` → 현재 → `sc_50bd5e961133492089170f6ce8722f14`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 설정 화면.
- 입력 항목·필수 표시·기본값: Sky 선택; 민트 사이드패널/버튼 미리보기, Branding off.
- 버튼·메뉴·안내 문구: 이미지 추가, Finish/Cancel.
- 확인된 상태: Sunrise→Sky로 색이 바뀌었다.
- 단계 간 변화: Sky로 바꾼다.

#### 동작과 데이터

- 화면 관찰: 테마 재선택 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 폰트/크기 등 테마별 차이는 미확인.

#### 모델링 영향

- 후보와 근거: 스타일 선택과 업무 데이터 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 이미지 업로드 시작

- Screen ID: `sc_50bd5e961133492089170f6ce8722f14`
- 원본: [화면 페이지](https://gummble.com/screens/sc_50bd5e961133492089170f6ce8722f14?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8ef061c1-2684-4876-9e18-b23b5f627017.png)
- 로컬 이미지: [06_sc_50bd5e961133492089170f6ce8722f14.png](<screens/06_sc_50bd5e961133492089170f6ce8722f14.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4f10bb8170af46e4a15d99547ce30256` → 현재 → `sc_686dd66afa034c4aa2d4873c645d8a3a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 이미지 추가 버튼 오른쪽 회색 진행 막대.
- 입력 항목·필수 표시·기본값: Sky 유지, 업로드 파일명/미리보기 아직 없음.
- 버튼·메뉴·안내 문구: Add Custom Profile Image, Finish, Cancel.
- 확인된 상태: 진행 표시가 시작되었다.
- 단계 간 변화: 프로필 이미지 업로드를 시작한다. 파일 선택창은 미수록.

#### 동작과 데이터

- 화면 관찰: 업로드 중간 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 파일 선택창·선택 파일 원본·취소는 미수록.

#### 모델링 영향

- 후보와 근거: 자산 업로드 진행 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 이미지 전송 진행

- Screen ID: `sc_686dd66afa034c4aa2d4873c645d8a3a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_686dd66afa034c4aa2d4873c645d8a3a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a92234a3-fda1-4225-84c2-0d53d89a8223.png)
- 로컬 이미지: [07_sc_686dd66afa034c4aa2d4873c645d8a3a.png](<screens/07_sc_686dd66afa034c4aa2d4873c645d8a3a.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_50bd5e961133492089170f6ce8722f14` → 현재 → `sc_3e3731a8434b4afaa36517cfb8b669db`

#### 화면에서 직접 확인한 내용

- 레이아웃: 버튼 오른쪽 막대가 초록으로 채워진다.
- 입력 항목·필수 표시·기본값: 파일명/미리보기는 아직 없음.
- 버튼·메뉴·안내 문구: Finish, Cancel, 이미지 추가 영역.
- 확인된 상태: 전송/처리 진행으로 보이나 막대만으로 최종 저장 성공을 확정하지 않는다.
- 단계 간 변화: 업로드 진행 막대가 채워진다.

#### 동작과 데이터

- 화면 관찰: 업로드 진행 UI 변화.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 정확한 백분율·처리 단계는 미확인.

#### 모델링 영향

- 후보와 근거: 업로드와 처리/연결 완료 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 이미지 업로드 완료 표시

- Screen ID: `sc_3e3731a8434b4afaa36517cfb8b669db`
- 원본: [화면 페이지](https://gummble.com/screens/sc_3e3731a8434b4afaa36517cfb8b669db?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8759642e-c0ba-4c18-a53e-ee66fcf39ed4.png)
- 로컬 이미지: [08_sc_3e3731a8434b4afaa36517cfb8b669db.png](<screens/08_sc_3e3731a8434b4afaa36517cfb8b669db.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_686dd66afa034c4aa2d4873c645d8a3a` → 현재 → `sc_0ee8dbe38fe54aa381a2c4384015c6c4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 이미지 필드와 오른쪽 썸네일.
- 입력 항목·필수 표시·기본값: spencer.png 파일명, 베이지 로고 썸네일; Sky·Branding off 유지.
- 버튼·메뉴·안내 문구: 파일 제거 X, Finish, Cancel.
- 확인된 상태: 업로드 결과가 파일명/미리보기로 나타난다.
- 단계 간 변화: 파일명과 이미지 미리보기가 나타난다.

#### 동작과 데이터

- 화면 관찰: 예약 유형에 사용할 이미지가 준비되었다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 자산 ID·크롭·최종 유형 연결 저장은 미확인.

#### 모델링 영향

- 후보와 근거: 이미지 참조와 원본 파일명 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 이벤트 유형 생성 완료

- Screen ID: `sc_0ee8dbe38fe54aa381a2c4384015c6c4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0ee8dbe38fe54aa381a2c4384015c6c4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b7c9b60a-6300-4ba8-a599-cb9fade7f3fa.png)
- 로컬 이미지: [09_sc_0ee8dbe38fe54aa381a2c4384015c6c4.png](<screens/09_sc_0ee8dbe38fe54aa381a2c4384015c6c4.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_3e3731a8434b4afaa36517cfb8b669db` → 현재 → `sc_529048e78b304f66937c84b12cbc8a07`

#### 화면에서 직접 확인한 내용

- 레이아웃: Event Type Created 페이지, 중앙 성공 일러스트·문구·링크.
- 입력 항목·필수 표시·기본값: Your event is live; 예약 URL 필드는 가로로 잘려 보인다.
- 버튼·메뉴·안내 문구: URL 열기 아이콘, Close.
- 확인된 상태: 고객이 링크로 회의를 예약할 수 있다는 안내.
- 단계 간 변화: Finish로 유형을 생성한다.

#### 동작과 데이터

- 화면 관찰: 유형 생성 성공을 확인한다. 실제 예약은 아직 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전체 URL·공개 범위·생성 실패 경로는 미확인.

#### 모델링 영향

- 후보와 근거: 유형 생성/공개 상태 및 공유 경로 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 생성된 유형 목록

- Screen ID: `sc_529048e78b304f66937c84b12cbc8a07`
- 원본: [화면 페이지](https://gummble.com/screens/sc_529048e78b304f66937c84b12cbc8a07?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/6ba84c63-1167-41ca-9412-e3dbab548038.png)
- 로컬 이미지: [10_sc_529048e78b304f66937c84b12cbc8a07.png](<screens/10_sc_529048e78b304f66937c84b12cbc8a07.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0ee8dbe38fe54aa381a2c4384015c6c4` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Scheduling 관리2열 화면.
- 입력 항목·필수 표시·기본값: Consultation call, Video Conferencing,30min; No Upcoming Events.
- 버튼·메뉴·안내 문구: View Booking Page, Copy Link, …, Calendar Settings, New Event Type.
- 확인된 상태: 생성한 유형이 목록에 나타난다.
- 단계 간 변화: Close로 관리 목록에 복귀한다.

#### 동작과 데이터

- 화면 관찰: 유형 레코드 영속 결과를 확인할 근거다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새로고침 후 유지와 실제 예약 연동은 미확인.

#### 모델링 영향

- 후보와 근거: 정의와 인스턴스의 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 테마 목록의 hover와 선택 후 미리보기 반영을 구분한다.
- [관찰] 업로드는 진행 표시→파일명/미리보기 순서다. 최소160px 정사각형은 권장 문구이지 강제 검증 결과가 아니다.
- [관찰] Finish 후 Event Type Created/Your event is live 안내와 목록 레코드가 있어 생성 완료를 확인한다.
- [관찰] Bonsai Branding은 계속 off이며 토글 변경 과정은 없다.

## 6. 공식 도움말과 API 대조

- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 테마·색·프로필 이미지·브랜딩을 설정할 수 있다.
- [공개 API](https://docs.hellobonsai.com/api): 검토한 공개 목록에서 예약 유형·가용 시간·캘린더 연결 전용 endpoint와 필드 계약은 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 예약 유형별 테마 식별자·색 구성·프로필 이미지 자산·브랜딩 표시 후보.
- 업로드 임시 상태와 최종 유형 저장·공개 링크 상태를 분리할 후보.

## 8. 미확인 사항과 검토 질문

- Custom Theme의 색/폰트 범위와 회사 기본 브랜딩의 상속·우선순위를 확인한다.
- 이미지 용량/확장자/크롭/실패/제거 동작, 업로드 후 Cancel 시 자산 정리를 확인한다.
- 브랜딩 표시의 요금제 권한과 공개 페이지 캐시 갱신을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 10단계 재조회 및 원본 10개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
