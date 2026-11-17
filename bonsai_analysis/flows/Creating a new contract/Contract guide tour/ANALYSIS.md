# Contract guide tour 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `03c89447-e059-4f05-b9f3-7b1430640cb1` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=03c89447-e059-4f05-b9f3-7b1430640cb1) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

생성된 표준 계약의 편집·서명 방법을 안내 투어로 확인한다.

- 생성 직후 Drafted/Standardized 문서에서 시작하며 계약 작성 본문은 바뀌지 않는다.

- 상위 분석: [Creating a new contract](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_8e868b8f4bf24c25ba59cbdb3a6094dd`](https://gummble.com/screens/sc_8e868b8f4bf24c25ba59cbdb3a6094dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 계약 초안·첫 안내 | Next로 강조 영역 편집 안내를 연다. |
| 02 | [`sc_679cd2ad4dc543da8376c9f9a3937eb5`](https://gummble.com/screens/sc_679cd2ad4dc543da8376c9f9a3937eb5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 강조 부분 편집 안내 | Next로 작성자 서명 안내를 연다. |
| 03 | [`sc_0d294250f432400a84649b47f29fd387`](https://gummble.com/screens/sc_0d294250f432400a84649b47f29fd387?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 서명·후속 발송 안내 | Finish로 투어를 닫는다. |
| 04 | [`sc_44b33b264e7f43c68480de85e6cc82f8`](https://gummble.com/screens/sc_44b33b264e7f43c68480de85e6cc82f8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 투어 종료 후 초안 | 편집 화면에 남는다. |

## 4. 화면별 상세 분석

### 단계 01 — 계약 초안·첫 안내

- Screen ID: `sc_8e868b8f4bf24c25ba59cbdb3a6094dd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8e868b8f4bf24c25ba59cbdb3a6094dd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e6ac0cb2-aba6-4e80-848c-76c4a7abb4af.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_679cd2ad4dc543da8376c9f9a3937eb5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 문서, 오른쪽 Overview/Settings/Payments, 위 툴바와 첫 투어 말풍선.
- 입력 항목·필수 표시·기본값: Drafted, Standardized, $20 USD/hour; 로고 on, Font FF Meta Serif, Single recipient(no co-signer). 본문에 당사자·범위·2/6~3/8·시급20·15일·10% 반영.
- 버튼·메뉴·안내 문구: Preview, Automation, Sign Contract, …; Add Custom Clause, Convert to Fully Editable; 투어 Next/X.
- 확인된 상태: 입력 부분은 노란 강조. 본문에는 비용 사전 승인 불필요·지원 미제공 등 마법사에서 직접 보지 못한 조항도 있다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 초안 생성과 조건의 본문 반영을 확인했다. 안내의 변호사 검토 문구는 제품 설명이지 본 분석의 법적 평가가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 기본 조항 출처, 전체 문서 하단, 실제 저장 요청 및 지급 설정 하단은 미확인.

#### 모델링 영향

- 후보와 근거: 템플릿 기본 조항과 사용자 입력의 출처, 문서 타입/상태/스타일 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 강조 부분 편집 안내

- Screen ID: `sc_679cd2ad4dc543da8376c9f9a3937eb5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_679cd2ad4dc543da8376c9f9a3937eb5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/348a3cac-de13-462a-96b5-fc877719156e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8e868b8f4bf24c25ba59cbdb3a6094dd` → 현재 → `sc_0d294250f432400a84649b47f29fd387`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 좌상단 당사자 문장에 말풍선이 연결된다.
- 입력 항목·필수 표시·기본값: Drafted, Standardized, 시급20 및 문서 조건 유지.
- 버튼·메뉴·안내 문구: Back, Next, X; 뒤쪽 편집 도구.
- 확인된 상태: 입력한 조건이 강조되어 있고 해당 텍스트를 클릭해 수정할 수 있다는 안내.
- 단계 간 변화: Next로 강조 영역 편집 안내를 연다.

#### 동작과 데이터

- 화면 관찰: 투어 단계만 변경되며 계약 데이터 수정 증거는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 클릭 시 입력 UI·저장 동작은 이 투어에 없다.

#### 모델링 영향

- 후보와 근거: 편집 가능한 문서 영역과 구조화된 값의 대응 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 서명·후속 발송 안내

- Screen ID: `sc_0d294250f432400a84649b47f29fd387`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0d294250f432400a84649b47f29fd387?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e6dbae6b-d800-42aa-acf1-c4a709735582.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_679cd2ad4dc543da8376c9f9a3937eb5` → 현재 → `sc_44b33b264e7f43c68480de85e6cc82f8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우상단 Sign Contract 주변에 마지막 말풍선.
- 입력 항목·필수 표시·기본값: 계약 내용과 설정 유지.
- 버튼·메뉴·안내 문구: Back, Finish, X; Sign Contract.
- 확인된 상태: 작성자 전자서명 후 고객에게 보내 상대 서명을 받으라는 순서를 설명한다.
- 단계 간 변화: Next로 작성자 서명 안내를 연다.

#### 동작과 데이터

- 화면 관찰: 서명과 발송이 분리된 동작임을 안내에서 확인한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 상대 서명 및 거절 UI는 미수록.

#### 모델링 영향

- 후보와 근거: 서명 주체별 상태와 발송 이벤트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 투어 종료 후 초안

- Screen ID: `sc_44b33b264e7f43c68480de85e6cc82f8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_44b33b264e7f43c68480de85e6cc82f8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/42759925-1300-4c5e-bf92-71f3b60f447e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0d294250f432400a84649b47f29fd387` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 말풍선이 사라져 문서와 우측 패널이 드러난다.
- 입력 항목·필수 표시·기본값: Drafted, Standardized, $20/hour, 로고 on, FF Meta Serif, Single recipient.
- 버튼·메뉴·안내 문구: Sign Contract, Preview, Automation, Add Custom Clause, Convert to Fully Editable.
- 확인된 상태: 투어 종료 후 계약은 여전히 초안이다.
- 단계 간 변화: Finish로 투어를 닫는다.

#### 동작과 데이터

- 화면 관찰: 업무 상태 전이는 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 투어 완료 저장 위치는 미확인.

#### 모델링 영향

- 후보와 근거: 온보딩 상태와 계약 상태를 분리한다.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] Next/Back/Finish/X로 진행하는 3개 안내 말풍선이다.
- [관찰] 완료 후에도 Drafted이며 투어 자체가 서명·발송을 수행하지 않는다.

## 6. 공식 도움말과 API 대조

- [표준·사용자 정의 계약](https://help.hellobonsai.com/en/articles/918802-creating-completely-custom-contracts): Basic Info·Scope of Work·Payment 입력과 표준 계약의 부분 편집, 작성자 서명 후 발송 순서를 설명한다. 2026-07-27 이후 생성 계정은 통합 Document builder를 사용하므로 캡처의 구형 계약 편집기와 구분한다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인. 안내 투어 저장 endpoint는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 투어 진행·완료 여부와 계약 업무 상태를 분리할 후보.

## 8. 미확인 사항과 검토 질문

- 재진입 시 투어 반복 여부, 닫기와 Finish의 차이, 사용자별 완료 상태 저장 여부를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
