// 역할 : `/admin/api/me` 응답으로 확인한 관리자 사용자 정보를 정의합니다.
export type AdminMe = {
  readonly id: string;
  readonly supabaseUserId: string | null;
  readonly name: string | null;
  readonly email: string | null;
  readonly role: "ADMIN";
};
