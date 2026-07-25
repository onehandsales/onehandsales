# Backend API TODO

상태: Confirmed
확정일: 2026-07-25

## 1. 목적

06 Backend 작업은 `DealActivity` 정본 API와 목록 summary API를 구현한다.

정본 계약:

- `COMMON/BUSINESS-LOGIC.md`
- `COMMON/API-SPEC/DEAL_ACTIVITY_API.md`
- `COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md`

## 2. G03 Deal Activity API

| Method | Path | 목적 | 상태 |
|---|---|---|---|
| `GET` | `/api/deals/:dealId/activities` | timeline 조회 | confirmed |
| `POST` | `/api/deals/:dealId/activities` | 수동 activity 생성 | confirmed |
| `PATCH` | `/api/deals/:dealId/activities/:activityId` | 수동 activity 수정 | confirmed |

### Backend 작업

1. DTO를 만든다.
2. controller route를 추가한다.
3. application service/use case를 만든다.
4. repository port/adapter를 구현한다.
5. 자동 activity writer를 만든다.
6. `COMMON/BUSINESS-LOGIC.md` 기준으로 safe summary와 linked record를 만든다.
7. 딜 생성/단계 변경/다음 행동/일정/회의록/follow-up mutation에 연결한다.
8. ownership/redaction/transaction test를 작성한다.

## 3. 자동 activity trigger

| Trigger | Activity type | 연결 위치 후보 |
|---|---|---|
| 딜 생성 | `DEAL_CREATED` | `DealApplicationService.createDeal` |
| 딜 단계 변경 | `STAGE_CHANGED` | `DealApplicationService.updateDeal` |
| 다음 행동 생성 | `NEXT_ACTION_CREATED` | `createFollowingActionLog` |
| 다음 행동 완료 변경 | `NEXT_ACTION_COMPLETION_CHANGED` | `updateFollowingActionLog` |
| 일정 연결 | `SCHEDULE_LINKED` | Schedule deal link mutation |
| 일정 연결 해제 | `SCHEDULE_UNLINKED` | Schedule deal unlink/replace mutation |
| 회의록 연결 | `MEETING_NOTE_LINKED` | MeetingNote deal link mutation |
| 회의록 연결 해제 | `MEETING_NOTE_UNLINKED` | MeetingNote deal unlink/replace mutation. delete/recreate 전 diff 필요 |
| follow-up 발송 성공 | `FOLLOW_UP_SENT` | FollowUpMessage send success 중 `DEAL` target |
| follow-up 발송 실패 | `FOLLOW_UP_FAILED` | FollowUpMessage send failed 중 `DEAL` target |

## 4. G05 Record Summary API

| API | 변경 | 상태 |
|---|---|---|
| `GET /api/deals` | `products`, `latestActivity` field 추가 | confirmed |
| `GET /api/contacts` | `dealCount` field 추가 | confirmed |

### Backend 작업

1. Deal list page 대상 ID 기준 products aggregation을 추가한다.
2. Deal list page 대상 ID 기준 latest activity aggregation을 추가한다.
3. Contact list page 대상 ID 기준 dealCount aggregation을 추가한다.
4. page size 15 계약을 확인한다.
5. ownership/soft delete test를 작성한다.

## 5. 금지

- 수동 activity 삭제 API를 만들지 않는다.
- 자동 activity 수정/삭제 API를 만들지 않는다.
- Admin API를 만들지 않는다.
- FE가 쓸 summary를 Backend 계약 없이 임의 response로 추가하지 않는다.
- private memo/provider raw/follow-up body 전체를 일반 User API response에 추가하지 않는다.
