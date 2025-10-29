export interface LoginResponse {
  access_token: string;
  user: TypeUser;
}

export interface TypeMenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}