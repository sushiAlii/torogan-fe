import { useMutation } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useAddPropertyImage() {
  return useMutation(PropertyService.method.addPropertyImage)
}
