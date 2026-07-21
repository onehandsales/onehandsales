# DB Schema TODO

상태: Draft

## 모델 후보

- `DealActivity`
- `DealActivityType`
- `DealActivityLinkedEntity`
- summary cache table 후보
- search index 후보
- deal probability/score field 후보

## 결정 baseline 반영 후 세부 확인

- 기존 `DealFollowingActionLog`, `DealMemoLog`와 통합할지 참조할지
- 자동 activity backfill 여부
- soft delete 여부
- index: `userId`, `dealId`, `activityDate`
- products summary와 dealCount를 runtime aggregation으로 할지 denormalized field로 둘지
- latest activity summary cache가 필요한지
- page size는 DB 영향이 없지만 query/index 영향을 확인해야 한다.
- 딜 가능성/확률이 새 field인지 기존 enum 확장인지

## migration 주의

- activity 내용은 민감정보일 수 있다.
- 기존 상세 화면과 response compatibility를 깨지 않아야 한다.
- summary/cache를 만들 경우 private memo와 민감 회의록 원문을 포함하지 않는다.
- aggregation은 user ownership과 soft delete 조건을 반드시 포함한다.
