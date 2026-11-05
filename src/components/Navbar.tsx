import React from "react";
import { Leaf, PlusCircle, LayoutDashboard, ListFilter, Info, BookOpen, Radius } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openReportModal: () => void;
  totalReportsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openReportModal,
  totalReportsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/50 text-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => setCurrentTab("home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-950/40 text-emerald-950 font-bold group-hover:scale-105 transition-transform">
              <img  className="w-10 h-10 object-contain rounded-lg" src="src/voe.jpeg" alt="" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">EcoPulse</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Civic Platform
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 hidden sm:block">Environmental Issue Reporting & Tracking</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-home"
              onClick={() => setCurrentTab("home")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === "home"
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              Home
            </button>
            <button
              id="nav-report"
              onClick={() => setCurrentTab("report")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === "report"
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              Report Issue
            </button>
            <button
              id="nav-issues"
              onClick={() => setCurrentTab("issues")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                currentTab === "issues"
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ListFilter className="w-4 h-4" />
                Issues
                {totalReportsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[11px] rounded-full bg-emerald-500/30 text-emerald-200 font-semibold">
                    {totalReportsCount}
                  </span>
                )}
              </span>
            </button>
            <button
              id="nav-dashboard"
              onClick={() => setCurrentTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === "dashboard"
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </span>
            </button>
            <button
              id="nav-about"
              onClick={() => setCurrentTab("about")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === "about"
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                About
              </span>
            </button>
            <button
              id="nav-guide"
              onClick={() => setCurrentTab("guide")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentTab === "guide"
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-emerald-200 hover:text-white hover:bg-emerald-900/60"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Architecture & Code
              </span>
            </button>
          </nav>

          {/* Header Action */}
          <div className="flex items-center gap-2">
            <button
              id="header-report-btn"
              onClick={openReportModal}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-semibold px-4 py-2 rounded-xl text-sm shadow-md shadow-emerald-950/30 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
              <span className="hidden sm:inline">Report an Issue</span>
              <span className="sm:hidden">Report</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-emerald-900/60 text-xs">
          <button
            onClick={() => setCurrentTab("home")}
            className={`py-1 px-2 rounded font-medium ${currentTab === "home" ? "text-emerald-300 font-bold" : "text-emerald-400/80"}`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab("report")}
            className={`py-1 px-2 rounded font-medium ${currentTab === "report" ? "text-emerald-300 font-bold" : "text-emerald-400/80"}`}
          >
            Report
          </button>
          <button
            onClick={() => setCurrentTab("issues")}
            className={`py-1 px-2 rounded font-medium ${currentTab === "issues" ? "text-emerald-300 font-bold" : "text-emerald-400/80"}`}
          >
            Issues ({totalReportsCount})
          </button>
          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`py-1 px-2 rounded font-medium ${currentTab === "dashboard" ? "text-emerald-300 font-bold" : "text-emerald-400/80"}`}
          >
            Stats
          </button>
          <button
            onClick={() => setCurrentTab("about")}
            className={`py-1 px-2 rounded font-medium ${currentTab === "about" ? "text-emerald-300 font-bold" : "text-emerald-400/80"}`}
          >
            About
          </button>
          <button
            onClick={() => setCurrentTab("guide")}
            className={`py-1 px-2 rounded font-medium ${currentTab === "guide" ? "text-emerald-300 font-bold" : "text-emerald-400/80"}`}
          >
            Guide
          </button>
        </div>
      </div>
    </header>
  );
};
