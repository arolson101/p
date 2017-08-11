import { ipcRenderer } from 'electron'
import { OAuthConfig, OAuthOptions, Token, OAuthInterface } from 'util/oauth'

interface Reply {
  token: Token
  error: string
}

let oauthChannelIndex = 0

export const oauthGetAccessToken = async (config: OAuthConfig, options: OAuthOptions): Promise<Token> => {
  return new Promise<Token>((resolve, reject) => {
    const channel = `oauth-reply-${oauthChannelIndex++}`
    ipcRenderer.send('oauth-getAccessToken', { config, options, channel })
    ipcRenderer.once(channel, (event: string, reply: Reply) => {
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
    ipcRenderer.once(channel, (event: string, reply: Reply) => {
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

export const oauthElectron: OAuthInterface = {
  oauthGetAccessToken,
  oauthRefreshToken
}
