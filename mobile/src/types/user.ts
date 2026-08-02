export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
};

export type AuthTokensResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
};
