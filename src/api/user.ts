import { publicHttp } from './http'

export type UserSignInResponse = {
  readonly user: string
  readonly permission: string
  readonly isremoteuser: boolean
  readonly ispasswordexpired?: boolean
}

export const signIn = async (username: string, password: string): Promise<UserSignInResponse> => {
  const url = '/api/login'
  const { data } = await publicHttp.post<UserSignInResponse>(url, {
    json: { username, password },
    timeout: 2 * 60 * 1000,
  })

  return data
}

export const signOut = async (username: string, password: string): Promise<void> => {
  const url = '/api/logout'
  await publicHttp.post(url, {
    json: { username, password, logoutUser: username },
    timeout: 2 * 60 * 1000,
  })
}
