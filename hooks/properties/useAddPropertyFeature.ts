import { useMutation } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useAddPropertyFeature() {
  return useMutation(PropertyService.method.addPropertyFeature)
}
