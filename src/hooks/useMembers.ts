import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as membersApi from "../api/members.api";
import type { IssueCouponInput, MemberInput } from "../api/members.api";

export function useMembers(search?: string) {
  return useQuery({
    queryKey: ["members", search],
    queryFn: () => membersApi.listMembers(search),
    enabled: search === undefined || search.length > 0,
  });
}

export function useMember(id: string | null) {
  return useQuery({
    queryKey: ["members", "detail", id],
    queryFn: () => membersApi.getMember(id as string),
    enabled: !!id,
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MemberInput) => membersApi.createMember(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MemberInput> & { active?: boolean } }) =>
      membersApi.updateMember(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });
}

export function useMemberCoupons(memberId: string | undefined, redeemed?: boolean) {
  return useQuery({
    queryKey: ["members", memberId, "coupons", redeemed],
    queryFn: () => membersApi.listMemberCoupons(memberId as string, redeemed),
    enabled: !!memberId,
  });
}

export function useIssueCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, input }: { memberId: string; input: IssueCouponInput }) =>
      membersApi.issueCoupon(memberId, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["members", variables.memberId, "coupons"] });
      qc.invalidateQueries({ queryKey: ["members", "detail", variables.memberId] });
    },
  });
}
