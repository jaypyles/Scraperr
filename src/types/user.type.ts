export type User = {
  isAuthenticated: boolean;
  email?: string;
  username?: string;
  loading: boolean;
  error: string | null;
  full_name?: string;
};
