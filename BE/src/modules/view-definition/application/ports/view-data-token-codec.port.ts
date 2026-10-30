export const VIEW_DATA_TOKEN_CODEC = Symbol("VIEW_DATA_TOKEN_CODEC");
// 역할 : cursor/group token에 담는 조회 맥락과 위치를 정의합니다.
export interface ViewDataTokenPayload {
  context: string;
  configuration: string;
  part: string;
  offset: number;
  groupKey: string | null;
}
// 역할 : application에 암호화 구현을 노출하지 않고 페이지 맥락을 보호합니다.
export interface ViewDataTokenCodec {
  // 기능 : 설정과 조회 조건의 결정적 식별값을 계산합니다.
  fingerprint(value: unknown): string;
  // 기능 : 조회 맥락·페이지 위치를 만료되는 불투명 토큰으로 보호합니다.
  encode(payload: ViewDataTokenPayload): string;
  // 기능 : 위변조·길이·만료를 검증한 토큰의 안전한 payload를 반환합니다.
  decode(token: string): ViewDataTokenPayload;
}
