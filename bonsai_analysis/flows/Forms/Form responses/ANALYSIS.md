# Form responses 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ecd1821a-aa3a-40f6-beff-71e924dfb56f` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ecd1821a-aa3a-40f6-beff-71e924dfb56f) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

폼 응답의 빈 상태와 제출 후 목록을 확인한다.

- 폼 목록→설정 화면→Responses 탭으로 이어진다. 중간 설정 오류 발생 원인과 2건의 응답 생성은 이 상위 흐름에 없다.

- 상위 분석: [Forms](../ANALYSIS.md)
- 하위 플로우: [Response detail](Response%20detail/ANALYSIS.md), [Giving a response](Giving%20a%20response/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_e8689439c84b422fa72242c56784a19a`](https://gummble.com/screens/sc_e8689439c84b422fa72242c56784a19a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 폼 목록 | 폼 편집기로 진입한다. |
| 02 | [`sc_80538dd26ffd48f7bbaa444a7ce66805`](https://gummble.com/screens/sc_80538dd26ffd48f7bbaa444a7ce66805?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 폼 설정과 일반 오류 | 일반 오류 안내가 사라진다. 해결 동작은 미수록. |
| 03 | [`sc_89eb7d6a8ce640c4a33e5449a13e9772`](https://gummble.com/screens/sc_89eb7d6a8ce640c4a33e5449a13e9772?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 일반 오류 제거 상태 | Responses 탭으로 이동한다. |
| 04 | [`sc_b86c61ba3e0247a2805d392dce12f454`](https://gummble.com/screens/sc_b86c61ba3e0247a2805d392dce12f454?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 응답 없음 | 후속 시점에 응답 2건 목록이 나타난다. 제출 과정은 하위 흐름 참고. |
| 05 | [`sc_54a522cdaf524c81b83ad5dbccf32762`](https://gummble.com/screens/sc_54a522cdaf524c81b83ad5dbccf32762?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 응답 2건 목록 | 응답 상세 조회로 이어진다. |

## 4. 화면별 상세 분석

### 단계 01 — 폼 목록

- Screen ID: `sc_e8689439c84b422fa72242c56784a19a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e8689439c84b422fa72242c56784a19a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0d797d41-7022-44a3-ab28-376126608996.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_80538dd26ffd48f7bbaa444a7ce66805`

#### 화면에서 직접 확인한 내용

- 레이아웃: 공통 사이드바와 상단 검색/Track Time/+New. 본문 Forms 제목 아래 한 행의 테이블.
- 입력 항목·필수 표시·기본값: Graphic Design Brief, 0 Response, 9 Questions, Created Feb 1 2024.
- 버튼·메뉴·안내 문구: Learn More, New Form, 행 제목/응답 수, ….
- 확인된 상태: 기존 폼 하나와 응답 0건이 표시된다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 폼 정의와 제출 응답의 수를 분리해 보여준다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 행 메뉴·권한·질문 수 계산 기준은 미확인.

#### 모델링 영향

- 후보와 근거: 폼과 응답의 일대다 관계 후보. 고객과의 관계는 별도 확인한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 폼 설정과 일반 오류

- Screen ID: `sc_80538dd26ffd48f7bbaa444a7ce66805`
- 원본: [화면 페이지](https://gummble.com/screens/sc_80538dd26ffd48f7bbaa444a7ce66805?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/61046584-df97-4ab5-863e-ec5003be7a12.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_e8689439c84b422fa72242c56784a19a` → 현재 → `sc_89eb7d6a8ce640c4a33e5449a13e9772`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 폼, 오른쪽 Settings. 폼 상단 빨간 오류 배너.
- 입력 항목·필수 표시·기본값: Background Image 파일명 일부; Display Logo on; Logo Alignment Center…; Form Title Alignment Left; Font Arial; Text Color 짙은색, Form Background 흰색, Page Background 연한색, Submit Button 초록, Submit Text 흰색, Submit Alignment Center…; CAPTCHA off.
- 버튼·메뉴·안내 문구: 이미지 삭제 X, 정렬/폰트 선택, 색 선택, 토글, Create/Responses, Share Form.
- 확인된 상태: Please fix the errors below. 개별 오류는 현재 뷰포트에 보이지 않는다.
- 단계 간 변화: 폼 편집기로 진입한다.

#### 동작과 데이터

- 화면 관찰: 스타일·CAPTCHA 설정과 검증 상태를 확인했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 오류 발생 원인·전체 폼 하단 오류·설정 저장 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 폼 표시 설정·공개 제출 검증·편집 상태를 분리한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 일반 오류 제거 상태

- Screen ID: `sc_89eb7d6a8ce640c4a33e5449a13e9772`
- 원본: [화면 페이지](https://gummble.com/screens/sc_89eb7d6a8ce640c4a33e5449a13e9772?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/58edf165-0646-4871-88df-207352a8017e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_80538dd26ffd48f7bbaa444a7ce66805` → 현재 → `sc_b86c61ba3e0247a2805d392dce12f454`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은 Settings 화면, 오류 배너가 사라져 폼이 위로 당겨졌다.
- 입력 항목·필수 표시·기본값: 배경·로고·정렬·Arial·색·CAPTCHA off 유지.
- 버튼·메뉴·안내 문구: 스타일 필드, Responses, Preview, Share Form.
- 확인된 상태: 관찰 가능한 차이는 오류 배너 제거다.
- 단계 간 변화: 일반 오류 안내가 사라진다. 해결 동작은 미수록.

#### 동작과 데이터

- 화면 관찰: 어떤 입력 수정으로 해소됐는지는 보이지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 폼 데이터/설정이 저장됐다고 이 화면만으로 확정하지 않는다.

#### 모델링 영향

- 후보와 근거: 검증 메시지 수명주기 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 응답 없음

- Screen ID: `sc_b86c61ba3e0247a2805d392dce12f454`
- 원본: [화면 페이지](https://gummble.com/screens/sc_b86c61ba3e0247a2805d392dce12f454?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/704b1094-2e3a-4344-a459-7b9ab4172d69.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_89eb7d6a8ce640c4a33e5449a13e9772` → 현재 → `sc_54a522cdaf524c81b83ad5dbccf32762`

#### 화면에서 직접 확인한 내용

- 레이아웃: Responses 탭 선택, 중앙 아이콘과 빈 상태 안내.
- 입력 항목·필수 표시·기본값: You have no responses yet; 폼 게시 성공 및 공유 안내.
- 버튼·메뉴·안내 문구: Share Your Form, Create, Forms 뒤로.
- 확인된 상태: 응답 0건의 안내 화면.
- 단계 간 변화: Responses 탭으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 게시와 응답 제출은 별개 상태다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 새 폼의 공개 범위·공유 전 접근 가능 여부는 미확인.

#### 모델링 영향

- 후보와 근거: 공개 상태와 응답 집계 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 응답 2건 목록

- Screen ID: `sc_54a522cdaf524c81b83ad5dbccf32762`
- 원본: [화면 페이지](https://gummble.com/screens/sc_54a522cdaf524c81b83ad5dbccf32762?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a28ab068-27a6-472a-94f8-1eec551c501b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_b86c61ba3e0247a2805d392dce12f454` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Responses 탭 아래 Date/Name/Email Address 테이블.
- 입력 항목·필수 표시·기본값: Feb 8 2024 7:15PM Jane Studio와 이메일; 7:14PM 이메일을 Name으로 사용하는 두 번째 행.
- 버튼·메뉴·안내 문구: Date 정렬 화살표, 각 행 …, 행 이름, Create.
- 확인된 상태: 최신 시각 행이 위에 있다. 기존 0건에서 생성 과정 없이 2건으로 바뀌었다.
- 단계 간 변화: 후속 시점에 응답 2건 목록이 나타난다. 제출 과정은 하위 흐름 참고.

#### 동작과 데이터

- 화면 관찰: 서로 다른 응답 행과 제출 시각이 존재한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 시간대·실시간 갱신·Name 대체 규칙은 미확인.

#### 모델링 영향

- 후보와 근거: 응답 식별자·제출시각·고객 참조/표시 스냅샷 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 응답이 없어도 폼은 published successfully 안내를 표시한다.
- [관찰] 응답 목록에는 Date/Name/Email Address가 있다. Name이 회사명 또는 이메일로 표시되므로 제출 First/Last Name과 단순 동일시하면 안 된다.
- [관찰] 폼 Settings에는 스타일과 CAPTCHA가 있다. 이 흐름에서 변경/저장하지 않았다.

## 6. 공식 도움말과 API 대조

- [폼·질문·공유·응답 도움말](https://help.hellobonsai.com/en/articles/3831621-create-custom-forms-and-questionnaires): 제출자·답변·제출일 조회를 설명한다.
- [공개 API 문서](https://docs.hellobonsai.com/api): 검토한 공개 리소스 목록에서 Forms/Questions/Responses 전용 endpoint와 필드 계약을 확인하지 못했다. Documents API를 폼 API로 대체하지 않는다.

## 7. 데이터 모델링 시사점

- 폼 공개 상태와 응답 수를 분리할 후보.
- 응답 제출 정보와 연결된 고객 표시명, 폼 스타일/스팸 방지 설정 후보.

## 8. 미확인 사항과 검토 질문

- 공개 설정 저장/게시 시점, CAPTCHA 기본값과 서버 검증을 확인한다.
- 제출 이름과 목록 Name의 관계를 고객 상세와 대조한다.
- 빈 목록→2건 사이 갱신 방식·시간대·정렬/페이지 처리·권한을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
