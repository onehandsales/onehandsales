# Canceling subscription 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **10/10단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `89fb5b3c-c982-48a3-a713-b70f07d8c544` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=89fb5b3c-c982-48a3-a713-b70f07d8c544) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 10단계 / 10단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

구독 취소 영향 안내·유지 제안·사유 선택을 거쳐 기간 말 해지를 예약하고 후속 피드백을 제출한다.

- 계정 삭제와 다르다. 마지막에도Starter와종료일이남는다.
- 취소 사유 제출 후 설문 첫 문구가 이미취소됐다고 안내하므로 피드백 제출을 해지 선행조건으로 단정하지 않는다.

- 상위 분석: [Subscribing to Starter plan](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_9164a60dde6c4aa9a52899d31fd2b949`](https://gummble.com/screens/sc_9164a60dde6c4aa9a52899d31fd2b949?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Starter 구독 갱신 성공 | 취소영향확인모달 |
| 02 | [`sc_eedb724bece1495b8768996b36d6a5d5`](https://gummble.com/screens/sc_eedb724bece1495b8768996b36d6a5d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 구독 취소 영향 확인 | 3개월50%할인제안 |
| 03 | [`sc_762730d159f44a10ac21b27d3d9b651c`](https://gummble.com/screens/sc_762730d159f44a10ac21b27d3d9b651c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 일회성 할인 제안 | 취소사유·일시정지제안 |
| 04 | [`sc_5b3499781e104b2ab5f28a7431af72b4`](https://gummble.com/screens/sc_5b3499781e104b2ab5f28a7431af72b4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 취소 사유 미선택 | 사업중단사유선택 |
| 05 | [`sc_f5f4626ab6584b5794e35938aaa046af`](https://gummble.com/screens/sc_f5f4626ab6584b5794e35938aaa046af?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 사업 중단 사유 선택 | 취소후설문로딩 |
| 06 | [`sc_88e0ceea03fc443e9bf417d13e8858cd`](https://gummble.com/screens/sc_88e0ceea03fc443e9bf417d13e8858cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 취소 후 설문 로딩 | 취소 완료 안내와 피드백 입력 |
| 07 | [`sc_d1b0f02ee20040448b5ed2f7a9ab8a64`](https://gummble.com/screens/sc_d1b0f02ee20040448b5ed2f7a9ab8a64?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 취소 완료 안내와 피드백 | No입력 |
| 08 | [`sc_ed2581fa87bb46ec8c8eaec0a23b3afc`](https://gummble.com/screens/sc_ed2581fa87bb46ec8c8eaec0a23b3afc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 피드백 No 입력 | 피드백감사화면 |
| 09 | [`sc_14b0ff48b6544f7fafec087127efc520`](https://gummble.com/screens/sc_14b0ff48b6544f7fafec087127efc520?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 피드백 제출 완료 | 구독설정복귀 |
| 10 | [`sc_331ea36b85774eef9739e4e8f0f5fcb4`](https://gummble.com/screens/sc_331ea36b85774eef9739e4e8f0f5fcb4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 청구기간 말 해지 예약 | 기간말취소예약확인 |

## 4. 화면별 상세 분석

### 단계 01 — Starter 구독 갱신 성공

- Screen ID: `sc_9164a60dde6c4aa9a52899d31fd2b949`
- 원본: [화면 페이지](https://gummble.com/screens/sc_9164a60dde6c4aa9a52899d31fd2b949?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/45c8b2a8-76fc-4ca6-b8c0-d08542153239.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_eedb724bece1495b8768996b36d6a5d5`

#### 화면에서 직접 확인한 내용

- 레이아웃: Settings Subscription,CurrentSubscription카드와 토스트.
- 입력 항목·필수 표시·기본값: Starter25월,다음청구Mar8 2024,Visa7065.
- 버튼·메뉴·안내 문구: Managepaymentmethods,upgrade,cancel,Switchtoyearly.구독업데이트성공.
- 확인된 상태: Starter 활성표시.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 다음청구일·기본결제수단확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 승인거래ID·세금내역미확인.

#### 모델링 영향

- 후보와 근거: 구독유효기간과결제수단 연결.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 구독 취소 영향 확인

- Screen ID: `sc_eedb724bece1495b8768996b36d6a5d5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_eedb724bece1495b8768996b36d6a5d5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e9d3ded1-9ec0-4c1a-b689-80d1a689e959.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_9164a60dde6c4aa9a52899d31fd2b949` → 현재 → `sc_762730d159f44a10ac21b27d3d9b651c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 좁은 중앙모달, 어두운 배경.
- 입력 항목·필수 표시·기본값: 추가입력없음.
- 버튼·메뉴·안내 문구: 프로젝트비활성·문서서명/결제제한·장부/대시보드제한·프로모션상실안내. I don't want to cancel,Continue canceling,Pause링크.
- 확인된 상태: 확인단계.
- 단계 간 변화: 취소영향확인모달

#### 동작과 데이터

- 화면 관찰: 취소영향안내와대안.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제제한적용시점미확인.

#### 모델링 영향

- 후보와 근거: 해지영향안내 및 취소진입 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 일회성 할인 제안

- Screen ID: `sc_762730d159f44a10ac21b27d3d9b651c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_762730d159f44a10ac21b27d3d9b651c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/79098bcf-a7f9-4d4e-bbb0-b6a17e69e9e0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_eedb724bece1495b8768996b36d6a5d5` → 현재 → `sc_5b3499781e104b2ab5f28a7431af72b4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙작은모달.
- 입력 항목·필수 표시·기본값: 다음3개월50%할인표시.
- 버튼·메뉴·안내 문구: RedeemNow,Continue to cancel,X.
- 확인된 상태: 유지제안.
- 단계 간 변화: 3개월50%할인제안

#### 동작과 데이터

- 화면 관찰: 해지중프로모션제시.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 자격·반복제공·적용시점미확인.

#### 모델링 영향

- 후보와 근거: retention offer 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 취소 사유 미선택

- Screen ID: `sc_5b3499781e104b2ab5f28a7431af72b4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_5b3499781e104b2ab5f28a7431af72b4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f19816ac-6ecc-4f19-a480-38b709d6e6d0.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_762730d159f44a10ac21b27d3d9b651c` → 현재 → `sc_f5f4626ab6584b5794e35938aaa046af`

#### 화면에서 직접 확인한 내용

- 레이아웃: 긴모달상단1/2/3개월Pause제안,하단6라디오.
- 입력 항목·필수 표시·기본값: 기능부족,일없음,활용어려움,체험취소깜빡,가격,사업중단 모두미선택.
- 버튼·메뉴·안내 문구: PauseSubscription,CancelSubscription연한색.
- 확인된 상태: 최종사유대기.
- 단계 간 변화: 취소사유·일시정지제안

#### 동작과 데이터

- 화면 관찰: 일시정지와해지대안.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 사유별추가질문미확인.

#### 모델링 영향

- 후보와 근거: 해지사유분류 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 사업 중단 사유 선택

- Screen ID: `sc_f5f4626ab6584b5794e35938aaa046af`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f5f4626ab6584b5794e35938aaa046af?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/f95b7549-fa5f-466a-b727-5dfbcbbaf910.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_5b3499781e104b2ab5f28a7431af72b4` → 현재 → `sc_88e0ceea03fc443e9bf417d13e8858cd`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일모달.
- 입력 항목·필수 표시·기본값: My business is no longer active 선택.
- 버튼·메뉴·안내 문구: CancelSubscription진한빨강,X.
- 확인된 상태: 취소제출준비.
- 단계 간 변화: 사업중단사유선택

#### 동작과 데이터

- 화면 관찰: 사유선택후버튼활성.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 다른사유분기미확인.

#### 모델링 영향

- 후보와 근거: 사유필수여부검증후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 취소 후 설문 로딩

- Screen ID: `sc_88e0ceea03fc443e9bf417d13e8858cd`
- 원본: [화면 페이지](https://gummble.com/screens/sc_88e0ceea03fc443e9bf417d13e8858cd?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a658105c-7f53-480d-92db-003c3178de77.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f5f4626ab6584b5794e35938aaa046af` → 현재 → `sc_d1b0f02ee20040448b5ed2f7a9ab8a64`

#### 화면에서 직접 확인한 내용

- 레이아웃: 넓은흰모달,로고와진행막대,배경검정.
- 입력 항목·필수 표시·기본값: 설문 내용 흐리게 보이나 확정 문구는 다음 단계 참고.
- 버튼·메뉴·안내 문구: 닫기X.
- 확인된 상태: 로딩.
- 단계 간 변화: 취소후설문로딩

#### 동작과 데이터

- 화면 관찰: 좁은 취소 모달에서 넓은 피드백으로 전환.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 외부설문공급자미확인.

#### 모델링 영향

- 후보와 근거: 해지 처리와 피드백 로딩 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 취소 완료 안내와 피드백

- Screen ID: `sc_d1b0f02ee20040448b5ed2f7a9ab8a64`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d1b0f02ee20040448b5ed2f7a9ab8a64?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/93b30849-1e5a-4750-9a27-8c1ca9ef519d.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_88e0ceea03fc443e9bf417d13e8858cd` → 현재 → `sc_ed2581fa87bb46ec8c8eaec0a23b3afc`

#### 화면에서 직접 확인한 내용

- 레이아웃: 넓은모달에한문항.
- 입력 항목·필수 표시·기본값: 제품 개선 가능 여부 자유 입력* 빈값.
- 버튼·메뉴·안내 문구: Submit,Cmd+Enter,X.구독취소됐다는상단안내.
- 확인된 상태: 피드백전이미취소안내.
- 단계 간 변화: 취소 완료 안내와 피드백 입력

#### 동작과 데이터

- 화면 관찰: 후속설문과해지상태분리.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 필수 별표가 설문용인지 해지용인지;후자는근거없음.

#### 모델링 영향

- 후보와 근거: 피드백응답별도후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 08 — 피드백 No 입력

- Screen ID: `sc_ed2581fa87bb46ec8c8eaec0a23b3afc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_ed2581fa87bb46ec8c8eaec0a23b3afc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/24b5f1eb-060b-4c37-98a2-936e2582eb9b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d1b0f02ee20040448b5ed2f7a9ab8a64` → 현재 → `sc_14b0ff48b6544f7fafec087127efc520`

#### 화면에서 직접 확인한 내용

- 레이아웃: 같은문항.
- 입력 항목·필수 표시·기본값: No 입력.
- 버튼·메뉴·안내 문구: Submit,Cmd+Enter,X.
- 확인된 상태: 응답준비.
- 단계 간 변화: No입력

#### 동작과 데이터

- 화면 관찰: 자유텍스트수집.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 응답최소길이·필수검증미확인.

#### 모델링 영향

- 후보와 근거: 해지피드백텍스트 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 09 — 피드백 제출 완료

- Screen ID: `sc_14b0ff48b6544f7fafec087127efc520`
- 원본: [화면 페이지](https://gummble.com/screens/sc_14b0ff48b6544f7fafec087127efc520?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/597e90d1-6912-42ec-8113-d5546033512e.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_ed2581fa87bb46ec8c8eaec0a23b3afc` → 현재 → `sc_331ea36b85774eef9739e4e8f0f5fcb4`

#### 화면에서 직접 확인한 내용

- 레이아웃: 큰녹색체크와감사문구.
- 입력 항목·필수 표시·기본값: 입력없음.
- 버튼·메뉴·안내 문구: Thanks for your feedback,X.
- 확인된 상태: 설문성공.
- 단계 간 변화: 피드백감사화면

#### 동작과 데이터

- 화면 관찰: 피드백 완료이며 새 해지 작업 아님.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 외부저장소미확인.

#### 모델링 영향

- 후보와 근거: 설문제출결과.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 10 — 청구기간 말 해지 예약

- Screen ID: `sc_331ea36b85774eef9739e4e8f0f5fcb4`
- 원본: [화면 페이지](https://gummble.com/screens/sc_331ea36b85774eef9739e4e8f0f5fcb4?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/3d44b2d5-e83b-4f83-b189-900de1036014.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_14b0ff48b6544f7fafec087127efc520` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Subscription설정복귀·우하단토스트.
- 입력 항목·필수 표시·기본값: Starter25월유지,Mar8 2024종료안내.
- 버튼·메뉴·안내 문구: 해지철회clickhere.청구주기말취소토스트.
- 확인된 상태: 해지예약상태.
- 단계 간 변화: 구독설정복귀

#### 동작과 데이터

- 화면 관찰: 즉시계정폐쇄가아님.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 철회·종료후동작미확인.

#### 모델링 영향

- 후보와 근거: 종료 예정일과 유효 플랜 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 첫 모달은 미서명계약·미결제청구서 접근제한 등을 안내하지만 실제영향은후속계정검증 필요.
- 할인제안·Pause는 사용하지 않은 대안이며 실효정책으로 확정하지 않는다.
- 사유6개중1개선택 후 취소버튼활성.
- 후속 설문은 필수 별표가 있으나 설문 닫기X도있다.해지처리는이미완료안내.
- 종료일Mar8 2024까지현재청구기간유지,해지철회링크표시.

## 6. 공식 도움말과 API 대조

- [일시정지·취소](https://help.hellobonsai.com/en/articles/1867485-pausing-or-cancelling-your-bonsai-subscription): 현재도 취소 후 기존 자료 접근과1~3개월일시정지를설명한다.캡처 경고와 정확한 권한 범위를 대조해야 한다.
- [Limited 플랜](https://help.hellobonsai.com/en/articles/2683127-what-you-can-do-on-a-free-limited-subscription-plan): 현재문서는작업·시간·수입 비용 등 일부 편집 허용을 안내해 캡처의 포괄적 제한 문구와 차이가 있다.
- [환불정책](https://help.hellobonsai.com/en/articles/1638426-learn-more-about-bonsai-s-refund-policy):14일 요청 기간 안내와 위 취소 문서의24시간 표현이 일치하지 않는다.이 플로우는 환불을 보여주지 않으므로 환불 기간을 확정하지 않는다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 해지요청·종료예정일·기능 자격과 계정 활성 상태 분리.
- 해지사유·유지프로모션제시·피드백 응답을 구독 상태와 분리.
- 중복제출·철회·예약해지이벤트 후보.

## 8. 미확인 사항과 검토 질문

- 종료일이후권한,예약해지철회,Pause/할인분기확인.
- 설문을 닫아도 해지 예약이 유지되는지 검증.
- 현재 환불 문서 상충은 지원팀/최신 약관 확인 후 제품 정책 결정.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 10개와 실제 이미지 10개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
