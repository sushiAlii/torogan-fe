import { useQuery } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useGetMyProperties(options?: { enabled?: boolean }) {
  return useQuery(PropertyService.method.getMyPropertyList, {}, options)
}
