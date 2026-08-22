export interface StageSummaryData {
    totalLeads: { current: number; lastPeriod: number; percentageChange: number };
    stagedLeads: { current: number; lastPeriod: number; percentageChange: number };
    stagedLeadRate: { current: number; lastPeriod: number; pointDifference: number };
}

export interface StageBreakdownItem {
    stageName: string;
    count: number;
}
export interface LeadStageDatum {
    month: string;
    converted: number;
    contacted: number;
    lost: number;
}
export interface LeadSourceItem {
    source: string;
    count: number;
}

export interface LeadSourcesResponse {
    totalLeads: number;
    eachCount: LeadSourceItem[];
}
export type StageVisibility = Record<string, boolean>;
export interface ReportsState {
    tab: 'lead-conversion' | 'campaign-performance' | 'member-activity';
    period: string;
}

export interface DepositRevenueSummary {
    totalDepositRevenue: { current: number; lastPeriod: number; percentageChange: number };
    paidDeposits: { current: number; lastPeriod: number; percentageChange: number };
    refunded: { current: number; lastPeriod: number; percentageChange: number };
}

export interface DepositRevenueTrendPoint {
    month: string;
    revenue: number;
}

export interface CampaignHighlight {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
}

export interface CampaignTableRow {
    rowNumber: number;
    id: string;
    campaignName: string;
    sent: number;
    openRate: number;
    clickRate: number;
}

export interface CampaignTableResponse {
    data: CampaignTableRow[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface MemberActivityHighlights {
    activeTeamMembers: number;
    avgLeadsPerMember: number;
    mostAssignedMember: {
        name: string;
        assignedCount: number;
    };
}

export interface MemberTableRow {
    id: string;
    firstName: string;
    lastName: string;
    role: string[];
    assigned: number;
    stageBreakdown: Record<string, number>;
}