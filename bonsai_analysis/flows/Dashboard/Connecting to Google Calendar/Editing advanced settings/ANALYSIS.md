# Editing advanced settings 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **5/5단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `dc6c28b1-c2c2-4118-9358-3578b336031e` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=dc6c28b1-c2c2-4118-9358-3578b336031e) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 5단계 / 5단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

예약 가능 기한·간격·추가 질문·알림 설정을 구성한다.

- New Event Type 마법사3단계에서 시작해4단계 브랜딩으로 이동한다.

- 상위 분석: [Connecting to Google Calendar](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_10567e85a1db45959f5fee59dfe269aa`](https://gummble.com/screens/sc_10567e85a1db45959f5fee59dfe269aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Advanced Settings 초기값 | 최소 예약 리드타임8→12hours로 변경한다. |
| 02 | [`sc_8bb3e910accd4338b79775e2ee848439`](https://gummble.com/screens/sc_8bb3e910accd4338b79775e2ee848439?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 예약 리드타임12시간 | After event 버퍼를 켠다. |
| 03 | [`sc_33d8ffeb19eb4c4da265017825df8811`](https://gummble.com/screens/sc_33d8ffeb19eb4c4da265017825df8811?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 행사 후 버퍼 활성화 | Additional Question을 켠다. |
| 04 | [`sc_bd8bd2e13f7d401d82394d17da326e87`](https://gummble.com/screens/sc_bd8bd2e13f7d401d82394d17da326e87?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 추가 질문 활성화 | Continue로 Branding & Design에 이동한다. |
| 05 | [`sc_4a74288006d54ecd949b1c814b0abc38`](https://gummble.com/screens/sc_4a74288006d54ecd949b1c814b0abc38?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Branding & Design 초기 | 브랜드 설정으로 이어진다. |

## 4. 화면별 상세 분석

### 단계 01 — Advanced Settings 초기값

- Screen ID: `sc_10567e85a1db45959f5fee59dfe269aa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_10567e85a1db45959f5fee59dfe269aa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9f1a2b3f-0272-446f-afc8-be918c9d53d1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_8bb3e910accd4338b79775e2ee848439`

#### 화면에서 직접 확인한 내용

- 레이아웃: 마법사3단계. 예약 조건·버퍼·추가 질문·리마인더 세로 섹션.
- 입력 항목·필수 표시·기본값: 미래30일, 시작8hours 전 예약 제한; Before/After 체크off·15minutes 회색; Additional Question off; 이메일1hours 전 한 행.
- 버튼·메뉴·안내 문구: Continue, Cancel, 체크/토글, Add Reminder, 리마인더 X.
- 확인된 상태: 가용성 단계에서 고급 설정으로 이동했다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 주간 가용성과 예약 제한 조건이 별도 필드다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 제한 경계·기본값 출처·유효성은 미확인.

#### 모델링 영향

- 후보와 근거: 예약 창·최소 리드타임·전후 버퍼·알림 규칙 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 예약 리드타임12시간

- Screen ID: `sc_8bb3e910accd4338b79775e2ee848439`
- 원본: [화면 페이지](https://gummble.com/screens/sc_8bb3e910accd4338b79775e2ee848439?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1365058f-6e20-4182-aeaa-d0611c8e27db.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_10567e85a1db45959f5fee59dfe269aa` → 현재 → `sc_33d8ffeb19eb4c4da265017825df8811`

#### 화면에서 직접 확인한 내용

- 레이아웃: Advanced Settings 화면 유지.
- 입력 항목·필수 표시·기본값: 미래30일, 최소12hours; 버퍼 off, 질문 off, 알림1hour.
- 버튼·메뉴·안내 문구: Continue, Cancel, 버퍼 체크, Add Reminder.
- 확인된 상태: 8→12 변경, After event 체크는 아직 꺼져 있다.
- 단계 간 변화: 최소 예약 리드타임8→12hours로 변경한다.

#### 동작과 데이터

- 화면 관찰: 예약 시작 전 허용 경계 입력 변경.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 현재 시각과 예약자 시간대 적용 방식은 미확인.

#### 모델링 영향

- 후보와 근거: 최소 사전 예약시간 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 행사 후 버퍼 활성화

- Screen ID: `sc_33d8ffeb19eb4c4da265017825df8811`
- 원본: [화면 페이지](https://gummble.com/screens/sc_33d8ffeb19eb4c4da265017825df8811?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1d58f7eb-8478-4859-8383-f4c0c1ec89ea.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_8bb3e910accd4338b79775e2ee848439` → 현재 → `sc_bd8bd2e13f7d401d82394d17da326e87`

#### 화면에서 직접 확인한 내용

- 레이아웃: After event 행이 활성화된다.
- 입력 항목·필수 표시·기본값: After event on,15minutes 검은값; Before off;12hours/30days 유지.
- 버튼·메뉴·안내 문구: After event 체크, 값/단위, Continue.
- 확인된 상태: 행사 후 버퍼15분을 켰다.
- 단계 간 변화: After event 버퍼를 켠다.

#### 동작과 데이터

- 화면 관찰: 회의 길이 외에 추가 불가 구간 설정.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른 유형·외부 일정에 버퍼 적용 범위 미확인.

#### 모델링 영향

- 후보와 근거: 회의 길이와 버퍼 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 추가 질문 활성화

- Screen ID: `sc_bd8bd2e13f7d401d82394d17da326e87`
- 원본: [화면 페이지](https://gummble.com/screens/sc_bd8bd2e13f7d401d82394d17da326e87?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/130a506e-ea06-4437-a55d-3c3093ad1c93.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_33d8ffeb19eb4c4da265017825df8811` → 현재 → `sc_4a74288006d54ecd949b1c814b0abc38`

#### 화면에서 직접 확인한 내용

- 레이아웃: Additional Question 아래 설명과 답변 미리보기 영역이 확장된다.
- 입력 항목·필수 표시·기본값: 질문 on; 회의 준비에 도움이 될 정보를 요청하는 문구와 Write your answer here…; after15min,리드타임12h,알림1h 유지.
- 버튼·메뉴·안내 문구: Continue, 질문 토글, Add Reminder, 알림X.
- 확인된 상태: 예약자에게 질문을 노출할 설정이 추가된다.
- 단계 간 변화: Additional Question을 켠다.

#### 동작과 데이터

- 화면 관찰: 질문 정의/표시 설정이지 실제 답변 레코드가 아니다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 질문 라벨 편집·필수/최대길이 미확인.

#### 모델링 영향

- 후보와 근거: 예약 유형 질문과 예약 응답 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Branding & Design 초기

- Screen ID: `sc_4a74288006d54ecd949b1c814b0abc38`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4a74288006d54ecd949b1c814b0abc38?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/38795298-f890-46c6-afc7-9c22de6cd842.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_bd8bd2e13f7d401d82394d17da326e87` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 마법사4단계, 왼쪽 단계 목록, 중앙 테마/이미지 설정·우측 작은 미리보기.
- 입력 항목·필수 표시·기본값: Booking Page Theme Standard; 사용자 이미지 없음; Bonsai Branding off. 최소160px 정사각 이미지 권장.
- 버튼·메뉴·안내 문구: Finish, Cancel, 테마 선택, Add Custom Profile Image, Branding 토글.
- 확인된 상태: 3단계를 벗어나 마지막 디자인 설정에 도달했다.
- 단계 간 변화: Continue로 Branding & Design에 이동한다.

#### 동작과 데이터

- 화면 관찰: 유형 생성 완료 전 디자인 입력 상태.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 브랜딩 off의 요금제 권한·이미지 제한은 미확인.

#### 모델링 영향

- 후보와 근거: 유형별 테마/이미지/브랜딩 설정 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 전/후 버퍼는 별도 활성화 체크와 숫자·단위다.
- [관찰] 추가 질문을 켜면 회의 준비를 위한 질문과 답변 placeholder가 나타난다. 관리자에게 답변을 입력하라는 뜻이 아니다.
- [관찰] 이메일1시간 전 리마인더와 Add Reminder·행 삭제가 있다. 실제 발송은 미확인.

## 6. 공식 도움말과 API 대조

- [예약·캘린더 공식 도움말](https://help.hellobonsai.com/en/articles/6823760-set-up-scheduling-and-booking-pages): 버퍼·예약 제한·추가 질문·리마인더 설정을 설명한다.
- [공개 API](https://docs.hellobonsai.com/api): 검토한 공개 목록에서 예약 유형·가용 시간·캘린더 연결 전용 endpoint와 필드 계약은 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 최대 예약 범위·최소 사전 예약시간·전후 버퍼·추가 질문 정의·복수 알림 규칙 후보.

## 8. 미확인 사항과 검토 질문

- 음수/0·단위 변환·상한 검증과 예약시간 경계 포함 여부를 확인한다.
- 이미 예약된 일정에 설정 변경이 적용되는지, 리마인더 중복·재예약 취소 시 정리를 확인한다.
- 추가 질문 필수 여부·질문 문구 편집·답변 저장 및 고객 연결을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 5개와 실제 이미지 5개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
