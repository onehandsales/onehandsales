# FE TODO

## 1. 목적

이 문서는 `FE/user-web`과 `FE/admin-web` 구현 작업의 공통 기준을 정리한다.

두 앱은 같은 제품과 Backend를 사용하지만 목적이 다르다. User Web은 개인 영업자의 빠른 업무 흐름을 우선하고, Admin Web은 운영자 조회, 감사, 민감정보 보호를 우선한다.

## 2. 공통 원칙

- `FE/user-web`과 `FE/admin-web`은 코드를 공유하지 않는다.
- 루트 workspace를 만들지 않는다.
- 각 앱은 자기 `package.json`, 설정, 테스트를 가진다.
- TypeScript strict 설정을 사용한다.
- 서버 상태는 TanStack Query로 관리한다.
- 폼은 React Hook Form과 Zod를 사용한다.
- UI는 Tailwind CSS와 shadcn/ui를 사용한다.
- 아이콘은 가능한 lucide-react를 사용한다.
- API client는 각 앱 내부 `src/shared/api`에 둔다.

## 3. 관련 문서

- `USER-WEB-TODO.md`: 사용자 앱 구현 작업
- `ADMIN-WEB-TODO.md`: Admin 앱 구현 작업

## 4. 구현 순서

1. User Web과 Admin Web 스캐폴딩
2. 공통 앱 내부 구조 설정
3. 라우팅, 인증 guard, API client
4. User Web 핵심 도메인 화면
5. Admin Web 기본 운영 화면
6. Import/Export/OCR/회의록/알림 확장
7. Playwright smoke E2E

## 5. 완료 기준

- User Web에서 회사/거래처(담당자)/제품/딜/일정/회의록 핵심 흐름이 동작한다.
- Admin Web에서 사용자와 전체 도메인 데이터를 조회할 수 있다.
- Admin Web에서 민감정보 원문 조회는 사유 입력과 감사 로그 흐름을 탄다.
- 각 앱은 독립적으로 설치, 실행, 테스트할 수 있다.


