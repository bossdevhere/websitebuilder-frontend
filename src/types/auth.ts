export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    is_demo?: boolean;
    [key: string]: any;
  };
  app_metadata?: Record<string, any>;
  aud?: string;
  is_demo?: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: AuthUser;
  [key: string]: any;
}

export interface AuthResponse {
  message: string;
  user: any;
  session: any;
}
