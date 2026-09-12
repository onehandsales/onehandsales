# User Flow / 화면 목록

Status: UX Screen Map
Date: 2026-09-12

## 1. 목적

이 문서는 User Web과 Admin Web의 화면 목록, 현재 구현 상태, 후속 CRM Core 흐름을 한 번에 확인하기 위한 지도다.

상세 UX 기준은 `FIRST_USE_FLOW.md`, `KIT_SELECTION_UX.md`, `WORKSPACE_HOME_UX.md`, `RECORD_LIST_DETAIL_UX.md`를 우선한다.

## 2. 현재 구현된 User Web 흐름

### Flow A. 로그인 후 foundation home 확인

1. 사용자가 로그인한다.
2. `/app`에 진입한다.
3. 현재 구현된 foundation home을 확인한다.
4. 더보기, 계정 설정, 도움말 진입점을 확인한다.

현재 `/app`은 후속 CRM Core가 붙기 전의 foundation 화면이다. 존재하지 않는 Kit, Record, 업무 데이터를 실제 활성 기능처럼 보여주면 안 된다.

### Flow B. 계정 설정 확인

1. `/app` 또는 `/app/more`에서 계정 설정 모달을 연다.
2. 프로필, 환경설정, 로그인 기기 정보를 확인한다.
3. 표시 언어, 시간대, 기본 국가, 기본 통화 값을 수정하고 저장한다.

### Flow C. 도움말 접수

1. 도움말 메뉴를 연다.
2. 지원 문의 또는 오류 신고를 선택한다.
3. 내용을 입력하고 접수 결과를 확인한다.

### Flow D. 공개 문의

1. 로그인 전 공개 사이트의 문의 페이지에 접근한다.
2. 이메일, 이름, 성, 회사명, 회사 규모, 직함, 지역, 전화번호, 사용 계획, 인지 경로를 입력한다.
3. 문의 접수 완료 상태를 확인한다.

## 3. 후속 OneHand CRM 핵심 흐름

### Flow 1. 첫 사용

```text
로그인/가입
-> 업무 유형 선택
-> Kit 미리보기
-> Workspace 준비
-> 첫 Record 생성
-> 기본 보기 확인
-> 다음 행동 안내
```

### Flow 2. 반복 사용

```text
Workspace home
-> 관리 대상 선택
-> Record 목록 확인
-> Record 상세 열기
-> 상태/정보/연결 수정
-> 다음 행동 확인
```

### Flow 3. Record 연결

```text
Record 상세
-> 연결된 기록 영역
-> 기존 Record 선택 또는 새 Record 추가
-> 연결 확인
```

## 4. User Web 화면 목록

### 현재 활성

| 화면 | Route |
| --- | --- |
| 홈 foundation | `/app` |
| 더보기 | `/app/more` |
| 계정 모달 | 보호 route 위의 `?account=settings` |
| 도움말 모달 | 보호 route 위의 공통 shell modal |
| 공개 사이트 | `/{locale}` 계열 공개 route |

### 후속 CRM Core

| 화면 | 목적 |
| --- | --- |
| 업무 유형 선택 | 사용자가 Kit을 선택한다. |
| Kit 미리보기 | 관리 대상, 관계, 첫 행동을 확인한다. |
| Workspace home | Kit 적용 후 첫 업무 화면을 제공한다. |
| Record 목록 | 같은 관리 대상의 Record를 다시 찾고 비교한다. |
| Record 상세 | 상태, 속성, 연결, 다음 행동을 확인한다. |
| Record 생성 패널 | 목록 맥락을 유지하며 새 Record를 만든다. |
| 연결 Record 선택/생성 | 업무 관계를 자연스럽게 만든다. |

## 5. Admin Web 화면 목록

| 화면 | Route |
| --- | --- |
| 권한 확인 | `/` |
| 로그인 | `/login` |

Admin Web은 현재 권한 확인과 로그인 중심의 최소 화면이다. User Web의 Kit/Record 업무 화면을 암시하지 않는다.

## 6. 우선순위

1. 현재 활성 foundation 화면과 계정/도움말 흐름을 깨지 않게 유지한다.
2. 후속 작업에서는 첫 사용 flow와 Kit 선택 UX를 먼저 설계한다.
3. Workspace home과 첫 Record 생성 flow를 함께 설계한다.
4. Record 목록/상세/연결 UX는 CRM Core 구현 범위와 맞춰 확정한다.
5. Team, billing, automation은 PM 범위 확정 전 화면 우선순위에서 제외한다.

## 7. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/PLANNING/KIT_SELECTION_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/WORKSPACE_HOME_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
