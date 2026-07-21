# User Web TODO

상태: Draft

## 0. 완료 반영

- [x] `NBA-006 ImportJob persistence/resume API`: User Web import resume UX와 client state 구현 완료

## 1. 목적

이 문서는 G07에서 분리한 Backend/API 후보가 `FE/user-web`에 미칠 수 있는 영향을 정리한다.

현재 User Web 구현 변경은 없다. 이 문서는 future API contract가 `confirmed`된 뒤 함께 확인할 client/screen 영향만 기록한다.

## 2. Release follow-up 영향 후보

| 후보 ID | FE 영향 | 확인 기준 |
|---|---|---|
| NBA-001 | 딜 목록 client type과 row/card 표시 | `products` summary가 없으면 FE에서 임의 생성하지 않는다. |
| NBA-002 | 담당자 목록 client type과 count 표시 | `dealCount`가 없으면 FE에서 별도 추정하지 않는다. |
| NBA-005 | 명함 OCR 실패 copy와 retry UI | 사용자 copy는 provider/quota/API key 정보를 노출하지 않는다. |
| NBA-008 | pagination/page size client 계약 | FE 단독으로 page size 숫자를 바꾸지 않는다. |

## 3. Product feature 영향 후보

| 후보 ID | FE 영향 | 확인 기준 |
|---|---|---|
| NBA-003 | 회사/담당자/제품 목록 summary 표시 | private memo와 일반 활동을 구분한다. |
| NBA-004 | 회의록 목록 summary 표시 | AI/STT raw text나 민감 원문을 목록에 노출하지 않는다. |
| NBA-006 | Import resume 화면과 client state | 완료: 새로고침/탭 이동 복구 UX, 만료/실패 상태, confirm/cancel 흐름 구현 |
| NBA-009 | `/app/schedules/week` redirect 해제 또는 새 화면 | timezone 기준 주간 범위와 loading/error state가 필요하다. |
| NBA-010 | Notification route/sidebar 노출 | Backend API와 권한/설정 계약 전에는 노출하지 않는다. |

## 4. Ops/security 영향 후보

| 후보 ID | FE 영향 | 확인 기준 |
|---|---|---|
| NBA-007 | Trash detail response type 조정 | private memo 원문이 없어도 복구 판단 UI가 깨지지 않아야 한다. |
| NBA-011 | User Web 영향 없음 | transcript/provider log는 User Web 일반 화면에 노출하지 않는다. |
| NBA-012 | Trash restore error/copy 조정 | 7일 이후 restore 실패 안내와 위험 액션 copy가 필요하다. |
| NBA-013 | User Web 영향 없음 | User Web은 `/admin/api/*`를 호출하지 않는다. |
| NBA-014 | User Web 영향 없음 | DB/Prisma 운영 gate는 FE 코드 변경 없이 닫는다. |

## 5. 공통 FE 규칙

- 서버 상태는 TanStack Query로 관리한다.
- API 호출은 `src/lib/api-client.ts`를 통한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- API response에 없는 latest activity, next action, count, product summary를 FE에서 사실처럼 꾸미지 않는다.
- form validation은 React Hook Form + Zod를 따른다.
- 모바일 record list는 desktop table을 억지로 노출하지 않고 card/list로 확인한다.

## 6. future 검증 명령

API 계약이 confirmed되고 FE 변경이 생긴 경우 아래를 기본 gate로 실행한다.

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```
