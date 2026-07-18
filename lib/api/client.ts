import { createClient, type Interceptor } from '@connectrpc/connect'
import { createConnectTransport } from '@connectrpc/connect-web'

import { AuthService } from '@/lib/gen/auth_pb'
import { PropertyService } from '@/lib/gen/property_pb'
import { getAccessToken } from '@/lib/api/token'

const authInterceptor: Interceptor = (next) => (req) => {
  const token = getAccessToken()
  if (token) {
    req.header.set('Authorization', `Bearer ${token}`)
  }
  return next(req)
}

const transport = createConnectTransport({
  baseUrl: '/rpc',
  interceptors: [authInterceptor],
  fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
})

export const authClient = createClient(AuthService, transport)
export const propertyClient = createClient(PropertyService, transport)
