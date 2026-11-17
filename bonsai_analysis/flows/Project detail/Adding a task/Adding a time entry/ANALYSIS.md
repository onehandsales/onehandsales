# Adding a time entry 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `38dcad7d-b2da-4d91-8eb3-2f3b39899b66` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=38dcad7d-b2da-4d91-8eb3-2f3b39899b66) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

작업 문맥에서 이미 수행한 시간을 수동으로 입력하여 시간 기록을 추가하는 흐름이다.

- 작업 Initial Chat에서 프로젝트·작업·멤버가 채워진 Add Time Entry 모달로 진입한다.
- 타이머 없이 기록하는 체크가 선택되어 있고1시간·요율20을 입력한다.
- 성공 메시지 뒤 No hours added인 다른 캡처가 끼어 있으며, 마지막에는 작업 합계1시간이 보인다. 단일 연속 세션으로 추정하지 않는다.

- 상위 분석: [Adding a task](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_12595f0282da469b919de850906c592c`](https://gummble.com/screens/sc_12595f0282da469b919de850906c592c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 담당자 반영 | 작업의 시간 추가 모달 표시. |
| 02 | [`sc_52d2f2ef9de6464684b936c685dcbc0a`](https://gummble.com/screens/sc_52d2f2ef9de6464684b936c685dcbc0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업 문맥의 시간 입력 모달 | 요율20과1시간 입력. |
| 03 | [`sc_fcb60cfa8c604997858702d9f4b91809`](https://gummble.com/screens/sc_fcb60cfa8c604997858702d9f4b91809?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 수동1시간과 요율 입력 | 모달 닫힘, 시간기록 생성 성공 토스트. |
| 04 | [`sc_f823706741894a19881040ebe1fc20e5`](https://gummble.com/screens/sc_f823706741894a19881040ebe1fc20e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 시간기록 생성 성공 | 설명 있는 작업 패널이지만 시간 없음 표시. 캡처 시점/대상 차이 미확인. |
| 05 | [`sc_92611ceaf06340ae99ed8df9b666d850`](https://gummble.com/screens/sc_92611ceaf06340ae99ed8df9b666d850?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 하위 작업 추가 전 작업 상세 | Tasks 보드 위 작업 패널에는1시간 합계가 보임. 동일 제목 다른 작업 가능성도 남김. |
| 06 | [`sc_2586b49246f44022bf45b22d67ba23a8`](https://gummble.com/screens/sc_2586b49246f44022bf45b22d67ba23a8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 작업에1시간 누적 표시 | 1시간 표시로 종료. 생성된 시간의 상세 ID는 없음. |

## 4. 화면별 상세 분석

### 단계 01 — 작업 담당자 반영

- Screen ID: `sc_12595f0282da469b919de850906c592c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_12595f0282da469b919de850906c592c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/ebffb145-ab1f-4e47-a824-1d578f14be64.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_52d2f2ef9de6464684b936c685dcbc0a`

#### 화면에서 직접 확인한 내용

- 레이아웃: 프로젝트 개요 오른쪽 절반을 작업 상세 패널이 덮는다. 왼쪽 경계에 닫힘 화살표, 위 제목·말줄임, 두 열 속성, 설명·Files·Subtasks·Activity를 세로 배치.
- 입력 항목·필수 표시·기본값: 담당자 Joe Doe와 JD 아이콘. 상태In Progress·기한Feb6·제목 유지.
- 버튼·메뉴·안내 문구: 담당자·상태·시간·설명 편집, 말줄임.
- 확인된 상태: 드롭다운이 닫히고 담당자가 표시된다.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 담당자가 선택된 결과. 배경 Tasks는 아직 비어 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 목록 반영·알림·권한·영속 저장.

#### 모델링 영향

- 후보와 근거: 담당자 참조와 배경 조회 갱신 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 작업 문맥의 시간 입력 모달

- Screen ID: `sc_52d2f2ef9de6464684b936c685dcbc0a`
- 원본: [화면 페이지](https://gummble.com/screens/sc_52d2f2ef9de6464684b936c685dcbc0a?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/40f121ac-6bd8-4d94-a8ce-b1ce5c00701c.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_12595f0282da469b919de850906c592c` → 현재 → `sc_fcb60cfa8c604997858702d9f4b91809`

#### 화면에서 직접 확인한 내용

- 레이아웃: 중앙 Add Time Entry 모달. 상단 프로젝트, 다음 줄 Task/Project Member. 아래 왼쪽 요율/Notes, 오른쪽 시분초·날짜, 하단 체크와 Add Hours.
- 입력 항목·필수 표시·기본값: Project=Design Project with Doe, Task=Initial Chat(지우기X), Member=Joe Doe. Hourly Rate 회색100.0, HR/MIN/SEC=00, DateFeb6 2024, Notes빈 예시.
- 버튼·메뉴·안내 문구: Add Hours, 닫기X, 수동 기록 체크 선택.
- 확인된 상태: 입력 전 수동 기록 폼. 필수 별표 없음.
- 단계 간 변화: 작업의 시간 추가 모달 표시.

#### 동작과 데이터

- 화면 관찰: 프로젝트·작업 문맥이 미리 채워져 있다. 회색100.0은 저장 기본값으로 확정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 프로젝트 필드 비활성 여부·멤버변경권한·필수값.

#### 모델링 영향

- 후보와 근거: 시간기록의 업무 대상과 기록자·시간·요율 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 수동1시간과 요율 입력

- Screen ID: `sc_fcb60cfa8c604997858702d9f4b91809`
- 원본: [화면 페이지](https://gummble.com/screens/sc_fcb60cfa8c604997858702d9f4b91809?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2b4eed0b-6576-436e-9d08-8ebee1dcb586.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_52d2f2ef9de6464684b936c685dcbc0a` → 현재 → `sc_f823706741894a19881040ebe1fc20e5`

#### 화면에서 직접 확인한 내용

- 레이아웃: 동일 모달.
- 입력 항목·필수 표시·기본값: Hourly Rate20, HR01/MIN00/SEC00, DateFeb6. Notes비어 있고 수동체크 선택.
- 버튼·메뉴·안내 문구: Add Hours.
- 확인된 상태: 저장 전 입력 완료 상태.
- 단계 간 변화: 요율20과1시간 입력.

#### 동작과 데이터

- 화면 관찰: 1시간을 숫자 조합으로 지정했다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 소수시간·자리수·음수·요율통화.

#### 모델링 영향

- 후보와 근거: 기간을 정규화할 저장 단위와 요율 스냅샷 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 시간기록 생성 성공

- Screen ID: `sc_f823706741894a19881040ebe1fc20e5`
- 원본: [화면 페이지](https://gummble.com/screens/sc_f823706741894a19881040ebe1fc20e5?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/feba5b1c-b646-4795-926c-f165d6242053.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_fcb60cfa8c604997858702d9f4b91809` → 현재 → `sc_92611ceaf06340ae99ed8df9b666d850`

#### 화면에서 직접 확인한 내용

- 레이아웃: 모달/패널이 닫힌 프로젝트 Overview. 오른쪽 아래 생성 성공 토스트.
- 입력 항목·필수 표시·기본값: 작업·문서 개요는 빈 안내 유지. Time Tracking 카드는 아래 일부만 보임.
- 버튼·메뉴·안내 문구: Your time entry has been created, 토스트닫기.
- 확인된 상태: 생성 성공 안내.
- 단계 간 변화: 모달 닫힘, 시간기록 생성 성공 토스트.

#### 동작과 데이터

- 화면 관찰: 성공 피드백은 있지만 이 화면만으로1시간의 합계를 읽을 수 없다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 생성 ID·목록갱신·토스트만 성공인 경우의 처리.

#### 모델링 영향

- 후보와 근거: 생성 결과와 후속 조회 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 하위 작업 추가 전 작업 상세

- Screen ID: `sc_92611ceaf06340ae99ed8df9b666d850`
- 원본: [화면 페이지](https://gummble.com/screens/sc_92611ceaf06340ae99ed8df9b666d850?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1f793b7e-3ada-4276-baf3-ddff095d1f59.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_f823706741894a19881040ebe1fc20e5` → 현재 → `sc_2586b49246f44022bf45b22d67ba23a8`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 패널 상단 속성과 설명·Files·Subtasks·Activity가 보인다.
- 입력 항목·필수 표시·기본값: Initial Chat / In Progress / Feb6 2024 / Joe Doe. 설명 Call Jane to have initial chat. 하위 항목 없음.
- 버튼·메뉴·안내 문구: +Add File, +Add Subtask, 말줄임, 상태·담당자·시간.
- 확인된 상태: 설명은 채워져 있고 하위 작업은 없는 상태.
- 단계 간 변화: 설명 있는 작업 패널이지만 시간 없음 표시. 캡처 시점/대상 차이 미확인.

#### 동작과 데이터

- 화면 관찰: 부모 설명과 하위 항목 컬렉션은 별도 영역.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 설명 저장 시점·하위 항목 없음의 정확한 조회 상태.

#### 모델링 영향

- 후보와 근거: 부모 작업 설명과 자식 목록 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 작업에1시간 누적 표시

- Screen ID: `sc_2586b49246f44022bf45b22d67ba23a8`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2586b49246f44022bf45b22d67ba23a8?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/2672664c-17b3-4a6c-bbbf-942331473a2a.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_92611ceaf06340ae99ed8df9b666d850` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: Tasks 보드 위 오른쪽 Initial Chat 패널. 시간 속성에 합계와 펼침 화살표.
- 입력 항목·필수 표시·기본값: 총01:00:00, 상태In Progress·담당Joe Doe·기한Feb6. 설명은 비어 있음. 뒤 보드에는동일제목2개.
- 버튼·메뉴·안내 문구: 시간 펼침, 작업 말줄임, 각 속성.
- 확인된 상태: 한 시간 기록이 있는 작업.
- 단계 간 변화: Tasks 보드 위 작업 패널에는1시간 합계가 보임. 동일 제목 다른 작업 가능성도 남김.

#### 동작과 데이터

- 화면 관찰: 이전 설명 있는 No hours added와 내용이 달라 같은 객체의 즉시 갱신이라고 단정하지 않는다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 동일 제목 작업 구분·시간 상세·소유자.

#### 모델링 영향

- 후보와 근거: 작업ID별 시간 합계와 표시명 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 관찰: 수동 시간은 HR/MIN/SEC 세 입력과 날짜로 표현된다.
- 관찰: Task 선택에 지우기X가 있지만 비워서 저장한 결과는 없다. 필수 여부를 단정하지 않는다.
- 관찰: Notes가 빈 예시 상태에서 생성 성공 화면으로 이어진다. 현행 문서의 Description 필수 안내와 버전/조건 차이를 기록한다.
- 관찰: Log these hours without starting a timer 체크가 켜져 있다. 체크 해제 분기는 이 흐름에 없다.

## 6. 공식 도움말과 API 대조

- [수동 시간 입력 도움말](https://help.hellobonsai.com/en/articles/3438791-manually-adding-time-tracking-entries): 전체 시간 목록과 프로젝트에서 수동 기록을 생성하고 양쪽에서 조회할 수 있다고 설명한다. 현재 문서는 Description을 필수 항목에 포함하지만 캡처의 빈 Notes와 차이가 있어 검증이 필요하다.
- [Time Entries API](https://docs.hellobonsai.com/api/tag/time-entries): GET/POST `/public-api/v1/time_entries`, PATCH `/public-api/v1/time_entries/{key}`가 공개되어 있다. 이 그룹 페이지에서 실행 중 타이머 프로토콜이나 요청 필드 계약은 확인되지 않는다.

## 7. 데이터 모델링 시사점

- TimeEntry의 프로젝트·선택적 작업 후보·기록 멤버·기간 길이·업무일자·요율·메모 후보.
- 수동 기록과 타이머 실행의 생성 경로를 구분하되 같은 시간 합계에 포함하는 조회 모델 후보.
- 프로젝트 담당자와 실제 시간 기록자(Project Member)는 서로 다른 관계로 검토한다.
- FE 후보: 문맥으로 채워진 모달, 시/분/초 분할 입력, 수동모드 체크, 생성 성공 토스트.

## 8. 미확인 사항과 검토 질문

- Task/Notes/Project Member의 실제 필수 조건은 무엇인가? 빈 값 제출과 공개 요청 스키마를 대조한다.
- 기록자가 다른 멤버의 시간을 입력할 수 있는가? 역할별 권한을 확인한다.
- 0시간·음수·60분·24시간 이상 입력은 어떻게 정규화되는가? 경계값 검증이 필요하다.
- 성공 뒤 No hours added 캡처는 다른 작업인가? 동일 이름 두 작업의 실제 ID·시점을 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-17 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
