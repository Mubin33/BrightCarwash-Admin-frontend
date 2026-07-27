export interface Users {
  success: boolean;
  message: string;
  data: Data[];
}

export interface Data {
  user_id: string;
  email: string;
  name: string;
  human_escalation_required: boolean;
  created_at: string;
  updated_at: string;
}
