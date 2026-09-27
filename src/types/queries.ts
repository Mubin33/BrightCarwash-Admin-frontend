export interface quoteInterfece {
  success: boolean
  message: string
  data: Data
}

export interface Data {
  items: Item[]
  meta: Meta
}

export interface Item {
  id: string
  created_at: string
  updated_at: string
  full_name: string
  email: string
  phone: string
  vehicle: string
  status: string
  description: string | null | unknown
  date: string
}

export interface Meta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface QuoteDetail {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string;
  vehicle: string;
  status: string;
  description: string | null;
  date: string;
  message?: string;
}

export interface QuoteDetailResponse {
  success: boolean;
  message: string;
  data: QuoteDetail;
}
