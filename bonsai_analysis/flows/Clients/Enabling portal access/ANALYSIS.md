# Enabling portal access 플로우 분석

검토 상태: **R1 이미지 검토 및 문서 대조**. 실제 이미지 확인 **2/2단계**. 계정 재현은 수행하지 않았다.

관찰은 Gummble 정적 이미지, 문서 확인은 공식 도움말·API, 설계 가정은 우리 구현 후보를 뜻한다. 버튼의 존재와 실행 결과를 구분한다.

## 1. 출처와 검토 상태

| 항목 | 기록 |
| --- | --- |
| 앱 | Bonsai Web · `bonsai-web` · `c1026782-09a7-45fb-b2d0-7cc1909bf1f4` |
| Flow ID | `0cf1b411-06f2-4fc9-8af4-30148a3e88e2` |
| 원본 | [Gummble flow](https://gummble.com/apps/bonsai-web?tab=flows&flow=0cf1b411-06f2-4fc9-8af4-30148a3e88e2) |
| 버전 | 앱 조회 결과 `Latest`, version ID `2146`. 개별 flow의 제품 빌드·캡처 시점은 응답에 없어 미확인 |
| 조회일 / 이미지 검토일 | 2026-11-17 이후 세션 조회 / 2026-11-17~2026-11-18 KST (개별 이미지 시각 미기록) |
| 캡처일 | 미확인. 화면 속 업무 날짜나 샘플 값은 캡처일이 아니다 |
| 화면 수 / 이미지 검토 | 2단계 / 2단계 |
| 캡처 조건 | MCP 이미지 메타데이터의 크기는 단계별로 기록. 브라우저 배율·DPR·권한·요금제·국가는 별도 확인 없으면 미확인 |
| 실제 계정 재현 | 미수행. 발송·삭제·서명·결제·외부 연결을 실행하지 않음 |
| 로컬 원본·단계 재검증 | 2026-11-18 KST · MCP 단계 순서 재조회, 원본 2개 배치, PNG 디코딩·픽셀 크기·SHA-256 대조 완료 |

## 2. 플로우 목적과 연결

업무 담당자가 고객 포털을 사용할 수 있도록 계정의 포털 접근 설정을 켠다.

- Clients > Client Portal에서 시작한다. 고객 개별 상세가 아니라 전체 고객 설정 화면이다.
- 종료 근거는 Enabled 선택과 설정 업데이트 토스트다. 외부 고객의 로그인 성공은 기록되지 않았다.

- 상위 분석: [Clients](../ANALYSIS.md)

- 폴더 위치: `bonsai_analysis/flows/Clients/Enabling portal access`
- 부모·자식은 Gummble 탐색 분류이며, 모든 하위 플로우가 순차 실행된다는 뜻은 아니다.

## 3. 전체 단계표

아래 순서는 MCP가 반환한 캡처 순서다. 동일 페이지의 스크롤·메뉴 상태도 별도 단계이며, 이미지 사이의 클릭·저장 과정이 모두 기록됐다는 뜻은 아니다.

| 단계 | Screen ID와 원본 | 확인된 화면 | 다음 단계와 관계 |
| --- | --- | --- | --- |
| 01 | [`sc_531ce252700c43088b29703be32726d6`](https://gummble.com/screens/sc_531ce252700c43088b29703be32726d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [고객 포털 비활성 설정](<screens/01_sc_531ce252700c43088b29703be32726d6.png>) | Portal Access가 Disabled에서 Enabled로 바뀌고 업데이트 토스트가 나타난다. |
| 02 | [`sc_4930cb54d79940748e12ac3f586d48bc`](https://gummble.com/screens/sc_4930cb54d79940748e12ac3f586d48bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) | [포털 접근 Enabled](<screens/02_sc_4930cb54d79940748e12ac3f586d48bc.png>) | 설정 반영 표시로 종료. 링크 접속·인증·고객별 예외는 미수록. |

## 4. 화면별 상세 분석

### 단계 01 — 고객 포털 비활성 설정

- Screen ID: `sc_531ce252700c43088b29703be32726d6`
- 원본: [화면 페이지](https://gummble.com/screens/sc_531ce252700c43088b29703be32726d6?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/1cc4b534-e3d3-4969-ab1e-5a0eea2f2af6.png)
- 로컬 이미지: [01_sc_531ce252700c43088b29703be32726d6.png](<screens/01_sc_531ce252700c43088b29703be32726d6.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `플로우 시작` → 현재 → `sc_4930cb54d79940748e12ac3f586d48bc`

#### 화면에서 직접 확인한 내용

- 레이아웃: Client Portal 탭. 안내배너, 왼쪽설정·오른쪽포털미리보기.
- 입력 항목·필수 표시·기본값: 공유URL 축약표시, Portal Access Disabled, HeaderImage Custom Header, Bonsai Branding켜짐.
- 버튼·메뉴·안내 문구: View, 링크복사, Enable/Disabled, Upload Image, 브랜딩토글, brand settings링크, 배너닫기.
- 확인된 상태: 포털이 꺼져 있고 이미지업로드/브랜딩컨트롤은 표시됨.
- 단계 간 변화: 진입 화면. 이 단계 이전의 사용자 행동은 별도 자료가 필요하다.

#### 동작과 데이터

- 화면 관찰: 포털설정은 특정고객 상세가 아닌 전역 Clients탭에 있다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: URL전체·링크인증·고객별접근·요금제제약.

#### 모델링 영향

- 후보와 근거: 포털 전역설정·브랜딩 자산·외부접근 후보.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

### 단계 02 — 포털 접근 Enabled

- Screen ID: `sc_4930cb54d79940748e12ac3f586d48bc`
- 원본: [화면 페이지](https://gummble.com/screens/sc_4930cb54d79940748e12ac3f586d48bc?source=mcp_result&utm_source=mcp&utm_medium=mcp_tool&utm_campaign=screen_result) · [이미지](https://storage.gummble.com/prod/content/app_screens/84ac489f-dde1-4dc0-87b1-23d133b66dd9.png)
- 로컬 이미지: [02_sc_4930cb54d79940748e12ac3f586d48bc.png](<screens/02_sc_4930cb54d79940748e12ac3f586d48bc.png>)
- 실제 이미지 확인일: 2026-11-17~2026-11-18 KST (세션 내 확인; 개별 이미지 시각 미기록)
- 이미지 크기: MCP 메타데이터 **1440 × 900** / 원본 PNG **2880 × 1800 px**. 브라우저 배율·DPR은 미확인
- 이전·다음 단계: `sc_531ce252700c43088b29703be32726d6` → 현재 → `플로우 기록 종료`

#### 화면에서 직접 확인한 내용

- 레이아웃: 상단 Clients 탭 아래 안내 배너, 왼쪽 설정과 오른쪽 포털 미리보기의 두 열.
- 입력 항목·필수 표시·기본값: Portal Access Enabled 선택. Custom Header와 Bonsai Branding 켜짐 유지. 링크는 중간 이후 생략 표시.
- 버튼·메뉴·안내 문구: View·링크 복사·Upload Image·brand settings·토스트 닫기. Client portal settings updated 성공 알림.
- 확인된 상태: 설정 성공 상태. 고객 포털 자체가 아니라 관리 화면의 미리보기다.
- 단계 간 변화: Portal Access가 Disabled에서 Enabled로 바뀌고 업데이트 토스트가 나타난다.

#### 동작과 데이터

- 화면 관찰: Disabled→Enabled와 성공 토스트가 함께 관찰된다.
- 공식 문서 확인: 아래 6절에서 출처와 적용 범위를 대조한다. 현재 화면의 내부 API 호출은 확인하지 않았다.
- 설계 가정: 표시된 업무 개념은 구현 후보이며 저장 방식·권한·트랜잭션을 확정하지 않는다.
- 미확인: 공유 링크 전체값, 로그인 방식·세션 취소·메일 발송은 이미지로 미확인.

#### 모델링 영향

- 후보와 근거: 포털 접근 설정과 프리뷰·브랜딩 구성. 고객별 권한과 전역 설정 구분.
- 확정 전 확인: 소유 범위·필수값·연결 수·삭제 영향은 화면과 공식 계약을 추가 대조한다.

## 5. 업무 규칙과 데이터 변화

- [관찰] 포털 활성화 후 기존 공유 링크·브랜딩 설정이 함께 유지된다.
- [문서] 계정 기본값과 고객별 접근 설정을 구분한다. 같은 고객의 여러 연락처는 같은 포털을 사용한다고 설명한다.
- [미확인] 활성화 즉시 고객에게 안내 메일이 발송되는지는 이 두 이미지로 확인할 수 없다.

## 6. 공식 도움말과 API 대조

- [Client Portal 도움말](https://help.hellobonsai.com/en/articles/4409019-how-to-use-the-client-portal): 2026-09-18 기준 보안 이메일 링크로 접근하며, 미리보기는 실제 작업을 허용하지 않는다. 화면의 Enabled는 인증 성공의 증거가 아니다.
- [Companies API](https://docs.hellobonsai.com/api/tag/companies): GET/POST `/public-api/v1/companies`, GET/PATCH `/public-api/v1/companies/{id}`, GET `/public-api/v1/companies/{id}/activities`를 확인했다. 공개 그룹에서 포털 토글 전용 endpoint는 확인하지 못했다.

## 7. 데이터 모델링 시사점

- 계정 포털 설정·고객별 접근 허용·연락처 인증을 별개 후보로 둔다. UI 전체 토글 하나를 모든 연락처의 개별 권한값으로 복제하지 않는다.
- 공유 URL과 로그인 자격 증명을 구분한다. URL 생성·만료·토큰 저장 방식은 미확인.

## 8. 미확인 사항과 검토 질문

- 비활성화 시 기존 로그인 세션도 만료되는가? 실제 계정에서 기존 세션·직접 링크를 비교해야 한다.
- 전역 허용과 고객별 차단이 충돌할 때 적용 순서는 무엇인가? 권한 정책 확정 전 공식 설명·계정 재현이 필요하다.

## 9. 검토 이력

| 차수 | 날짜 | 확인·수정 내용 | 남은 범위 |
| --- | --- | --- | --- |
| R1 | 2026-11-18 KST | MCP 단계 목록 2개와 실제 이미지 2개 대조. 출처·관찰·문서·가정 분리 | 실제 계정·미수록 상태와 8절 질문 |
| 이미지 배치·무결성 검토 | 2026-11-18 KST | MCP 2단계 재조회 및 원본 2개 로컬 배치. 단계표·상세 분석의 로컬 링크, ID·순서·PNG 디코딩·크기·SHA-256 대조 | 파일·문서 연결 검증이며 기존 R1/R2 시각 검토와 구분. 실제 계정·미수록 분기는 미검증 |
