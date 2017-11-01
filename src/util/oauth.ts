
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

export interface OAuthInterface {
  oauthGetAccessToken: (config: OAuthConfig, options: OAuthOptions) => Promise<Token>
  oauthRefreshToken: (config: OAuthConfig, refreshToken: string) => Promise<Token>
}
