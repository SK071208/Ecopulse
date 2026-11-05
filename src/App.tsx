import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { IssuesList } from "./components/IssuesList";
import { ReportIssueForm } from "./components/ReportIssueForm";
import { IssueDetailModal } from "./components/IssueDetailModal";
import { DashboardView } from "./components/DashboardView";
import { AboutSection } from "./components/AboutSection";
import { GuideSection } from "./components/GuideSection";
import { EnvironmentalReport, DashboardStats, IssueStatus } from "./types";
import { Leaf, ShieldCheck, Heart, Sparkles, Check } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const [reports, setReports] = useState<EnvironmentalReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<EnvironmentalReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchReports(), fetchStats()]);
    setLoading(false);
  }, [fetchReports, fetchStats]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle support / upvote
  const handleSupport = async (reportId: number) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/support`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, support_count: data.support_count } : r
          )
        );
        if (selectedReport && selectedReport.id === reportId) {
          setSelectedReport((prev) =>
            prev ? { ...prev, support_count: data.support_count } : null
          );
        }
        showToast("Community support recorded!");
      }
    } catch (err) {
      console.error("Error supporting report:", err);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (reportId: number, newStatus: IssueStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? data.report : r))
        );
        setSelectedReport(data.report);
        fetchStats();
        showToast(`Report #${reportId} status changed to "${newStatus}".`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle new report submission success
  const handleReportSuccess = (newReport: EnvironmentalReport) => {
    setReports((prev) => [newReport, ...prev]);
    fetchStats();
    setIsReportModalOpen(false);
    setSelectedReport(newReport);
    showToast("Incident report successfully analyzed and added to EcoTrack!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950 text-emerald-100 shadow-xl border border-emerald-700/80 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openReportModal={() => setIsReportModalOpen(true)}
        totalReportsCount={reports.length}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentTab === "home" && (
          <HeroSection
            stats={stats}
            recentReports={reports}
            onReportClick={() => setIsReportModalOpen(true)}
            onExploreClick={() => setCurrentTab("issues")}
            onSelectReport={(r) => setSelectedReport(r)}
          />
        )}

        {currentTab === "report" && (
          <ReportIssueForm
            onSuccess={handleReportSuccess}
            onCancel={() => setCurrentTab("home")}
          />
        )}

        {currentTab === "issues" && (
          <IssuesList
            reports={reports}
            loading={loading}
            onRefresh={refreshAllData}
            onSelectReport={(r) => setSelectedReport(r)}
            onSupport={handleSupport}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {currentTab === "dashboard" && (
          <DashboardView stats={stats} loading={loading} />
        )}

        {currentTab === "about" && (
          <AboutSection
            onReportClick={() => setIsReportModalOpen(true)}
            onExploreClick={() => setCurrentTab("issues")}
          />
        )}

        {currentTab === "guide" && <GuideSection />}
      </main>

      {/* Report Modal (Triggered from anywhere) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl">
            <ReportIssueForm
              onSuccess={handleReportSuccess}
              onCancel={() => setIsReportModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedReport && (
        <IssueDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={handleStatusUpdate}
          onSupport={handleSupport}
        />
      )}

      {/* Modern Civic Environmental Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
                <img src="src/voe.jpeg" alt="" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900">EcoPulse</span>
                <p className="text-[11px] text-slate-400">Environmental Issue Reporting & Tracking Platform</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
              <button onClick={() => setCurrentTab("home")} className="hover:text-emerald-700 cursor-pointer">Home</button>
              <button onClick={() => setCurrentTab("report")} className="hover:text-emerald-700 cursor-pointer">Report Issue</button>
              <button onClick={() => setCurrentTab("issues")} className="hover:text-emerald-700 cursor-pointer">Browse Issues</button>
              <button onClick={() => setCurrentTab("dashboard")} className="hover:text-emerald-700 cursor-pointer">Dashboard</button>
              <button onClick={() => setCurrentTab("about")} className="hover:text-emerald-700 cursor-pointer">About</button>
              <button onClick={() => setCurrentTab("guide")} className="hover:text-emerald-700 cursor-pointer">Architecture & Code</button>
            </div>

            <div className="text-[11px] text-slate-400 text-center sm:text-right">
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
