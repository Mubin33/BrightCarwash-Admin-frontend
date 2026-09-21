export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  service: string;
  vehicle: string;
  source: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deposit: number;
  depositStatus: "PENDING" | "PAID" | "NONE";
  stage: string;
  stageId: string;
  stageIcon: string | null;
  assignedToId: string | null;
  notes: string[];
  date: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  service: string;
  vehicle: string;
  source: string;
  priority: Lead["priority"];
  deposit_status: Lead["depositStatus"];
  stage_name?: string;
  stage?: string;
  notes?: string[];
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
  assigned_to_id?: string;
}

export interface LeadApiResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  vehicle: string;
  source: string;
  priority: string;
  deposit_status: string;
  stage_id: string;

  stage?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };

  stageIcon?: string | null;
  assigned_to_id?: string | null;
  notes?: string[];
  created_at: string;
}

// ----

export interface LeadGroup {
  id: string;
  name: string;
  // Add your existing LeadGroup fields here
}

export interface LeadGroupsListResponse {
  success: boolean;
  data: {
    groups: LeadGroup[];
  };
}

// Lead Filter Types

export interface LeadFilterStage {
  id: string;
  name: string;
}

export interface LeadFilterDepositStatus {
  status: string;
  count: number;
}

export interface LeadFilterSource {
  source: string;
  count: number;
}

export interface LeadFilterPriority {
  priority: string;
  count: number;
}

export interface LeadFilterOptions {
  stages: LeadFilterStage[];
  deposit_statuses: LeadFilterDepositStatus[];
  sources: LeadFilterSource[];
  priorities: LeadFilterPriority[];
}

export interface LeadFilterOptionsResponse {
  success: boolean;
  data: LeadFilterOptions;
}

export type LeadDepositStatus = Lead["depositStatus"];
export type LeadStage = string;
