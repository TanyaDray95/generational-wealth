export type View = 'dashboard' | 'upload' | 'documents' | 'chat';

export interface IncomeStatementItem {
  metric: string;
  percentageChange: number;
  currentValue: number;
  previousValue: number;
  previousPeriod: string;
  currentPeriod: string;
}

export interface QualityRating {
  factor: string;
  rating: number; // 1-5
}

export interface FinancialRatio {
  metric: string;
  value: string;
  description: string;
}

export interface ValuationMetric {
  label: string;
  value: string;
}

export interface DCFAnalysis {
  currentEarnings: string;
  shortTermGrowth: string;
  longTermGrowth: string;
  discountRate: string;
  terminalMultiple: string;
  timePeriod: string;
  intrinsicValue: string;
  simpleValuation: string;
}

export interface ValuationRatios {
  dividendYield: string;
  eps: string;
  peRatio: string;
}

export interface FinancialPerformanceData {
  title: string;
  subtitle: string;
  asOfDate: string;
  keyMetrics: IncomeStatementItem[];
  quality: QualityRating[];
  financials: IncomeStatementItem[];
  financialRatios: FinancialRatio[];
  pros: string[];
  cons: string[];
  valuation: {
    fcfScenario1: ValuationMetric[];
    fcfScenario2: ValuationMetric[];
    achievability: 'Low' | 'Medium' | 'High';
    fairValue: string;
    undervaluationPercent: number;
  };
  dcfAnalysis: DCFAnalysis;
  valuationRatios: ValuationRatios;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Added missing types for chart components to prevent build errors
export interface BalanceSheetItem {
  metric: string;
  value: number;
  barPercentage: number;
  changes: Array<{ value: number; isPositive: boolean }>;
}

export interface PerformanceDonutChartData {
  title: string;
  segments: Array<{ label: string; value: number; color: string }>;
}

export interface PerformanceMetric {
  title: string;
  type: 'bar' | 'bullet';
  value?: string;
  percentageChange?: number;
  actual?: number;
  target?: number;
}