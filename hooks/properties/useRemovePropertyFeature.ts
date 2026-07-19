import { useMutation } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useRemovePropertyFeature() {
  return useMutation(PropertyService.method.removePropertyFeature)
}
