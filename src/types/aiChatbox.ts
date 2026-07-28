export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    next?: string | null;
    previous?: string | null;
    page_size?: number;
  };
};

export type ChatUser = {
  id: string;
  name: string;
  email: string;
  lastActive: string;
};

export type ChatSession = {
  id: string;
  date: string;
  label: string;
  preview: string;
};

export type ChatMessage = {
  sender: "bot" | "user";
  text: string;
  time: string;
};

export type ApiUser = {
  user_id: string;
  name?: string | null;
  email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type GetUsersParams = {
  cursor?: string;
  pageSize?: number;
  search?: string;
};

export type ApiSession = {
  session_id: string;
  status?: string | null;
  last_message?: string | null;
  preview?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ApiMessage = {
  role?: string | null;
  sender?: string | null;
  content?: string | null;
  message?: string | null;
  text?: string | null;
  created_at?: string | null;
  timestamp?: string | null;
};
