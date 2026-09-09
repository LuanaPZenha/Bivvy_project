export type UserRole = 'renter' | 'owner' | 'both';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: UserRole;
  acceptedTermsAt?: string | null;
  createdAt?: string;
};

export type AuthTokensResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
};
