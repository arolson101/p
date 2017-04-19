import { ipcRenderer } from 'electron'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  authorizationUrl: string
  tokenUrl: string
  useBasicAuthorizationHeader: boolean
  redirectUri: string
}

export interface OAuthOptions {
  scope: string
  accessType: string
}

export interface Token {
  access_token: string
  refresh_token: string
  expires_in?: number
  expiry_date: number
  token_type: string
}

interface Reply {
  token: Token
  error: string
}

let oauthChannelIndex = 0

export const oauthGetAccessToken = async (config: OAuthConfig, options: OAuthOptions): Promise<Token> => {
  return new Promise<Token>((resolve, reject) => {
    const channel = `oauth-reply-${oauthChannelIndex++}`
    ipcRenderer.send('oauth-getAccessToken', { config, options, channel })
    ipcRenderer.once(channel, (event, reply: Reply) => {
      if (reply.error) {
        reject(new Error(reply.error))
      } else {
        fixToken(reply.token)
        resolve(reply.token)
      }
    })
  })
}

export const oauthRefreshToken = async (config: OAuthConfig, refreshToken: string): Promise<Token> => {
  return new Promise<Token>((resolve, reject) => {
    const channel = `oauth-reply-${oauthChannelIndex++}`
    ipcRenderer.send('oauth-refreshToken', { config, refreshToken, channel })
    ipcRenderer.once(channel, (event, reply: Reply) => {
      if (reply.error) {
        reject(new Error(reply.error))
      } else {
        fixToken(reply.token)
        resolve(reply.token)
      }
    })
  })
}

const fixToken = (token: Token) => {
  if (token && token.expires_in) {
    token.expiry_date = ((new Date()).getTime() + (token.expires_in * 1000))
    delete token.expires_in
  }
}
