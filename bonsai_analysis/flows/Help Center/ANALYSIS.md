# Help Center 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **2/2단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `4f8c359f-2e1f-46bd-953b-bd601767a0f1` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=4f8c359f-2e1f-46bd-953b-bd601767a0f1) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 2단계 / 2단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

사용자가 도움말 검색·인기 문서·주제별 컬렉션을 찾아 셀프서비스 지원을 받는다.

- 공식 도움말 사이트 전용 헤더를 사용한다.
- 하위 Help article detail에서 인기 포털 문서로 진입한다.

- 하위 플로우: [Help article detail](Help%20article%20detail/ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_5d4f0991488547c6bd0735f4e074318c`](https://gummble.com/screens/sc_5d4f0991488547c6bd0735f4e074318c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 도움말 홈 | 목록 하단으로 스크롤; 중간 컬렉션 일부 미수록 |
| 02 | [`sc_979e0c1be7934cd6a079e9914cec68dd`](https://gummble.com/screens/sc_979e0c1be7934cd6a079e9914cec68dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 도움말 홈 하단 | 푸터에서 종료; 검색·문의 실행 없음 |

## 4. 화면별 상세 분석

### 단계 01 — 도움말 홈

- Screen ID: `sc_5d4f0991488547c6bd0735f4e074318c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5d4f0991488547c6bd0735f4e074318c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/70d86993-9d53-4292-90d0-f8f6a7667a7d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_979e0c1be7934cd6a079e9914cec68dd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 잎 배경 헤더와 큰 검색창, Popular Articles 3열, 아래 컬렉션 카드 2열.
- 입력 항목·필수 표시·기본값: Search for articles 빈 입력, 언어 English.
- 버튼·메뉴·안내 문구: Go to Bonsai·My Account·Feature Requests, 인기 포털·결제수단·입금일정 문서.
- 확인된 상태: General Questions & Overview 55, Invoicing & Getting Paid 64 articles; Proposals·Contracts 일부.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 공개 도움말 탐색 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 검색 실행·컬렉션 클릭 결과·언어 선택 목록 미확인.

#### 모델링 영향

- 후보와 근거: 컬렉션·기사·표시 개수·검색 입력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 도움말 홈 하단

- Screen ID: `sc_979e0c1be7934cd6a079e9914cec68dd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_979e0c1be7934cd6a079e9914cec68dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/adce822d-c237-4040-bcaa-292761f43394.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_5d4f0991488547c6bd0735f4e074318c` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 컬렉션 2열 마지막 부분과 중앙 로고·푸터.
- 입력 항목·필수 표시·기본값: 입력 없음.
- 버튼·메뉴·안내 문구: 3rd-Party Integrations 4, Business banking 9, Scheduling 4, KYC & Verification 2; Back to Bonsai·Email Support·Feature Requests.
- 확인된 상태: Bonsai 2024 저작권 표시.
- 단계 간 변화: 목록 하단으로 스크롤; 중간 컬렉션 일부 미수록

#### 동작과 데이터

- 화면 관찰: 통합·은행·예약·신원확인 도움말이 분리되어 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 중간 목록·각 문서 내용 미수록. 2024는 캡처일 증거가 아니다.

#### 모델링 영향

- 후보와 근거: 도움말 분류와 외부 지원 링크 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 컬렉션의 기사 개수는 캡처 당시 값이다.
- 검색 입력·언어 메뉴는 보이나 검색 결과·언어 전환은 미수록이다.

## 6. 공식 도움말과 API 대조

- [공식 도움말 홈](https://help.hellobonsai.com/en/): 검색·인기 문서·주제 컬렉션 구조를 확인했다. 현재는 CRM·Productivity·Finance 등으로 재분류되어 캡처의 명칭·개수와 다르다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 문서는 업무 리소스 중심이며 이 공개 페이지의 콘텐츠·검색·추천·제휴 관리 endpoint와 필드 계약은 확인하지 못했다. 화면 카드를 곧바로 업무 DB 테이블로 확정하지 않는다.

## 7. 데이터 모델링 시사점

- 도움말 컬렉션·기사·언어·검색 색인·추천 순서 후보. 업무 DB와 분리한다.

## 8. 미확인 사항과 검토 질문

- 검색 결과·빈 검색·언어 전환·중간 컬렉션을 추가 캡처로 확인한다.
- 외부 지원 플랫폼을 사용할지 자체 콘텐츠로 구현할지 결정이 필요하다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 2개와 실제 이미지 2개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
