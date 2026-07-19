import { useQueryClient } from '@tanstack/react-query'
import { createConnectQueryKey, useMutation } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useMarkPropertyRented() {
  const queryClient = useQueryClient()

  return useMutation(PropertyService.method.markPropertyRented, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: createConnectQueryKey({
          schema: PropertyService.method.getMyPropertyList,
          cardinality: 'finite',
        }),
      })
    },
  })
}
