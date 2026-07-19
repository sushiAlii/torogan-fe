import 'server-only'

import { createClient } from '@connectrpc/connect'
import { createConnectTransport } from '@connectrpc/connect-web'

import { PropertyService } from '@/lib/gen/property_pb'
import { AddressService } from '@/lib/gen/address_pb'

// Server-only counterpart to lib/api/client.ts. That transport is
// browser-only (relative "/rpc" baseUrl relying on next.config.mjs's
// rewrite, credentials:'include' to forward the browser's cookies, an
// auth interceptor reading an in-memory access token that only exists in
// the browser runtime) — none of that applies in a Server Component.
//
// This transport talks to BACKEND_ORIGIN directly (no "/rpc" prefix — the
// rewrite exists for browser requests only) and carries no auth, since the
// refresh-token cookie is SameSite=Strict and unreliable to read
// server-side anyway (see lib/api/listing-data.ts for why). Anonymous
// reads only.
const baseUrl = process.env.BACKEND_ORIGIN ?? 'http://localhost:8080'

const serverTransport = createConnectTransport({ baseUrl })

export const serverPropertyClient = createClient(PropertyService, serverTransport)
export const serverAddressClient = createClient(AddressService, serverTransport)
