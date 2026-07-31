import {
  MOBILE_LOCAL_DRAFT_SCHEMA_VERSION,
  MOBILE_LOCAL_DRAFT_TTL_MS,
  type LocalDraftLoadResult,
  type LocalDraftSaveResult,
  type MobileLocalDraftEnvelope,
  type MobileLocalDraftType,
  type SaveMobileLocalDraftRequest,
} from "@/features/mobile-local-draft/types/mobile-local-draft";

export type MobileLocalDraftPersistence = {
  readonly load: (draftKey: string) => Promise<unknown | null>;
  readonly save: (
    draftKey: string,
    envelope: MobileLocalDraftEnvelope<unknown>
  ) => Promise<void>;
  readonly remove: (draftKey: string) => Promise<void>;
};

export type MobileLocalDraftStore = {
  readonly save: <TPayload>(
    request: SaveMobileLocalDraftRequest<TPayload>
  ) => Promise<LocalDraftSaveResult>;
  readonly load: <TPayload>(
    draftKey: string
  ) => Promise<LocalDraftLoadResult<TPayload>>;
  readonly discard: (draftKey: string) => Promise<void>;
};

type CreateMobileLocalDraftStoreOptions = {
  readonly primary?: MobileLocalDraftPersistence | null;
  readonly fallback?: MobileLocalDraftPersistence | null;
  readonly now?: () => Date;
};

type UserScopeHashOptions = {
  readonly salt?: string;
  readonly saltStorage?: Pick<Storage, "getItem" | "setItem"> | null;
  readonly crypto?: Crypto | null;
};

const draftDatabaseName = "onehand-mobile-local-drafts";
const draftDatabaseVersion = 1;
const draftObjectStoreName = "drafts";
const localStorageEnvelopePrefix = "onehand.mobileLocalDraft.envelope:";
const localDraftUserSaltStorageKey = "onehand.mobileLocalDraft.userScopeSalt";
const meetingNoteClientDraftIdStorageKey =
  "onehand.mobileLocalDraft.meetingNoteCreate.clientDraftId";

// 기능 : draft type과 사용자 범위 hash, form 기준 ID를 조합해 저장 key를 만듭니다.
export function getMobileLocalDraftKey(input: {
  readonly draftType: MobileLocalDraftType;
  readonly userScopedHash: string;
  readonly draftId: string;
}) {
  const prefix =
    input.draftType === "BUSINESS_CARD_CONFIRM"
      ? "mobile-business-card-confirm"
      : "mobile-meeting-note-create";

  return `${prefix}:${input.userScopedHash}:${input.draftId}`;
}

// 기능 : userId를 그대로 저장하지 않도록 브라우저 로컬 salt 기반 hash로 바꿉니다.
export async function createMobileLocalDraftUserScopedHash(
  userId: string,
  options: UserScopeHashOptions = {}
) {
  const crypto = options.crypto ?? getBrowserCrypto();
  const salt =
    options.salt ??
    getOrCreateMobileLocalDraftSalt(
      options.saltStorage ?? getBrowserLocalStorage(),
      crypto
    );

  return digestMobileLocalDraftUserScope(`${salt}:${userId}`, crypto);
}

// 기능 : 회의록 작성 form의 active client draft ID를 브라우저에 보관합니다.
export function getOrCreateMeetingNoteCreateClientDraftId(
  storage = getBrowserLocalStorage(),
  crypto = getBrowserCrypto()
) {
  const stored = safeStorageGet(storage, meetingNoteClientDraftIdStorageKey);

  if (stored) {
    return stored;
  }

  const nextId = createMobileLocalDraftClientId(crypto);
  safeStorageSet(storage, meetingNoteClientDraftIdStorageKey, nextId);

  return nextId;
}

// 기능 : 저장 또는 버리기 이후 다음 회의록 작성 form이 새 draft ID를 쓰게 합니다.
export function rotateMeetingNoteCreateClientDraftId(
  storage = getBrowserLocalStorage(),
  crypto = getBrowserCrypto()
) {
  const nextId = createMobileLocalDraftClientId(crypto);
  safeStorageSet(storage, meetingNoteClientDraftIdStorageKey, nextId);

  return nextId;
}

// 기능 : IndexedDB를 primary로 쓰고 localStorage를 fallback으로 쓰는 브라우저 store를 만듭니다.
export function createBrowserMobileLocalDraftStore() {
  return createMobileLocalDraftStore({
    primary: createBrowserIndexedDbMobileLocalDraftPersistence(),
    fallback: createBrowserLocalStorageMobileLocalDraftPersistence(),
  });
}

// 기능 : local draft 저장소 조합을 만들고 만료/schema mismatch 정리를 공통 처리합니다.
export function createMobileLocalDraftStore(
  options: CreateMobileLocalDraftStoreOptions = {}
): MobileLocalDraftStore {
  const now = options.now ?? (() => new Date());
  const primary = options.primary ?? null;
  const fallback = options.fallback ?? null;

  return {
    async save<TPayload>(request: SaveMobileLocalDraftRequest<TPayload>) {
      const savedAt = now();
      const expiresAt = new Date(savedAt.getTime() + MOBILE_LOCAL_DRAFT_TTL_MS);
      const envelope: MobileLocalDraftEnvelope<TPayload> = {
        schemaVersion: MOBILE_LOCAL_DRAFT_SCHEMA_VERSION,
        draftType: request.draftType,
        draftKey: request.draftKey,
        savedAt: savedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        payload: request.payload,
      };

      await saveEnvelope(primary, fallback, request.draftKey, envelope);

      return {
        saved: true,
        expiresAt: envelope.expiresAt,
      };
    },

    async load<TPayload>(draftKey: string) {
      const primaryResult = await loadEnvelope(primary, draftKey);

      if (primaryResult) {
        return normalizeLoadedDraft<TPayload>(
          primaryResult,
          draftKey,
          now,
          primary,
          fallback
        );
      }

      const fallbackResult = await loadEnvelope(fallback, draftKey);

      if (fallbackResult) {
        return normalizeLoadedDraft<TPayload>(
          fallbackResult,
          draftKey,
          now,
          primary,
          fallback
        );
      }

      return { found: false, reason: "NOT_FOUND" };
    },

    async discard(draftKey: string) {
      await removeFromBoth(primary, fallback, draftKey);
    },
  };
}

// 기능 : 브라우저 IndexedDB persistence를 생성하고 사용할 수 없으면 null을 돌려줍니다.
export function createBrowserIndexedDbMobileLocalDraftPersistence() {
  const indexedDb =
    typeof window === "undefined" ? undefined : window.indexedDB;

  if (!indexedDb) {
    return null;
  }

  return createIndexedDbMobileLocalDraftPersistence(indexedDb);
}

// 기능 : IndexedDB object store에 draft envelope를 저장합니다.
export function createIndexedDbMobileLocalDraftPersistence(
  indexedDb: IDBFactory
): MobileLocalDraftPersistence {
  return {
    async load(draftKey: string) {
      const db = await openMobileLocalDraftDatabase(indexedDb);

      try {
        return await requestToPromise(
          db
            .transaction(draftObjectStoreName, "readonly")
            .objectStore(draftObjectStoreName)
            .get(draftKey)
        );
      } finally {
        db.close();
      }
    },

    async save(
      _draftKey: string,
      envelope: MobileLocalDraftEnvelope<unknown>
    ) {
      const db = await openMobileLocalDraftDatabase(indexedDb);

      try {
        const transaction = db.transaction(draftObjectStoreName, "readwrite");
        transaction.objectStore(draftObjectStoreName).put(envelope);
        await transactionToPromise(transaction);
      } finally {
        db.close();
      }
    },

    async remove(draftKey: string) {
      const db = await openMobileLocalDraftDatabase(indexedDb);

      try {
        const transaction = db.transaction(draftObjectStoreName, "readwrite");
        transaction.objectStore(draftObjectStoreName).delete(draftKey);
        await transactionToPromise(transaction);
      } finally {
        db.close();
      }
    },
  };
}

// 기능 : 브라우저 localStorage fallback persistence를 생성합니다.
export function createBrowserLocalStorageMobileLocalDraftPersistence() {
  const storage = getBrowserLocalStorage();

  if (!storage) {
    return null;
  }

  return createLocalStorageMobileLocalDraftPersistence(storage);
}

// 기능 : localStorage에 JSON envelope를 저장하는 fallback persistence를 만듭니다.
export function createLocalStorageMobileLocalDraftPersistence(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">
): MobileLocalDraftPersistence {
  return {
    async load(draftKey: string) {
      const raw = safeStorageGet(storage, toLocalStorageEnvelopeKey(draftKey));

      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw) as unknown;
      } catch {
        safeStorageRemove(storage, toLocalStorageEnvelopeKey(draftKey));
        return null;
      }
    },

    async save(
      draftKey: string,
      envelope: MobileLocalDraftEnvelope<unknown>
    ) {
      safeStorageSet(
        storage,
        toLocalStorageEnvelopeKey(draftKey),
        JSON.stringify(envelope)
      );
    },

    async remove(draftKey: string) {
      safeStorageRemove(storage, toLocalStorageEnvelopeKey(draftKey));
    },
  };
}

async function saveEnvelope<TPayload>(
  primary: MobileLocalDraftPersistence | null,
  fallback: MobileLocalDraftPersistence | null,
  draftKey: string,
  envelope: MobileLocalDraftEnvelope<TPayload>
) {
  if (primary) {
    try {
      await primary.save(
        draftKey,
        envelope as MobileLocalDraftEnvelope<unknown>
      );
      await fallback?.remove(draftKey).catch(() => undefined);
      return;
    } catch {
      // 기능 : IndexedDB 저장이 막힌 브라우저에서는 localStorage fallback으로 이어갑니다.
    }
  }

  if (fallback) {
    await fallback.save(
      draftKey,
      envelope as MobileLocalDraftEnvelope<unknown>
    );
  }
}

async function loadEnvelope(
  persistence: MobileLocalDraftPersistence | null,
  draftKey: string
) {
  if (!persistence) {
    return null;
  }

  try {
    return await persistence.load(draftKey);
  } catch {
    return null;
  }
}

async function normalizeLoadedDraft<TPayload>(
  rawEnvelope: unknown,
  draftKey: string,
  now: () => Date,
  primary: MobileLocalDraftPersistence | null,
  fallback: MobileLocalDraftPersistence | null
): Promise<LocalDraftLoadResult<TPayload>> {
  if (!isDraftEnvelopeRecord(rawEnvelope, draftKey)) {
    await removeFromBoth(primary, fallback, draftKey);
    return { found: false, reason: "VERSION_MISMATCH" };
  }

  if (new Date(rawEnvelope.expiresAt).getTime() <= now().getTime()) {
    await removeFromBoth(primary, fallback, draftKey);
    return { found: false, reason: "EXPIRED" };
  }

  return {
    found: true,
    draft: rawEnvelope as MobileLocalDraftEnvelope<TPayload>,
  };
}

function isDraftEnvelopeRecord(
  value: unknown,
  draftKey: string
): value is MobileLocalDraftEnvelope<unknown> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.schemaVersion === MOBILE_LOCAL_DRAFT_SCHEMA_VERSION &&
    value.draftKey === draftKey &&
    typeof value.draftType === "string" &&
    typeof value.savedAt === "string" &&
    typeof value.expiresAt === "string" &&
    "payload" in value &&
    Number.isFinite(new Date(value.savedAt).getTime()) &&
    Number.isFinite(new Date(value.expiresAt).getTime())
  );
}

async function removeFromBoth(
  primary: MobileLocalDraftPersistence | null,
  fallback: MobileLocalDraftPersistence | null,
  draftKey: string
) {
  await Promise.all([
    primary?.remove(draftKey).catch(() => undefined),
    fallback?.remove(draftKey).catch(() => undefined),
  ]);
}

function openMobileLocalDraftDatabase(indexedDb: IDBFactory) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDb.open(draftDatabaseName, draftDatabaseVersion);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(draftObjectStoreName)) {
        db.createObjectStore(draftObjectStoreName, { keyPath: "draftKey" });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionToPromise(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

function getOrCreateMobileLocalDraftSalt(
  storage: Pick<Storage, "getItem" | "setItem"> | null,
  crypto: Crypto | null
) {
  const stored = safeStorageGet(storage, localDraftUserSaltStorageKey);

  if (stored) {
    return stored;
  }

  const nextSalt = createMobileLocalDraftClientId(crypto);
  safeStorageSet(storage, localDraftUserSaltStorageKey, nextSalt);

  return nextSalt;
}

async function digestMobileLocalDraftUserScope(
  value: string,
  crypto: Crypto | null | undefined
) {
  const subtle = crypto?.subtle;

  if (!subtle) {
    return createFallbackHash(value);
  }

  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(value));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

function createFallbackHash(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return `fallback-${(hash >>> 0).toString(36)}`;
}

function createMobileLocalDraftClientId(crypto: Crypto | null) {
  const bytes = new Uint8Array(12);

  if (crypto?.getRandomValues) {
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function toLocalStorageEnvelopeKey(draftKey: string) {
  return `${localStorageEnvelopePrefix}${draftKey}`;
}

function getBrowserLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getBrowserCrypto() {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }

  return globalThis.crypto ?? null;
}

function safeStorageGet(
  storage: Pick<Storage, "getItem"> | null,
  key: string
) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorageSet(
  storage: Pick<Storage, "setItem"> | null,
  key: string,
  value: string
) {
  try {
    storage?.setItem(key, value);
  } catch {
    // 기능 : storage quota 또는 privacy mode 오류는 form 흐름을 막지 않습니다.
  }
}

function safeStorageRemove(
  storage: Pick<Storage, "removeItem"> | null,
  key: string
) {
  try {
    storage?.removeItem(key);
  } catch {
    // 기능 : fallback 정리 실패는 다음 저장/만료 검증에서 다시 정리합니다.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
