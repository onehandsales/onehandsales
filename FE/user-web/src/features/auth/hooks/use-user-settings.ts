import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile,
  listMyDevices,
  updateMyProfile,
} from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-query-keys";
import { useAuthSession } from "@/features/auth/auth-context";
import type { UpdateUserProfileInput } from "@/features/auth/types/auth";

export function useMyProfile() {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: getMyProfile,
  });
}

export function useMyDevices() {
  return useQuery({
    queryKey: authQueryKeys.devices(),
    queryFn: listMyDevices,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();
  const { updateAuthUser } = useAuthSession();

  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => updateMyProfile(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(authQueryKeys.profile(), profile);
      updateAuthUser({
        email: profile.email,
        id: profile.id,
        name: profile.name,
        role: profile.role,
        status: profile.status,
        timeZone: profile.timeZone,
        preferredLocale: profile.preferredLocale,
        signupLocale: profile.signupLocale,
        signupCountryCode: profile.signupCountryCode,
        signupTimeZone: profile.signupTimeZone,
        lastLoginLocale: profile.lastLoginLocale,
        lastLoginCountryCode: profile.lastLoginCountryCode,
        lastLoginTimeZone: profile.lastLoginTimeZone,
      });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
    },
  });
}
