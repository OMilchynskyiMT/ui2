import { isApiError } from '@/api/errors'
import { changePassword as requestChangePassword, signIn as requestSignIn, signOut as requestSignOut } from '@/api/user'
import { useUserSession } from '@/state/userSession'

export type SystemUserRole = 'admin' | 'user' | 'guest'
export type UserRole = SystemUserRole | (string & {})

export type User = {
  readonly user: string
  readonly role: UserRole
  readonly isRemote: boolean
  readonly isPasswordExpired: boolean
}

export type SignInErrorReason = 'invalid-credentials' | 'session-conflict' | 'maximum-users'
export class SignInError extends Error {
  readonly reason: SignInErrorReason
  override readonly cause: unknown

  constructor(reason: SignInErrorReason, message: string, cause: unknown) {
    super(message)
    this.name = 'SignInError'
    this.reason = reason
    this.cause = cause
  }
}

const signIn = async (username: string, password: string): Promise<User> => {
  try {
    const data = await requestSignIn(username, password)

    const user: User = {
      user: data.user,
      role: data.permission,
      isRemote: data.isremoteuser,
      isPasswordExpired: data.ispasswordexpired ?? false,
    }

    useUserSession().set(user)

    return user
  } catch (error) {
    if (isApiError(error)) {
      if (error.code === 409) {
        if (error.message.includes('maximum authorized users reached')) {
          throw new SignInError('maximum-users', 'Maximum number of users reached', error)
        }
        throw new SignInError('session-conflict', 'Another user is already logged in', error)
      }
      if (error.code === 401 && error.message.includes('no user role permissions are present')) {
        throw new SignInError('invalid-credentials', error.message, error)
      }
      if ([401, 403].includes(error.code)) {
        throw new SignInError('invalid-credentials', 'Invalid username or password', error)
      }
    }

    throw error
  }
}

const signOut = async (username: string, password: string): Promise<void> => {
  await requestSignOut(username, password)
  useUserSession().remove()
}

export type ChangePasswordResult = { readonly ok: true } | { readonly ok: false; message: string }

const changePassword = async (
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> => {
  const response = await requestChangePassword(username, currentPassword, newPassword)
  if (!response.aasDone) {
    return { ok: false, message: response.aasMsg }
  }
  return { ok: true }
}

export const useUser = () => {
  return {
    signIn,
    signOut,
    changePassword,
  }
}
