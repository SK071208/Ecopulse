import React, { useState } from "react";
import { ThumbsUp, MapPin, Calendar, Clock, AlertCircle, ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";
import { EnvironmentalReport, IssueSeverity, IssueStatus } from "../types";

interface IssueCardProps {
  report: EnvironmentalReport;
  onSelect: (report: EnvironmentalReport) => void;
  onSupport: (reportId: number) => Promise<void>;
}

const severityConfig: Record<IssueSeverity, { bg: string; text: string; dot: string }> = {
  Critical: { bg: "bg-rose-50 border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  High: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", dot: "bg-orange-500" },
  Medium: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  Low: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const statusConfig: Record<IssueStatus, { bg: string; text: string; iconBg: string }> = {
  Reported: { bg: "bg-slate-100", text: "text-slate-700", iconBg: "bg-slate-400" },
  "AI Analyzed": { bg: "bg-teal-50 text-teal-800 border-teal-200", text: "text-teal-800", iconBg: "bg-teal-500" },
  "Under Review": { bg: "bg-blue-50 text-blue-800 border-blue-200", text: "text-blue-800", iconBg: "bg-blue-500" },
  "In Progress": { bg: "bg-amber-50 text-amber-800 border-amber-200", text: "text-amber-800", iconBg: "bg-amber-500" },
  Resolved: { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", text: "text-emerald-800", iconBg: "bg-emerald-500" },
};

export const IssueCard: React.FC<IssueCardProps> = ({ report, onSelect, onSupport }) => {
  const [isSupporting, setIsSupporting] = useState(false);
  const [hasSupported, setHasSupported] = useState(false);

  const severityStyle = severityConfig[report.severity] || severityConfig.Medium;
  const statusStyle = statusConfig[report.status] || statusConfig.Reported;

  const handleSupportClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSupporting || hasSupported) return;
    setIsSupporting(true);
    try {
      await onSupport(report.id);
      setHasSupported(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupporting(false);
    }
  };

  const formattedDate = new Date(report.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      id={`report-card-${report.id}`}
      onClick={() => onSelect(report)}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/70 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            {report.category}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Priority Badge */}
            <span
              className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                report.priority === "High"
                  ? "bg-rose-100 text-rose-800"
                  : report.priority === "Medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Priority: {report.priority}
            </span>

            {/* Severity Badge */}
            <span
              className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border text-[11px] ${severityStyle.bg} ${severityStyle.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot}`} />
              {report.severity}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {report.title}
        </h3>

        {/* AI Summary Box */}
        {report.ai_summary && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-800 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Assessment Summary:</span>
            </div>
            <p className="line-clamp-2 leading-relaxed text-slate-700">
              {report.ai_summary}
            </p>
          </div>
        )}

        {/* Location & Reporter */}
        <div className="space-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-700 font-medium">{report.location}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>Reported {formattedDate}</span>
            {report.reporter_name && (
              <>
                <span>•</span>
                <span className="truncate">by {report.reporter_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Status and Support Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusStyle.iconBg}`} />
            {report.status}
          </span>
        </div>

        {/* Support Button */}
        <button
          type="button"
          onClick={handleSupportClick}
          disabled={isSupporting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            hasSupported
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300"
          }`}
          title="Support this report to escalate attention"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasSupported ? "fill-emerald-700 text-emerald-700" : ""}`} />
          <span>{report.support_count || 0}</span>
          <span className="hidden sm:inline font-medium text-[11px] text-slate-500">
            {hasSupported ? "Supported" : "Support"}
          </span>
        </button>
      </div>
    </div>
  );
};
