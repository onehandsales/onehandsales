import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackMobileFieldAnalyticsEvent } from "@/features/analytics";
import {
  createBrowserMobileLocalDraftStore,
  createMobileLocalDraftUserScopedHash,
  getMobileLocalDraftKey,
  type MobileLocalDraftStore,
} from "@/features/mobile-local-draft/storage/mobile-local-draft-storage";
import type {
  MobileLocalDraftClientEvent,
  MobileLocalDraftDiscardReason,
  MobileLocalDraftEnvelope,
  MobileLocalDraftType,
} from "@/features/mobile-local-draft/types/mobile-local-draft";

type UseMobileLocalDraftOptions<TPayload> = {
  readonly debounceMs?: number;
  readonly draftId: string | null;
  readonly draftType: MobileLocalDraftType;
  readonly enabled: boolean;
  readonly isPayloadEmpty: (payload: TPayload) => boolean;
  readonly onRestore: (payload: TPayload) => void;
  readonly payload: TPayload;
  readonly shouldSave: boolean;
  readonly store?: MobileLocalDraftStore;
  readonly trackEvent?: (event: MobileLocalDraftClientEvent) => void;
  readonly userId: string | null | undefined;
};

const defaultDebounceMs = 600;

// 기능 : form 값을 debounce 저장하고 유효한 local draft가 있으면 복구 prompt 상태를 제공합니다.
export function useMobileLocalDraft<TPayload>({
  debounceMs = defaultDebounceMs,
  draftId,
  draftType,
  enabled,
  isPayloadEmpty,
  onRestore,
  payload,
  shouldSave,
  store,
  trackEvent = emitMobileLocalDraftClientEvent,
  userId,
}: UseMobileLocalDraftOptions<TPayload>) {
  const defaultStoreRef = useRef<MobileLocalDraftStore | null>(null);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
  const [promptDraft, setPromptDraft] =
    useState<MobileLocalDraftEnvelope<TPayload> | null>(null);
  const activeStore =
    store ?? (defaultStoreRef.current ??= createBrowserMobileLocalDraftStore());
  const analyticsDraftType = useMemo(
    () =>
      draftType === "BUSINESS_CARD_CONFIRM"
        ? "business_card_confirm"
        : "meeting_note_create",
    [draftType]
  );

  useEffect(() => {
    let isMounted = true;

    setDraftKey(null);
    setHasLoadedDraft(false);
    setPromptDraft(null);

    if (!enabled || !draftId || !userId) {
      return () => {
        isMounted = false;
      };
    }

    void createMobileLocalDraftUserScopedHash(userId)
      .then((userScopedHash) => {
        if (!isMounted) {
          return;
        }

        setDraftKey(
          getMobileLocalDraftKey({
            draftId,
            draftType,
            userScopedHash,
          })
        );
      })
      .catch(() => {
        if (isMounted) {
          setHasLoadedDraft(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [draftId, draftType, enabled, userId]);

  useEffect(() => {
    let isMounted = true;

    if (!enabled || !draftKey) {
      setHasLoadedDraft(false);
      setPromptDraft(null);
      return () => {
        isMounted = false;
      };
    }

    setHasLoadedDraft(false);

    void activeStore.load<TPayload>(draftKey).then((result) => {
      if (!isMounted) {
        return;
      }

      setHasLoadedDraft(true);

      if (result.found) {
        setPromptDraft(result.draft);
        return;
      }

      setPromptDraft(null);

      if (result.reason === "EXPIRED") {
        trackEvent({
          eventName: "local_draft_discarded",
          eventVersion: 1,
          payload: {
            draftType: analyticsDraftType,
            reason: "expired",
          },
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeStore, analyticsDraftType, draftKey, enabled, trackEvent]);

  useEffect(() => {
    if (
      !enabled ||
      !draftKey ||
      !hasLoadedDraft ||
      promptDraft ||
      !shouldSave ||
      isPayloadEmpty(payload)
    ) {
      return undefined;
    }

    let isCancelled = false;
    const timerId = window.setTimeout(() => {
      void activeStore
        .save({
          draftKey,
          draftType,
          payload,
        })
        .then(() => {
          if (isCancelled) {
            return;
          }

          trackEvent({
            eventName: "local_draft_saved",
            eventVersion: 1,
            payload: {
              draftType: analyticsDraftType,
            },
          });
        })
        .catch(() => {
          // 기능 : local draft 저장 실패는 사용자의 입력 흐름을 막지 않습니다.
        });
    }, debounceMs);

    return () => {
      isCancelled = true;
      window.clearTimeout(timerId);
    };
  }, [
    activeStore,
    analyticsDraftType,
    debounceMs,
    draftKey,
    draftType,
    enabled,
    hasLoadedDraft,
    isPayloadEmpty,
    payload,
    promptDraft,
    shouldSave,
    trackEvent,
  ]);

  const restorePromptDraft = useCallback(() => {
    if (!promptDraft) {
      return;
    }

    onRestore(promptDraft.payload);
    setPromptDraft(null);
    trackEvent({
      eventName: "local_draft_restored",
      eventVersion: 1,
      payload: {
        draftType: analyticsDraftType,
      },
    });
  }, [analyticsDraftType, onRestore, promptDraft, trackEvent]);

  const discardDraft = useCallback(
    async (reason: MobileLocalDraftDiscardReason = "user_discarded") => {
      if (!draftKey) {
        return;
      }

      await activeStore.discard(draftKey);
      setPromptDraft(null);
      trackEvent({
        eventName: "local_draft_discarded",
        eventVersion: 1,
        payload: {
          draftType: analyticsDraftType,
          reason,
        },
      });
    },
    [activeStore, analyticsDraftType, draftKey, trackEvent]
  );

  return {
    discardDraft,
    draftKey,
    hasPrompt: Boolean(promptDraft),
    promptDraft,
    restorePromptDraft,
  };
}

// 기능 : local draft client event를 collector로 전송하고 기존 브라우저 내부 event도 발행합니다.
export function emitMobileLocalDraftClientEvent(
  event: MobileLocalDraftClientEvent
) {
  trackMobileFieldAnalyticsEvent(event);

  if (typeof window === "undefined" || typeof CustomEvent === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("onehand:mobile-local-draft-analytics", {
      detail: event,
    })
  );
}
