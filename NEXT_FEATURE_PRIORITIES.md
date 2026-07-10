# Next Feature Priorities

기준일: 2026-07-10

이 문서는 `onehand.sales`의 다음 작업 우선순위를 정리한다. 현재 기준에서는 새 기능 개발보다 출시 전 품질 라운드가 우선이다. 핵심 기능 happy path와 주요 smoke QA는 통과했고, 남은 일은 UX/UI, 모바일 브라우저, 브라우저 호환, 다중 계정 보안, 운영/DB 정합성 확인이다.

## 1. 현재 제품 범위

현재 제품 범위는 다음과 같다.

- Web
- 반응형 Web
- 모바일 브라우저 Web
- 공개/인증 화면의 URL locale 지원
- 앱 내부 관리 화면은 한국어 우선

초기 판매/검토 대상 국가는 다음으로 본다.

- 한국
- 일본
- 대만
- 미국
- 영국
- 싱가포르
- 호주
- 캐나다

현재 public/auth canonical locale slug는 다음이다.

- `ko`
- `ja`
- `zh-tw`
- `en-us`
- `en-gb`
- `en-sg`
- `en-au`
- `en-ca`

현재 범위가 아닌 항목은 다음과 같다.

- iOS/Android 네이티브 앱
- 네이티브 푸시
- 네이티브 연락처/캘린더 연동
- 오프라인 앱 동작
- 앱스토어/플레이스토어 배포
- 결제/구독 자동화

따라서 모바일 QA는 네이티브 앱 QA가 아니라, 현재 Web 제품이 모바일 브라우저에서도 핵심 업무를 수행할 수 있는지 확인하는 QA다.

## 2. 현재 완료 상태

### 2.1 기능 QA happy path 완료

아래 흐름은 수동 QA 기준으로 동작 확인 완료 상태다.

1. 로그인
2. 회사 생성/조회/수정/삭제/복구
3. 담당자 생성/조회/수정/삭제/복구
4. 제품 생성/조회/수정/삭제/복구
5. 딜 생성/조회/수정/삭제/복구
6. 일정 생성/조회/수정/삭제
7. 회의록 생성/조회/수정/삭제/복구
8. 명함 OCR
9. 데이터 가져오기 Import
10. 검색
11. 휴지통
12. 도메인별 XLSX Export
13. 설정/더보기

### 2.2 자동 검증 완료

2026-07-10 기준 자동 검증 결과는 다음과 같다.

- BE `typecheck`, `lint`, `test`, `build` 통과
- BE test: 17 suites / 82 tests passed
- FE/user-web `typecheck`, `lint`, `build`, `test:e2e` 통과
- FE/user-web E2E: 핵심 업무 smoke 1 passed
- FE/admin-web 선택 점검 `typecheck`, `lint`, `build` 통과

### 2.3 진입/인증/라우팅 smoke 완료

- Public/auth canonical URL은 `/{locale}`와 `/{locale}/login` 형식을 사용한다.
- legacy `/`, `/login`, `/pricing` 등은 선호 locale URL로 redirect한다.
- `/auth/callback`은 locale prefix 없이 유지한다.
- `/app/*`는 locale prefix를 붙이지 않는다.
- 비로그인 `/app/*` 접근은 선호 locale의 login URL로 이동한다.

### 2.4 API/보안 기본 smoke 완료

- `GET /api/health` 200 확인
- 보호 API 인증 없음 401 확인
- 잘못된 token 401 확인
- 존재하지 않는 route 404 확인
- AdminGuard 403은 자동 테스트로 확인
- User Web API client는 `/admin/api/*` 호출을 차단한다.
- 로그인/보호 redirect URL에 token-like query가 붙지 않는다.
- 비로그인 상태에서 앱 access token이 localStorage에 생성되지 않는다.
- FE/BE source에서 `console.*` 사용자 데이터 출력은 발견되지 않았다.
- refresh token은 httpOnly cookie와 hash 저장 구조를 사용한다.

## 3. 아직 남은 출시 전 품질 범위

### 3.1 UX/UI 공통 QA

현재 가장 중요한 남은 범위다.

확인할 항목:

- 1440px desktop
- 1280px notebook
- 768px tablet
- 390px mobile
- 360px mobile
- 브라우저 확대 125%
- 긴 회사명/담당자명/제품명/딜이름
- 긴 이메일/전화번호/URL
- 모달/드롭다운/토스트 위치
- Tab/Enter/Escape 기본 접근성
- 에러 메시지와 입력 필드 연결
- Notion식 작업도구 UX 기준과의 차이

### 3.2 모바일 브라우저 QA

현재 제품은 모바일 브라우저 Web을 포함한다.

우선 확인할 흐름:

- 모바일 로그인
- 홈
- 회사/담당자/제품 목록
- 딜 단계 탭과 딜 목록
- 일정 생성 form
- 회의록 긴 입력
- Import 표 가로 스크롤
- 휴지통 복구
- 작은 화면 모달
- 모바일 키보드가 올라온 상태의 저장 버튼 접근

### 3.3 브라우저 QA

우선순위는 Chrome, 그다음 Edge다.

확인할 항목:

- Chrome 최신 버전 핵심 시나리오
- Edge 최신 버전 핵심 시나리오
- 새로고침 후 상태 유지
- 뒤로가기/앞으로가기
- 여러 탭에서 같은 데이터 수정
- 느린 네트워크에서 로딩 상태

### 3.4 다중 계정 보안 QA

일반 smoke로는 확인하지 않은 보안 범위다.

별도 계정 또는 DB 상태 조작이 필요하다.

- 다른 사용자 UUID 추측 접근 불가
- XLSX export에 다른 사용자 데이터 미포함
- 다중 계정 검색 결과 격리
- 다중 계정 휴지통 격리
- Admin/API 권한 침투성 확인

### 3.5 DB/운영 환경 정합성

현재 기능 수동 QA는 통과했지만, 운영 전 별도 정리가 필요하다.

- Prisma generate가 실행 중 BE 프로세스의 query engine DLL lock 때문에 실패했던 기록 정리
- migration 기록 정합성 확인
- seed 실행 여부와 실제 Supabase OAuth/CRM QA 데이터 분리
- 배포 DB와 로컬 DB의 migration 상태 차이 정리

## 4. 알려진 한계

현재 실패로 처리하지 않고 `N/A` 또는 `Known limitation`으로 기록하는 항목은 다음이다.

- 확정 전 ImportJob은 서버 메모리에 저장되어 재시작 시 사라질 수 있음
- `/app/notifications`는 `/app`으로 redirect됨
- `/app/export`는 `/app`으로 redirect됨
- `/app/schedules/week`는 `/app/schedules`로 redirect됨
- Admin 운영 화면은 현재 QA 범위에서 제외
- 알림, 결제, 구독은 현재 제품 범위에서 제외
- iOS/Android 네이티브 앱은 현재 제품 범위가 아님
- Kakao OAuth는 Kakao Developers 앱 설정과 `account_email` 동의항목 설정 전까지 provider QA 보류
- 가입 국가/마지막 로그인 국가는 proxy geo header가 없으면 `기록 없음`일 수 있음
- 현재 전화번호 입력/검증은 한국 휴대폰 형식 중심이며, 다국가 전화번호 모델은 후속 검토

## 5. 실행 우선순위

| 순서 | 작업 | 목적 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | UX/UI 공통 QA | 기능은 동작하지만 실제 사용 품질 확인 | 주요 화면의 레이아웃/문구/상태/접근성 이슈 정리 |
| 2 | 모바일 브라우저 QA | 현재 Web 제품의 모바일 사용성 확인 | 390px/360px에서 핵심 흐름 사용 가능 |
| 3 | Chrome/Edge 브라우저 QA | 주요 브라우저 호환 확인 | Chrome/Edge 핵심 시나리오 통과 |
| 4 | 다중 계정 보안 QA | 사용자 데이터 격리 확인 | 다른 사용자 데이터 접근/검색/export 미노출 확인 |
| 5 | DB/운영 환경 정합성 정리 | 배포와 운영 리스크 제거 | Prisma generate/migration/seed 상태 정리 |
| 6 | S0/S1/S2 버그 수정 | 출시 판단을 막는 문제 제거 | Blocker/Critical/Major 버그가 수정 또는 명확히 보류 판단됨 |
| 7 | 외부 진입면/정책 문구 점검 | 신뢰도와 제품 진입 경로 정리 | 랜딩/푸터/약관/개인정보 문구 최소 점검 |
| 8 | DataImport Job 영속화 | 서버 재시작/배포 중 업로드 작업 유실 방지 | 확정 전 job DB 영속화 설계/구현 |
| 9 | 검색/필터 고도화 | 데이터 증가 시 탐색 효율 개선 | 고급 필터/정렬/검색 기준 확정 |
| 10 | 주간 일정/영업 리포트 | 일정, 딜, 회의록 데이터를 영업 판단으로 연결 | 주간 보고서 화면/export 요구사항 확정 |

## 6. QA 이후 기능 우선순위

아래 항목은 출시 전 품질 라운드와 S0/S1/S2 정리가 끝난 뒤 검토한다.

| 순서 | 작업 | 이유 |
| --- | --- | --- |
| 1 | DataImport Job 영속화 | 서버 재시작/배포 시 업로드, 매핑, 검증 중인 작업 유실 방지 |
| 2 | 다국가 전화번호 모델 | 한국/일본/대만/영미권 번호를 안정적으로 저장/검증하기 위함 |
| 3 | 검색/필터 고도화 | 데이터가 쌓일수록 탐색 효율이 중요해짐 |
| 4 | 주간 일정/영업 리포트 | 일정, 딜, 회의록 데이터를 영업 판단으로 연결 |
| 5 | 휴지통/삭제 정책 고도화 | 복구 기한, 만료, 장기 보관 정책 명확화 |
| 6 | 딜 가능성/확률 | 파이프라인 우선순위 판단 강화 |
| 7 | 범용 활동 타임라인 | 딜 중심 활동을 한 화면에서 추적 |
| 8 | 회의록 AI/STT 이력 고도화 | AI/STT 품질 분석, 실패 추적, 개인정보 정책 정리 |
| 9 | 반복 일정 / 외부 캘린더 가져오기 | 일정 도메인 확장 |
| 10 | 대용량/비동기 Export | 동기 XLSX 다운로드 한계 대응 |

## 7. 지금 바로 할 일

바로 다음 행동은 새 기능 개발이 아니다.

1. `QA_CHECKLIST.md` 기준으로 UX/UI 공통 QA를 진행한다.
2. 모바일 브라우저 390px/360px에서 핵심 흐름을 확인한다.
3. Chrome/Edge 브라우저 QA를 기록한다.
4. 다중 계정 보안 QA를 별도 계정으로 확인한다.
5. DB/운영 환경 정합성을 정리한다.
6. 발견 버그를 S0/S1/S2/S3/S4로 분류한다.
7. S0/S1/S2만 먼저 수정한다.

이 순서가 끝나기 전에는 새 영업 기능을 시작하지 않는다.
