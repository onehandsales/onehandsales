import { describe, expect, it } from "vitest";
import {
  MOBILE_LOCAL_DRAFT_SCHEMA_VERSION,
  MOBILE_LOCAL_DRAFT_TTL_MS,
  type MeetingNoteCreateLocalDraftPayload,
} from "@/features/mobile-local-draft/types/mobile-local-draft";
import {
  createMobileLocalDraftStore,
  createMobileLocalDraftUserScopedHash,
  getMobileLocalDraftKey,
  type MobileLocalDraftPersistence,
} from "./mobile-local-draft-storage";

describe("mobile local draft storage", () => {
  it("saves to primary storage with a 24 hour TTL", async () => {
    const primary = createMemoryPersistence();
    const fallback = createMemoryPersistence();
    const now = new Date("2026-07-31T00:00:00.000Z");
    const store = createMobileLocalDraftStore({
      primary: primary.persistence,
      fallback: fallback.persistence,
      now: () => now,
    });

    await store.save<MeetingNoteCreateLocalDraftPayload>({
      draftKey: "draft-key",
      draftType: "MEETING_NOTE_CREATE",
      payload: {
        clientDraftId: "client-001",
        title: "방문 미팅",
      },
    });

    expect(primary.items.has("draft-key")).toBe(true);
    expect(fallback.items.has("draft-key")).toBe(false);

    const loaded = await store.load<MeetingNoteCreateLocalDraftPayload>(
      "draft-key"
    );

    expect(loaded.found).toBe(true);
    expect(loaded.found ? loaded.draft.expiresAt : null).toBe(
      new Date(now.getTime() + MOBILE_LOCAL_DRAFT_TTL_MS).toISOString()
    );
  });

  it("uses fallback storage when primary storage is unavailable", async () => {
    const fallback = createMemoryPersistence();
    const store = createMobileLocalDraftStore({
      primary: createFailingPersistence(),
      fallback: fallback.persistence,
      now: () => new Date("2026-07-31T00:00:00.000Z"),
    });

    await store.save<MeetingNoteCreateLocalDraftPayload>({
      draftKey: "fallback-key",
      draftType: "MEETING_NOTE_CREATE",
      payload: {
        clientDraftId: "client-002",
        details: "현장 상담 메모",
      },
    });

    expect(fallback.items.has("fallback-key")).toBe(true);

    const loaded = await store.load<MeetingNoteCreateLocalDraftPayload>(
      "fallback-key"
    );

    expect(loaded.found).toBe(true);
    expect(loaded.found ? loaded.draft.payload.details : null).toBe(
      "현장 상담 메모"
    );
  });

  it("deletes expired drafts and returns an EXPIRED load result", async () => {
    const primary = createMemoryPersistence();
    let currentTime = new Date("2026-07-31T00:00:00.000Z");
    const store = createMobileLocalDraftStore({
      primary: primary.persistence,
      now: () => currentTime,
    });

    await store.save<MeetingNoteCreateLocalDraftPayload>({
      draftKey: "expired-key",
      draftType: "MEETING_NOTE_CREATE",
      payload: { clientDraftId: "client-003", title: "만료 테스트" },
    });

    currentTime = new Date(
      currentTime.getTime() + MOBILE_LOCAL_DRAFT_TTL_MS + 1
    );

    await expect(store.load("expired-key")).resolves.toEqual({
      found: false,
      reason: "EXPIRED",
    });
    expect(primary.items.has("expired-key")).toBe(false);
  });

  it("deletes schema mismatch drafts without restoring them", async () => {
    const primary = createMemoryPersistence();
    const store = createMobileLocalDraftStore({
      primary: primary.persistence,
      now: () => new Date("2026-07-31T00:00:00.000Z"),
    });

    primary.items.set("mismatch-key", {
      schemaVersion: MOBILE_LOCAL_DRAFT_SCHEMA_VERSION + 1,
      draftType: "MEETING_NOTE_CREATE",
      draftKey: "mismatch-key",
      savedAt: "2026-07-31T00:00:00.000Z",
      expiresAt: "2026-08-01T00:00:00.000Z",
      payload: { clientDraftId: "client-004" },
    });

    await expect(store.load("mismatch-key")).resolves.toEqual({
      found: false,
      reason: "VERSION_MISMATCH",
    });
    expect(primary.items.has("mismatch-key")).toBe(false);
  });

  it("builds user scoped keys without storing the raw user id", async () => {
    const userScopedHash = await createMobileLocalDraftUserScopedHash(
      "raw-user-id-001",
      {
        crypto: null,
        salt: "local-salt",
      }
    );
    const draftKey = getMobileLocalDraftKey({
      draftId: "client-005",
      draftType: "MEETING_NOTE_CREATE",
      userScopedHash,
    });

    expect(draftKey).toContain("mobile-meeting-note-create:");
    expect(draftKey).not.toContain("raw-user-id-001");
  });

  it("uses browser crypto digest for the user scoped hash when available", async () => {
    const crypto = {
      subtle: {
        async digest(algorithm: AlgorithmIdentifier, data: BufferSource) {
          expect(algorithm).toBe("SHA-256");
          expect(new TextDecoder().decode(data)).toBe(
            "local-salt:raw-user-id-002"
          );

          const digest = new Uint8Array(32);
          digest.forEach((_value, index) => {
            digest[index] = index;
          });

          return digest.buffer;
        },
      },
    } as unknown as Crypto;

    await expect(
      createMobileLocalDraftUserScopedHash("raw-user-id-002", {
        crypto,
        salt: "local-salt",
      })
    ).resolves.toBe("000102030405060708090a0b0c0d0e0f");
  });
});

// 기능 : storage 테스트에서 IndexedDB 역할을 대신하는 in-memory persistence를 만듭니다.
function createMemoryPersistence() {
  const items = new Map<string, unknown>();
  const persistence: MobileLocalDraftPersistence = {
    async load(draftKey) {
      return items.get(draftKey) ?? null;
    },
    async save(draftKey, envelope) {
      items.set(draftKey, envelope);
    },
    async remove(draftKey) {
      items.delete(draftKey);
    },
  };

  return { items, persistence };
}

// 기능 : IndexedDB 차단 브라우저를 테스트하기 위해 항상 실패하는 persistence를 만듭니다.
function createFailingPersistence(): MobileLocalDraftPersistence {
  return {
    async load() {
      throw new Error("primary unavailable");
    },
    async save() {
      throw new Error("primary unavailable");
    },
    async remove() {
      throw new Error("primary unavailable");
    },
  };
}
