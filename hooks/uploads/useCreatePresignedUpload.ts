import { useMutation } from '@connectrpc/connect-query'
import { UploadService } from '@/lib/gen/upload_pb'

export function useCreatePresignedUpload() {
  return useMutation(UploadService.method.createPresignedUpload)
}
