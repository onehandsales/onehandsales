import { Buffer } from "node:buffer";
import { ConfigService } from "@nestjs/config";
import type {
  MeetingNoteDraftAudioFile,
  MeetingNoteSttProvider,
  MeetingNoteTranscription,
  TranscribeMeetingNoteAudioInput,
} from "@/modules/meeting-note/application/ports/meeting-note-stt.provider";
import {
  MeetingNoteAiDraftFailedError,
  MeetingNoteAiDraftProviderUnavailableError,
} from "@/modules/meeting-note/domain/meeting-note.errors";
import { AppLogger } from "@/shared/infrastructure/logger/app-logger.service";

const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_STT_MODEL = "gpt-4o-mini-transcribe";
const OPENAI_PROVIDER = "openai";

// 역할 : OpenAiSttConfig OpenAI STT provider 호출에 필요한 설정 값을 정의합니다.
interface OpenAiSttConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly sttModel: string;
}

// 역할 : OpenAiMeetingNoteSttProvider OpenAI transcription API로 회의록 음성을 텍스트로 변환하는 infrastructure adapter입니다.
export class OpenAiMeetingNoteSttProvider implements MeetingNoteSttProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {}

  // 기능 : 음성 파일을 OpenAI audio transcription API로 transcript 텍스트로 변환합니다.
  async transcribe(
    input: TranscribeMeetingNoteAudioInput
  ): Promise<MeetingNoteTranscription> {
    const config = this.getConfig();
    const formData = new FormData();
    formData.set("model", config.sttModel);
    formData.set("response_format", "json");
    formData.set(
      "file",
      this.createAudioBlob(input.audioFile),
      input.audioFile.fileName
    );

    const response = await fetch(`${config.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      this.logProviderFailure(
        "audio.transcriptions",
        response.status,
        response.statusText
      );
      throw new MeetingNoteAiDraftFailedError("OpenAI transcription failed");
    }

    const responseBody = await this.readJsonResponse(
      response,
      "OpenAI transcription response was not JSON"
    );

    if (!this.isRecord(responseBody)) {
      throw new MeetingNoteAiDraftFailedError(
        "OpenAI transcription response did not match schema"
      );
    }

    const transcript = this.readStringField(responseBody, "text");

    if (!transcript || transcript.trim().length === 0) {
      throw new MeetingNoteAiDraftFailedError("OpenAI transcript was empty");
    }

    return { transcript: transcript.trim() };
  }

  // 기능 : OpenAI STT API 호출에 필요한 환경변수를 ConfigService에서 읽고 검증합니다.
  private getConfig(): OpenAiSttConfig {
    const apiKey = this.getRequiredConfig("OPENAI_API_KEY");
    const baseUrl =
      this.configService.get<string>("OPENAI_BASE_URL")?.trim() ||
      DEFAULT_OPENAI_BASE_URL;
    const sttModel =
      this.configService.get<string>("OPENAI_MEETING_NOTE_STT_MODEL")?.trim() ||
      DEFAULT_STT_MODEL;

    return {
      apiKey,
      baseUrl: baseUrl.replace(/\/+$/, ""),
      sttModel,
    };
  }

  // 기능 : 필수 provider 환경변수가 비어 있으면 설정 오류로 변환합니다.
  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new MeetingNoteAiDraftProviderUnavailableError(`${key} is required`);
    }

    return value;
  }

  // 기능 : Node Buffer 음성 데이터를 FormData가 전송할 수 있는 Blob으로 변환합니다.
  private createAudioBlob(audioFile: MeetingNoteDraftAudioFile): Blob {
    const audioBytes = Buffer.from(audioFile.buffer);
    const arrayBuffer = audioBytes.buffer.slice(
      audioBytes.byteOffset,
      audioBytes.byteOffset + audioBytes.byteLength
    ) as ArrayBuffer;

    return new Blob([arrayBuffer], { type: audioFile.mimeType });
  }

  // 기능 : fetch response body를 JSON으로 안전하게 파싱합니다.
  private async readJsonResponse(
    response: Response,
    errorMessage: string
  ): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      throw new MeetingNoteAiDraftFailedError(errorMessage);
    }
  }

  // 기능 : unknown 값이 key 조회 가능한 object인지 확인합니다.
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  // 기능 : record에서 문자열 필드를 읽고 없으면 null을 반환합니다.
  private readStringField(
    value: Record<string, unknown>,
    fieldName: string
  ): string | null {
    const fieldValue = value[fieldName];

    return typeof fieldValue === "string" ? fieldValue : null;
  }

  // 기능 : 음성 원문 없이 provider 실패 추적에 필요한 안전한 context만 남깁니다.
  private logProviderFailure(
    operation: string,
    statusCode: number,
    statusText: string
  ): void {
    this.logger.error(
      JSON.stringify({
        event: "provider.openai.meetingNoteStt.failed",
        provider: OPENAI_PROVIDER,
        operation,
        statusCode,
        retryable: statusCode >= 500 || statusCode === 429,
      }),
      statusText,
      "OpenAiMeetingNoteSttProvider"
    );
  }
}
