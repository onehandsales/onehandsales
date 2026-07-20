# Release QA Follow-up User Flow

## 1. 목적

이 문서는 출시 전 후속 QA에서 사용자가 실제로 통과해야 하는 핵심 흐름을 고정한다.

## 2. QA 시작점

사용자는 모바일 브라우저 또는 데스크톱 브라우저에서 공개/로그인 화면을 거쳐 `/app` 보호 앱으로 들어온다.

확인 순서:

1. 비로그인 상태에서 `/app/*` 접근 시 locale login으로 이동한다.
2. 로그인 UI에서 Google provider 진입점이 보인다.
3. mock 또는 실제 QA 세션으로 `/app`에 진입한다.
4. 홈에서 오늘 일정, 진행 딜, 다음 행동, 최근 회의록이 읽힌다.
5. 하단 또는 사이드 navigation으로 주요 도메인 화면을 이동한다.

## 3. 모바일 브라우저 핵심 흐름

390px와 360px에서 아래 흐름을 각각 확인한다.

1. `/app` 홈 진입
2. 하단 navigation 또는 모바일 더보기로 회사, 담당자, 제품, 딜, 일정, 회의록, 명함 스캔, 데이터 업로드, 휴지통 이동
3. 회사/담당자/제품 목록에서 record card가 읽히는지 확인
4. 딜 단계 탭이 작은 화면에서 가로 overflow를 제어하는지 확인
5. 딜 생성 또는 상세 진입에서 회사/담당자/제품 linked record가 깨지지 않는지 확인
6. 일정 생성 form에서 시작/종료 일시, 장소, 연결 딜, 저장 버튼이 키보드 상황에서도 접근 가능한지 확인
7. 회의록 긴 입력 영역이 화면 밖으로 사라지지 않는지 확인
8. Import preview table은 page 전체가 깨지지 않고 내부 가로 스크롤로 확인 가능한지 확인
9. Trash 복구 버튼이 작은 화면에서 위험 액션처럼 구분되는지 확인

## 4. Chrome/Edge 핵심 흐름

Chrome과 Edge에서 아래 흐름을 각각 확인한다.

1. 로그인 화면 진입과 provider 버튼 확인
2. 보호 route redirect 확인
3. `/app` 홈 진입
4. 회사 생성, 담당자 생성, 제품 생성, 딜 생성, 일정 생성, 회의록 생성 smoke
5. 새로고침 후 세션과 현재 화면 상태 확인
6. 뒤로가기/앞으로가기 후 route와 화면 상태 확인
7. 같은 데이터가 열린 두 탭에서 한쪽 수정 후 다른 탭 새로고침 시 화면이 무너지지 않는지 확인
8. slow 3G 또는 route delay mock에서 loading state가 보이는지 확인

## 5. 다중 계정 보안 흐름

두 사용자 A/B를 준비하고 아래를 확인한다.

1. 사용자 A 데이터와 사용자 B 데이터를 같은 도메인에 각각 만든다.
2. 사용자 A token으로 사용자 B의 Company/Contact/Product/Deal/Schedule/MeetingNote 직접 조회 URL 또는 API를 호출한다.
3. Search 결과에 사용자 B 데이터가 섞이지 않는지 확인한다.
4. Trash 목록과 상세에 사용자 B 삭제 데이터가 섞이지 않는지 확인한다.
5. Company/Contact/Product/Deal XLSX export 결과에 사용자 B 데이터가 포함되지 않는지 확인한다.
6. 일반 사용자 token으로 `/admin/api/*` 접근이 차단되는지 확인한다.

## 6. DB/Prisma 운영 흐름

1. Node, pnpm, Docker, `.env` 존재 여부를 확인한다.
2. 실제 비밀값을 문서에 기록하지 않는다.
3. `BE/.env`의 DB 대상이 로컬 dev DB인지 공유 DB인지 분류한다.
4. 로컬 DB이면 Prisma validate/generate/migration status를 확인한다.
5. 공유 DB이면 migration/seed 자동 실행을 중단하고 `Blocked`로 기록한다.
6. migration 이력, Prisma client generate, seed 기준을 `QA-RESULTS.md`에 남긴다.

## 7. 완료 흐름

모든 QA 결과는 `COMMON/QA-RESULTS.md`에 기록한다. 발견된 이슈는 `COMMON/ISSUE-LOG.md`에 심각도와 상태를 남긴다. S0/S1/S2는 G06에서 수정하거나 출시 판단 가능한 보류 이유를 적는다.

## 8. 관련 문서

- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`

