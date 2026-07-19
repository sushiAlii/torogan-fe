import { useQueryClient } from '@tanstack/react-query'
import { createConnectQueryKey, useMutation } from '@connectrpc/connect-query'
import { PropertyService } from '@/lib/gen/property_pb'

export function useDeleteProperty() {
  const queryClient = useQueryClient()

  return useMutation(PropertyService.method.deletePropertyByID, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: createConnectQueryKey({
          schema: PropertyService.method.getMyPropertyList,
          cardinality: 'finite',
        }),
      })
      queryClient.invalidateQueries({
        queryKey: createConnectQueryKey({
          schema: PropertyService.method.getMyDeletedPropertyList,
          cardinality: 'finite',
        }),
      })
    },
  })
}
