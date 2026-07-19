import { useMutation } from '@connectrpc/connect-query'
import { AddressService } from '@/lib/gen/address_pb'

export function useUpdateAddress() {
  return useMutation(AddressService.method.updateAddressByID)
}
