import { useQuery } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useGetPropertyFeatures(propertyId: string, options?: { enabled?: boolean }) {
  return useQuery(PropertyService.method.listPropertyFeatures, { propertyId }, options)
}
