export type IssueCategory =
  | "Waste Management"
  | "Plastic Waste"
  | "Water Pollution"
  | "Air Pollution"
  | "Sewage Problems"
  | "Illegal Dumping"
  | "Tree/Environmental Damage"
  | "Blocked Drains"
  | "Excessive Littering"
  | "Other";

export type IssueStatus =
  | "Reported"
  | "AI Analyzed"
  | "Under Review"
  | "In Progress"
  | "Resolved";

export type IssueSeverity = "Low" | "Medium" | "High" | "Critical";

export type IssuePriority = "Low" | "Medium" | "High";

export interface StatusHistoryEntry {
  id: number;
  report_id: number;
  status: IssueStatus;
  notes?: string;
  timestamp: string;
}

export interface EnvironmentalReport {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  image_path?: string | null;
  reporter_name?: string;
  created_at: string;
  status: IssueStatus;
  severity: IssueSeverity;
  priority: IssuePriority;
  ai_summary?: string;
  environmental_impact?: string;
  recommended_action?: string;
  actionable?: number | boolean;
  actionable_reason?: string;
  support_count: number;
  history?: StatusHistoryEntry[];
}

export interface DashboardStats {
  totalReports: number;
  reportsThisWeek: number;
  openIssues: number;
  inProgress: number;
  resolvedIssues: number;
  highCritical: number;
  mostCommonCategory: string;
  categoryBreakdown: { category: string; count: number }[];
  severityBreakdown: { severity: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
}
