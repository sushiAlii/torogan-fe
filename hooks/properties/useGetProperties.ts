import { useQuery } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useGetProperties(search: string, limit = 50) {
  return useQuery(PropertyService.method.getPropertyList, { search, limit })
}
