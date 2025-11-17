export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
