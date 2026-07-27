import { apiClient } from "./client";
import type { Coupon, CouponDiscountType, Member, MemberDetail } from "../types";

export async function listMembers(search?: string): Promise<Member[]> {
  const { data } = await apiClient.get<{ items: Member[] }>("/members", {
    params: search ? { search } : undefined,
  });
  return data.items;
}

export interface MemberInput {
  phone: string;
  name: string;
}

export async function createMember(input: MemberInput): Promise<Member> {
  const { data } = await apiClient.post<Member>("/members", input);
  return data;
}

export async function updateMember(
  id: string,
  input: Partial<MemberInput> & { active?: boolean }
): Promise<Member> {
  const { data } = await apiClient.patch<Member>(`/members/${id}`, input);
  return data;
}

export async function getMember(id: string): Promise<MemberDetail> {
  const { data } = await apiClient.get<MemberDetail>(`/members/${id}`);
  return data;
}

export interface IssueCouponInput {
  discountType: CouponDiscountType;
  value: number;
}

export async function issueCoupon(memberId: string, input: IssueCouponInput): Promise<Coupon> {
  const { data } = await apiClient.post<Coupon>(`/members/${memberId}/coupons`, input);
  return data;
}

export async function listMemberCoupons(memberId: string, redeemed?: boolean): Promise<Coupon[]> {
  const { data } = await apiClient.get<{ items: Coupon[] }>(`/members/${memberId}/coupons`, {
    params: redeemed === undefined ? undefined : { redeemed },
  });
  return data.items;
}
