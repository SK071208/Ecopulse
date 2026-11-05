import os
from datetime import datetime
from flask import Flask, request, jsonify, render_template, redirect, url_for
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from database.models import init_db, get_db_connection
from services.gemini_service import analyze_report

load_dotenv()

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "static", "uploads")
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5MB max
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Initialize database tables
init_db()

@app.route("/")
def home():
    conn = get_db_connection()
    reports = conn.execute("SELECT * FROM reports ORDER BY created_at DESC LIMIT 3").fetchall()
    stats = {
        "total": conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0],
        "resolved": conn.execute("SELECT COUNT(*) FROM reports WHERE status='Resolved'").fetchone()[0]
    }
    conn.close()
    return render_template("index.html", reports=reports, stats=stats)

@app.route("/report", methods=["GET", "POST"])
def report():
    if request.method == "POST":
        title = request.form.get("title")
        description = request.form.get("description")
        category = request.form.get("category", "Other")
        location = request.form.get("location")
        reporter_name = request.form.get("reporter_name") or "Anonymous"

        image_path = None
        image_bytes = None
        mime_type = "image/jpeg"

        if "image" in request.files:
            file = request.files["image"]
            if file and file.filename != "":
                filename = secure_filename(f"{int(datetime.now().timestamp())}_{file.filename}")
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(filepath)
                image_path = f"/static/uploads/{filename}"
                with open(filepath, "rb") as f:
                    image_bytes = f.read()
                mime_type = file.mimetype or "image/jpeg"

        # 1. Save initial report
        now = datetime.utcnow().isoformat()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reports (title, description, category, location, image_path, reporter_name, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Reported')
        """, (title, description, category, location, image_path, reporter_name, now))
        report_id = cursor.lastrowid

        cursor.execute("INSERT INTO status_history (report_id, status, notes, timestamp) VALUES (?, 'Reported', 'Issue reported by citizen.', ?)", (report_id, now))
        conn.commit()

        # 2. Analyze with Gemini
        ai_data = analyze_report(title, description, category, location, image_bytes, mime_type)

        # 3. Update report with AI results
        cursor.execute("""
            UPDATE reports
            SET category = ?, severity = ?, priority = ?, ai_summary = ?,
                environmental_impact = ?, recommended_action = ?, actionable = ?,
                actionable_reason = ?, status = 'AI Analyzed'
            WHERE id = ?
        """, (
            ai_data.get("category", category),
            ai_data.get("severity", "Medium"),
            ai_data.get("priority", "Medium"),
            ai_data.get("summary", ""),
            ai_data.get("environmental_impact", ""),
            ai_data.get("recommended_action", ""),
            1 if ai_data.get("actionable", True) else 0,
            ai_data.get("actionable_reason", ""),
            report_id
        ))

        ai_time = datetime.utcnow().isoformat()
        cursor.execute("INSERT INTO status_history (report_id, status, notes, timestamp) VALUES (?, 'AI Analyzed', ?, ?)",
                       (report_id, f"AI severity: {ai_data.get('severity')}", ai_time))
        conn.commit()
        conn.close()

        return redirect(url_for("issue_detail", issue_id=report_id))

    return render_template("report.html")

@app.route("/issues")
def issues():
    category = request.args.get("category")
    severity = request.args.get("severity")
    status = request.args.get("status")
    search = request.args.get("search")

    query = "SELECT r.*, (SELECT COUNT(*) FROM supports s WHERE s.report_id = r.id) as support_count FROM reports r WHERE 1=1"
    params = []

    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR location LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])
    if category and category != "All":
        query += " AND category = ?"
        params.append(category)
    if severity and severity != "All":
        query += " AND severity = ?"
        params.append(severity)
    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"

    conn = get_db_connection()
    reports = conn.execute(query, params).fetchall()
    conn.close()
    return render_template("issues.html", reports=reports)

@app.route("/issues/<int:issue_id>")
def issue_detail(issue_id):
    conn = get_db_connection()
    report = conn.execute("""
        SELECT r.*, (SELECT COUNT(*) FROM supports s WHERE s.report_id = r.id) as support_count
        FROM reports r WHERE r.id = ?
    """, (issue_id,)).fetchone()

    if not report:
        conn.close()
        return "Report not found", 404

    history = conn.execute("SELECT * FROM status_history WHERE report_id = ? ORDER BY timestamp ASC", (issue_id,)).fetchall()
    conn.close()
    return render_template("issue_detail.html", report=report, history=history)

# API Endpoints
@app.route("/api/reports", methods=["GET"])
def api_get_reports():
    conn = get_db_connection()
    rows = conn.execute("SELECT r.*, (SELECT COUNT(*) FROM supports s WHERE s.report_id = r.id) as support_count FROM reports r").fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in rows])

@app.route("/api/reports/<int:id>/support", methods=["POST"])
def api_support_report(id):
    conn = get_db_connection()
    conn.execute("INSERT INTO supports (report_id, created_at) VALUES (?, ?)", (id, datetime.utcnow().isoformat()))
    conn.commit()
    count = conn.execute("SELECT COUNT(*) FROM supports WHERE report_id = ?", (id,)).fetchone()[0]
    conn.close()
    return jsonify({"success": True, "support_count": count})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
