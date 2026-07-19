import { useMutation } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useRemovePropertyImage() {
  return useMutation(PropertyService.method.removePropertyImage)
}
