import os
import json
from google import genai
from google.genai import types

def analyze_report(title: str, description: str, category: str, location: str, image_bytes: bytes = None, mime_type: str = "image/jpeg"):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "MY_GEMINI_API_KEY":
        return get_fallback_analysis(title, description, category)

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are an expert environmental assessment officer evaluating a civic environmental issue report.

REPORT DETAILS:
Title: "{title}"
Description: "{description}"
Category: "{category}"
Location: "{location}"

STRICT SAFETY & RELIABILITY RULES:
1. Use neutral, evidence-grounded language (e.g. "Possible environmental concern detected").
2. DO NOT claim crimes, malicious intent, or legal guilt.
3. Clearly base conclusions only on observable claims.
4. Assess whether the report has enough actionable details.

Return JSON adhering to schema:
- category (string)
- severity ("Low", "Medium", "High", "Critical")
- summary (string)
- environmental_impact (string)
- recommended_action (string)
- priority ("Low", "Medium", "High")
- actionable (boolean)
- actionable_reason (string)
"""

    contents = []
    if image_bytes:
        contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
    contents.append(prompt)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini API error: {e}")
        return get_fallback_analysis(title, description, category)

def get_fallback_analysis(title, description, category):
    text = f"{title} {description} {category}".lower()
    sev = "Medium"
    pri = "Medium"
    if any(w in text for w in ["chemical", "toxic", "poison", "effluent"]):
        sev = "Critical"
        pri = "High"
    elif any(w in text for w in ["dump", "large", "overflow", "severe"]):
        sev = "High"
        pri = "High"

    return {
        "category": category or "Waste Management",
        "severity": sev,
        "summary": f"Reported concern regarding {title.lower()}.",
        "environmental_impact": "Potential localized environmental disturbance requiring sanitation inspection.",
        "recommended_action": "Coordinate with municipal environmental authorities for on-site evaluation.",
        "priority": pri,
        "actionable": True,
        "actionable_reason": "Verifiable description and location provided."
    }
