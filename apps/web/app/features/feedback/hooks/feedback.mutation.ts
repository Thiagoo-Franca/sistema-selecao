import apiClient from "@/shared/services/apiClient"
import { rpcReturn, type RpcType } from "@/shared/lib/utils"
import { useMutation } from "@tanstack/react-query"

export const useSubmitFeedbackMutation = () => {
  type Query = RpcType<typeof apiClient.feedback.$post>
  return useMutation({
    mutationFn: async (request: Query["input"]) => {
      const response = await apiClient.feedback.$post(request)
      return rpcReturn(response)
    },
  })
}
