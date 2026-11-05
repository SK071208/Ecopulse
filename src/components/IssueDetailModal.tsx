import React, { useState } from "react";
import { X, MapPin, Calendar, User, Sparkles, ThumbsUp, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight, Clock, RefreshCw } from "lucide-react";
import { EnvironmentalReport, IssueStatus, IssueSeverity } from "../types";

interface IssueDetailModalProps {
  report: EnvironmentalReport;
  onClose: () => void;
  onStatusUpdate: (reportId: number, newStatus: IssueStatus, notes?: string) => Promise<void>;
  onSupport: (reportId: number) => Promise<void>;
}

const STATUS_PIPELINE: IssueStatus[] = [
  "Reported",
  "AI Analyzed",
  "Under Review",
  "In Progress",
  "Resolved",
];

const severityBadgeMap: Record<IssueSeverity, { bg: string; text: string; border: string }> = {
  Critical: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  High: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  Medium: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  Low: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
};

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  report,
  onClose,
  onStatusUpdate,
  onSupport,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>(report.status);
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const currentStatusIndex = STATUS_PIPELINE.indexOf(report.status);
  const severityStyle = severityBadgeMap[report.severity] || severityBadgeMap.Medium;

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === report.status && !statusNote.trim()) return;

    setIsUpdating(true);
    setUpdateMessage(null);
    try {
      await onStatusUpdate(report.id, selectedStatus, statusNote.trim() || undefined);
      setStatusNote("");
      setUpdateMessage(`Status updated to "${selectedStatus}".`);
      setTimeout(() => setUpdateMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setUpdateMessage("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = new Date(report.created_at).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-2 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {report.category}
              </span>
              <span
                className={`font-bold text-xs px-2.5 py-1 rounded-md border ${severityStyle.bg} ${severityStyle.text} ${severityStyle.border}`}
              >
                Severity: {report.severity}
              </span>
              <span
                className={`font-semibold text-xs px-2 py-0.5 rounded-md ${
                  report.priority === "High"
                    ? "bg-rose-100 text-rose-800"
                    : report.priority === "Medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                Priority: {report.priority}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {report.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {report.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Reporter: {report.reporter_name || "Anonymous Citizen"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Status Pipeline Progress Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lifecycle Milestone Progress
            </h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {STATUS_PIPELINE.map((st, idx) => {
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div key={st} className="flex flex-col items-center space-y-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCurrent
                          ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] leading-tight font-semibold ${
                        isCurrent ? "text-emerald-800 font-bold" : isPassed ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description & Image Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`space-y-4 ${report.image_path ? "md:col-span-2" : "md:col-span-3"}`}>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Citizen Observation
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {report.description}
                </div>
              </div>

              {/* Community Support */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                <div className="text-xs text-emerald-950 font-medium">
                  <span className="font-bold text-emerald-900">{report.support_count || 0} community members</span> have supported this report.
                </div>
                <button
                  type="button"
                  onClick={() => onSupport(report.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Support Issue
                </button>
              </div>
            </div>

            {/* Optional Image */}
            {report.image_path && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Uploaded Photo
                </h3>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={report.image_path}
                    alt="Report photo"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gemini AI Analysis Section */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-950 text-emerald-50 p-6 sm:p-7 space-y-5 border border-emerald-800/80 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Google Gemini AI Assessment</h3>
                  <p className="text-[11px] text-emerald-300/80">Structured environmental evaluation & decision support</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Neutral Assessment Standard
              </div>
            </div>

            {/* AI Summary */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Summary
              </span>
              <p className="text-sm text-emerald-100 leading-relaxed">
                {report.ai_summary || "Automated analysis completed by EcoTrack AI."}
              </p>
            </div>

            {/* Environmental Impact & Recommended Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-800/40 space-y-1.5">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Potential Ecological & Health Impact
                </span>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {report.environmental_impact || "Potential localized environmental hazard requiring remediation."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-800/40 space-y-1.5">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recommended Action
                </span>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {report.recommended_action || "Schedule municipal team inspection."}
                </p>
              </div>
            </div>

            {/* Actionability & Neutrality Footnote */}
            <div className="pt-2 border-t border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-400/90">
              <span>
                <strong>Field Actionability:</strong>{" "}
                {report.actionable ? "Adequate location and observable details provided." : "Additional details requested."}{" "}
                {report.actionable_reason && `(${report.actionable_reason})`}
              </span>
              <span className="text-emerald-300/60 italic">
                AI assists decision-making; authority verification required.
              </span>
            </div>
          </div>

          {/* Status History & Update Tool */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* History Timeline */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Status History
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {report.history && report.history.length > 0 ? (
                  report.history.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{h.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
                          {new Date(h.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {h.notes && <p className="text-slate-600 text-[11px]">{h.notes}</p>}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">No status updates logged yet.</div>
                )}
              </div>
            </div>

            {/* Update Status Tool */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Update Issue Status
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Advance through the lifecycle or add official inspection notes.
                </p>
              </div>

              {updateMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-medium">
                  {updateMessage}
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="modal-status-select" className="block text-[11px] font-bold text-slate-600">
                    New Status
                  </label>
                  <select
                    id="modal-status-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as IssueStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {STATUS_PIPELINE.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="modal-status-notes" className="block text-[11px] font-bold text-slate-600">
                    Milestone Notes (Optional)
                  </label>
                  <input
                    id="modal-status-notes"
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g., Sanitation crew dispatched with collection truck."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving Update...
                    </>
                  ) : (
                    "Apply Status Change"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Report ID: #{report.id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
