import express from "express";
import path from "node:path";
import fs from "node:fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initDatabase, db } from "./server/db.ts";
import { analyzeEnvironmentalReport } from "./server/gemini.ts";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON limit for base64 image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Initialize SQLite database
initDatabase();

// Create uploads directory if not exists
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "EcoTrack", timestamp: new Date().toISOString() });
});

// GET /api/reports - View, search, filter, and sort issues
app.get("/api/reports", (req, res) => {
  try {
    const { search, category, severity, status, sort } = req.query as {
      search?: string;
      category?: string;
      severity?: string;
      status?: string;
      sort?: string;
    };

    let sql = `
      SELECT r.*,
        (SELECT COUNT(*) FROM supports s WHERE s.report_id = r.id) as support_count
      FROM reports r
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && search.trim()) {
      const s = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(r.title) LIKE ? OR LOWER(r.description) LIKE ? OR LOWER(r.location) LIKE ?)`;
      params.push(s, s, s);
    }

    if (category && category !== "All") {
      sql += ` AND r.category = ?`;
      params.push(category);
    }

    if (severity && severity !== "All") {
      sql += ` AND r.severity = ?`;
      params.push(severity);
    }

    if (status && status !== "All") {
      sql += ` AND r.status = ?`;
      params.push(status);
    }

    // Sorting
    if (sort === "supports") {
      sql += ` ORDER BY support_count DESC, r.created_at DESC`;
    } else if (sort === "priority") {
      sql += ` ORDER BY 
        CASE r.priority 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END, r.created_at DESC`;
    } else {
      // Default: newest
      sql += ` ORDER BY r.created_at DESC`;
    }

    const stmt = db.prepare(sql);
    const reports = stmt.all(...params);

    res.json({ success: true, reports });
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch reports" });
  }
});

// GET /api/reports/:id - View single issue with status history & supports
app.get("/api/reports/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid report ID" });
    }

    const reportStmt = db.prepare(`
      SELECT r.*,
        (SELECT COUNT(*) FROM supports s WHERE s.report_id = r.id) as support_count
      FROM reports r
      WHERE r.id = ?
    `);
    const report = reportStmt.get(id) as any;

    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    const historyStmt = db.prepare(`
      SELECT * FROM status_history
      WHERE report_id = ?
      ORDER BY timestamp ASC
    `);
    const history = historyStmt.all(id);

    res.json({ success: true, report: { ...report, history } });
  } catch (error: any) {
    console.error("Error fetching report details:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch report" });
  }
});

// POST /api/reports - Create new environmental issue report & trigger Gemini analysis
app.post("/api/reports", async (req, res) => {
  try {
    const {
      title,
      description,
      category = "Other",
      location,
      reporter_name = "Anonymous Citizen",
      image_data, // base64 data url
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: "Problem title is required." });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: "Problem description is required." });
    }
    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, error: "Location description is required." });
    }

    const now = new Date().toISOString();
    let imagePath: string | null = null;
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    // Save image locally if provided
    if (image_data && typeof image_data === "string" && image_data.startsWith("data:image/")) {
      try {
        const matches = image_data.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches) {
          imageMimeType = matches[1];
          imageBase64 = matches[2];
          const ext = imageMimeType.split("/")[1] || "png";
          const fileName = `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, Buffer.from(imageBase64, "base64"));
          imagePath = `/uploads/${fileName}`;
        }
      } catch (err) {
        console.warn("Could not save image to disk:", err);
      }
    }

    // Step 1: Save initial report to SQLite
    const insertStmt = db.prepare(`
      INSERT INTO reports (
        title, description, category, location, image_path, reporter_name,
        created_at, status, severity, priority, ai_summary, environmental_impact,
        recommended_action, actionable, actionable_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Reported', 'Medium', 'Medium', 'Pending AI assessment...', '', '', 1, '')
    `);

    const info = insertStmt.run(
      title.trim(),
      description.trim(),
      category.trim(),
      location.trim(),
      imagePath,
      (reporter_name || "").trim() || "Anonymous Citizen",
      now
    );

    const reportId = Number(info.lastInsertRowid);

    // Record initial status history: Reported
    const historyStmt = db.prepare(`
      INSERT INTO status_history (report_id, status, notes, timestamp)
      VALUES (?, 'Reported', 'Report submitted to EcoTrack community registry.', ?)
    `);
    historyStmt.run(reportId, now);

    // Step 2: Send to Gemini for AI analysis
    let aiResult;
    try {
      aiResult = await analyzeEnvironmentalReport({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        location: location.trim(),
        imageBase64,
        imageMimeType,
      });
    } catch (err) {
      console.warn("AI analysis error:", err);
    }

    // Step 3: Update report with AI analysis results and advance status to 'AI Analyzed'
    if (aiResult) {
      const updateStmt = db.prepare(`
        UPDATE reports
        SET category = ?,
            severity = ?,
            priority = ?,
            ai_summary = ?,
            environmental_impact = ?,
            recommended_action = ?,
            actionable = ?,
            actionable_reason = ?,
            status = 'AI Analyzed'
        WHERE id = ?
      `);

      updateStmt.run(
        aiResult.category,
        aiResult.severity,
        aiResult.priority,
        aiResult.summary,
        aiResult.environmental_impact,
        aiResult.recommended_action,
        aiResult.actionable ? 1 : 0,
        aiResult.actionable_reason,
        reportId
      );

      // Record AI Analyzed in history
      const aiTime = new Date(Date.now() + 1000).toISOString();
      historyStmt.run(
        reportId,
        "AI Analyzed",
        `Assessed as ${aiResult.severity} severity / ${aiResult.priority} priority in ${aiResult.category}.`,
        aiTime
      );
    }

    // Retrieve the final updated report
    const finalReport = db.prepare(`
      SELECT r.*,
        (SELECT COUNT(*) FROM supports s WHERE s.report_id = r.id) as support_count
      FROM reports r
      WHERE r.id = ?
    `).get(reportId);

    const history = db.prepare(`
      SELECT * FROM status_history WHERE report_id = ? ORDER BY timestamp ASC
    `).all(reportId);

    res.status(201).json({
      success: true,
      report: { ...finalReport, history },
      message: "Report successfully submitted and analyzed by EcoTrack AI.",
    });
  } catch (error: any) {
    console.error("Error creating report:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create report" });
  }
});

// PUT /api/reports/:id - Update issue status (Reported -> AI Analyzed -> Under Review -> In Progress -> Resolved)
app.put("/api/reports/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    const validStatuses = ["Reported", "AI Analyzed", "Under Review", "In Progress", "Resolved"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Verify report exists
    const checkStmt = db.prepare("SELECT * FROM reports WHERE id = ?");
    const existing = checkStmt.get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    // Update status in reports table
    const updateStmt = db.prepare("UPDATE reports SET status = ? WHERE id = ?");
    updateStmt.run(status, id);

    // Insert into status_history
    const now = new Date().toISOString();
    const historyNote = notes && notes.trim() ? notes.trim() : `Status updated to ${status}.`;
    const insertHistoryStmt = db.prepare(`
      INSERT INTO status_history (report_id, status, notes, timestamp)
      VALUES (?, ?, ?, ?)
    `);
    insertHistoryStmt.run(id, status, historyNote, now);

    // Return updated report with history
    const updated = db.prepare(`
      SELECT r.*,
        (SELECT COUNT(*) FROM supports s WHERE s.report_id = r.id) as support_count
      FROM reports r
      WHERE r.id = ?
    `).get(id);

    const history = db.prepare(`
      SELECT * FROM status_history WHERE report_id = ? ORDER BY timestamp ASC
    `).all(id);

    res.json({ success: true, report: { ...updated, history }, message: `Issue status updated to ${status}.` });
  } catch (error: any) {
    console.error("Error updating report status:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update report status" });
  }
});

// POST /api/reports/:id/support - Upvote/support an issue to indicate community attention
app.post("/api/reports/:id/support", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid report ID" });
    }

    const checkStmt = db.prepare("SELECT id FROM reports WHERE id = ?");
    const exists = checkStmt.get(id);
    if (!exists) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    const now = new Date().toISOString();
    const insertSupportStmt = db.prepare("INSERT INTO supports (report_id, created_at) VALUES (?, ?)");
    insertSupportStmt.run(id, now);

    const countStmt = db.prepare("SELECT COUNT(*) as count FROM supports WHERE report_id = ?");
    const result = countStmt.get(id) as { count: number };

    res.json({ success: true, support_count: result.count, message: "Support recorded successfully" });
  } catch (error: any) {
    console.error("Error supporting report:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to record support" });
  }
});

// GET /api/stats - Dashboard analytics and metrics
app.get("/api/stats", (_req, res) => {
  try {
    const totalReports = (db.prepare("SELECT COUNT(*) as c FROM reports").get() as any).c;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const reportsThisWeek = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE created_at >= ?").get(oneWeekAgo) as any).c;

    const openIssues = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE status != 'Resolved'").get() as any).c;
    const inProgress = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'In Progress'").get() as any).c;
    const resolvedIssues = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE status = 'Resolved'").get() as any).c;
    const highCritical = (db.prepare("SELECT COUNT(*) as c FROM reports WHERE severity IN ('High', 'Critical')").get() as any).c;

    // Most common category
    const topCat = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM reports
      GROUP BY category
      ORDER BY count DESC
      LIMIT 1
    `).get() as any;

    // Category distribution
    const categoryBreakdown = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM reports
      GROUP BY category
      ORDER BY count DESC
    `).all();

    // Severity distribution
    const severityBreakdown = db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM reports
      GROUP BY severity
    `).all();

    // Status distribution
    const statusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM reports
      GROUP BY status
    `).all();

    res.json({
      success: true,
      stats: {
        totalReports,
        reportsThisWeek,
        openIssues,
        inProgress,
        resolvedIssues,
        highCritical,
        mostCommonCategory: topCat ? topCat.category : "None yet",
        categoryBreakdown,
        severityBreakdown,
        statusBreakdown,
      },
    });
  } catch (error: any) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch stats" });
  }
});

// ==========================================
// VITE CLIENT MIDDLEWARE OR STATIC SERVE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoTrack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
