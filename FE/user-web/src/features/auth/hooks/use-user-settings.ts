import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeJobSelectionOnboarding,
  getMyProfile,
  listMyDevices,
  updateMyProfile,
} from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-query-keys";
import { useAuthSession } from "@/features/auth/auth-context";
import type { UpdateUserProfileInput } from "@/features/auth/types/auth";

// 기능 : My Profile hook으로 상태와 동작을 제공합니다.
export function useMyProfile() {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: getMyProfile,
  });
}

// 기능 : My Devices hook으로 상태와 동작을 제공합니다.
export function useMyDevices() {
  return useQuery({
    queryKey: authQueryKeys.devices(),
    queryFn: listMyDevices,
  });
}

// 기능 : Update My Profile Mutation hook으로 상태와 동작을 제공합니다.
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
        countryCode: profile.countryCode,
        defaultCurrencyCode: profile.defaultCurrencyCode,
        signupLocale: profile.signupLocale,
        signupCountryCode: profile.signupCountryCode,
        signupTimeZone: profile.signupTimeZone,
        lastLoginLocale: profile.lastLoginLocale,
        lastLoginCountryCode: profile.lastLoginCountryCode,
        lastLoginTimeZone: profile.lastLoginTimeZone,
        jobSelectOnboardingCompletedAt: profile.jobSelectOnboardingCompletedAt,
      });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
    },
  });
}

// 기능 : Complete Job Selection Onboarding Mutation hook으로 온보딩 완료 상태를 저장합니다.
export function useCompleteJobSelectionOnboardingMutation() {
  const queryClient = useQueryClient();
  const { updateAuthUser } = useAuthSession();

  return useMutation({
    mutationFn: completeJobSelectionOnboarding,
    onSuccess: (response) => {
      updateAuthUser({
        jobSelectOnboardingCompletedAt: response.jobSelectOnboardingCompletedAt,
      });
      void queryClient.invalidateQueries({ queryKey: authQueryKeys.profile() });
    },
  });
}
