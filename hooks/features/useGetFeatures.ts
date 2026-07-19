import { useQuery } from '@connectrpc/connect-query'
import { FeatureService } from '@/lib/gen/feature_pb'

export function useGetFeatures(limit = 100) {
  return useQuery(FeatureService.method.listFeatures, { limit })
}
