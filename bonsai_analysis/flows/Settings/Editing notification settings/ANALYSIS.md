# Editing notification settings 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **4/4단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `ac111df9-05db-467b-be5a-f58bc35913c0` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=ac111df9-05db-467b-be5a-f58bc35913c0) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 4단계 / 4단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 4개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

프리랜싱 팁과 새 기능 소식 수신 옵션을 해제하고 계정 변경 성공을 확인한다.

- 고객에게 보내는 프로젝트 알림과 개인이 받는 알림 옵션을 구분한다.
- 마지막 화면은 Notifications 패널이 아니라 Profile Settings이다.

- 상위 분석: [Settings](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Settings/Editing notification settings`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_5ed82da31d4542d1971fce527dc0584d`](https://gummble.com/screens/sc_5ed82da31d4542d1971fce527dc0584d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [Notifications & Alerts](<screens/01_sc_5ed82da31d4542d1971fce527dc0584d.png>) | 임계값까지 스크롤 |
| 02 | [`sc_476c4b83209b496ea4ce93a698feb187`](https://gummble.com/screens/sc_476c4b83209b496ea4ce93a698feb187?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [알림 전체 설정](<screens/02_sc_476c4b83209b496ea4ce93a698feb187.png>) | 팁·새 기능 체크 해제 |
| 03 | [`sc_4abe9d9b1af149e6aaef817ddfc25171`](https://gummble.com/screens/sc_4abe9d9b1af149e6aaef817ddfc25171?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [팁·새 기능 알림 해제](<screens/03_sc_4abe9d9b1af149e6aaef817ddfc25171.png>) | Profile Settings와 업데이트 성공 토스트 |
| 04 | [`sc_c74927faab1c467ea4f4614abf9de9ae`](https://gummble.com/screens/sc_c74927faab1c467ea4f4614abf9de9ae?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [알림 변경 후 계정 업데이트 성공](<screens/04_sc_c74927faab1c467ea4f4614abf9de9ae.png>) | 계정 저장 결과에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — Notifications & Alerts

- Screen ID: `sc_5ed82da31d4542d1971fce527dc0584d`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5ed82da31d4542d1971fce527dc0584d?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/edf60083-6b0c-4f58-8daa-ef41461d5905.png)
- 로컬 이미지: [01_sc_5ed82da31d4542d1971fce527dc0584d.png](<screens/01_sc_5ed82da31d4542d1971fce527dc0584d.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_476c4b83209b496ea4ce93a698feb187`

#### 화면에서 직접 확인한 내용

- 레이아웃: 체크박스 5개, 구분선 아래 브라우저 알림과 타이머 임계값.
- 입력 항목·필수 표시·기본값: 앱 알림/리마인더, 프리랜싱 팁, 새 기능, 구독 결제 문제, 작업 기한 알림 모두 체크. 아래 360 minutes 일부 보임.
- 버튼·메뉴·안내 문구: Save Changes, Enable desktop notifications.
- 확인된 상태: 브라우저 권한 창은 없다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 이메일 성격의 항목들과 브라우저 알림 진입이 분리됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 체크 항목별 전송 채널과 임계값 최소·최대 미확인.

#### 모델링 영향

- 후보와 근거: 알림 종류별 선호와 브라우저 권한, 타이머 임계값 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 알림 전체 설정

- Screen ID: `sc_476c4b83209b496ea4ce93a698feb187`
- 원본: [화면 페이지](https://gummble.com/screens/sc_476c4b83209b496ea4ce93a698feb187?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3b532a3c-878b-4bad-9c0e-60835045ff67.png)
- 로컬 이미지: [02_sc_476c4b83209b496ea4ce93a698feb187.png](<screens/02_sc_476c4b83209b496ea4ce93a698feb187.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_5ed82da31d4542d1971fce527dc0584d` → 현재 → `sc_4abe9d9b1af149e6aaef817ddfc25171`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 카드 전체가 보이며 하단 타이머 임계값까지 노출.
- 입력 항목·필수 표시·기본값: 5개 체크 모두 선택. 타이머 이메일 알림360 minutes.
- 버튼·메뉴·안내 문구: Save Changes, Enable desktop notifications.
- 확인된 상태: 정상 편집 상태.
- 단계 간 변화: 임계값까지 스크롤

#### 동작과 데이터

- 화면 관찰: 브라우저 알림 버튼과 이메일 타이머 한계가 별도.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 360이 계정값인지 기본값인지 미확인.

#### 모델링 영향

- 후보와 근거: 개인 알림 환경설정과 분 단위 임계값 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 팁·새 기능 알림 해제

- Screen ID: `sc_4abe9d9b1af149e6aaef817ddfc25171`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4abe9d9b1af149e6aaef817ddfc25171?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/78517745-ba1a-4c2a-be6b-5f34c745a031.png)
- 로컬 이미지: [03_sc_4abe9d9b1af149e6aaef817ddfc25171.png](<screens/03_sc_4abe9d9b1af149e6aaef817ddfc25171.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_476c4b83209b496ea4ce93a698feb187` → 현재 → `sc_c74927faab1c467ea4f4614abf9de9ae`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 카드.
- 입력 항목·필수 표시·기본값: Helpful articles와 New feature announcements만 미체크. 나머지3개 체크,360분 유지.
- 버튼·메뉴·안내 문구: Save Changes.
- 확인된 상태: 변경된 편집 상태, 성공 토스트 없음.
- 단계 간 변화: 팁·새 기능 체크 해제

#### 동작과 데이터

- 화면 관찰: 마케팅 성격의2종류만 선택적으로 꺼짐.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 즉시 저장 여부 미확인.

#### 모델링 영향

- 후보와 근거: 종류별 독립 선호 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 알림 변경 후 계정 업데이트 성공

- Screen ID: `sc_c74927faab1c467ea4f4614abf9de9ae`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c74927faab1c467ea4f4614abf9de9ae?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/01a14942-a23a-4d62-bd60-10f15b51a3ba.png)
- 로컬 이미지: [04_sc_c74927faab1c467ea4f4614abf9de9ae.png](<screens/04_sc_c74927faab1c467ea4f4614abf9de9ae.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_4abe9d9b1af149e6aaef817ddfc25171` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Profile Settings 패널로 바뀌고 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: JD 이니셜 사진·Joe Doe. 알림 값은 화면 밖.
- 버튼·메뉴·안내 문구: Your account has been updated successfully, Save Changes.
- 확인된 상태: 계정 저장 성공 안내.
- 단계 간 변화: Profile Settings와 업데이트 성공 토스트

#### 동작과 데이터

- 화면 관찰: 알림 화면에서 다른 패널로 이동한 결과; 저장 범위는 별도 확인 필요.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 알림 재조회 값과 전송 동작 미확인.

#### 모델링 영향

- 후보와 근거: 설정 저장 피드백 및 저장 후 라우팅 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 5개 항목 중 팁·새 기능만 해제; 업무/구독/작업 알림은 유지.
- 타이머 임계값360분은 변경되지 않고 브라우저 권한 요청도 실행된 화면이 없다.
- 성공 토스트는 계정 전체 문구여서 알림 값 재조회는 별도 검증 필요.

## 6. 공식 도움말과 API 대조

- [제안서 알림](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): 수신 설정이 켜진 경우 제안 승인 이메일 알림을 안내한다. 이 화면의 모든 체크박스와 채널 대응은 문서로 확정하지 못했다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 종류별 수신 선호·타이머 임계값과 브라우저 권한을 분리하는 후보.

## 8. 미확인 사항과 검토 질문

- 저장 후 알림 패널을 다시 열어2개 해제가 유지되는지 확인.
- 필수 보안·결제 안내가 이 설정으로 차단되는지 정책 문서 확인 필요.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 4개와 실제 이미지 4개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 4단계 재조회 및 원본 4개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
