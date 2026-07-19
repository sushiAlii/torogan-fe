import { useQuery } from '@connectrpc/connect-query'
import { UserService } from '@/lib/gen/user_pb'

export function useGetMe(options?: { enabled?: boolean }) {
  return useQuery(UserService.method.getMe, {}, options)
}
