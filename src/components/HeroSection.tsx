import React from "react";
import { PlusCircle, ArrowRight, ShieldCheck, Cpu, Users, CheckCircle2, AlertTriangle, Droplets, Trash2, Wind } from "lucide-react";
import { EnvironmentalReport, DashboardStats } from "../types";

interface HeroSectionProps {
  stats: DashboardStats | null;
  recentReports: EnvironmentalReport[];
  onReportClick: () => void;
  onExploreClick: () => void;
  onSelectReport: (report: EnvironmentalReport) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  recentReports,
  onReportClick,
  onExploreClick,
  onSelectReport,
}) => {
  return (
    <div className="space-y-16 py-6">
      {/* Primary Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white p-8 sm:p-12 lg:p-16 border border-emerald-800/60 shadow-xl shadow-emerald-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Civic Environmental Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Report Environmental Problems. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Help Create a Cleaner Community.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
            EcoTrack connects proactive citizens with environmental authorities. Report garbage dumping, water pollution, blocked drains, or toxic discharges. Google Gemini AI immediately assesses the severity, identifies ecological hazards, and tracks resolution from submission to cleanup.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-report-btn"
              onClick={onReportClick}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-emerald-950 font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/20 active:scale-95 transition-all text-base cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              Report an Issue
            </button>

            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="flex items-center gap-2 bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold px-6 py-3.5 rounded-2xl border border-emerald-700/60 transition-all text-base hover:border-emerald-500 cursor-pointer"
            >
              Explore Public Issues
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Pillar Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-emerald-800/50 text-xs text-emerald-200">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gemini AI Severity & Impact Evaluation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Community Upvotes & Public Transparency</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Step-by-Step Verified Resolution Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Statistics Bar */}
      {stats && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Reports</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.totalReports}</div>
            <div className="text-xs text-slate-500 mt-1">Verified community issues logged</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>This Week</span>
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{stats.reportsThisWeek}</div>
            <div className="text-xs text-slate-500 mt-1">New citizen alerts in past 7 days</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>High / Critical</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            </div>
            <div className="text-3xl font-extrabold text-rose-600">{stats.highCritical}</div>
            <div className="text-xs text-slate-500 mt-1">Prioritized by Gemini risk matrix</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Resolved</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">{stats.resolvedIssues}</div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.totalReports > 0
                ? `${Math.round((stats.resolvedIssues / stats.totalReports) * 100)}% resolution rate`
                : "Active cleanup underway"}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How EcoTrack Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From reporting an environmental hazard to verified municipal resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-4 text-base">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Person Reports Problem</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit description, location details, and optional photo. No complex login or password required.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center mb-4 text-base">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">AI Analyzes Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini evaluates ecological risks, determines severity (Low to Critical), and suggests recommended actions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center mb-4 text-base">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Community Tracks Status</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Issue appears on the civic dashboard. Residents upvote urgent problems to escalate authority attention.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mb-4 text-base">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Marked as Resolved</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cleanup teams address the issue and log status milestones along a transparent public timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Reports Showcase */}
      {recentReports.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recent Community Reports</h2>
              <p className="text-xs sm:text-sm text-slate-500">Live environmental issues reported across neighborhood zones</p>
            </div>
            <button
              onClick={onExploreClick}
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              View all issues
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recentReports.slice(0, 3).map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {report.category}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        report.severity === "Critical"
                          ? "bg-rose-100 text-rose-700"
                          : report.severity === "High"
                          ? "bg-orange-100 text-orange-700"
                          : report.severity === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {report.severity}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {report.ai_summary || report.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[160px] font-medium text-slate-600">
                    📍 {report.location}
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative max-w-2xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Spotted an environmental hazard in your neighborhood?
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Every report makes a measurable difference. Help civic teams detect hazards early before they contaminate local water, damage biodiversity, or impact public health.
          </p>
          <button
            onClick={onReportClick}
            className="inline-flex items-center gap-2 bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-6 py-3 rounded-xl shadow-md text-sm cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
            Submit a Report Now
          </button>
        </div>
      </section>
    </div>
  );
};
