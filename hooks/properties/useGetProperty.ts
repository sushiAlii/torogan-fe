import { useQuery } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useGetProperty(id: string, options?: { enabled?: boolean }) {
  return useQuery(PropertyService.method.getPropertyByID, { id }, options)
}
