import { useMutation } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useCreateProperty() {
  return useMutation(PropertyService.method.createProperty)
}
