# SOFTWARE_AGENT

## 1. 목적

`SOFTWARE_AGENT`는 소프트웨어 구현 방향과 품질 기준을 책임지는 문서 영역이다.

이 폴더는 Backend, User Web, Admin Web의 아키텍처, 코드 컨벤션, 테스트, 배포, 보안 구현 원칙을 관리한다.

## 2. 관리 범위

- Backend 아키텍처
- User Web 아키텍처
- Admin Web 아키텍처
- 테스트 전략
- 배포 환경
- 코드 컨벤션
- 주석과 로깅 규칙
- Admin 권한과 민감정보 보호 구현
- 외부 Provider port/adapter 구조

## 3. 폴더 구조

```text
SOFTWARE_AGENT/
  README.md
  ENGINEERING_REVIEW_CHECKLIST.md
  ARCHITECTURE/
  CONVENTION/
  DECISIONS/
```

## 4. 우선 확인 문서

1. `ARCHITECTURE/OVERVIEW.md`
2. `ARCHITECTURE/BACKEND.md`
3. `ARCHITECTURE/FRONTEND_USER_WEB.md`
4. `ARCHITECTURE/ADMIN_WEB.md`
5. `ARCHITECTURE/TESTING.md`
6. `CONVENTION/BACKEND.md`
7. `CONVENTION/FRONTEND_USER_WEB.md`
8. `CONVENTION/ADMIN_WEB.md`
9. `CONVENTION/COMMENT_AND_LOGGING.md`
10. `ENGINEERING_REVIEW_CHECKLIST.md`

## 5. 협업 원칙

- PM 범위와 UX 흐름을 먼저 확인한 뒤 구현 구조를 확정한다.
- User API와 Admin API는 반드시 분리한다.
- 사용자 소유 데이터는 항상 `userId`로 필터링한다.
- Domain layer는 NestJS, Prisma, OpenAI, HTTP SDK를 몰라야 한다.
- 외부 Provider는 Backend port/interface 뒤에 둔다.
- 위험도가 큰 흐름은 테스트를 먼저 계획한다.


