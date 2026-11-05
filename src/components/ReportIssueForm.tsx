import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle2, Sparkles, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { EnvironmentalReport, IssueCategory } from "../types";

interface ReportIssueFormProps {
  onSuccess: (report: EnvironmentalReport) => void;
  onCancel: () => void;
}

const CATEGORIES: IssueCategory[] = [
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

export const ReportIssueForm: React.FC<ReportIssueFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory>("Waste Management");
  const [location, setLocation] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16));

  const [imageData, setImageData] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file (PNG, JPG, WebP, etc.)");
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be under 5MB.");
      return;
    }

    setErrorMessage(null);
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a descriptive problem title.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Please enter a detailed description of the environmental issue.");
      return;
    }
    if (!location.trim()) {
      setErrorMessage("Please specify the location or landmark.");
      return;
    }

    setIsSubmitting(true);
    setAnalysisStep("Saving citizen report to SQLite database...");

    try {
      setTimeout(() => {
        setAnalysisStep("Connecting to Google Gemini API for ecological assessment...");
      }, 700);

      setTimeout(() => {
        setAnalysisStep("Evaluating severity level & recommending remediation...");
      }, 1600);

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          location: location.trim(),
          reporter_name: reporterName.trim() || "Anonymous Citizen",
          image_data: imageData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit report");
      }

      onSuccess(data.report);
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage(err.message || "An error occurred while submitting your report. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Quick preset sample helper
  const handleLoadExample = () => {
    setTitle("Garbage dumped near primary school entrance");
    setDescription("Large quantity of plastic packaging, cardboard, and decomposed food waste has been dumped beside the school entrance gate, creating foul odor and blocking the footpath.");
    setCategory("Waste Management");
    setLocation("Near Green Valley School, Anna Nagar, Chennai");
    setReporterName("Citizen Observer");
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              AI-Assisted Reporting
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Report an Environmental Issue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit details below. Google Gemini will instantly analyze environmental severity and ecological hazards.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Example Button */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs">
          <span className="text-emerald-900 font-medium">
            Want to test quickly with sample incident data?
          </span>
          <button
            type="button"
            onClick={handleLoadExample}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-300 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            Load Example Report
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Problem Title */}
          <div className="space-y-1.5">
            <label htmlFor="issue-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Problem Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Garbage dumped near school entrance"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Environmental Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="issue-category" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Environmental Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="issue-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="issue-datetime" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Date & Time Observed
              </label>
              <input
                id="issue-datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Location Description */}
          <div className="space-y-1.5">
            <label htmlFor="issue-location" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Location Description / Landmark <span className="text-rose-500">*</span>
            </label>
            <input
              id="issue-location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Near ABC School entrance, Sector 4, Chennai"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-500">Provide prominent landmarks, cross-streets, or neighborhood names.</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="issue-description" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="issue-description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the visible condition, volume of waste, foul odor, water discoloration, or public safety impacts..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 resize-y"
            />
          </div>

          {/* Image Upload (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Optional Image Upload
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-emerald-400 bg-slate-50/60"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
              />

              {imageData ? (
                <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="relative inline-block max-w-xs mx-auto rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <img src={imageData} alt="Incident preview" className="max-h-48 object-cover mx-auto" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageData(null);
                        setImageFileName(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{imageFileName}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    Drag and drop an incident image, or <span className="text-emerald-700">browse</span>
                  </div>
                  <p className="text-xs text-slate-400">Supports PNG, JPG, WebP up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Reporter Name (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="reporter-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Reporter Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="reporter-name"
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Leave blank to report anonymously"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* AI Progress Box when submitting */}
          {isSubmitting && (
            <div className="p-5 rounded-2xl bg-emerald-950 text-emerald-100 space-y-3 shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="font-bold text-sm text-white">EcoTrack AI Processing...</span>
              </div>
              <p className="text-xs text-emerald-300/90">{analysisStep || "Analyzing environmental attributes..."}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-report-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit & Analyze Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
