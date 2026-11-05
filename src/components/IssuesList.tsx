import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, RefreshCw, X, PlusCircle } from "lucide-react";
import { EnvironmentalReport, IssueCategory, IssueSeverity, IssueStatus } from "../types";
import { IssueCard } from "./IssueCard";

interface IssuesListProps {
  reports: EnvironmentalReport[];
  loading: boolean;
  onRefresh: () => void;
  onSelectReport: (report: EnvironmentalReport) => void;
  onSupport: (reportId: number) => Promise<void>;
  onOpenReportModal: () => void;
}

const CATEGORIES: string[] = [
  "All",
  "Waste Management",
  "Plastic Waste",
  "Water Pollution",
  "Air Pollution",
  "Sewage Problems",
  "Illegal Dumping",
  "Tree/Environmental Damage",
  "Blocked Drains",
  "Excessive Littering",
  "Other",
];

const SEVERITIES: string[] = ["All", "Critical", "High", "Medium", "Low"];
const STATUSES: string[] = ["All", "Reported", "AI Analyzed", "Under Review", "In Progress", "Resolved"];

export const IssuesList: React.FC<IssuesListProps> = ({
  reports,
  loading,
  onRefresh,
  onSelectReport,
  onSupport,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "priority" | "supports">("newest");

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        // Search filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = report.title.toLowerCase().includes(term);
          const matchDesc = report.description.toLowerCase().includes(term);
          const matchLoc = report.location.toLowerCase().includes(term);
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        // Category filter
        if (selectedCategory !== "All" && report.category !== selectedCategory) {
          return false;
        }

        // Severity filter
        if (selectedSeverity !== "All" && report.severity !== selectedSeverity) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "All" && report.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "supports") {
          return (b.support_count || 0) - (a.support_count || 0);
        }
        if (sortBy === "priority") {
          const priorityScore = { High: 3, Medium: 2, Low: 1 };
          return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
        }
        // default: newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [reports, searchTerm, selectedCategory, selectedSeverity, selectedStatus, sortBy]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "All" ||
    selectedSeverity !== "All" ||
    selectedStatus !== "All";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedSeverity("All");
    setSelectedStatus("All");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6 py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Community Environmental Issues
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, search, and track citizen-reported hazards analyzed by Google Gemini AI
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh issues"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="All">All Severities</option>
              {SEVERITIES.filter((s) => s !== "All").map((s) => (
                <option key={s} value={s}>
                  {s} Severity
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="newest">Sort: Newest</option>
                <option value="priority">Sort: Highest Priority</option>
                <option value="supports">Sort: Most Supported</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Status:</span>
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> environmental reports
        </span>
      </div>

      {/* Grid of Issues */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => (
            <IssueCard
              key={report.id}
              report={report}
              onSelect={onSelectReport}
              onSupport={onSupport}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No matching environmental reports</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No reports match your current search query or filter criteria. Try adjusting filters or submit a new report.
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          ) : (
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs hover:bg-emerald-800 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Submit the First Report
            </button>
          )}
        </div>
      )}
    </div>
  );
};
