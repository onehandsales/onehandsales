# Editing branding settings 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **6/6단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `79468a76-f7fd-456e-843e-66c2763976a5` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=79468a76-f7fd-456e-843e-66c2763976a5) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 6단계 / 6단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |

## 2. 플로우 목적과 연결

운영 회사의 기본 문서 헤더를 No image에서 Abstract·Plant로 미리 보고 Plant를 저장한다.

- Branding 탭의 공통 기본값. 개별 청구서·제안서 헤더 편집과 범위를 구분한다.

- 상위 분석: [Settings](../ANALYSIS.md)

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_a2d30da474bc43909f17e726b0559b83`](https://gummble.com/screens/sc_a2d30da474bc43909f17e726b0559b83?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Brand Settings | 하단 화이트라벨 옵션까지 스크롤 |
| 02 | [`sc_d380789677a74dfb98c181aa6f8ea9c0`](https://gummble.com/screens/sc_d380789677a74dfb98c181aa6f8ea9c0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 브랜드 기본값과 화이트라벨 | Header Image 드롭다운 열기 |
| 03 | [`sc_159f4c9fd4464638b012a2db5441565c`](https://gummble.com/screens/sc_159f4c9fd4464638b012a2db5441565c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Header Image 선택 메뉴 | Abstract 선택 및 미리보기 |
| 04 | [`sc_42454ea4d1c44374b940aa52d155a53b`](https://gummble.com/screens/sc_42454ea4d1c44374b940aa52d155a53b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Abstract 헤더 미리보기 | Plant 선택 및 미리보기 |
| 05 | [`sc_936ae7a98b0c4cb5a0ac7c85438225be`](https://gummble.com/screens/sc_936ae7a98b0c4cb5a0ac7c85438225be?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | Plant 헤더 미리보기 | 상단으로 이동·저장 완료 토스트 |
| 06 | [`sc_56fc9c3ddb2b4075b4e6d69efe450718`](https://gummble.com/screens/sc_56fc9c3ddb2b4075b4e6d69efe450718?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | 브랜드 저장 완료 | Plant 저장된 상태에서 종료 |

## 4. 화면별 상세 분석

### 단계 01 — Brand Settings

- Screen ID: `sc_a2d30da474bc43909f17e726b0559b83`
- 원본: [화면 페이지](https://gummble.com/screens/sc_a2d30da474bc43909f17e726b0559b83?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d32a37ed-4ba5-4daf-bb38-10a0ce50321b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_d380789677a74dfb98c181aa6f8ea9c0`

#### 화면에서 직접 확인한 내용

- 레이아웃: Branding 탭. 왼쪽 설정, 오른쪽 Sample Invoice 미리보기.
- 입력 항목·필수 표시·기본값: Company Logo spencer.png, Small Square 84×84, Header Image No image, Brand Font 미선택, Brand Color #22AD01 일부.
- 버튼·메뉴·안내 문구: Save Changes, 파일 제거 X, 로고 크기·헤더·폰트 드롭다운. 폰트·색 왕관.
- 확인된 상태: 새로 만드는 문서에만 변경 적용 안내. 샘플 invoice1001.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 운영 회사의 브랜드 기본값과 미리보기.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 왕관 기능의 제한 동작·미리보기와 저장 차이 미확인.

#### 모델링 영향

- 후보와 근거: 브랜드 설정·asset·문서 생성 당시 기본값 복사 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 브랜드 기본값과 화이트라벨

- Screen ID: `sc_d380789677a74dfb98c181aa6f8ea9c0`
- 원본: [화면 페이지](https://gummble.com/screens/sc_d380789677a74dfb98c181aa6f8ea9c0?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/daa7ed2b-46f2-4628-8ff4-0aa3a53f22c1.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_a2d30da474bc43909f17e726b0559b83` → 현재 → `sc_159f4c9fd4464638b012a2db5441565c`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 설정 전체, 오른쪽 Sample Invoice 하단 Pay Invoice 포함.
- 입력 항목·필수 표시·기본값: 로고 spencer.png84×84, Header No image, Font 미선택, Color #22AD01. Show Bonsai branding 선택.
- 버튼·메뉴·안내 문구: Hide Bonsai branding and show mine, Remove all branding은 미선택·왕관.
- 확인된 상태: 미리보기 흰 헤더, 베이지 로고.
- 단계 간 변화: 하단 화이트라벨 옵션까지 스크롤

#### 동작과 데이터

- 화면 관찰: 화이트라벨은 단순 켜기/끄기보다3가지 선택으로 보임.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 폰트·색 비활성 여부와 요금제 조건 미확인.

#### 모델링 영향

- 후보와 근거: 화이트라벨 enum 후보, 로고/문서 헤더와 분리.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 03 — Header Image 선택 메뉴

- Screen ID: `sc_159f4c9fd4464638b012a2db5441565c`
- 원본: [화면 페이지](https://gummble.com/screens/sc_159f4c9fd4464638b012a2db5441565c?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5b227ae4-1b31-40b2-9007-ef72ebb381ba.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_d380789677a74dfb98c181aa6f8ea9c0` → 현재 → `sc_42454ea4d1c44374b940aa52d155a53b`

#### 화면에서 직접 확인한 내용

- 레이아웃: 왼쪽 드롭다운이 폰트 영역 위로 펼쳐짐.
- 입력 항목·필수 표시·기본값: No image 선택. Abstract, Plant, Desk, Custom Header(왕관).
- 버튼·메뉴·안내 문구: 각 preset 메뉴.
- 확인된 상태: 미리보기는 아직 No image.
- 단계 간 변화: Header Image 드롭다운 열기

#### 동작과 데이터

- 화면 관찰: 선택 가능한 preset과 사용자 이미지 옵션이 분리됨.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 커스텀 이미지 업로드 제한 미확인.

#### 모델링 영향

- 후보와 근거: 헤더 유형과 선택된 preset/asset 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 04 — Abstract 헤더 미리보기

- Screen ID: `sc_42454ea4d1c44374b940aa52d155a53b`
- 원본: [화면 페이지](https://gummble.com/screens/sc_42454ea4d1c44374b940aa52d155a53b?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/d4256e01-9911-44db-ae1f-0beda99d294b.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_159f4c9fd4464638b012a2db5441565c` → 현재 → `sc_936ae7a98b0c4cb5a0ac7c85438225be`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 청구서 상단에 회색 곡선 건축 이미지. 로고가 헤더 아래 경계에 겹침.
- 입력 항목·필수 표시·기본값: Header Abstract. 나머지 설정 유지.
- 버튼·메뉴·안내 문구: 동일 설정 컨트롤.
- 확인된 상태: 미리보기 변경. 저장 토스트 없음.
- 단계 간 변화: Abstract 선택 및 미리보기

#### 동작과 데이터

- 화면 관찰: 프리셋 전환에 따라 헤더 영역 레이아웃도 달라짐.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 서버 저장 발생 여부 미확인.

#### 모델링 영향

- 후보와 근거: 미리보기 상태와 저장된 기본값 분리 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 05 — Plant 헤더 미리보기

- Screen ID: `sc_936ae7a98b0c4cb5a0ac7c85438225be`
- 원본: [화면 페이지](https://gummble.com/screens/sc_936ae7a98b0c4cb5a0ac7c85438225be?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/5f1e25ab-88e2-4b12-870f-993e9b1efdfa.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_42454ea4d1c44374b940aa52d155a53b` → 현재 → `sc_56fc9c3ddb2b4075b4e6d69efe450718`

#### 화면에서 직접 확인한 내용

- 레이아웃: 오른쪽 연한 녹색 배경·화병 식물 헤더, 로고는 중앙 경계.
- 입력 항목·필수 표시·기본값: Header Plant. Show Bonsai branding 유지.
- 버튼·메뉴·안내 문구: 동일 설정 컨트롤.
- 확인된 상태: Abstract에서 Plant로 교체.
- 단계 간 변화: Plant 선택 및 미리보기

#### 동작과 데이터

- 화면 관찰: 선택 값과 미리보기 이미지 대응.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 실제 문서 적용 전.

#### 모델링 영향

- 후보와 근거: 헤더 preset 선택 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 06 — 브랜드 저장 완료

- Screen ID: `sc_56fc9c3ddb2b4075b4e6d69efe450718`
- 원본: [화면 페이지](https://gummble.com/screens/sc_56fc9c3ddb2b4075b4e6d69efe450718?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/a95cb1af-3693-4a01-b036-369c6d279113.png)
- 로컬 이미지: 미배치. 다운로드 후 화면 ID와 순서를 대조해 연결한다.
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: 1440 × 900
- 이전·다음 단계: `sc_936ae7a98b0c4cb5a0ac7c85438225be` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Brand Settings로 돌아옴. 우하단 성공 토스트.
- 입력 항목·필수 표시·기본값: Header Plant, logo spencer.png84×84.
- 버튼·메뉴·안내 문구: Save Changes; 브랜딩 설정 저장 완료 안내와 닫기 X.
- 확인된 상태: Plant 미리보기 유지·저장 성공 표시.
- 단계 간 변화: 상단으로 이동·저장 완료 토스트

#### 동작과 데이터

- 화면 관찰: 선택 값을 저장했다는 UI 근거.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 저장된 필드 범위와 기존 문서 변화 미확인.

#### 모델링 영향

- 후보와 근거: 설정 저장 결과·기본값 버전 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- 미리보기 변경과 저장 성공은 구분된다. 마지막에 저장 토스트가 있다.
- 캡처 안내는 새 문서에만 영향. 기존 문서 일괄 변경으로 해석하지 않는다.
- 화이트라벨3개 라디오 중 Show Bonsai branding 유지. 나머지2개는 왕관 표시.

## 6. 공식 도움말과 API 대조

- [회사 로고·문서 헤더](https://help.hellobonsai.com/en/articles/1977524-how-to-update-your-company-logo-and-header-on-your-documents): 회사 로고/문서 표시와 크기·헤더 설정을 설명한다. 캡처는 온보딩의 간단한 업로드이며 전체 Branding 설정과 다르다.
- [공개 API](https://docs.hellobonsai.com/api): 조회한 리소스 목록에서 내 프로필·회사 설정·알림·2FA·구독 변경 endpoint를 확인하지 못했다. CRM Companies API를 운영 회사 설정 API로 간주하지 않는다.

## 7. 데이터 모델링 시사점

- 브랜드 기본 헤더 preset, 로고 asset/크기, 폰트·색, 화이트라벨 모드 후보.
- 문서 생성 시 기본값 적용과 개별 문서 override의 경계를 검증할 것.

## 8. 미확인 사항과 검토 질문

- 저장 후 새 청구서·제안서·계약 각각의 적용 범위를 확인할 것.
- 왕관 옵션의 클릭 결과와 플랜별 허용 조건은 미수록.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 6개와 실제 이미지 6개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
