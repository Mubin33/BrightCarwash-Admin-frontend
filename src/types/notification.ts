export interface notificationInterfece {
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
  recipient: string
  title: string
  body: string
  channel: string
  status: string
  metadata: Metadata
  error_logs: any
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface Metadata {
  leadId: string
  assignedToId?: string
}

export interface Meta {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next_page: boolean
  has_prev_page: boolean
}
