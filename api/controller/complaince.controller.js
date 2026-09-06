import {Product} from "../models/product.schema.js";
import {Framework} from "../models/framework.schema.js";
import {Report} from "../models/report.schema.js";
import {generateEmbedding} from "../../utils/embeddings.js";
import {qdrantClient} from "../../config/qdrant.js";
import Groq from "groq-sdk";

const groq = new Groq({apiKey: process.env.Groq_API_KEY});

const STATUS_SCORES = {
  pass: 1,
  partial: 0.7,
  fail: 0,
  not_applicable: 1,
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const buildApprovalsSummary = (approvals = []) =>
  approvals
    .filter((a) => a.authority || a.approvalNumber)
    .map(
      (a) =>
        `${a.authority || "Unknown"} — ${a.approvalNumber || "N/A"} (${a.approvalDate || "undated"})`,
    )
    .join("; ") || "None recorded";

const buildTypeDetails = (type, cd) => {
  const map = {
    medical_device: `
Clinical Validation Done: ${cd.medicalDevice?.clinicalValidationDone ? "Yes" : "No"}
Sterilization Method:     ${cd.medicalDevice?.sterilizationMethod || "N/A"}
Biocompatibility Tested:  ${cd.medicalDevice?.biocompatibilityTested ? "Yes" : "No"}
Post-Market Surveillance: ${cd.medicalDevice?.postMarketSurveillance ? "Yes" : "No"}
UDI Assigned:             ${cd.medicalDevice?.udiAssigned ? "Yes" : "No"}`,

    drug: `
Clinical Trial Phase: ${cd.drug?.clinicalTrialPhase || "N/A"}
GMP Certified:        ${cd.drug?.gmpCertified ? "Yes" : "No"}
Formulation Type:     ${cd.drug?.formulationType || "N/A"}
Active Ingredient:    ${cd.drug?.activeIngredient || "N/A"}
Shelf Life (months):  ${cd.drug?.shelfLifeMonths || "N/A"}
Cold Chain Required:  ${cd.drug?.coldChainRequired ? "Yes" : "No"}`,

    software: `
Software Version:         ${cd.software?.softwareVersion || "N/A"}
SDLC Methodology:         ${cd.software?.sdlcMethodology || "N/A"}
Penetration Testing Done: ${cd.software?.penetrationTestingDone ? "Yes" : "No"}
Last Pen Test Date:       ${cd.software?.lastPenTestDate || "N/A"}
Uptime SLA:               ${cd.software?.uptimeSlaPercent ? cd.software.uptimeSlaPercent + "%" : "N/A"}
Disaster Recovery Plan:   ${cd.software?.disasterRecoveryPlan ? "Yes" : "No"}
Change Management:        ${cd.software?.changeManagementProcess ? "Yes" : "No"}`,

    ai_system: `
AI Model Validated:      ${cd.aiSystem?.aiModelValidated ? "Yes" : "No"}
Model Version:           ${cd.aiSystem?.modelVersion || "N/A"}
Training Data Documented:${cd.aiSystem?.trainingDataDocumented ? "Yes" : "No"}
Bias Testing Done:       ${cd.aiSystem?.biasTestingDone ? "Yes" : "No"}
Explainability Method:   ${cd.aiSystem?.explainabilityMethod || "N/A"}
Human Oversight Enabled: ${cd.aiSystem?.humanOversightEnabled ? "Yes" : "No"}
Model Drift Monitoring:  ${cd.aiSystem?.modelDriftMonitoring ? "Yes" : "No"}
EU AI Act Risk Level:    ${cd.aiSystem?.euAiActRiskLevel || "N/A"}`,

    diagonistic: `
Sensitivity:          ${cd.diagnostic?.sensitivityPercent ? cd.diagnostic.sensitivityPercent + "%" : "N/A"}
Specificity:          ${cd.diagnostic?.specificityPercent ? cd.diagnostic.specificityPercent + "%" : "N/A"}
Lab Accredited:       ${cd.diagnostic?.labAccredited ? "Yes" : "No"}
Accreditation Body:   ${cd.diagnostic?.accreditationBody || "N/A"}
Specimen Type:        ${cd.diagnostic?.specimenType || "N/A"}
Turnaround (hours):   ${cd.diagnostic?.turnaroundTimeHours || "N/A"}`,
  };

  return map[type] || "";
};

const buildProductText = (product) => {
  const cd = product.complianceDetails || {};

  const common = `
Risk Assessment Performed:   ${cd.riskAssessmentPerformed ? "Yes" : "No"}
Risk Assessment Methodology: ${cd.riskAssessmentMethodology || "N/A"}
Risk Mitigation Summary:     ${cd.riskMitigationSummary || "N/A"}
Encryption at Rest:          ${cd.encryptionAtRest ? "Yes" : "No"}
Encryption in Transit:       ${cd.encryptionInTransit ? "Yes" : "No"}
HIPAA Compliant:             ${cd.hipaaCompliant ? "Yes" : "No"}
GDPR Compliant:              ${cd.gdprCompliant ? "Yes" : "No"}
Data Retention Policy:       ${cd.dataRetentionPolicy || "N/A"}
Audit Logging Enabled:       ${cd.auditLoggingEnabled ? "Yes" : "No"}
Log Retention Days:          ${cd.logRetentionDays || "N/A"}
ISO Standard:                ${cd.isoStandard || "N/A"}
Technical Notes:             ${cd.technicalNotes || "N/A"}`;

  return `
Product Name:        ${product.productName}
Product Code:        ${product.productCode || "N/A"}
Type:                ${product.productType || "N/A"}
Description:         ${product.description || "N/A"}
Intended Use:        ${product.regulatory?.intendedUse || "N/A"}
Risk Category:       ${product.regulatory?.riskCategory || "N/A"}
Device Class:        ${product.regulatory?.deviceClass || "N/A"}
Markets:             ${(product.regulatory?.market || []).join(", ") || "N/A"}
Compliance Status:   ${product.complianceStatus || "N/A"}
Approvals:           ${buildApprovalsSummary(product.regulatory?.approvals)}
${common}
${buildTypeDetails(product.productType, cd)}
`.trim();
};

const buildPrompt = (productText, relevantControls) =>
  `
You are a senior regulatory compliance analyst with expertise in medical devices, software, AI systems, and pharmaceutical products.

Assess how well the product satisfies each compliance control. Base your assessment ONLY on the information provided.

SCORING RULES:
- "pass"           → Product clearly satisfies this control.
- "partial"        → Partially satisfies, or insufficient info but no clear violation. Default to this when uncertain.
- "fail"           → Clear evidence the product does NOT meet this control.
- "not_applicable" → Control clearly does not apply to this product type.

CALIBRATION:
- Missing field ≠ failure. Use "partial" when data is absent but no violation is evident.
- Only use "fail" when documented properties directly contradict the control.
- Every reason must cite specific product attributes. 1–2 sentences max.

PRODUCT:
${productText}

CONTROLS (${relevantControls.length} total):
${JSON.stringify(relevantControls, null, 2)}

Return ONLY valid JSON, no markdown fences:
{
  "summary": "2–3 sentence overall assessment",
  "overallRisk": "low | medium | high | critical",
  "recommendations": ["actionable item 1", "actionable item 2"],
  "controls": [
    {
      "controlId": "<exact controlId>",
      "title": "<exact title>",
      "status": "pass | partial | fail | not_applicable",
      "reason": "1–2 sentences"
    }
  ],
  "reportMarkdown": "# Compliance Report\\n..."
}
`.trim();

const getRelevantControls = (framework, product, searchResults) => {
  const normalize = (id) => String(id).trim().toUpperCase();
  console.log(framework.controls);
  console.log("FRAMEWORK INDUSTRY");
  console.log(framework.industry);
  console.log("product:::-");
  console.log(product);
  const ruleBasedControls = framework.controls.filter((c) => {
    const typeMatch =
      !c.productTypes?.length || c.productTypes.includes(product.productType);
    const industryMatch =
      !c.industries?.length || c.industries.includes(framework.industry);
    return typeMatch && industryMatch;
  });
  console.log("RULE BASED CONTROLS");
  console.log(ruleBasedControls);

  const vectorControls = searchResults
    .filter(
      (r) =>
        !r.payload.productTypes?.length ||
        r.payload.productTypes.includes(product.productType),
    )
    .map((r) => ({
      controlId: r.payload.controlId,
      title: r.payload.controlTitle,
      text: r.payload.text,
      mandatory: r.payload.isMandatory,
      riskLevel: r.payload.riskLevel,
      weight: Number(r.payload.weight || 10),
    }));
  console.log("VECTOR CONTROLS");
  console.log(vectorControls);
  const merged = new Map();
  [...ruleBasedControls, ...vectorControls].forEach((c) => {
    if (c.controlId) merged.set(normalize(c.controlId), c);
  });

  return Array.from(merged.values());
};

const parseAiResponse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned); // throws if still invalid
  }
};

const normalizeControls = (controls) => {
  const valid = ["pass", "partial", "fail", "not_applicable"];
  return controls.map((c) => {
    const status = valid.includes(c.status?.toLowerCase())
      ? c.status.toLowerCase()
      : "partial";
    return {
      controlId: String(c.controlId || ""),
      title: String(c.title || ""),
      status,
      score: STATUS_SCORES[status] ?? 0.7,
      reason: String(c.reason || ""),
    };
  });
};

const calcWeightedScore = (normalizedControls, relevantControls) => {
  const normalize = (id) => String(id).trim().toUpperCase();
  let totalWeight = 0;
  let weightedScore = 0;

  normalizedControls.forEach((ac) => {
    const matched = relevantControls.find(
      (c) => normalize(c.controlId) === normalize(ac.controlId),
    );
    const baseWeight = Number(matched?.weight || 10);
    const weight = matched?.mandatory ? baseWeight * 2 : baseWeight;
    totalWeight += weight;
    weightedScore += ac.score * weight;
  });

  return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
};

const calcBreakdown = (controls) => ({
  total: controls.length,
  passed: controls.filter((c) => c.status === "pass").length,
  partial: controls.filter((c) => c.status === "partial").length,
  failed: controls.filter((c) => c.status === "fail").length,
  notApplicable: controls.filter((c) => c.status === "not_applicable").length,
});

// ─────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────

export const analyzeCompliance = async (req, res) => {
  try {
    const {productId, frameworkId} = req.body;

    if (!productId || !frameworkId) {
      return res
        .status(400)
        .json({error: "Product ID and Framework ID are required"});
    }

    const [product, framework] = await Promise.all([
      Product.findById(productId),
      Framework.findById(frameworkId),
    ]);

    if (!product) return res.status(404).json({error: "Product not found"});
    if (!framework) return res.status(404).json({error: "Framework not found"});
    const productText = buildProductText(product);
    const productVector = await generateEmbedding(productText);

    const searchResults = await qdrantClient.search("frameworks", {
      vector: productVector,
      limit: 10,
      filter: {must: [{key: "frameworkId", match: {value: frameworkId}}]},
    });

    const relevantControls = getRelevantControls(
      framework,
      product,
      searchResults,
    );
    console.log("relevant controls");
    console.log(relevantControls);
    if (!relevantControls.length) {
      return res.status(400).json({
        error:
          "No relevant controls found for this product type and framework.",
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {role: "user", content: buildPrompt(productText, relevantControls)},
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.15,
      max_tokens: 4096,
      response_format: {type: "json_object"},
    });

    let parsedReport;
    try {
      parsedReport = parseAiResponse(chatCompletion.choices[0].message.content);
    } catch {
      return res.status(500).json({error: "Invalid JSON returned by AI"});
    }

    if (!Array.isArray(parsedReport.controls)) {
      return res
        .status(500)
        .json({error: "Invalid AI response — controls array missing"});
    }

    const normalizedControls = normalizeControls(parsedReport.controls);
    const normalizedRecommendations = (parsedReport.recommendations || []).map(
      String,
    );
    const finalScore = calcWeightedScore(normalizedControls, relevantControls);
    const breakdown = calcBreakdown(normalizedControls);

    const savedReport = await Report.create({
      product: productId,
      framework: frameworkId,
      summary: parsedReport.summary || "",
      recommendations: normalizedRecommendations,
      analysis: normalizedControls,
      reportMarkdown: parsedReport.reportMarkdown || "",
      complianceScore: finalScore,
      createdBy: req.user.id,
    });

    return res.status(200).json({
      message: "Compliance Report Generated Successfully",
      data: {
        reportId: savedReport._id,
        product: product.productName,
        framework: framework.name,
        summary: parsedReport.summary,
        overallRisk: parsedReport.overallRisk || "medium",
        recommendations: normalizedRecommendations,
        analysis: normalizedControls,
        breakdown,
        reportMarkdown: parsedReport.reportMarkdown,
        complianceScore: finalScore,
      },
    });
  } catch (error) {
    console.error("analyzeCompliance error:", error);
    return res
      .status(500)
      .json({error: "Failed to analyze report", message: error.message});
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({createdBy: req.user.id})
      .populate("product", "productName productType")
      .populate("framework", "name shortCode")
      .sort({createdAt: -1});

    return res.status(200).json({data: reports});
  } catch (error) {
    return res.status(500).json({message: "Failed to fetch reports"});
  }
};

export const getSingleReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("product", "productName productType")
      .populate("framework", "name shortCode");

    if (!report) return res.status(404).json({error: "Report not found"});

    return res.status(200).json({data: report});
  } catch (error) {
    return res.status(500).json({error: "Failed to fetch report"});
  }
};
