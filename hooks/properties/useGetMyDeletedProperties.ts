import { useQuery } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useGetMyDeletedProperties(options?: { enabled?: boolean }) {
  return useQuery(PropertyService.method.getMyDeletedPropertyList, {}, options)
}
