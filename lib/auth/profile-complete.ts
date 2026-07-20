import type { User } from '@/lib/gen/auth_pb'

// Name and phone are required at registration going forward, but this
// still needs checking at runtime: Google sign-in can never supply a phone
// number (not part of what Google's OAuth returns), and accounts created
// before this requirement existed may still be missing either field.
export function isProfileComplete(user: User): boolean {
  return user.name.trim() !== '' && user.phone.trim() !== ''
}
