import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MeetingNoteRecordingAnalyticsEventInput } from "@/features/analytics";
import {
  createMeetingNoteRecordingFile,
  formatMeetingNoteRecordingDuration,
  getMeetingNoteRecordingDurationBucket,
  isMeetingNoteAudioRecordingSupported,
  selectMeetingNoteRecordingMimeType,
  useMeetingNoteAudioRecorder,
} from "./use-meeting-note-audio-recorder";

type RecorderHookState = ReturnType<typeof useMeetingNoteAudioRecorder>;
type MediaRecorderGlobalForTest = typeof globalThis & {
  readonly MediaRecorder?: typeof MediaRecorder;
};

const originalMediaRecorder = (
  globalThis as MediaRecorderGlobalForTest
).MediaRecorder;
const originalMediaDevices = globalThis.navigator.mediaDevices;
let root: Root | null = null;

describe("meeting note audio recorder helpers", () => {
  afterEach(() => {
    restoreBrowserRecordingGlobals();
  });

  it("detects MediaRecorder support without calling getUserMedia", () => {
    const getUserMedia = vi.fn<MediaDevices["getUserMedia"]>();
    installFakeMediaRecorder();
    installMediaDevices(getUserMedia);

    expect(isMeetingNoteAudioRecordingSupported()).toBe(true);
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("selects supported mime type and formats recorded files", () => {
    installFakeMediaRecorder(["audio/webm"]);

    expect(selectMeetingNoteRecordingMimeType()).toBe("audio/webm");
    expect(formatMeetingNoteRecordingDuration(65)).toBe("01:05");
    expect(getMeetingNoteRecordingDurationBucket(59)).toBe("under_1m");
    expect(getMeetingNoteRecordingDurationBucket(60)).toBe("1m_5m");
    expect(getMeetingNoteRecordingDurationBucket(300)).toBe("5m_15m");
    expect(getMeetingNoteRecordingDurationBucket(900)).toBe("over_15m");

    const file = createMeetingNoteRecordingFile(
      [new Blob(["audio"])],
      "audio/mp4",
      new Date("2026-07-31T01:02:03.000Z")
    );

    expect(file.name).toBe("meeting-recording-2026-07-31T01-02-03-000Z.m4a");
    expect(file.type).toBe("audio/mp4");
  });
});

describe("useMeetingNoteAudioRecorder", () => {
  afterEach(async () => {
    await unmountRecorderHook();
    restoreBrowserRecordingGlobals();
    vi.useRealTimers();
  });

  it("marks unsupported browsers without opening permission prompt", async () => {
    const getUserMedia = vi.fn<MediaDevices["getUserMedia"]>();
    installMediaDevices(getUserMedia);
    installMediaRecorder(undefined);
    const events: MeetingNoteRecordingAnalyticsEventInput[] = [];
    const controller = await renderRecorderHook({
      trackEvent: (event) => events.push(event),
    });

    await act(async () => {
      await controller.current.startRecording();
    });

    expect(controller.current.status).toBe("failed");
    expect(controller.current.errorCode).toBe(
      "AUDIO_RECORDING_NOT_SUPPORTED"
    );
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(events).toEqual([
      {
        eventName: "meeting_note_recording_failed",
        eventVersion: 1,
        payload: {
          reason: "unsupported",
        },
      },
    ]);
  });

  it("maps microphone permission denial to file upload fallback error", async () => {
    installFakeMediaRecorder();
    installMediaDevices(
      vi.fn<MediaDevices["getUserMedia"]>().mockRejectedValue(
        createDomNamedError("NotAllowedError")
      )
    );
    const events: MeetingNoteRecordingAnalyticsEventInput[] = [];
    const controller = await renderRecorderHook({
      trackEvent: (event) => events.push(event),
    });

    await act(async () => {
      await controller.current.startRecording();
    });

    expect(controller.current.status).toBe("failed");
    expect(controller.current.errorCode).toBe(
      "AUDIO_RECORDING_PERMISSION_DENIED"
    );
    expect(controller.current.recordedFile).toBeNull();
    expect(events).toEqual([
      {
        eventName: "meeting_note_recording_failed",
        eventVersion: 1,
        payload: {
          reason: "permission_denied",
        },
      },
    ]);
  });

  it("records, stops, and exposes a File for the STT draft API", async () => {
    const trackStop = vi.fn();
    installFakeMediaRecorder(["audio/webm"]);
    installMediaDevices(
      vi.fn<MediaDevices["getUserMedia"]>().mockResolvedValue(
        createStreamFake(trackStop)
      )
    );
    const events: MeetingNoteRecordingAnalyticsEventInput[] = [];
    const controller = await renderRecorderHook({
      trackEvent: (event) => events.push(event),
    });

    await act(async () => {
      await controller.current.startRecording();
    });
    expect(controller.current.status).toBe("recording");

    await act(async () => {
      controller.current.stopRecording();
    });

    expect(controller.current.status).toBe("recorded");
    expect(controller.current.recordedFile).toMatchObject({
      name: expect.stringContaining("meeting-recording-"),
      type: "audio/webm",
    });
    expect(controller.current.recordedFile?.size).toBeGreaterThan(0);
    expect(trackStop).toHaveBeenCalled();
    expect(events).toEqual([
      {
        eventName: "meeting_note_recording_started",
        eventVersion: 1,
        payload: {
          entryPoint: "meeting_note_create",
        },
      },
      {
        eventName: "meeting_note_recording_completed",
        eventVersion: 1,
        payload: {
          durationBucket: "under_1m",
        },
      },
    ]);
  });

  it("cancels active recording without keeping an audio file", async () => {
    installFakeMediaRecorder(["audio/webm"]);
    installMediaDevices(
      vi.fn<MediaDevices["getUserMedia"]>().mockResolvedValue(
        createStreamFake()
      )
    );
    const events: MeetingNoteRecordingAnalyticsEventInput[] = [];
    const controller = await renderRecorderHook({
      trackEvent: (event) => events.push(event),
    });

    await act(async () => {
      await controller.current.startRecording();
    });
    await act(async () => {
      controller.current.cancelRecording();
    });

    expect(controller.current.status).toBe("idle");
    expect(controller.current.recordedFile).toBeNull();
    expect(controller.current.errorCode).toBeNull();
    expect(events).toEqual([
      {
        eventName: "meeting_note_recording_started",
        eventVersion: 1,
        payload: {
          entryPoint: "meeting_note_create",
        },
      },
    ]);
  });
});

// 기능 : hook 테스트용 React root를 만들고 최신 recorder state를 노출합니다.
async function renderRecorderHook(input: {
  readonly trackEvent?: (
    event: MeetingNoteRecordingAnalyticsEventInput
  ) => void;
} = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  let current: RecorderHookState | null = null;

  root = createRoot(container);

  await act(async () => {
    root?.render(
      <RecorderHookProbe
        onChange={(nextState) => {
          current = nextState;
        }}
        trackEvent={input.trackEvent}
      />
    );
  });

  if (!current) {
    throw new Error("recorder hook is not ready");
  }

  return {
    get current() {
      if (!current) {
        throw new Error("recorder hook was unmounted");
      }

      return current;
    },
  };
}

// 기능 : 테스트 컴포넌트에서 hook state를 외부 controller로 전달합니다.
function RecorderHookProbe({
  onChange,
  trackEvent,
}: {
  readonly onChange: (state: RecorderHookState) => void;
  readonly trackEvent?: (
    event: MeetingNoteRecordingAnalyticsEventInput
  ) => void;
}) {
  const recorder = useMeetingNoteAudioRecorder({ trackEvent });

  useEffect(() => {
    onChange(recorder);
  }, [onChange, recorder]);

  return null;
}

async function unmountRecorderHook() {
  if (!root) {
    return;
  }

  await act(async () => {
    root?.unmount();
  });
  root = null;
}

// 기능 : 테스트 후 전역 브라우저 녹음 API를 원래 상태로 되돌립니다.
function restoreBrowserRecordingGlobals() {
  installMediaRecorder(originalMediaRecorder);
  Object.defineProperty(globalThis.navigator, "mediaDevices", {
    configurable: true,
    value: originalMediaDevices,
  });
}

function installFakeMediaRecorder(supportedMimeTypes = ["audio/webm"]) {
  FakeMediaRecorder.supportedMimeTypes = new Set(supportedMimeTypes);
  installMediaRecorder(FakeMediaRecorder as unknown as typeof MediaRecorder);
}

function installMediaRecorder(mediaRecorder: typeof MediaRecorder | undefined) {
  Object.defineProperty(globalThis, "MediaRecorder", {
    configurable: true,
    value: mediaRecorder,
    writable: true,
  });
}

function installMediaDevices(getUserMedia: MediaDevices["getUserMedia"]) {
  Object.defineProperty(globalThis.navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
}

function createDomNamedError(name: string) {
  const error = new Error(name);
  error.name = name;

  return error;
}

function createStreamFake(trackStop = vi.fn()) {
  return {
    getTracks: () => [{ stop: trackStop }],
  } as unknown as MediaStream;
}

// 역할 : FakeMediaRecorder hook 테스트에서 브라우저 MediaRecorder를 대체합니다.
class FakeMediaRecorder {
  static supportedMimeTypes = new Set(["audio/webm"]);

  static isTypeSupported(mimeType: string) {
    return FakeMediaRecorder.supportedMimeTypes.has(mimeType);
  }

  ondataavailable: ((event: BlobEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onstop: ((event: Event) => void) | null = null;
  state: RecordingState = "inactive";
  private readonly mimeType: string;

  // 기능 : 테스트용 recorder에 stream과 MIME type만 보관합니다.
  constructor(_stream: MediaStream, options?: MediaRecorderOptions) {
    this.mimeType = options?.mimeType ?? "audio/webm";
  }

  // 기능 : 녹음 시작 상태를 기록합니다.
  start() {
    this.state = "recording";
  }

  // 기능 : 녹음 종료 시 dataavailable과 stop event를 동기적으로 발생시킵니다.
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({
      data: new Blob(["fake audio"], { type: this.mimeType }),
    } as BlobEvent);
    this.onstop?.(new Event("stop"));
  }
}
