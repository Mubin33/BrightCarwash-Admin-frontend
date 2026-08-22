import type { DepositRevenueSummary, DepositRevenueTrendPoint, StageSummaryData, StageBreakdownItem, LeadSourceItem, LeadStageDatum } from '@/types/reports';

export const mockStageSummary: StageSummaryData = {
    totalLeads: { current: 20, lastPeriod: 0, percentageChange: 100 },
    stagedLeads: { current: 0, lastPeriod: 0, percentageChange: 0 },
    stagedLeadRate: { current: 0, lastPeriod: 0, pointDifference: 0 },
};

export const mockStageBreakdown: StageBreakdownItem[] = [
    { stageName: 'New', count: 10 },
    { stageName: 'Contacted', count: 5 },
    { stageName: 'Converted', count: 3 },
    { stageName: 'Lost', count: 2 },
];

export const mockLeadSources: LeadSourceItem[] = [
    { source: 'Google Search', count: 4 },
    { source: 'Referral', count: 3 },
    { source: 'Facebook Ads', count: 3 },
    { source: 'Walk-in', count: 2 },
];

export const mockLeadStageData: LeadStageDatum[] = [
    { month: 'Jan', converted: 360, contacted: 560, lost: 270 },
    { month: 'Feb', converted: 650, contacted: 870, lost: 760 },
    { month: 'Mar', converted: 720, contacted: 560, lost: 410 },
    { month: 'Apr', converted: 330, contacted: 150, lost: 480 },
    { month: 'May', converted: 820, contacted: 1180, lost: 700 },
    { month: 'Jun', converted: 390, contacted: 420, lost: 580 },
];


export const mockDepositRevenueSummary: DepositRevenueSummary = {
    totalDepositRevenue: { current: 12450, lastPeriod: 10200, percentageChange: 22 },
    paidDeposits: { current: 89, lastPeriod: 72, percentageChange: 23 },
    refunded: { current: 5, lastPeriod: 8, percentageChange: -37 },
};

export const mockDepositRevenueTrend: DepositRevenueTrendPoint[] = [
    { month: 'Jan', revenue: 1800 },
    { month: 'Feb', revenue: 2100 },
    { month: 'Mar', revenue: 1950 },
    { month: 'Apr', revenue: 2400 },
    { month: 'May', revenue: 2200 },
    { month: 'Jun', revenue: 2000 },
];