import { useQueryClient } from '@tanstack/react-query'
import { createConnectQueryKey, useMutation } from '@connectrpc/connect-query'
import { UserService } from '@/lib/gen/user_pb'

export function useUpdateMe() {
  const queryClient = useQueryClient()

  return useMutation(UserService.method.updateMe, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: createConnectQueryKey({
          schema: UserService.method.getMe,
          cardinality: 'finite',
        }),
      })
    },
  })
}
