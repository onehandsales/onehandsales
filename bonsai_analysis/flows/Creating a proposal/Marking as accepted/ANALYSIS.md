# Marking as accepted 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `7f481864-a5f0-4786-a800-334c1637b819` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=7f481864-a5f0-4786-a800-334c1637b819) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 6개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

고객의 외부 의사 확인 등을 근거로 담당자가 제안서를 수동 Accepted 처리하는 UI를 분석한다.

- Sent 제안서에서 시작한다. 실제 고객이 직접 Accept한 흐름과 구분한다.
- 패키지를 선택한 후 변경불가 안내를 확인하고 수락 상태로 바뀐다.

- 상위 분석: [Creating a proposal](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Creating a proposal/Marking as accepted`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_6f751d09df314d7f94be053f43818f5f`](https://gummble.com/screens/sc_6f751d09df314d7f94be053f43818f5f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Sent 제안서 상세](<screens/01_sc_6f751d09df314d7f94be053f43818f5f.png>) | 발송 성공 토스트가 사라진 Sent 상세를 확인한다. |
| 02 | [`sc_e1c9c65adce440a3a5ae0d88b7f4fea0`](https://gummble.com/screens/sc_e1c9c65adce440a3a5ae0d88b7f4fea0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Sent 제안서 안정 상태](<screens/02_sc_e1c9c65adce440a3a5ae0d88b7f4fea0.png>) | … 메뉴에서 Mark Accepted를 선택한다. |
| 03 | [`sc_e297b51f3cef4926b034dbd054fad183`](https://gummble.com/screens/sc_e297b51f3cef4926b034dbd054fad183?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [발송 제안서 작업 메뉴](<screens/03_sc_e297b51f3cef4926b034dbd054fad183.png>) | 확인 모달에 패키지 선택과 편집불가 안내가 나타난다. |
| 04 | [`sc_25b9c545e77a4d33b7ebe8e8e466c5cd`](https://gummble.com/screens/sc_25b9c545e77a4d33b7ebe8e8e466c5cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수동 수락 확인과 패키지 선택](<screens/04_sc_25b9c545e77a4d33b7ebe8e8e466c5cd.png>) | Mark Accepted 후 성공 토스트가 보인다. |
| 05 | [`sc_9eea152027524c2fa988187d65d83326`](https://gummble.com/screens/sc_9eea152027524c2fa988187d65d83326?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수동 수락 처리 성공](<screens/05_sc_9eea152027524c2fa988187d65d83326.png>) | 모달이 닫히고 Accepted·수락날짜를 표시한다. |
| 06 | [`sc_8afa6c0d651c411eb077be375ebba010`](https://gummble.com/screens/sc_8afa6c0d651c411eb077be375ebba010?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [수락된 제안서 상세](<screens/06_sc_8afa6c0d651c411eb077be375ebba010.png>) | 수동 수락 완료 표시로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — Sent 제안서 상세

- Screen ID: `sc_6f751d09df314d7f94be053f43818f5f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_6f751d09df314d7f94be053f43818f5f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/11ba08f7-1863-4bb4-8794-ed4b7c6c6f42.png)
- 로컬 이미지: [01_sc_6f751d09df314d7f94be053f43818f5f.png](<screens/01_sc_6f751d09df314d7f94be053f43818f5f.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_e1c9c65adce440a3a5ae0d88b7f4fea0`

#### 화면에서 직접 확인한 내용

- 레이아웃: 편집제어사라진문서와Overview/Payments/Activity. 우하단성공토스트.
- 입력 항목·필수 표시·기본값: Sent,5255,SingleOption,ExpirationFeb15,SentFeb8·Accepted빈칸,USD.
- 버튼·메뉴·안내 문구: Send Reminder,Automation,…,Activity펼침.
- 확인된 상태: 발송후읽기상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: Drafted→Sent·발송날짜·만료일변경확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객열람·거절·반송·재발송동작미수록.

#### 모델링 영향

- 후보와 근거: 문서상태전이·발송이력·유효기간 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — Sent 제안서 안정 상태

- Screen ID: `sc_e1c9c65adce440a3a5ae0d88b7f4fea0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e1c9c65adce440a3a5ae0d88b7f4fea0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5dbb63ce-947f-40c6-a571-f4c10508788c.png)
- 로컬 이미지: [02_sc_e1c9c65adce440a3a5ae0d88b7f4fea0.png](<screens/02_sc_e1c9c65adce440a3a5ae0d88b7f4fea0.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_6f751d09df314d7f94be053f43818f5f` → 현재 → `sc_e297b51f3cef4926b034dbd054fad183`

#### 화면에서 직접 확인한 내용

- 레이아웃: 발송 후 문서와 Overview/Payments/Activity. 토스트 없음.
- 입력 항목·필수 표시·기본값: Sent5255,SingleOption,만료Feb15,SentFeb8·Accepted빈칸.
- 버튼·메뉴·안내 문구: Send Reminder,Automation,…
- 확인된 상태: 아직수락전.
- 단계 간 변화: 발송 성공 토스트가 사라진 Sent 상세를 확인한다.

#### 동작과 데이터

- 화면 관찰: 발송과 수락 상태가 구분된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객열람여부·문서잠금정책미확인.

#### 모델링 영향

- 후보와 근거: 발송 상태 및 후속 수락 작업 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 발송 제안서 작업 메뉴

- Screen ID: `sc_e297b51f3cef4926b034dbd054fad183`
- 원본: [화면 페이지](https://gummble.com/screens/sc_e297b51f3cef4926b034dbd054fad183?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/b4727606-e70d-4e49-892e-997fc06e8886.png)
- 로컬 이미지: [03_sc_e297b51f3cef4926b034dbd054fad183.png](<screens/03_sc_e297b51f3cef4926b034dbd054fad183.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e1c9c65adce440a3a5ae0d88b7f4fea0` → 현재 → `sc_25b9c545e77a4d33b7ebe8e8e466c5cd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우상단…드롭다운.
- 입력 항목·필수 표시·기본값: 값입력없음.
- 버튼·메뉴·안내 문구: Edit,Download PDF,Mark Accepted,Duplicate,Save As Template,Archive,Delete.
- 확인된 상태: 상태별추가작업선택.
- 단계 간 변화: … 메뉴에서 Mark Accepted를 선택한다.

#### 동작과 데이터

- 화면 관찰: 발송후에도Edit진입점이있지만실제회수/초안전환은미수록.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Edit의확인과링크무효화·권한조건미확인.

#### 모델링 영향

- 후보와 근거: 문서상태별가능행동 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 수동 수락 확인과 패키지 선택

- Screen ID: `sc_25b9c545e77a4d33b7ebe8e8e466c5cd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_25b9c545e77a4d33b7ebe8e8e466c5cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d87ea5fe-4b0e-4118-85f0-5c944dd2666a.png)
- 로컬 이미지: [04_sc_25b9c545e77a4d33b7ebe8e8e466c5cd.png](<screens/04_sc_25b9c545e77a4d33b7ebe8e8e466c5cd.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_e297b51f3cef4926b034dbd054fad183` → 현재 → `sc_9eea152027524c2fa988187d65d83326`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙Mark Proposal Accepted,경고카드·패키지선택·확정버튼.
- 입력 항목·필수 표시·기본값: Select one or more packages: New Package Title. 이름은 실제 표시 문구이며 새 패키지 생성 필드라고 단정 불가.
- 버튼·메뉴·안내 문구: Mark Accepted,외곽X. 이후편집불가안내.
- 확인된 상태: 수동상태변경확인전.
- 단계 간 변화: 확인 모달에 패키지 선택과 편집불가 안내가 나타난다.

#### 동작과 데이터

- 화면 관찰: 패키지와 수락 결과를 확인하는 단계.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 옵션전체·다중선택제약·선택초기값미확인.

#### 모델링 영향

- 후보와 근거: 선택패키지/수락결정기록후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 수동 수락 처리 성공

- Screen ID: `sc_9eea152027524c2fa988187d65d83326`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9eea152027524c2fa988187d65d83326?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/60a165fc-5f6d-4e62-b440-4ca16375b55a.png)
- 로컬 이미지: [05_sc_9eea152027524c2fa988187d65d83326.png](<screens/05_sc_9eea152027524c2fa988187d65d83326.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_25b9c545e77a4d33b7ebe8e8e466c5cd` → 현재 → `sc_8afa6c0d651c411eb077be375ebba010`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달유지,확정버튼옅어짐,우하단성공알림.
- 입력 항목·필수 표시·기본값: 선택패키지유지.
- 버튼·메뉴·안내 문구: Your proposal was marked as accepted. X.
- 확인된 상태: 성공응답직후중간상태.
- 단계 간 변화: Mark Accepted 후 성공 토스트가 보인다.

#### 동작과 데이터

- 화면 관찰: 앱이수동수락성공을보고.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 알림메일/인보이스생성결과미수록.

#### 모델링 영향

- 후보와 근거: 상태 변경 요청과 연계 작업 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 수락된 제안서 상세

- Screen ID: `sc_8afa6c0d651c411eb077be375ebba010`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8afa6c0d651c411eb077be375ebba010?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/155608a1-1a52-4e95-8175-cead6b011155.png)
- 로컬 이미지: [06_sc_8afa6c0d651c411eb077be375ebba010.png](<screens/06_sc_8afa6c0d651c411eb077be375ebba010.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_9eea152027524c2fa988187d65d83326` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 표현편집제어없는Cover문서,우측Overview/Payments/Activity.
- 입력 항목·필수 표시·기본값: Accepted5255 SingleOption,Sent/AcceptedFeb8,USD UpfrontPaymentNone.
- 버튼·메뉴·안내 문구: Automation·Download PDF·…·Activity펼침.
- 확인된 상태: 수락된문서읽기상태.
- 단계 간 변화: 모달이 닫히고 Accepted·수락날짜를 표시한다.

#### 동작과 데이터

- 화면 관찰: 수락일과발송일·선수금정보가분리표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 수락주체/법적 동의 증거는 이미지로 미확인.

#### 모델링 영향

- 후보와 근거: 문서상태·수락이벤트·지급조건분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 확인문구는 수락 이후 더 이상 편집할 수 없다고 알린다.
- [관찰] 패키지 드롭다운은 New Package Title이며 한 개 이상 선택하라는 문구가 있다. Single Option인데도 이 제어가 노출된다.
- [문서] 수동 수락은 되돌릴 수 없고 고객에게 통지메일을 보내지 않으며 선수금 납부를 기록하지 않는다.
- [미확인] 수락시 자동인보이스 옵션이 수동 수락에도 실행됐는지 이 이미지에 결과가 없다.

## 6. 공식 도움말과 API 대조

- [수동 수락 도움말](https://help.hellobonsai.com/en/articles/7935094-marking-a-proposal-as-accepted-for-a-client): 2026-08-05 설명의 비가역·편집제한·알림없음·선수금미수납을 대조했다. 이 기록은 실제 고객 동의의 법적 효력을 평가하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인.

## 7. 데이터 모델링 시사점

- 수락 방식(고객/담당자 대리)·수락 처리자·시각·선택 패키지·상태 전이 이력 후보.
- 수락과 입금/선수금/인보이스 생성은 각각 독립 이벤트 후보.

## 8. 미확인 사항과 검토 질문

- 누가 수동 수락할 수 있는지와 외부 동의 근거를 첨부할 수 있는지 확인한다.
- 다중 패키지 선택의 필수·제약과 자동인보이스/사용자자동화의 수동 수락 대응을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 6단계 재조회 및 원본 6개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
