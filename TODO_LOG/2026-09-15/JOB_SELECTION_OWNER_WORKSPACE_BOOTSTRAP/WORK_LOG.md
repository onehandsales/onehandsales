# Job Selection Owner Workspace Bootstrap Work Log

작업명: 직업 선택 온보딩 완료 시 OWNER Workspace bootstrap
작업 일자: 2026-09-15
상태: 완료

## 1. 관련 요청

- `POST /api/users/me/onboarding/job-selection`만 유지보수한다.
- 사용자가 다른 Workspace에 `MEMBER` 또는 `ADMIN`으로 초대되어 있어도, 본인이 `OWNER`인 Workspace가 없으면 개인 Workspace를 생성한다.
- 팀은 자동 생성하지 않는다.

## 2. 적용 범위

- Backend application/use case transaction orchestration
- Backend user repository port and Prisma repository implementation
- User Web response type and E2E mock contract alignment

## 3. API 계약

- Method/path: `POST /api/users/me/onboarding/job-selection`
- Request body: 없음
- Success status: `200 OK`
- Response:
  - `jobSelectOnboardingCompletedAt`
  - `workspace`
  - `workspaceMember`
- Transaction:
  - `User.jobSelectOnboardingCompletedAt`
  - `Workspace`
  - `WorkspaceMember`
- Error:
  - 사용자 없음 또는 비활성 사용자는 기존 `InactiveUserError` 흐름을 유지한다.

## 4. 구현 결과

- `UserRepository.runInTransaction()`을 추가하고 `AuthRepository`와 같은 repository transaction 패턴으로 구현했다.
- 온보딩 완료 처리에서 `WorkspaceMember.role = OWNER`인 멤버십만 조회한다.
- OWNER 멤버십이 없으면 `Workspace.kind = PERSONAL` Workspace와 `WorkspaceMember.role = OWNER` 멤버십을 생성한다.
- 이미 온보딩 완료 시각이 있어도 OWNER Workspace가 없으면 Workspace bootstrap을 수행한다.
- 기본 Team/TeamMember는 생성하지 않는다.

## 5. 검증 결과

- `pnpm.cmd --dir BE typecheck`: 통과
- `pnpm.cmd --dir BE test -- complete-job-selection-onboarding.use-case.spec.ts update-my-profile.use-case.spec.ts`: 통과
- `pnpm.cmd --dir FE\user-web typecheck`: 통과
- `pnpm.cmd --dir BE lint`: 통과
- `pnpm.cmd --dir BE prisma:validate`: 통과
- `pnpm.cmd --dir FE\user-web lint`: 통과
- `git diff --check`: 통과

## 6. 남은 사항

- `/app` 진입 후 현재 Workspace를 선택/조회하는 API는 별도 작업으로 남긴다.
- Team 자동 생성은 이번 범위에서 제외했다.

## 7. 추가 정리

- Application 계층의 응답 타입 이름은 `WorkspaceKind`, `WorkspaceMemberRole`로 정리했다.
- Prisma enum은 repository 내부에서 `PrismaWorkspaceKind`, `PrismaWorkspaceMemberRole` alias로 구분한다.
- 이 API에서 새로 생성하는 Workspace는 항상 `PERSONAL`이다.
