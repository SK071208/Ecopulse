import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

export interface AIAnalysisResult {
  category: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  summary: string;
  environmental_impact: string;
  recommended_action: string;
  priority: "Low" | "Medium" | "High";
  actionable: boolean;
  actionable_reason: string;
}

export async function analyzeEnvironmentalReport(params: {
  title: string;
  description: string;
  category?: string;
  location: string;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<AIAnalysisResult> {
  const { title, description, category, location, imageBase64, imageMimeType } = params;

  const ai = getGeminiClient();

  if (ai) {
    try {
      const promptText = `
You are an expert environmental assessment officer evaluating a civic environmental issue report.

REPORT DETAILS:
Title: "${title}"
Description: "${description}"
User-Selected Category: "${category || "Uncategorized"}"
Location Context: "${location}"

SAFETY & RELIABILITY RULES (STRICT):
1. Use purely objective, neutral, scientific language. For example, use "Possible environmental concern detected" or "Apparent waste accumulation noted".
2. DO NOT make accusations of crimes, intentional wrongdoing, or legal liability against individuals or businesses.
3. Clearly base conclusions only on the provided descriptions or image characteristics.
4. Assess whether the report provides enough concrete information (adequate location and observable issue) to be actionable by civic response teams. If insufficient, set actionable to false and explain why.

CATEGORIES:
- "Waste Management"
- "Plastic Waste"
- "Water Pollution"
- "Air Pollution"
- "Sewage Problems"
- "Illegal Dumping"
- "Tree/Environmental Damage"
- "Blocked Drains"
- "Excessive Littering"
- "Other"

SEVERITY LEVELS:
- "Critical": Immediate toxic hazard, acute public water contamination, or severe biological emergency.
- "High": Substantial uncontained garbage, chemical runoff, blocked major drainage creating hazard.
- "Medium": Localized dumping, moderate litter accumulation, clogged roadside drain.
- "Low": Minor surface littering, aesthetic issues without acute contamination risk.

PRIORITY LEVELS:
- "High", "Medium", "Low"
`;

      const contents: Array<any> = [];

      if (imageBase64 && imageMimeType) {
        contents.push({
          inlineData: {
            data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
            mimeType: imageMimeType,
          },
        });
      }

      contents.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction:
            "You are EcoTrack AI, an environmental classification system assisting municipal and community authorities. Provide neutral, evidence-grounded assessments adhering strictly to the JSON schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Standardized environmental issue category.",
              },
              severity: {
                type: Type.STRING,
                description: "Severity level: Low, Medium, High, or Critical.",
              },
              summary: {
                type: Type.STRING,
                description: "Concise neutral summary of the observed issue.",
              },
              environmental_impact: {
                type: Type.STRING,
                description: "Potential ecological and public health consequences.",
              },
              recommended_action: {
                type: Type.STRING,
                description: "Constructive recommended municipal or civic action step.",
              },
              priority: {
                type: Type.STRING,
                description: "Suggested priority: Low, Medium, or High.",
              },
              actionable: {
                type: Type.BOOLEAN,
                description: "Whether the report contains sufficient concrete information to act on.",
              },
              actionable_reason: {
                type: Type.STRING,
                description: "Reasoning regarding report adequacy.",
              },
            },
            required: [
              "category",
              "severity",
              "summary",
              "environmental_impact",
              "recommended_action",
              "priority",
              "actionable",
              "actionable_reason",
            ],
          },
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        const parsed = JSON.parse(responseText) as AIAnalysisResult;
        return {
          category: parsed.category || category || "Waste Management",
          severity: ["Low", "Medium", "High", "Critical"].includes(parsed.severity)
            ? parsed.severity
            : "Medium",
          summary: parsed.summary || "Possible environmental concern reported by citizen.",
          environmental_impact:
            parsed.environmental_impact || "Potential local environmental degradation if left unattended.",
          recommended_action:
            parsed.recommended_action || "Schedule site inspection by local municipal environmental team.",
          priority: ["Low", "Medium", "High"].includes(parsed.priority) ? parsed.priority : "Medium",
          actionable: parsed.actionable !== false,
          actionable_reason:
            parsed.actionable_reason || "Report includes verifiable location and issue description.",
        };
      }
    } catch (error) {
      console.warn("Gemini API call failed or encountered error, using fallback analysis:", error);
    }
  }

  // Resilient fallback rule if API key is not yet set or offline
  return fallbackEnvironmentalAnalysis(title, description, category, location);
}

function fallbackEnvironmentalAnalysis(
  title: string,
  description: string,
  categoryHint?: string,
  location?: string
): AIAnalysisResult {
  const combined = `${title} ${description} ${categoryHint || ""}`.toLowerCase();

  let category = categoryHint || "Waste Management";
  let severity: "Low" | "Medium" | "High" | "Critical" = "Medium";
  let priority: "Low" | "Medium" | "High" = "Medium";
  let summary = `Reported concern regarding ${title.toLowerCase().replace(/[.\s]+$/, "")}.`;
  let environmental_impact = "Potential localized ecological disturbance and aesthetic degradation.";
  let recommended_action = "Conduct an on-site evaluation and coordinate with local civic sanitation or maintenance services.";

  if (combined.includes("chemical") || combined.includes("toxic") || combined.includes("poison") || combined.includes("effluent") || combined.includes("discoloration")) {
    category = "Water Pollution";
    severity = "Critical";
    priority = "High";
    summary = "Suspected chemical or contaminated liquid runoff observed entering local water conduits.";
    environmental_impact = "May jeopardize aquatic ecosystems, disrupt pH balances, and risk subterranean water contamination.";
    recommended_action = "Dispatch municipal environmental testing crew for immediate water sampling and source tracing.";
  } else if (combined.includes("dump") || combined.includes("garbage") || combined.includes("waste") || combined.includes("trash")) {
    category = "Waste Management";
    severity = combined.includes("large") || combined.includes("huge") || combined.includes("school") || combined.includes("hospital") ? "High" : "Medium";
    priority = severity === "High" ? "High" : "Medium";
    summary = "Accumulation of unsegregated solid municipal refuse reported.";
    environmental_impact = "Risk of disease vector proliferation, vermin harborage, and foul odor dispersal.";
    recommended_action = "Mobilize solid waste clearing vehicle and sanitize surrounding public grounds.";
  } else if (combined.includes("plastic") || combined.includes("polythene") || combined.includes("bottles") || combined.includes("wrapper")) {
    category = "Plastic Waste";
    severity = "Medium";
    priority = "Medium";
    summary = "Non-biodegradable synthetic polymers and packaging litter dispersed in the environment.";
    environmental_impact = "Persists for centuries, fragments into microplastics, and threatens ingestion by suburban fauna.";
    recommended_action = "Organize designated collection and divert material to regional plastic recycling facilities.";
  } else if (combined.includes("sewage") || combined.includes("drain") || combined.includes("choked") || combined.includes("clog") || combined.includes("overflow")) {
    category = combined.includes("sewage") ? "Sewage Problems" : "Blocked Drains";
    severity = combined.includes("overflow") || combined.includes("foul") ? "High" : "Medium";
    priority = severity === "High" ? "High" : "Medium";
    summary = "Impeded stormwater or wastewater conveyance causing localized stagnation.";
    environmental_impact = "Potential contamination of pedestrian pathways and proliferation of mosquito breeding habitats.";
    recommended_action = "Deploy vacuum desilting unit and clear inlet grates of organic sediment.";
  } else if (combined.includes("smoke") || combined.includes("fumes") || combined.includes("burning") || combined.includes("air")) {
    category = "Air Pollution";
    severity = combined.includes("burning") ? "High" : "Medium";
    priority = "High";
    summary = "Particulate matter or visible emission dispersion reported in ambient air.";
    environmental_impact = "Elevated particulate concentration affecting local air quality index and vulnerable individuals with respiratory conditions.";
    recommended_action = "Inspect local source of combustion or emission and enforce municipal clean air bylaws.";
  } else if (combined.includes("tree") || combined.includes("branch") || combined.includes("deforestation") || combined.includes("cutting")) {
    category = "Tree/Environmental Damage";
    severity = "Medium";
    priority = "Medium";
    summary = "Observed physical harm or unauthorized pruning affecting community flora.";
    environmental_impact = "Reduction in local canopy shade, disruption of avian perching habitats, and decreased carbon absorption.";
    recommended_action = "Coordinate with urban forestry officer to assess tree vitality and implement protective measures.";
  }

  const isDetailed = description.length > 25 && (location || "").length > 5;

  return {
    category,
    severity,
    summary,
    environmental_impact,
    recommended_action,
    priority,
    actionable: isDetailed,
    actionable_reason: isDetailed
      ? "Sufficient observational detail and identifiable location provided for field response."
      : "General description provided; additional geographic specifics would accelerate field identification.",
  };
}
