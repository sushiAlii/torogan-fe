import { useQuery } from '@connectrpc/connect-query'
import { AddressService } from '@/lib/gen/address_pb'

export function useGetPropertyAddress(propertyId: string, options?: { enabled?: boolean }) {
  return useQuery(AddressService.method.getAddressByPropertyID, { propertyId }, options)
}
