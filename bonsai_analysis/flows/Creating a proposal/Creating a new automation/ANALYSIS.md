# Creating a new automation 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b4fff91d-639e-4818-9ec8-4dc1bfc3a18a` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b4fff91d-639e-4818-9ec8-4dc1bfc3a18a) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

특정 제안서의 이벤트에 후속 자동 동작을 연결한다.

- 이미 Accepted인 제안서에서 시작한다. 새로 만든 자동화가 과거 수락에 즉시 실행됐다는 증거는 없다.
- 수락 시 Bonsai 일정 예약을 보여주는 설정 폼이 수록됐다.
- 마지막 My Templates 화면은 탐색 결과이며 자동화 생성이 템플릿을 만들었다는 뜻이 아니다.

- 상위 분석: [Creating a proposal](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_8afa6c0d651c411eb077be375ebba010`](https://gummble.com/screens/sc_8afa6c0d651c411eb077be375ebba010?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 수락된 제안서 상세 | Automation으로 표준/사용자 자동화 설정을 연다. |
| 02 | [`sc_ba9262847181416986d989abb44ac1af`](https://gummble.com/screens/sc_ba9262847181416986d989abb44ac1af?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 제안서 자동화 설정 | Create New Automation으로 개별 규칙 폼을 연다. |
| 03 | [`sc_ba7608445bdf4240bdc5e6731e4b0c44`](https://gummble.com/screens/sc_ba7608445bdf4240bdc5e6731e4b0c44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 개별 제안서 자동화 폼 | 중간 입력이 생략된 채 생성 성공 토스트로 이어진다. Event Type 최종값은 알 수 없다. |
| 04 | [`sc_69b9617e5c6944ca870544bb46619f41`](https://gummble.com/screens/sc_69b9617e5c6944ca870544bb46619f41?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 자동화 생성 성공 | Proposals 목록으로 이동한다. |
| 05 | [`sc_76a9705b6f424ec08f36a60aec013a44`](https://gummble.com/screens/sc_76a9705b6f424ec08f36a60aec013a44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 수락 제안서 목록 | My Templates 탭으로 이동한다. |
| 06 | [`sc_8c39e91fa88341819108c92e13aac67a`](https://gummble.com/screens/sc_8c39e91fa88341819108c92e13aac67a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 개인 제안서 템플릿 목록 | 개인 템플릿 목록에서 종료. 자동화 실행 결과는 수록되지 않음. |

## 4. 화면별 상세 분석

### 단계 01 — 수락된 제안서 상세

- Screen ID: `sc_8afa6c0d651c411eb077be375ebba010`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8afa6c0d651c411eb077be375ebba010?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/155608a1-1a52-4e95-8175-cead6b011155.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_ba9262847181416986d989abb44ac1af`

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

### 단계 02 — 제안서 자동화 설정

- Screen ID: `sc_ba9262847181416986d989abb44ac1af`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ba9262847181416986d989abb44ac1af?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/142fa630-df49-4fda-9ee0-6d06875a8845.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8afa6c0d651c411eb077be375ebba010` → 현재 → `sc_ba7608445bdf4240bdc5e6731e4b0c44`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙Proposal Automation Settings,Standard와Custom두영역.
- 입력 항목·필수 표시·기본값: 만료전날메일체크on. Custom빈상태.
- 버튼·메뉴·안내 문구: Create New Automation,Add New Automation,Save Changes,X.
- 확인된 상태: 기존사용자규칙없음.
- 단계 간 변화: Automation으로 표준/사용자 자동화 설정을 연다.

#### 동작과 데이터

- 화면 관찰: 기본 알림과 사용자 규칙을 별도 관리.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: Save Changes와하위Save Automation의저장범위미확인.

#### 모델링 영향

- 후보와 근거: 표준알림설정/사용자규칙분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 개별 제안서 자동화 폼

- Screen ID: `sc_ba7608445bdf4240bdc5e6731e4b0c44`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ba7608445bdf4240bdc5e6731e4b0c44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e5672f46-cceb-4a9a-aa85-95ea140a2318.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ba9262847181416986d989abb44ac1af` → 현재 → `sc_69b9617e5c6944ca870544bb46619f41`

#### 화면에서 직접 확인한 내용

- 레이아웃: 큰모달상단범위안내,중앙Trigger→Action두열,하단예약설정.
- 입력 항목·필수 표시·기본값: Trigger수락시,Action Schedule an event using Bonsai. Event Type Select…,Header Schedule an event,Message기본안내51/175.
- 버튼·메뉴·안내 문구: global automation링크,두드롭다운,Save Automation,X.
- 확인된 상태: 규칙작성중. 이벤트유형미선택.
- 단계 간 변화: Create New Automation으로 개별 규칙 폼을 연다.

#### 동작과 데이터

- 화면 관찰: 고객이날짜/시간을 선택할 수 있게 한다는 안내. 즉시예약생성의증거아님.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 최종EventType·다른트리거/액션·필수표시미확인.

#### 모델링 영향

- 후보와 근거: 다형액션설정·일정유형참조·고객안내문후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 자동화 생성 성공

- Screen ID: `sc_69b9617e5c6944ca870544bb46619f41`
- 원본: [화면 페이지](https://gummble.com/screens/sc_69b9617e5c6944ca870544bb46619f41?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/cc607bdb-0813-41a7-b944-7eb466a6b962.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ba7608445bdf4240bdc5e6731e4b0c44` → 현재 → `sc_76a9705b6f424ec08f36a60aec013a44`

#### 화면에서 직접 확인한 내용

- 레이아웃: Accepted문서복귀·우하단성공토스트.
- 입력 항목·필수 표시·기본값: Accepted/5255/USD/UpfrontNone유지.
- 버튼·메뉴·안내 문구: Your automation has been successfully created. Automation버튼유지.
- 확인된 상태: 규칙생성성공표시.
- 단계 간 변화: 중간 입력이 생략된 채 생성 성공 토스트로 이어진다. Event Type 최종값은 알 수 없다.

#### 동작과 데이터

- 화면 관찰: UI상 규칙 생성은 확인되나 실행 결과 없음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 누락된필드입력·저장규칙내용·소급실행미확인.

#### 모델링 영향

- 후보와 근거: 규칙정의와실행기록분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 수락 제안서 목록

- Screen ID: `sc_76a9705b6f424ec08f36a60aec013a44`
- 원본: [화면 페이지](https://gummble.com/screens/sc_76a9705b6f424ec08f36a60aec013a44?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/c97ae699-51b3-43a6-9cbb-001dea3b0e46.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_69b9617e5c6944ca870544bb46619f41` → 현재 → `sc_8c39e91fa88341819108c92e13aac67a`

#### 화면에서 직접 확인한 내용

- 레이아웃: Proposals/My Templates탭,검색·Filters·New Proposal·한행표.
- 입력 항목·필수 표시·기본값: Creative Design Brief, Doe Company,Created/Sent/Accepted Feb8,녹색점.
- 버튼·메뉴·안내 문구: 행…·정렬·New Proposal·My Templates.
- 확인된 상태: 수락문서가목록에존재.
- 단계 간 변화: Proposals 목록으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 각업무일자를따로표시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동화 상태는 이 목록에 없음.

#### 모델링 영향

- 후보와 근거: 문서요약리스트·라이프사이클날짜후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 개인 제안서 템플릿 목록

- Screen ID: `sc_8c39e91fa88341819108c92e13aac67a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8c39e91fa88341819108c92e13aac67a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ee23e923-0eac-4f05-9666-842bf5b95bef.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_76a9705b6f424ec08f36a60aec013a44` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: My Templates탭. Template Name/Date Created/Published열.
- 입력 항목·필수 표시·기본값: Creative Brief,February8 2024,자물쇠Private.
- 버튼·메뉴·안내 문구: 행…·Proposals복귀탭.
- 확인된 상태: 개인템플릿한개존재.
- 단계 간 변화: My Templates 탭으로 이동한다.

#### 동작과 데이터

- 화면 관찰: 문서와 별도 개인 템플릿 목록 확인. 생성과정은없음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자동화와 템플릿의 인과관계 없음. 공개전환·복사정책미확인.

#### 모델링 영향

- 후보와 근거: 개인템플릿소유·공개상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 개별 제안서에만 적용하며 global automation을 별도로 제안한다.
- [관찰] 표준 만료 전날 알림과 사용자 정의 자동화를 분리한다.
- [관찰] Trigger는proposal accepted, Action은Bonsai scheduling. Event Type이 Select…인 화면 이후 곧바로 성공으로 넘어가므로 누락된 최종설정이 있다.
- [미확인] 생성 성공과 트리거 실행 성공은 다르다.

## 6. 공식 도움말과 API 대조

- [제안서 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): 2026-07-27 이후 생성 계정은 통합 Document builder를 사용한다고 명시한다. 이 캡처의 기존 Proposals 편집기와 현재 API의 Docs를 같은 버전으로 간주하지 않는다.
- [제안서 수락 후 청구서 생성](https://help.hellobonsai.com/en/articles/2157748-automating-invoices-when-your-proposals-are-accepted): 수락 후 자동 작업의 다른 사례를 확인했다. 이 자료를 일정예약 자동화의 필드/실행 규칙 근거로 확대하지 않는다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인. 공개 그룹에서 사용자 자동화 CRUD/실행이력 endpoint는 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 범위(전역/특정문서)·트리거·액션유형·액션별설정·활성상태·실행이력 후보.
- 일정 예약 액션은 기존 Event Type 참조와 고객용제목/메시지를 가지는 후보. 자동으로 특정 일시의 예약을 생성한다고 단정하지 않는다.

## 8. 미확인 사항과 검토 질문

- 이미Accepted인 문서에 규칙 추가 시 소급 실행하는가?새 수락 이벤트와 비교해야 한다.
- Event Type필수값과 삭제된 유형 참조 처리·메시지175자 제한의 실제 검증을 확인한다.
- 전역/개별규칙중복·실행순서·재시도·중복방지·실패알림을확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
