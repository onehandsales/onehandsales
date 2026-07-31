import { useCallback, useEffect, useRef, useState } from "react";

export type MeetingNoteAudioRecordingStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "recorded"
  | "failed";

export type MeetingNoteAudioRecordingErrorCode =
  | "AUDIO_RECORDING_PERMISSION_DENIED"
  | "AUDIO_RECORDING_NOT_SUPPORTED";

const MEETING_NOTE_RECORDING_MIME_TYPE_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
] as const;

type MediaRecorderGlobal = typeof globalThis & {
  readonly MediaRecorder?: typeof MediaRecorder;
};

// 기능 : 현재 실행 환경에서 MediaRecorder와 getUserMedia를 함께 사용할 수 있는지 확인합니다.
export function isMeetingNoteAudioRecordingSupported(
  scope: MediaRecorderGlobal = globalThis as MediaRecorderGlobal
) {
  return (
    typeof scope.MediaRecorder === "function" &&
    typeof scope.navigator?.mediaDevices?.getUserMedia === "function"
  );
}

// 기능 : 브라우저가 지원하는 회의록 녹음 MIME type을 우선순위대로 선택합니다.
export function selectMeetingNoteRecordingMimeType(
  mediaRecorder: typeof MediaRecorder | undefined = (
    globalThis as MediaRecorderGlobal
  ).MediaRecorder
) {
  if (typeof mediaRecorder?.isTypeSupported !== "function") {
    return "";
  }

  return (
    MEETING_NOTE_RECORDING_MIME_TYPE_CANDIDATES.find((mimeType) =>
      mediaRecorder.isTypeSupported(mimeType)
    ) ?? ""
  );
}

// 기능 : 녹음 Blob 조각을 STT draft API에 전송할 File 객체로 변환합니다.
export function createMeetingNoteRecordingFile(
  chunks: readonly BlobPart[],
  mimeType: string,
  recordedAt = new Date()
) {
  const normalizedMimeType = mimeType || "audio/webm";
  const extension = getAudioExtension(normalizedMimeType);
  const timestamp = recordedAt.toISOString().replace(/[:.]/g, "-");

  return new File([...chunks], `meeting-recording-${timestamp}.${extension}`, {
    type: normalizedMimeType,
  });
}

// 기능 : 녹음 경과 시간을 모바일 UI에 맞는 mm:ss 문자열로 변환합니다.
export function formatMeetingNoteRecordingDuration(seconds: number) {
  const safeSeconds = Math.max(Math.floor(seconds), 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(
    2,
    "0"
  )}`;
}

// 기능 : 회의록 생성 모달에서 사용할 MediaRecorder 상태와 제어 함수를 제공합니다.
export function useMeetingNoteAudioRecorder() {
  const [status, setStatus] =
    useState<MeetingNoteAudioRecordingStatus>("idle");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [errorCode, setErrorCode] =
    useState<MeetingNoteAudioRecordingErrorCode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const cancelRequestedRef = useRef(false);

  const clearDurationTimer = useCallback(() => {
    if (timerRef.current === null) {
      return;
    }

    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stopCurrentStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const resetRecorderState = useCallback(() => {
    clearDurationTimer();
    stopCurrentStream();
    recorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
  }, [clearDurationTimer, stopCurrentStream]);

  const clearRecording = useCallback(() => {
    cancelRequestedRef.current = true;

    if (
      recorderRef.current &&
      recorderRef.current.state !== "inactive"
    ) {
      recorderRef.current.stop();
      return;
    }

    resetRecorderState();
    setDurationSeconds(0);
    setRecordedFile(null);
    setErrorCode(null);
    setStatus("idle");
  }, [resetRecorderState]);

  const startRecording = useCallback(async () => {
    if (!isMeetingNoteAudioRecordingSupported()) {
      setStatus("failed");
      setErrorCode("AUDIO_RECORDING_NOT_SUPPORTED");
      setRecordedFile(null);
      return;
    }

    cancelRequestedRef.current = false;
    setStatus("requesting");
    setDurationSeconds(0);
    setRecordedFile(null);
    setErrorCode(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (cancelRequestedRef.current) {
        stopStream(stream);
        resetRecorderState();
        setStatus("idle");
        return;
      }

      const MediaRecorderConstructor = (
        globalThis as MediaRecorderGlobal
      ).MediaRecorder;
      if (!MediaRecorderConstructor) {
        throw new Error("MediaRecorder is unavailable");
      }

      const mimeType = selectMeetingNoteRecordingMimeType(
        MediaRecorderConstructor
      );
      const recorder = mimeType
        ? new MediaRecorderConstructor(stream, { mimeType })
        : new MediaRecorderConstructor(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        setErrorCode("AUDIO_RECORDING_NOT_SUPPORTED");
        setStatus("failed");
        resetRecorderState();
      };
      recorder.onstop = () => {
        const shouldCancel = cancelRequestedRef.current;
        const chunks = [...chunksRef.current];

        resetRecorderState();

        if (shouldCancel) {
          setDurationSeconds(0);
          setRecordedFile(null);
          setErrorCode(null);
          setStatus("idle");
          return;
        }

        const file = createMeetingNoteRecordingFile(chunks, mimeType);

        if (file.size <= 0) {
          setRecordedFile(null);
          setErrorCode("AUDIO_RECORDING_NOT_SUPPORTED");
          setStatus("failed");
          return;
        }

        setRecordedFile(file);
        setStatus("recorded");
      };

      recorder.start();
      startedAtRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        if (startedAtRef.current === null) {
          return;
        }

        setDurationSeconds(
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
      }, 500);
      setStatus("recording");
    } catch (error) {
      resetRecorderState();
      setRecordedFile(null);
      setStatus("failed");
      setErrorCode(
        isRecordingPermissionDeniedError(error)
          ? "AUDIO_RECORDING_PERMISSION_DENIED"
          : "AUDIO_RECORDING_NOT_SUPPORTED"
      );
    }
  }, [resetRecorderState]);

  const stopRecording = useCallback(() => {
    cancelRequestedRef.current = false;

    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  const cancelRecording = useCallback(() => {
    clearRecording();
  }, [clearRecording]);

  useEffect(() => {
    return () => {
      cancelRequestedRef.current = true;
      if (
        recorderRef.current &&
        recorderRef.current.state !== "inactive"
      ) {
        recorderRef.current.ondataavailable = null;
        recorderRef.current.onerror = null;
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      resetRecorderState();
    };
  }, [resetRecorderState]);

  return {
    cancelRecording,
    clearRecording,
    durationLabel: formatMeetingNoteRecordingDuration(durationSeconds),
    durationSeconds,
    errorCode,
    isSupported: isMeetingNoteAudioRecordingSupported(),
    recordedFile,
    startRecording,
    status,
    stopRecording,
  };
}

// 기능 : 브라우저 권한 거부 오류인지 안전하게 판별합니다.
function isRecordingPermissionDeniedError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const name = "name" in error ? String(error.name) : "";

  return ["NotAllowedError", "PermissionDeniedError", "SecurityError"].includes(
    name
  );
}

// 기능 : hook 내부에서 받은 MediaStream track을 모두 정리합니다.
function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

// 기능 : API가 받을 수 있는 오디오 파일 확장자를 MIME type에서 결정합니다.
function getAudioExtension(mimeType: string) {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }

  if (mimeType.includes("mpeg")) {
    return "mp3";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  if (mimeType.includes("wav")) {
    return "wav";
  }

  return "webm";
}
