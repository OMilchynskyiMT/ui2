import { http, publicHttp } from './http'

export type UserSignInResponse = {
  readonly user: string
  readonly permission: string
  readonly isremoteuser: boolean
  readonly ispasswordexpired?: boolean
}

export type PamRequest = {
  username: string
  aasAnswer?: string
  aasID?: string
}

export type PamResponse = {
  aasDone: boolean
  aasType: string
  aasMsg: string
  aasID: string
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
  await http.post(url, {
    json: { username, password, logoutUser: username },
    timeout: 2 * 60 * 1000,
  })
}

const sendPasswdRequest = async (request: PamRequest): Promise<PamResponse> => {
  const { data } = await http.post<PamResponse>('/api/command/passwd', {
    json: request,
  })

  return data
}

export const changePassword = async (
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<PamResponse> => {
  let response = await sendPasswdRequest({ username })
  if (response.aasMsg.includes('Current password')) {
    response = await sendPasswdRequest({
      username,
      aasID: response.aasID,
      aasAnswer: currentPassword,
    })
  }

  if (response.aasMsg.includes('New password')) {
    response = await sendPasswdRequest({
      username,
      aasID: response.aasID,
      aasAnswer: newPassword,
    })
  }

  if (response.aasMsg.includes('Retype new password')) {
    response = await sendPasswdRequest({
      username,
      aasID: response.aasID,
      aasAnswer: newPassword,
    })
  }

  return response
}
