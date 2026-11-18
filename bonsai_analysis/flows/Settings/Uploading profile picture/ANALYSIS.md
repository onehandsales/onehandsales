# Uploading profile picture 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `7f83211c-f4cf-4bc7-a715-c64a2a27626b` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=7f83211c-f4cf-4bc7-a715-c64a2a27626b) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 5개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

개인 프로필의 JD 이니셜 사진을 인물 이미지로 바꾸고 계정 설정을 저장한다.

- 회사 로고·고객 이미지 업로드와 다른 개인 프로필 영역.
- 운영체제 파일 선택기는 수록되지 않았다.

- 상위 분석: [Settings](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings/Uploading profile picture`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_f81cdd742f9d4d09b96c9de95c4d0390`](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Profile Settings](<screens/01_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>) | 아바타 hover |
| 02 | [`sc_0430edfa781949a18635bcbcac8ba7ac`](https://gummble.com/screens/sc_0430edfa781949a18635bcbcac8ba7ac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [아바타 Update Image hover](<screens/02_sc_0430edfa781949a18635bcbcac8ba7ac.png>) | 아바타 위 진행 막대 형태 표시 |
| 03 | [`sc_d81700e8fdfa4441a7be8978018ba9c2`](https://gummble.com/screens/sc_d81700e8fdfa4441a7be8978018ba9c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [아바타 업로드 중간 상태](<screens/03_sc_d81700e8fdfa4441a7be8978018ba9c2.png>) | 선택 이미지 표시 |
| 04 | [`sc_e320193a5ad34c869d44bf5d41a5e13c`](https://gummble.com/screens/sc_e320193a5ad34c869d44bf5d41a5e13c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [새 프로필 이미지 표시](<screens/04_sc_e320193a5ad34c869d44bf5d41a5e13c.png>) | 계정 저장 성공 |
| 05 | [`sc_78a1c292069f4a35a77afd642a459e7c`](https://gummble.com/screens/sc_78a1c292069f4a35a77afd642a459e7c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [프로필 저장 성공](<screens/05_sc_78a1c292069f4a35a77afd642a459e7c.png>) | 완료 토스트에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — Profile Settings

- Screen ID: `sc_f81cdd742f9d4d09b96c9de95c4d0390`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f81cdd742f9d4d09b96c9de95c4d0390?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/8881986d-5358-4529-a8dc-52332465d205.png)
- 로컬 이미지: [01_sc_f81cdd742f9d4d09b96c9de95c4d0390.png](<screens/01_sc_f81cdd742f9d4d09b96c9de95c4d0390.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_0430edfa781949a18635bcbcac8ba7ac`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 5개 탭, Account 내부 왼쪽 7개 세부 메뉴, 오른쪽 프로필 카드와 하단 Delete Account 일부.
- 입력 항목·필수 표시·기본값: First name Joe, Last name Doe, Email, Title의 회색 Operations Director 예시. JD 아바타와 제거 X. 별표 없음.
- 버튼·메뉴·안내 문구: Save Changes, Update Password 접기/펼치기.
- 확인된 상태: Profile Settings 선택. 개인 사진은 이니셜 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 개인 이름·로그인 이메일·직함과 사진을 수정하는 화면.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수 필드 검증·이메일 변경 재인증·사진 저장 시점 미확인.

#### 모델링 영향

- 후보와 근거: 개인 프로필과 인증정보 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 아바타 Update Image hover

- Screen ID: `sc_0430edfa781949a18635bcbcac8ba7ac`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0430edfa781949a18635bcbcac8ba7ac?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cd4b3379-fe05-4cfa-a79d-d42f6ee16491.png)
- 로컬 이미지: [02_sc_0430edfa781949a18635bcbcac8ba7ac.png](<screens/02_sc_0430edfa781949a18635bcbcac8ba7ac.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_f81cdd742f9d4d09b96c9de95c4d0390` → 현재 → `sc_d81700e8fdfa4441a7be8978018ba9c2`

#### 화면에서 직접 확인한 내용

- 레이아웃: JD 정사각형 위 반투명 회색 레이어와 Update Image 문구.
- 입력 항목·필수 표시·기본값: 다른 프로필 값 유지.
- 버튼·메뉴·안내 문구: 사진 영역, 제거 X, Save Changes.
- 확인된 상태: hover 강조 상태.
- 단계 간 변화: 아바타 hover

#### 동작과 데이터

- 화면 관찰: 사진 교체 진입점이 아바타 자체.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 키보드 접근·파일 선택기 미확인.

#### 모델링 영향

- 후보와 근거: 이미지 업로드 컨트롤 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 아바타 업로드 중간 상태

- Screen ID: `sc_d81700e8fdfa4441a7be8978018ba9c2`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d81700e8fdfa4441a7be8978018ba9c2?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7d60dcbd-2551-45ab-b6fc-aef56e207292.png)
- 로컬 이미지: [03_sc_d81700e8fdfa4441a7be8978018ba9c2.png](<screens/03_sc_d81700e8fdfa4441a7be8978018ba9c2.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_0430edfa781949a18635bcbcac8ba7ac` → 현재 → `sc_e320193a5ad34c869d44bf5d41a5e13c`

#### 화면에서 직접 확인한 내용

- 레이아웃: JD 위 가로 밝은 막대, 다른 입력 폼 그대로.
- 입력 항목·필수 표시·기본값: Title에 포커스 테두리, 텍스트는 회색 예시.
- 버튼·메뉴·안내 문구: 사진 제거 X와 Save Changes 유지.
- 확인된 상태: 진행 막대처럼 보이나 수치·완료 문구 없음.
- 단계 간 변화: 아바타 위 진행 막대 형태 표시

#### 동작과 데이터

- 화면 관찰: 사진 교체 중간 캡처로 해석 가능하나 업로드 단계는 추정.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 진행률·실패·크롭 미확인.

#### 모델링 영향

- 후보와 근거: 업로드 상태를 정적 이미지로 확정하지 않고 중간 상태로 기록.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 새 프로필 이미지 표시

- Screen ID: `sc_e320193a5ad34c869d44bf5d41a5e13c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e320193a5ad34c869d44bf5d41a5e13c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/fedd612d-648f-424a-8f0d-e7d9458cbd6d.png)
- 로컬 이미지: [04_sc_e320193a5ad34c869d44bf5d41a5e13c.png](<screens/04_sc_e320193a5ad34c869d44bf5d41a5e13c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_d81700e8fdfa4441a7be8978018ba9c2` → 현재 → `sc_78a1c292069f4a35a77afd642a459e7c`

#### 화면에서 직접 확인한 내용

- 레이아웃: JD 자리에 푸른 배경 인물 사진. 우측 상단 회사 로고 그대로.
- 입력 항목·필수 표시·기본값: 이름·이메일 변화 없음.
- 버튼·메뉴·안내 문구: Save Changes와 사진 제거 X.
- 확인된 상태: 선택 이미지 표시, 성공 토스트 아직 없음.
- 단계 간 변화: 선택 이미지 표시

#### 동작과 데이터

- 화면 관찰: 개인 이미지가 교체됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서버 저장 여부 미확인.

#### 모델링 영향

- 후보와 근거: 개인 avatar 참조 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 프로필 저장 성공

- Screen ID: `sc_78a1c292069f4a35a77afd642a459e7c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_78a1c292069f4a35a77afd642a459e7c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/017127ed-bf4f-4f3b-acbd-15c24ca1e79a.png)
- 로컬 이미지: [05_sc_78a1c292069f4a35a77afd642a459e7c.png](<screens/05_sc_78a1c292069f4a35a77afd642a459e7c.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e320193a5ad34c869d44bf5d41a5e13c` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 사진과 우하단 계정 업데이트 성공 토스트.
- 입력 항목·필수 표시·기본값: 프로필 입력 유지.
- 버튼·메뉴·안내 문구: Save Changes, 토스트 X.
- 확인된 상태: 저장 성공 UI.
- 단계 간 변화: 계정 저장 성공

#### 동작과 데이터

- 화면 관찰: 계정 업데이트가 완료됐다는 화면 근거.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 세션 전파·사진 캐시 미확인.

#### 모델링 영향

- 후보와 근거: 저장 결과와 프로필 갱신 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 사진 변경 미리보기 후 Save Changes와 성공 토스트가 구분된다.
- 사진을 바꿔도 우측 상단 회사 로고는 그대로다.

## 6. 공식 도움말과 API 대조

- [회사·개인 정보 변경](https://help.hellobonsai.com/en/articles/1977404-how-to-change-your-personal-or-business-information): 자신의 회사 이름·주소·통화 등은 Company Settings에서 저장하며 향후 문서/업무에 적용한다고 설명한다. 고객사 Companies 리소스와 구분한다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 개인 프로필 사진 asset과 운영 회사 로고 asset을 구분.
- 업로드 진행·미리보기·계정 저장 상태 후보.

## 8. 미확인 사항과 검토 질문

- 허용 확장자/파일 크기/자르기와 삭제 X 동작은 추가 확인.
- 업로드 즉시 영속화되는지 Save Changes 이전 이탈로 확인 필요.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 5단계 재조회 및 원본 5개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
