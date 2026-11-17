# Editing header style 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **7/7단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `b8c9b3db-6f13-454c-8abf-52859fd329e5` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=b8c9b3db-6f13-454c-8abf-52859fd329e5) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 7단계 / 7단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

제안서 헤더의 제목색과 보조 텍스트색을 개별 조정한다.

- Cover 테마의 초안에서 시작한다.
- 제목색 #17B390과 헤더 텍스트색 #919C9A를 선택한다. 본문 글로벌 Text Color는 별도 설정으로 보인다.

- 상위 분석: [Creating a proposal](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_c226d7f45ba246fb99a4debc2dd2d1d1`](https://gummble.com/screens/sc_c226d7f45ba246fb99a4debc2dd2d1d1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Cover 적용 후 스타일 패널 | Title Color 피커를 연다. |
| 02 | [`sc_c6d245c9b0dd4060835263a1d1e36001`](https://gummble.com/screens/sc_c6d245c9b0dd4060835263a1d1e36001?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 헤더 제목색 피커 | 제목색을 #17B390으로 바꾸면 제목 미리보기가 변한다. |
| 03 | [`sc_2c4f193d8c7641c1987e909554c4d7db`](https://gummble.com/screens/sc_2c4f193d8c7641c1987e909554c4d7db?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 제목색 #17B390 선택 | 피커를 닫고 제목색 적용 상태를 본다. |
| 04 | [`sc_0e431a7583df4f8e925fefae38f06a86`](https://gummble.com/screens/sc_0e431a7583df4f8e925fefae38f06a86?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 제목색 적용 후 피커 닫힘 | Header Styles의 Text Color 피커를 연다. |
| 05 | [`sc_005d231ace2e47cf98bed206c13d2102`](https://gummble.com/screens/sc_005d231ace2e47cf98bed206c13d2102?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 헤더 텍스트색 피커 | 텍스트색 #919C9A를 선택하면 날짜·발신/수신 정보가 회색으로 바뀐다. |
| 06 | [`sc_751bd587aefe4b10951650c413b22e1f`](https://gummble.com/screens/sc_751bd587aefe4b10951650c413b22e1f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 헤더 텍스트색 #919C9A 선택 | 피커를 닫고 Changes Saved를 확인한다. |
| 07 | [`sc_cbb5f16996764c49a4df94659a235efa`](https://gummble.com/screens/sc_cbb5f16996764c49a4df94659a235efa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 제목·텍스트색 저장 표시 | 헤더 스타일 변경 상태로 종료. |

## 4. 화면별 상세 분석

### 단계 01 — Cover 적용 후 스타일 패널

- Screen ID: `sc_c226d7f45ba246fb99a4debc2dd2d1d1`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c226d7f45ba246fb99a4debc2dd2d1d1?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/e5da378c-69ac-4e21-bf49-82295c739bdf.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_c6d245c9b0dd4060835263a1d1e36001`

#### 화면에서 직접 확인한 내용

- 레이아웃: 우측 테마선택그리드가 Overview/Style설정으로 복귀.
- 입력 항목·필수 표시·기본값: Theme Cover,Font Brawler,Border Width1, 만료Feb22,금액5255.
- 버튼·메뉴·안내 문구: Theme 재선택·색/폭·글꼴·Send Proposal.
- 확인된 상태: 스타일 편집 종료 상태.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: Cover선택이 일반설정에 반영됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서버저장/새로고침 지속성·Undo 미수록.

#### 모델링 영향

- 후보와 근거: 표현 설정 적용 상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 헤더 제목색 피커

- Screen ID: `sc_c6d245c9b0dd4060835263a1d1e36001`
- 원본: [화면 페이지](https://gummble.com/screens/sc_c6d245c9b0dd4060835263a1d1e36001?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/018e0875-5adf-4a80-8ad4-e07885bef5cd.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c226d7f45ba246fb99a4debc2dd2d1d1` → 현재 → `sc_2c4f193d8c7641c1987e909554c4d7db`

#### 화면에서 직접 확인한 내용

- 레이아웃: Title Color 아래 떠 있는 색상 피커가 다른 스타일 입력 일부를 덮는다.
- 입력 항목·필수 표시·기본값: 현재 Hex00120E, RGB0/18/14, A100. 색면·색상띠·투명도띠·프리셋.
- 버튼·메뉴·안내 문구: Hex/RGBA입력·팔레트·슬라이더. 문서제목은진녹색.
- 확인된 상태: 색상 선택 전.
- 단계 간 변화: Title Color 피커를 연다.

#### 동작과 데이터

- 화면 관찰: 색상값 직접입력 인터페이스 확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: A의단위·허용형식/범위·피커닫기미확인.

#### 모델링 영향

- 후보와 근거: 색표현/변환·팝오버상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — 제목색 #17B390 선택

- Screen ID: `sc_2c4f193d8c7641c1987e909554c4d7db`
- 원본: [화면 페이지](https://gummble.com/screens/sc_2c4f193d8c7641c1987e909554c4d7db?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/43e7e69d-5cc9-43ff-8652-04ce0c041862.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_c6d245c9b0dd4060835263a1d1e36001` → 현재 → `sc_0e431a7583df4f8e925fefae38f06a86`

#### 화면에서 직접 확인한 내용

- 레이아웃: 피커 유지, 문서제목과Title Color표시가청록으로변경.
- 입력 항목·필수 표시·기본값: Hex17B390, RGB23/179/144, A100.
- 버튼·메뉴·안내 문구: 팔레트/슬라이더/값입력. 상단Changes Saved.
- 확인된 상태: 실시간표현변경 및 저장표시.
- 단계 간 변화: 제목색을 #17B390으로 바꾸면 제목 미리보기가 변한다.

#### 동작과 데이터

- 화면 관찰: 제목만 색이 바뀌고 다른 헤더 텍스트는 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 저장debounce·네트워크실패복구 미확인.

#### 모델링 영향

- 후보와 근거: 제목색독립속성 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — 제목색 적용 후 피커 닫힘

- Screen ID: `sc_0e431a7583df4f8e925fefae38f06a86`
- 원본: [화면 페이지](https://gummble.com/screens/sc_0e431a7583df4f8e925fefae38f06a86?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/9ededaf3-4519-4c9e-b839-af95426de210.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_2c4f193d8c7641c1987e909554c4d7db` → 현재 → `sc_005d231ace2e47cf98bed206c13d2102`

#### 화면에서 직접 확인한 내용

- 레이아웃: 일반스타일패널복귀.
- 입력 항목·필수 표시·기본값: Title Color청록,Text Color진녹,배경흰색·Border1·FontBrawler.
- 버튼·메뉴·안내 문구: 각색버튼·Theme·Font.
- 확인된 상태: 제목색적용상태.
- 단계 간 변화: 피커를 닫고 제목색 적용 상태를 본다.

#### 동작과 데이터

- 화면 관찰: 색상 선택이 패널 닫힌 후에도 유지.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 세션재접속지속성미확인.

#### 모델링 영향

- 후보와 근거: 표현설정상태 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — 헤더 텍스트색 피커

- Screen ID: `sc_005d231ace2e47cf98bed206c13d2102`
- 원본: [화면 페이지](https://gummble.com/screens/sc_005d231ace2e47cf98bed206c13d2102?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/7944bab8-c90e-4a28-8680-3c5b42aa6a78.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_0e431a7583df4f8e925fefae38f06a86` → 현재 → `sc_751bd587aefe4b10951650c413b22e1f`

#### 화면에서 직접 확인한 내용

- 레이아웃: Text Color 아래피커. 제목은청록유지.
- 입력 항목·필수 표시·기본값: Hex00120E RGB0/18/14 A100.
- 버튼·메뉴·안내 문구: Hex/RGBA·슬라이더·프리셋.
- 확인된 상태: 두번째스타일속성편집.
- 단계 간 변화: Header Styles의 Text Color 피커를 연다.

#### 동작과 데이터

- 화면 관찰: Title Color와다른Text Color를편집.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 글로벌Text Color와 적용 범위 차이 전체 문서 검증 필요.

#### 모델링 영향

- 후보와 근거: 헤더와글로벌스타일계층 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 헤더 텍스트색 #919C9A 선택

- Screen ID: `sc_751bd587aefe4b10951650c413b22e1f`
- 원본: [화면 페이지](https://gummble.com/screens/sc_751bd587aefe4b10951650c413b22e1f?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/0d9d0ecf-5ef1-4aa8-9571-f2e97a25e305.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_005d231ace2e47cf98bed206c13d2102` → 현재 → `sc_cbb5f16996764c49a4df94659a235efa`

#### 화면에서 직접 확인한 내용

- 레이아웃: 날짜·발신 수신 정보가 회색으로 변경,본문Overview제목검정유지.
- 입력 항목·필수 표시·기본값: Hex919C9A RGB145/156/154 A100, 제목청록유지.
- 버튼·메뉴·안내 문구: 색상피커,상단Changes Saved.
- 확인된 상태: 선택변경표현.
- 단계 간 변화: 텍스트색 #919C9A를 선택하면 날짜·발신/수신 정보가 회색으로 바뀐다.

#### 동작과 데이터

- 화면 관찰: 헤더보조텍스트색 적용영역을직접확인.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 링크/placeholder에대한색상상속·명도정책미확인.

#### 모델링 영향

- 후보와 근거: 스타일범위·링크예외 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 07 — 제목·텍스트색 저장 표시

- Screen ID: `sc_cbb5f16996764c49a4df94659a235efa`
- 원본: [화면 페이지](https://gummble.com/screens/sc_cbb5f16996764c49a4df94659a235efa?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/47c523db-2082-45b3-8120-90eb2bcd4881.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_751bd587aefe4b10951650c413b22e1f` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 피커닫힘,일반패널과Changes Saved.
- 입력 항목·필수 표시·기본값: Title청록·Text회색·Cover·Brawler·Border1. Drafted5255·만료Feb22.
- 버튼·메뉴·안내 문구: Preview/Send Proposal/Automation,스타일제어.
- 확인된 상태: 스타일변경완료표시.
- 단계 간 변화: 피커를 닫고 Changes Saved를 확인한다.

#### 동작과 데이터

- 화면 관찰: 헤더 색 변경이 유지되며 업무 값은 같음.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 고객미리보기·PDF재현은별도검토.

#### 모델링 영향

- 후보와 근거: 콘텐츠/스타일분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 피커에 Hex/R/G/B/A와 색상팔레트·슬라이더가 있다.
- [관찰] 제목색 변경은 헤더 제목에, 텍스트색 변경은 날짜·From/To 정보에 반영된다. 하단 Overview & Goals의 본문 제목은 검정 유지.
- [관찰] 샘플 색은 실제 필드에서 읽은 값이다. 원본 앱 전체 디자인 토큰으로 일반화하지 않는다.

## 6. 공식 도움말과 API 대조

- [제안서 편집 도움말](https://help.hellobonsai.com/en/articles/5616844-all-about-proposals): 제안서 편집 구조를 대조했다. 색상피커의필드/저장스키마 계약은 이 도움말에 없다.
- [Documents API](https://docs.hellobonsai.com/api/tag/documents): GET/POST `/public-api/v1/docs`, GET `/public-api/v1/docs/{id}`, PUT `/public-api/v1/docs/{doc_id}/pricing_table`를 확인했다. API 생성 문서는 초안이며 검토·발송은 Bonsai에서 한다고 명시한다. 필드 계약·구형 제안서 호환성은 미확인.

## 7. 데이터 모델링 시사점

- 헤더 제목색·헤더 텍스트색·글로벌 본문색의 별도 스타일 속성 후보.
- RGBA/HEX 변환·미리보기 즉시반영·자동저장 상태 후보.

## 8. 미확인 사항과 검토 질문

- 투명도0·잘못된Hex·키보드입력·색선택취소와 변경이력 복원방식을 확인한다.
- 테마전환이 직접지정색을 유지하는지, 고객화면/PDF 색이일치하는지 확인한다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 7개와 실제 이미지 7개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 교정 | 2026-11-18 KST | 압축된 문장의 띄어쓰기 보완. 관찰·판단 내용은 변경하지 않음 | 이미지 재검토 횟수에 포함하지 않음 |
