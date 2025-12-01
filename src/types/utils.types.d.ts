export interface LoginResponse {
  access_token: string;
  user: TypeUser;
}

export interface TypeMenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

export interface TypeParamsGet {
  page: number;
  limit: number;
  search: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}