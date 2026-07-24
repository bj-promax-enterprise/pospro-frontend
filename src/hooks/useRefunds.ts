import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as refundsApi from "../api/refunds.api";
import type { CreateRefundInput } from "../api/refunds.api";

export function useCreateRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRefundInput) => refundsApi.createRefund(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", variables.orderId] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
