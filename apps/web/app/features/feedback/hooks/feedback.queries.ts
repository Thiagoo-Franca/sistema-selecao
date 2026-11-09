import { useQuery } from "@tanstack/react-query"
import { rpcReturn } from "@/shared/lib/utils"
import apiClient from "@/shared/services/apiClient"

export const useFeedbackStatisticsQuery = () => {
  return useQuery({
    queryKey: ["feedback", "statistics"],
    queryFn: async () => {
      const response = await apiClient.feedback.statistics.$get()
      return rpcReturn(response)
    },
  })
}

export const useFeatureRequestsQuery = () => {
  return useQuery({
    queryKey: ["feature-requests"],
    queryFn: async () => {
      const response = await apiClient["feature-request"].$get()
      return rpcReturn(response)
    },
  })
}
