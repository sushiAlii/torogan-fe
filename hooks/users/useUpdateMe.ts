import { useMutation } from '@connectrpc/connect-query'
import { UserService } from '@/lib/gen/user_pb'

export function useUpdateMe() {
  return useMutation(UserService.method.updateMe)
}
