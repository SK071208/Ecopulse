import React from "react";
import { ShieldCheck, Leaf, Cpu, Database, Eye, CheckCircle2, ArrowRight } from "lucide-react";

interface AboutSectionProps {
  onReportClick: () => void;
  onExploreClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onReportClick, onExploreClick }) => {
  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      {/* Overview Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white space-y-4 border border-emerald-800 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <Leaf className="w-3.5 h-3.5" />
          Mission & Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          About EcoTrack
        </h1>
        <p className="text-emerald-100 text-base leading-relaxed">
          EcoTrack is a modern civic environmental platform designed to bridge community vigilance with municipal action. By combining easy, barrier-free reporting with Google Gemini AI assessment, EcoTrack organizes citizen reports into actionable, prioritized intelligence for rapid remediation.
        </p>
      </div>

      {/* Core Workflow */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          The 5-Stage Issue Workflow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          {[
            { step: "1", title: "Reported", desc: "Citizen submits hazard description, landmark, and optional photo." },
            { step: "2", title: "AI Analyzed", desc: "Gemini evaluates severity, ecological risks, and recommended action." },
            { step: "3", title: "Under Review", desc: "Municipal/civic team acknowledges and schedules site inspection." },
            { step: "4", title: "In Progress", desc: "Cleanup crews, earthmovers, or drainage teams are actively deployed." },
            { step: "5", title: "Resolved", desc: "Site verified clean; transparent milestone recorded on timeline." },
          ].map((item) => (
            <div key={item.step} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center mx-auto text-xs">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-xs">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Safety and Reliability Principles */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              AI Safety & Ethical Reliability Standards
            </h2>
            <p className="text-xs text-slate-500">How EcoTrack ensures fair, objective, and evidence-grounded AI assessments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Neutral Language Mandate
            </span>
            <p className="text-slate-600 leading-relaxed">
              The AI never claims someone committed a crime or intentionally polluted. It strictly uses neutral phrases like <em>"Possible environmental concern detected"</em> or <em>"Observable waste accumulation noted"</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Strict Separation of Fact & Inference
            </span>
            <p className="text-slate-600 leading-relaxed">
              The platform separates what was reported by the citizen from the AI's ecological synthesis and flags whenever on-site authority verification is required.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Actionability Verification
            </span>
            <p className="text-slate-600 leading-relaxed">
              Gemini explicitly assesses whether the report contains sufficient concrete geographic and physical detail for field crews to act. If insufficient, it flags that more information is needed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Decision-Support Role
            </span>
            <p className="text-slate-600 leading-relaxed">
              AI suggestions guide triage and prioritize critical hazards (e.g. chemical runoff near water conduits) without replacing official municipal oversight.
            </p>
          </div>
        </div>
      </div>

      {/* Future Roadmap */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Planned Future Expansions
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Designed with modular architecture so advanced features can be activated in subsequent phases:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-700">
            📍 Interactive Map & GPS Geo-fencing
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-700">
            👥 Municipal Authority & Admin Roles
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-700">
            🔔 Push & Email Status Notifications
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-700">
            🔍 Duplicate Report Detection
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-700">
            📋 Automated Municipal Inspection Reports
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-700">
            ☁️ Cloud Database & Cross-Region Sync
          </div>
        </div>
      </div>

      {/* Navigation CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-emerald-50 border border-emerald-200">
        <div>
          <h3 className="font-bold text-emerald-950 text-base">Ready to take action?</h3>
          <p className="text-xs text-emerald-800">Submit a report or view existing neighborhood concerns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onReportClick}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            Report an Issue
          </button>
          <button
            onClick={onExploreClick}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-100/50 text-emerald-900 border border-emerald-300 font-semibold text-xs cursor-pointer"
          >
            Browse Issues
          </button>
        </div>
      </div>
    </div>
  );
};
