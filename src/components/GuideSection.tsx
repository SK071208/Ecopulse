import React, { useState } from "react";
import { BookOpen, Terminal, Database, Cpu, Code2, Copy, Check, Server, FileCode } from "lucide-react";

export const GuideSection: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="space-y-10 py-4 max-w-4xl mx-auto text-slate-800">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          Developer Architecture & Setup Guide
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          EcoTrack Architecture & Beginner Developer Manual
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Comprehensive step-by-step documentation explaining each component, communication flow, database schema, Gemini integration, and setup instructions for running the application.
        </p>
      </div>

      {/* 1. System Architecture & Flow */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            System Architecture & Communication Flow
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          EcoTrack is structured into 4 clean layers that communicate via standard REST JSON APIs:
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto space-y-2 leading-relaxed">
          <div>[Frontend: React/HTML/CSS/JS]</div>
          <div className="text-slate-400 pl-4">│  1. User submits report with details & optional image</div>
          <div className="text-slate-400 pl-4">▼  (POST /api/reports)</div>
          <div>[Backend Server: Express / Flask]</div>
          <div className="text-slate-400 pl-4">│  2. Validates input & saves report record with status 'Reported'</div>
          <div className="text-slate-400 pl-4">▼  (INSERT INTO reports / status_history)</div>
          <div>[SQLite Database: database.db]</div>
          <div className="text-slate-400 pl-4">│  3. Server forwards report details to Google Gemini API</div>
          <div className="text-slate-400 pl-4">▼  (gemini-3.8-flash structured JSON assessment)</div>
          <div>[Google Gemini AI Engine]</div>
          <div className="text-slate-400 pl-4">│  4. Returns severity, summary, ecological impact & recommended action</div>
          <div className="text-slate-400 pl-4">▼  (UPDATE reports SET status = 'AI Analyzed')</div>
          <div>[Updated Dashboard & Community Timeline]</div>
        </div>
      </div>

      {/* 2. Database Design & Tables */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            SQLite Database Design
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The SQLite database stores all data locally in <code>database.db</code> across three relational tables:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              Table: reports
            </div>
            <p className="text-[11px] text-slate-500">Main incident records and AI fields:</p>
            <ul className="text-slate-700 space-y-1 list-disc list-inside font-mono text-[10px]">
              <li>id (INTEGER PRIMARY KEY)</li>
              <li>title, description</li>
              <li>category, location</li>
              <li>image_path, reporter_name</li>
              <li>created_at, status</li>
              <li>severity, priority</li>
              <li>ai_summary</li>
              <li>environmental_impact</li>
              <li>recommended_action</li>
              <li>actionable, actionable_reason</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-600" />
              Table: status_history
            </div>
            <p className="text-[11px] text-slate-500">Full audit log of lifecycle milestones:</p>
            <ul className="text-slate-700 space-y-1 list-disc list-inside font-mono text-[10px]">
              <li>id (INTEGER PRIMARY KEY)</li>
              <li>report_id (FOREIGN KEY)</li>
              <li>status (Reported, AI Analyzed, Under Review, In Progress, Resolved)</li>
              <li>notes (Inspection or action log)</li>
              <li>timestamp (ISO 8601 string)</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-600" />
              Table: supports
            </div>
            <p className="text-[11px] text-slate-500">Citizen upvotes to escalate attention:</p>
            <ul className="text-slate-700 space-y-1 list-disc list-inside font-mono text-[10px]">
              <li>id (INTEGER PRIMARY KEY)</li>
              <li>report_id (FOREIGN KEY)</li>
              <li>created_at (Timestamp)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. API Design */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Backend API Endpoints
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold">
              <tr>
                <th className="p-3">Method</th>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              <tr>
                <td className="p-3 font-bold text-emerald-700">POST</td>
                <td className="p-3 text-slate-900">/api/reports</td>
                <td className="p-3 font-sans text-slate-600">Receives report, triggers Gemini AI analysis, updates status to 'AI Analyzed', stores to SQLite.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-700">GET</td>
                <td className="p-3 text-slate-900">/api/reports</td>
                <td className="p-3 font-sans text-slate-600">Retrieves reports with filters: ?search=..., ?category=..., ?severity=..., ?status=..., ?sort=...</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-700">GET</td>
                <td className="p-3 text-slate-900">/api/reports/:id</td>
                <td className="p-3 font-sans text-slate-600">Returns full details of an issue including all status_history log entries and support count.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-700">PUT</td>
                <td className="p-3 text-slate-900">/api/reports/:id</td>
                <td className="p-3 font-sans text-slate-600">Updates issue status (e.g. 'In Progress' or 'Resolved') with optional notes and appends to status_history.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-700">POST</td>
                <td className="p-3 text-slate-900">/api/reports/:id/support</td>
                <td className="p-3 font-sans text-slate-600">Adds an upvote/support record for the report to indicate community urgency.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-blue-700">GET</td>
                <td className="p-3 text-slate-900">/api/stats</td>
                <td className="p-3 font-sans text-slate-600">Aggregates civic KPIs: total, weekly count, high/critical count, resolved rate, category breakdown.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Gemini AI Integration Approach */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Google Gemini API Integration
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Gemini is called on the server using the modern <code>@google/genai</code> SDK with model <code>gemini-3.8-flash</code> and a structured JSON schema. The prompt strictly instructs the model to adhere to civic neutrality:
        </p>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto space-y-2">
          <div className="text-emerald-400">// Expected Gemini Structured JSON Output Schema</div>
          <div className="text-slate-300">
            {`{
  "category": "Waste Management",
  "severity": "High",           // Low | Medium | High | Critical
  "summary": "Large quantity of plastic and food waste has been dumped near a school.",
  "environmental_impact": "May attract pests and contaminate nearby soil and drainage systems.",
  "recommended_action": "Remove the waste and inspect the area for repeated dumping.",
  "priority": "High",           // Low | Medium | High
  "actionable": true,           // boolean: has sufficient location & detail
  "actionable_reason": "Verifiable landmark and clear observable waste composition."
}`}
          </div>
        </div>
      </div>

      {/* 5. Python / Flask Implementation & Run Instructions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
            5
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Python & Flask Local Execution Guide
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          For developers wishing to run the pure Python/Flask edition on their local machine, follow these simple steps:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono space-y-2">
            <div className="text-slate-400"># Step 1: Create a virtual environment</div>
            <div>python3 -m venv venv</div>
            <div>source venv/bin/activate  <span className="text-slate-500"># Windows: venv\Scripts\activate</span></div>
            <div className="text-slate-400 pt-2"># Step 2: Install dependencies</div>
            <div>pip install -r flask_backend/requirements.txt</div>
            <div className="text-slate-400 pt-2"># Step 3: Set your Gemini API key in .env</div>
            <div>echo "GEMINI_API_KEY=your_gemini_api_key_here" &gt; .env</div>
            <div className="text-slate-400 pt-2"># Step 4: Run Flask application</div>
            <div>python flask_backend/app.py</div>
          </div>
          <p className="text-slate-500 text-[11px]">
            The Flask app will initialize <code>database.db</code> with the required tables and seed reports, serving on <code>http://127.0.0.1:5000</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
