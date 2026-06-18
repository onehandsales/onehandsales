import type { Buffer } from "node:buffer";

export const MEETING_NOTE_STT_PROVIDER = Symbol("MEETING_NOTE_STT_PROVIDER");

// 역할 : MeetingNoteDraftAudioFile STT provider에 전달할 업로드 음성 파일 계약을 정의합니다.
export interface MeetingNoteDraftAudioFile {
  readonly buffer: Buffer;
  readonly fileName: string;
  readonly mimeType: string;
  readonly size: number;
}

// 역할 : TranscribeMeetingNoteAudioInput 음성 파일 transcript 생성 provider 입력 계약을 정의합니다.
export interface TranscribeMeetingNoteAudioInput {
  readonly audioFile: MeetingNoteDraftAudioFile;
}

// 역할 : MeetingNoteTranscription STT provider가 반환하는 transcript 계약을 정의합니다.
export interface MeetingNoteTranscription {
  readonly transcript: string;
}

// 역할 : MeetingNoteSttProvider 회의록 STT 생성을 외부 provider 뒤로 숨기는 application port입니다.
export interface MeetingNoteSttProvider {
  // 기능 : 음성 파일을 transcript 텍스트로 변환합니다.
  transcribe(
    input: TranscribeMeetingNoteAudioInput
  ): Promise<MeetingNoteTranscription>;
}
