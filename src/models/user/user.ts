import { isApiError } from '@/api/errors'
import {
  changePassword as requestChangePassword,
  commissioning as requestCommissioning,
  signIn as requestSignIn,
  signOut as requestSignOut,
} from '@/api/user'
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

export type SignInResult =
  | { readonly ok: true; readonly user: User }
  | { readonly ok: false; readonly reason: SignInErrorReason; message?: string }

const signIn = async (username: string, password: string): Promise<SignInResult> => {
  try {
    const data = await requestSignIn(username, password)

    const user: User = {
      user: data.user,
      role: data.permission,
      isRemote: data.isremoteuser,
      isPasswordExpired: data.ispasswordexpired ?? false,
    }

    useUserSession().set(user)

    return { ok: true, user }
  } catch (error) {
    if (isApiError(error)) {
      if (error.code === 409) {
        if (error.message.includes('maximum authorized users reached')) {
          return { ok: false, reason: 'maximum-users' }
        }
        return { ok: false, reason: 'session-conflict' }
      }
      if (error.code === 401 && error.message.includes('no user role permissions are present')) {
        return { ok: false, reason: 'invalid-credentials', message: error.message }
      }
      if ([401, 403].includes(error.code)) {
        return { ok: false, reason: 'invalid-credentials' }
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

export type CommissioningResult = { readonly ok: true } | { readonly ok: false; message: string }
const commissioning = async (username: string, password: string): Promise<CommissioningResult> => {
  const response = await requestCommissioning(username, password)
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
    commissioning,
  }
}
