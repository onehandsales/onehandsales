const TRASH_RETENTION_DAYS = 7;
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

// 기능 : 휴지통 보관 정책에 맞는 삭제 시각과 만료 시각을 생성합니다.
export function createTrashRetentionTimestamps(now = new Date()) {
  return {
    deletedAt: now,
    trashExpiresAt: new Date(
      now.getTime() + TRASH_RETENTION_DAYS * MILLIS_PER_DAY
    ),
  };
}
