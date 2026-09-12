# User Flow / 화면 목록

## 핵심 User Flow

### Flow 0. 로그인 후 홈 확인

1. 사용자가 로그인한다.
2. `/app` 빈 홈에 진입한다.
3. 사이드바 또는 하단 navigation에서 더보기와 계정 설정 진입점을 확인한다.

### Flow 1. 계정 설정 확인

1. `/app` 또는 `/app/more`에서 계정 설정 모달을 연다.
2. 프로필, 환경설정, 로그인 기기 정보를 확인한다.
3. 표시 언어, 시간대, 기본 국가, 기본 통화 값을 수정하고 저장한다.

### Flow 2. 도움말 접수

1. 도움말 메뉴를 연다.
2. 지원 문의 또는 오류 신고를 선택한다.
3. 내용을 입력하고 접수 결과를 확인한다.

### Flow 3. 공개 문의

1. 로그인 전 공개 사이트의 문의 페이지에 접근한다.
2. 이메일, 이름, 성, 회사명, 회사 규모, 직함, 지역, 전화번호, 사용 계획, 인지 경로를 입력한다.
3. 문의 접수 완료 상태를 확인한다.

## User Web 화면 목록

| 화면 | Route |
| --- | --- |
| 홈 | `/app` |
| 더보기 | `/app/more` |
| 계정 모달 | 보호 route 위의 `?account=settings` |
| 도움말 모달 | 보호 route 위의 공통 shell modal |
| 공개 사이트 | `/{locale}` 계열 공개 route |

현재 `/app/contacts/*`, `/app/products/*`, `/app/deals/*`, `/app/export`는 `/app`으로 redirect한다.

고정형 고객사 관리 route는 현재 활성 route가 아니다.

## Admin Web 화면 목록

| 화면 | Route |
| --- | --- |
| 권한 확인 | `/` |
| 로그인 | `/login` |

## 우선순위

1. 현재 활성 화면인 `/app`, `/app/more`, 계정/도움말 모달을 안정화한다.
2. 공개 문의의 입력 흐름과 접수 상태를 유지한다.
3. 후속 CRM record 화면은 Workspace/Object/Attribute/Record/List/View 결정 이후 별도 설계한다.
4. 모바일에서는 로그인, 더보기, 모달, 문의 form 흐름을 먼저 안정화한다.
