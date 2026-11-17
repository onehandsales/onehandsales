# Signing a contract 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `9c947be2-ae51-481b-953f-f7d65a3a366e` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=9c947be2-ae51-481b-953f-f7d65a3a366e) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

작성자가 계약에 서명해 고객 발송 가능한 상태로 만든다.

- Fully Editable 초안에서 시작한다. 이 흐름에는 고객 발송·고객 서명 화면이 없다.

- 상위 분석: [Creating a new contract](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_eddad5fbd6db473080c167790ff3bd1c`](https://gummble.com/screens/sc_eddad5fbd6db473080c167790ff3bd1c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Fully Editable 전환 완료 | Sign Contract로 서명 모달을 연다. |
| 02 | [`sc_20c95105456a422b92ed14f16a395998`](https://gummble.com/screens/sc_20c95105456a422b92ed14f16a395998?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작성자 서명 모달 | 법적 이름을 입력한다. |
| 03 | [`sc_a677902c130b4fef91420fa5123b3875`](https://gummble.com/screens/sc_a677902c130b4fef91420fa5123b3875?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 이름 입력·서명 미리보기 | Confirm Signature를 실행한다. |
| 04 | [`sc_1798ad71955049e3a338278b01b05a37`](https://gummble.com/screens/sc_1798ad71955049e3a338278b01b05a37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작성자 서명 확정 | Finalized 상태로 바뀐 뒤 본문 하단으로 스크롤한다. |
| 05 | [`sc_4bd74dbfe61f48ce9ae4b33e4e7b7d60`](https://gummble.com/screens/sc_4bd74dbfe61f48ce9ae4b33e4e7b7d60?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 계약 하단 양측 서명란 | 작성자 서명과 비어 있는 고객 서명란을 확인한다. |

## 4. 화면별 상세 분석

### 단계 01 — Fully Editable 전환 완료

- Screen ID: `sc_eddad5fbd6db473080c167790ff3bd1c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_eddad5fbd6db473080c167790ff3bd1c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/085a6a13-3e30-4146-bfbc-72dcd922124e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_20c95105456a422b92ed14f16a395998`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 본문 강조가 없어지고 우측 설정이 간소화된다.
- 입력 항목·필수 표시·기본값: Drafted 유지, Type Fully Editable; 로고 on, FF Meta Serif, Single recipient, Currency USD. Overview의 Amount가 보이지 않는다.
- 버튼·메뉴·안내 문구: Sign Contract, Preview, Automation, …; 기존 Add Custom Clause/Convert 도구는 없어졌다.
- 확인된 상태: Contract has been successfully updated 토스트. 본문 계약 조건은 남아 있다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 편집 타입 변경 성공을 확인했다. 금액 표시 제거가 데이터 삭제 증거는 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 전환 이후 실제 본문 수정과 저장은 미수록.

#### 모델링 영향

- 후보와 근거: 자유 본문·타입·계약 상태의 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 작성자 서명 모달

- Screen ID: `sc_20c95105456a422b92ed14f16a395998`
- 원본: [화면 페이지](https://gummble.com/screens/sc_20c95105456a422b92ed14f16a395998?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e5c2e959-d3c8-4c78-a49c-6b07853ce309.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_eddad5fbd6db473080c167790ff3bd1c` → 현재 → `sc_a677902c130b4fef91420fa5123b3875`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 큰 Sign Contract 모달. 왼쪽 입력·동의 문구, 오른쪽 SIGNATURE PREVIEW.
- 입력 항목·필수 표시·기본값: 법적 이름란에 Joe Doe 회색 안내. 미리보기에는 회사·이름·이메일이 보이고 서명 선은 비어 있다.
- 버튼·메뉴·안내 문구: Confirm Signature, 외부 X.
- 확인된 상태: 확정 클릭이 서명을 구성한다는 안내가 보인다. 실제 법적 효력을 본 분석에서 평가하지 않는다.
- 단계 간 변화: Sign Contract로 서명 모달을 연다.

#### 동작과 데이터

- 화면 관찰: 프로필 표시 정보와 사용자 입력 서명을 구분한다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 회색 이름이 placeholder인지 초기값인지 입력 전 단독 화면으로는 불명확하나 다음 화면과 색/서명 변화가 있다.

#### 모델링 영향

- 후보와 근거: 서명자 표시 정보와 확정 전 서명 입력 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 이름 입력·서명 미리보기

- Screen ID: `sc_a677902c130b4fef91420fa5123b3875`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a677902c130b4fef91420fa5123b3875?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/68205688-89cb-4ac6-ae89-d7a9c12b2530.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_20c95105456a422b92ed14f16a395998` → 현재 → `sc_1798ad71955049e3a338278b01b05a37`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 2열 모달.
- 입력 항목·필수 표시·기본값: Joe Doe가 검은 입력값으로 표시되고 오른쪽에 필기체 서명이 나타난다.
- 버튼·메뉴·안내 문구: Confirm Signature, X.
- 확인된 상태: 입력값과 서명 이미지가 동기화되었다.
- 단계 간 변화: 법적 이름을 입력한다.

#### 동작과 데이터

- 화면 관찰: 서명 프리뷰 생성일 뿐 아직 확정된 계약 서명은 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 이름 허용·최대 길이·폰트/서명 방식은 미확인.

#### 모델링 영향

- 후보와 근거: 입력/미리보기/확정 이벤트 구분 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 작성자 서명 확정

- Screen ID: `sc_1798ad71955049e3a338278b01b05a37`
- 원본: [화면 페이지](https://gummble.com/screens/sc_1798ad71955049e3a338278b01b05a37?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2dcada4f-5e59-4a3a-8584-4890d63e8652.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a677902c130b4fef91420fa5123b3875` → 현재 → `sc_4bd74dbfe61f48ce9ae4b33e4e7b7d60`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 화면으로 복귀. 우측 Overview/Payments/Activity.
- 입력 항목·필수 표시·기본값: Status Finalized, Type Fully Editable, Currency USD.
- 버튼·메뉴·안내 문구: Send Contract, Preview, Automation, …; 편집 Settings는 보이지 않는다.
- 확인된 상태: Drafted에서 Finalized로 바뀌고 주 버튼이 Send Contract가 된다.
- 단계 간 변화: Confirm Signature를 실행한다.

#### 동작과 데이터

- 화면 관찰: 작성자 서명 후 발송 준비 상태를 확인했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 아직 고객 발송 완료·고객 서명 증거는 없다.

#### 모델링 영향

- 후보와 근거: 서명 확정에 따른 문서 편집 잠금 및 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 계약 하단 양측 서명란

- Screen ID: `sc_4bd74dbfe61f48ce9ae4b33e4e7b7d60`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4bd74dbfe61f48ce9ae4b33e4e7b7d60?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/15b40b89-2324-4dac-8777-c00e636ec6da.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_1798ad71955049e3a338278b01b05a37` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 문서 하단 조항 아래 두 서명 블록. 상단 툴바·우측 패널은 고정.
- 입력 항목·필수 표시·기본값: 왼쪽 Joe Studio/Joe Doe/이메일/필기체 서명/Signed on February 8, 2024. 오른쪽 Doe Company는 서명선이 비어 있다.
- 버튼·메뉴·안내 문구: Send Contract, Preview, Automation, …, Activity 접기.
- 확인된 상태: 작성자 서명만 존재하고 고객 서명은 대기한다.
- 단계 간 변화: Finalized 상태로 바뀐 뒤 본문 하단으로 스크롤한다.

#### 동작과 데이터

- 화면 관찰: 각 당사자의 서명 상태를 독립적으로 확인할 수 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 발송·상대 서명·공동 서명·거절·감사 로그 상세는 미수록.

#### 모델링 영향

- 후보와 근거: 문서 1개에 여러 서명자와 개별 서명 시각을 연결할 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 이름 입력은 서명 미리보기에 반영되며 별도 확정 버튼이 있다.
- [관찰] 확정 후 Drafted→Finalized, Sign Contract→Send Contract, 편집 설정 숨김이 나타난다.
- [관찰] Finalized는 양측 서명 완료가 아니다. 마지막 화면에서 고객 서명란은 비어 있다.
- [문서] 고객 서명 전에는 Unsign & Edit로 되돌릴 수 있으며 이전 링크는 무효화된다. 이 동작 자체는 본 흐름에 없다.

## 6. 공식 도움말과 API 대조

- [표준·사용자 정의 계약](https://help.hellobonsai.com/en/articles/918802-creating-completely-custom-contracts): Basic Info·Scope of Work·Payment 입력과 표준 계약의 부분 편집, 작성자 서명 후 발송 순서를 설명한다. 2026-07-27 이후 생성 계정은 통합 Document builder를 사용하므로 캡처의 구형 계약 편집기와 구분한다.
- [발송 후 계약 수정](https://help.hellobonsai.com/en/articles/7935115-editing-a-contract-after-it-has-been-sent): 고객 서명 전 되돌리기와 재서명·재발송, 링크 무효화를 설명한다. 화면의 Finalized와 고객 서명 완료를 구분하는 근거다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인. 공개 그룹에서 서명 확정 endpoint는 확인되지 않는다.

## 7. 데이터 모델링 시사점

- 서명자 역할·이름·연락처 표시·서명시각·문서 버전과 서명 기록 후보.
- 문서 편집 가능 상태, 작성자 서명, 고객 서명, 발송 및 공유 링크 유효성을 분리할 후보.

## 8. 미확인 사항과 검토 질문

- 이름 일치 검증·빈 값 오류·서명자의 권한·추가 인증 여부를 실제 계정에서 확인한다.
- 서명 증빙/IP/문서 해시 등 내부 저장 항목은 화면만으로 확정하지 않는다.
- 서명 이후 내용 수정·서명 철회·링크 무효화 경계를 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
