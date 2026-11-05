import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dbPath = path.resolve(process.cwd(), "database.db");
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Initialize tables as requested: reports, status_history, supports
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      image_path TEXT,
      reporter_name TEXT,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Reported',
      severity TEXT DEFAULT 'Medium',
      priority TEXT DEFAULT 'Medium',
      ai_summary TEXT,
      environmental_impact TEXT,
      recommended_action TEXT,
      actionable INTEGER DEFAULT 1,
      actionable_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS supports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
  `);

  // Seed sample reports if table is empty
  const countStmt = db.prepare("SELECT COUNT(*) as count FROM reports");
  const result = countStmt.get() as { count: number };

  if (result.count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const sampleReports = [
    {
      title: "Garbage dumped near primary school entrance",
      description: "Large amount of unsegregated plastic packaging, broken bottles, and decomposing food waste has accumulated over the past week near the school entrance gate.",
      category: "Waste Management",
      location: "Near Green Valley Primary School, Anna Nagar, Chennai",
      reporter_name: "Anita Raman",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: "In Progress",
      severity: "High",
      priority: "High",
      ai_summary: "Substantial accumulation of plastic and perishable domestic refuse adjacent to an educational institution.",
      environmental_impact: "Presents biological hygiene hazards, attracts stray animals and disease vectors, and risks microplastic runoff into surface storm drains during rainfall.",
      recommended_action: "Deploy municipal sanitary team for immediate removal, disinfect perimeter, and schedule bi-weekly waste inspections.",
      actionable: 1,
      actionable_reason: "Location and waste composition clearly described with high public health urgency.",
      supports: 14,
      history: [
        { status: "Reported", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), notes: "Initial report submitted by citizen." },
        { status: "AI Analyzed", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4000).toISOString(), notes: "Automated severity assessment: High severity waste hazard." },
        { status: "Under Review", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: "Dispatched to Zone 4 Municipal Sanitation Officer." },
        { status: "In Progress", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: "Cleanup crew deployed with waste collection truck." },
      ]
    },
    {
      title: "Chemical discharge and discoloration in community canal",
      description: "Foamy, yellowish effluent with a pungent chemical smell is discharging from a small drainage culvert directly into the neighborhood canal.",
      category: "Water Pollution",
      location: "East Canal bank near Sector 8 Industrial Link Road",
      reporter_name: "Karthik Sundaram",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Under Review",
      severity: "Critical",
      priority: "High",
      ai_summary: "Industrial or chemical discharge observed flowing into a freshwater tributary.",
      environmental_impact: "Potential severe toxicity to aquatic microorganisms, depletion of dissolved oxygen, and risk of groundwater seepage affecting domestic borewells.",
      recommended_action: "Alert the State Pollution Control Board for emergency water sampling, locate the upstream discharge conduit, and issue stop-flow order.",
      actionable: 1,
      actionable_reason: "Specific observable discharge characteristics and location provided for environmental testing.",
      supports: 27,
      history: [
        { status: "Reported", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: "Report logged with description of discoloration." },
        { status: "AI Analyzed", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3500).toISOString(), notes: "Automated alert: Critical risk water contamination." },
        { status: "Under Review", timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: "Environmental health inspectors notified for water sampling." },
      ]
    },
    {
      title: "Severe plastic debris and packaging littering public park",
      description: "Following a weekend outdoor festival, plastic bottles, food wrappers, single-use cups, and polythene bags cover the open lawn and flower beds.",
      category: "Plastic Waste",
      location: "Riverside Public Botanical Park, South Lawn",
      reporter_name: "Meera Patel",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "AI Analyzed",
      severity: "Medium",
      priority: "Medium",
      ai_summary: "Post-event non-biodegradable litter dispersed across civic green space.",
      environmental_impact: "Litter risks ingestion by local wildlife and degradation into airborne microplastics.",
      recommended_action: "Organize volunteer civic cleanup and install permanent segregated recycling receptacles.",
      actionable: 1,
      actionable_reason: "Clear site boundary and standard municipal collection requirements.",
      supports: 9,
      history: [
        { status: "Reported", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: "Community report submitted." },
        { status: "AI Analyzed", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 2000).toISOString(), notes: "Categorized as Plastic Waste; Medium severity." },
      ]
    },
    {
      title: "Illegal night dumping of construction debris on wetland border",
      description: "Truckloads of concrete rubble, plaster, broken tiles, and drywall were dumped overnight adjacent to the protected marshland buffer.",
      category: "Illegal Dumping",
      location: "Marshland Sanctuary Perimeter Road, Milestone 4",
      reporter_name: "Rajesh Kumar",
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Resolved",
      severity: "High",
      priority: "High",
      ai_summary: "Inert construction & demolition debris unlawfully dumped on ecologically sensitive wetland buffer.",
      environmental_impact: "Compacts fragile soil, disrupts natural drainage channels, and impedes native wetland vegetation growth.",
      recommended_action: "Remove debris with earthmoving equipment and place concrete bollards to prevent vehicular nighttime access.",
      actionable: 1,
      actionable_reason: "Exact perimeter milestone and debris type identified.",
      supports: 31,
      history: [
        { status: "Reported", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), notes: "Citizen reported overnight dumping." },
        { status: "AI Analyzed", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 4000).toISOString(), notes: "Identified high-impact habitat disturbance." },
        { status: "Under Review", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: "Forestry and Wetland Protection Board inspected." },
        { status: "In Progress", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), notes: "Contracted earthmovers clearing aggregate." },
        { status: "Resolved", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: "All rubble cleared; vehicle barricades installed at entrance." },
      ]
    },
    {
      title: "Blocked storm drainage culvert causing stagnant wastewater pooling",
      description: "A primary roadside storm drain is choked with sediment, fallen branches, and discarded plastic bags, causing foul water to pool across the pedestrian walkway.",
      category: "Blocked Drains",
      location: "Intersection of Market Road and 4th Cross Avenue",
      reporter_name: "Deepak Verma",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Reported",
      severity: "Medium",
      priority: "Medium",
      ai_summary: "Urban stormwater drainage obstruction generating stagnant runoff pools.",
      environmental_impact: "Promotes vector-borne disease breeding (mosquitoes) and increases flash flood vulnerability during rainfall.",
      recommended_action: "Perform mechanical desilting and clear intake grating.",
      actionable: 1,
      actionable_reason: "Specific junction pinpointed for public works road crew.",
      supports: 6,
      history: [
        { status: "Reported", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: "Citizen submitted drain blockage report." }
      ]
    }
  ];

  const insertReportStmt = db.prepare(`
    INSERT INTO reports (
      title, description, category, location, reporter_name, created_at,
      status, severity, priority, ai_summary, environmental_impact,
      recommended_action, actionable, actionable_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHistoryStmt = db.prepare(`
    INSERT INTO status_history (report_id, status, notes, timestamp)
    VALUES (?, ?, ?, ?)
  `);

  const insertSupportStmt = db.prepare(`
    INSERT INTO supports (report_id, created_at)
    VALUES (?, ?)
  `);

  for (const report of sampleReports) {
    const info = insertReportStmt.run(
      report.title,
      report.description,
      report.category,
      report.location,
      report.reporter_name,
      report.created_at,
      report.status,
      report.severity,
      report.priority,
      report.ai_summary,
      report.environmental_impact,
      report.recommended_action,
      report.actionable,
      report.actionable_reason
    );

    const reportId = Number(info.lastInsertRowid);

    for (const h of report.history) {
      insertHistoryStmt.run(reportId, h.status, h.notes, h.timestamp);
    }

    for (let i = 0; i < report.supports; i++) {
      insertSupportStmt.run(reportId, new Date(Date.now() - (i + 1) * 3600000).toISOString());
    }
  }
}

export { db };
