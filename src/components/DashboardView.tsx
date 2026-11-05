import React from "react";
import { BarChart3, PieChart, TrendingUp, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Activity, Layers } from "lucide-react";
import { DashboardStats } from "../types";

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, loading }) => {
  if (loading && !stats) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm">
        Loading environmental statistics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-16 text-center text-slate-500 text-sm">
        No statistics available yet.
      </div>
    );
  }

  const resolutionRate = stats.totalReports > 0
    ? Math.round((stats.resolvedIssues / stats.totalReports) * 100)
    : 0;

  return (
    <div className="space-y-8 py-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Environmental Analytics & Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time civic intelligence aggregated across neighborhood hazard reports & AI evaluations
        </p>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Reports</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">{stats.totalReports}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total citizen submissions logged</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Reports This Week</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-teal-700">{stats.reportsThisWeek}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active weekly incident surge</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>High / Critical</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600">{stats.highCritical}</div>
          <div className="text-[11px] text-slate-500 mt-1">Prioritized acute ecological hazards</div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-700">{resolutionRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.resolvedIssues} of {stats.totalReports} verified resolved</div>
        </div>
      </div>

      {/* Secondary KPI Cards: Open, In Progress, Resolved, Top Category */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70">
          <span className="text-[11px] font-semibold text-amber-800 uppercase">Open Issues</span>
          <div className="text-2xl font-bold text-amber-900 mt-1">{stats.openIssues}</div>
          <p className="text-[10px] text-amber-700 mt-0.5">Pending or under review</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/70">
          <span className="text-[11px] font-semibold text-blue-800 uppercase">In Progress</span>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</div>
          <p className="text-[10px] text-blue-700 mt-0.5">Sanitation crews dispatched</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/70">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase">Resolved Issues</span>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{stats.resolvedIssues}</div>
          <p className="text-[10px] text-emerald-700 mt-0.5">Site verified remediated</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/70">
          <span className="text-[11px] font-semibold text-purple-800 uppercase">Most Common</span>
          <div className="text-base font-bold text-purple-950 mt-1 truncate" title={stats.mostCommonCategory}>
            {stats.mostCommonCategory}
          </div>
          <p className="text-[10px] text-purple-700 mt-0.5">Primary regional category</p>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Environmental Issue Categories
            </h3>
            <span className="text-xs text-slate-400">Total: {stats.totalReports}</span>
          </div>

          <div className="space-y-3 pt-2">
            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              stats.categoryBreakdown.map((item) => {
                const pct = stats.totalReports > 0 ? Math.round((item.count / stats.totalReports) * 100) : 0;
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{item.category}</span>
                      <span className="text-slate-500">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">No categories recorded yet.</div>
            )}
          </div>
        </div>

        {/* Severity & Status Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          {/* Severity Breakdown */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              AI-Evaluated Severity Distribution
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              {["Critical", "High", "Medium", "Low"].map((sev) => {
                const entry = stats.severityBreakdown.find((s) => s.severity === sev);
                const count = entry ? entry.count : 0;
                const colors = {
                  Critical: "bg-rose-50 border-rose-200 text-rose-800",
                  High: "bg-orange-50 border-orange-200 text-orange-800",
                  Medium: "bg-amber-50 border-amber-200 text-amber-800",
                  Low: "bg-emerald-50 border-emerald-200 text-emerald-800",
                }[sev];

                return (
                  <div key={sev} className={`p-3 rounded-2xl border ${colors} space-y-1`}>
                    <div className="text-lg font-black">{count}</div>
                    <div className="text-[11px] font-semibold">{sev}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Pipeline Distribution */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Status Lifecycle Distribution
            </h3>

            <div className="space-y-2">
              {["Reported", "AI Analyzed", "Under Review", "In Progress", "Resolved"].map((st) => {
                const entry = stats.statusBreakdown.find((s) => s.status === st);
                const count = entry ? entry.count : 0;
                const pct = stats.totalReports > 0 ? Math.round((count / stats.totalReports) * 100) : 0;

                return (
                  <div key={st} className="flex items-center gap-3 text-xs">
                    <span className="w-24 font-medium text-slate-700 truncate">{st}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-500 font-semibold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
