import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMobileLocalDraftStore,
  createMobileLocalDraftUserScopedHash,
  getMobileLocalDraftKey,
  type MobileLocalDraftPersistence,
} from "@/features/mobile-local-draft/storage/mobile-local-draft-storage";
import type {
  MeetingNoteCreateLocalDraftPayload,
  MobileLocalDraftClientEvent,
} from "@/features/mobile-local-draft/types/mobile-local-draft";
import {
  emitMobileLocalDraftClientEvent,
  useMobileLocalDraft,
} from "./use-mobile-local-draft";

type HookPayload = MeetingNoteCreateLocalDraftPayload;
type HookState = ReturnType<typeof useMobileLocalDraft<HookPayload>>;
type HookController = {
  readonly current: HookState;
  readonly setPayload: (payload: HookPayload) => void;
  readonly setShouldSave: (shouldSave: boolean) => void;
};

let root: Root | null = null;

describe("useMobileLocalDraft", () => {
  afterEach(async () => {
    await unmountHook();
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("loads an existing draft and restores it from the prompt", async () => {
    const persistence = createMemoryPersistence();
    const store = createMobileLocalDraftStore({
      primary: persistence.persistence,
      now: () => new Date("2026-07-31T00:00:00.000Z"),
    });
    const draftKey = await createMeetingNoteDraftKey("client-restore");
    const restoredPayload: HookPayload = {
      clientDraftId: "client-restore",
      details: "복구할 회의 내용",
      title: "복구 제목",
    };
    await store.save({
      draftKey,
      draftType: "MEETING_NOTE_CREATE",
      payload: restoredPayload,
    });
    const onRestore = vi.fn();
    const controller = await renderHook({
      initialPayload: { clientDraftId: "client-restore" },
      onRestore,
      store,
    });

    await flushAsync();

    expect(controller.current.hasPrompt).toBe(true);

    act(() => {
      controller.current.restorePromptDraft();
    });

    expect(onRestore).toHaveBeenCalledWith(restoredPayload);
    expect(controller.current.hasPrompt).toBe(false);
  });

  it("debounces saves and emits a safe local draft event", async () => {
    vi.useFakeTimers();
    const persistence = createMemoryPersistence();
    const events: MobileLocalDraftClientEvent[] = [];
    const store = createMobileLocalDraftStore({
      primary: persistence.persistence,
      now: () => new Date("2026-07-31T00:00:00.000Z"),
    });
    const draftKey = await createMeetingNoteDraftKey("client-save");
    const controller = await renderHook({
      initialPayload: { clientDraftId: "client-save" },
      onRestore: vi.fn(),
      store,
      trackEvent: (event) => events.push(event),
    });

    await flushAsync();

    act(() => {
      controller.setPayload({
        clientDraftId: "client-save",
        details: "저장할 회의 내용",
      });
      controller.setShouldSave(true);
    });
    await act(async () => {
      vi.advanceTimersByTime(650);
    });
    await flushAsync();

    const loaded = await store.load<HookPayload>(draftKey);

    expect(loaded.found).toBe(true);
    expect(loaded.found ? loaded.draft.payload.details : null).toBe(
      "저장할 회의 내용"
    );
    expect(events).toEqual([
      {
        eventName: "local_draft_saved",
        eventVersion: 1,
        payload: {
          draftType: "meeting_note_create",
        },
      },
    ]);
  });

  it("emits browser client events without form text", () => {
    const received: MobileLocalDraftClientEvent[] = [];
    const onEvent = (event: Event) => {
      received.push(
        (event as CustomEvent<MobileLocalDraftClientEvent>).detail
      );
    };

    window.addEventListener("onehand:mobile-local-draft-analytics", onEvent);
    emitMobileLocalDraftClientEvent({
      eventName: "local_draft_discarded",
      eventVersion: 1,
      payload: {
        draftType: "meeting_note_create",
        reason: "saved",
      },
    });
    window.removeEventListener("onehand:mobile-local-draft-analytics", onEvent);

    expect(received).toEqual([
      {
        eventName: "local_draft_discarded",
        eventVersion: 1,
        payload: {
          draftType: "meeting_note_create",
          reason: "saved",
        },
      },
    ]);
    expect(JSON.stringify(received)).not.toContain("저장할 회의 내용");
  });
});

// 기능 : hook 테스트용 React root를 만들고 최신 hook state를 controller로 노출합니다.
async function renderHook(input: {
  readonly initialPayload: HookPayload;
  readonly onRestore: (payload: HookPayload) => void;
  readonly store: ReturnType<typeof createMobileLocalDraftStore>;
  readonly trackEvent?: (event: MobileLocalDraftClientEvent) => void;
}): Promise<HookController> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  let current: HookState | null = null;
  let setPayload: ((payload: HookPayload) => void) | null = null;
  let setShouldSave: ((shouldSave: boolean) => void) | null = null;

  root = createRoot(container);

  await act(async () => {
    root?.render(
      <MobileLocalDraftHookProbe
        initialPayload={input.initialPayload}
        onChange={(nextState) => {
          current = nextState;
        }}
        onRestore={input.onRestore}
        setPayloadRef={(nextSetter) => {
          setPayload = nextSetter;
        }}
        setShouldSaveRef={(nextSetter) => {
          setShouldSave = nextSetter;
        }}
        store={input.store}
        trackEvent={input.trackEvent}
      />
    );
  });

  if (!current || !setPayload || !setShouldSave) {
    throw new Error("mobile local draft hook is not ready");
  }

  return {
    get current() {
      if (!current) {
        throw new Error("mobile local draft hook was unmounted");
      }

      return current;
    },
    setPayload,
    setShouldSave,
  };
}

function MobileLocalDraftHookProbe({
  initialPayload,
  onChange,
  onRestore,
  setPayloadRef,
  setShouldSaveRef,
  store,
  trackEvent,
}: {
  readonly initialPayload: HookPayload;
  readonly onChange: (state: HookState) => void;
  readonly onRestore: (payload: HookPayload) => void;
  readonly setPayloadRef: (setPayload: (payload: HookPayload) => void) => void;
  readonly setShouldSaveRef: (
    setShouldSave: (shouldSave: boolean) => void
  ) => void;
  readonly store: ReturnType<typeof createMobileLocalDraftStore>;
  readonly trackEvent?: (event: MobileLocalDraftClientEvent) => void;
}) {
  const [payload, setPayload] = useState(initialPayload);
  const [shouldSave, setShouldSave] = useState(false);
  const state = useMobileLocalDraft({
    debounceMs: 600,
    draftId: payload.clientDraftId,
    draftType: "MEETING_NOTE_CREATE",
    enabled: true,
    isPayloadEmpty: (nextPayload) =>
      !nextPayload.title?.trim() && !nextPayload.details?.trim(),
    onRestore,
    payload,
    shouldSave,
    store,
    trackEvent,
    userId: "user-001",
  });

  useEffect(() => {
    onChange(state);
  }, [onChange, state]);

  useEffect(() => {
    setPayloadRef(setPayload);
    setShouldSaveRef(setShouldSave);
  }, [setPayloadRef, setShouldSaveRef]);

  return null;
}

async function createMeetingNoteDraftKey(clientDraftId: string) {
  window.localStorage.setItem(
    "onehand.mobileLocalDraft.userScopeSalt",
    "hook-test-salt"
  );
  const userScopedHash = await createMobileLocalDraftUserScopedHash("user-001", {
    crypto: null,
    salt: "hook-test-salt",
  });

  return getMobileLocalDraftKey({
    draftId: clientDraftId,
    draftType: "MEETING_NOTE_CREATE",
    userScopedHash,
  });
}

async function flushAsync() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function unmountHook() {
  if (!root) {
    return;
  }

  await act(async () => {
    root?.unmount();
  });
  root = null;
}

// 기능 : hook 테스트에서 IndexedDB 역할을 대신하는 in-memory persistence를 만듭니다.
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
