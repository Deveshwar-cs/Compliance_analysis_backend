import {Product} from "../models/product.schema.js";

export const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      productCode,
      description,
      productType,
      company,
      complianceStatus,
      complianceScore,
      deviceClass,
      riskCategory,
      intendedUse,
      approvals,
      market,
    } = req.body;

    // ======================
    // REGULATORY
    // ======================
    const regulatory = {
      deviceClass,
      intendedUse,
      riskCategory,
      market: JSON.parse(market || "[]"),
      approvals: JSON.parse(approvals || "[]"),
    };

    // ======================
    // IMAGES
    // ======================
    const images = req.files?.map((img) => ({
      url: img.path,
      publicId: img.filename,
    }));

    // ======================
    // COMPLIANCE DETAILS
    // Helper to parse booleans from FormData strings
    // ======================
    const bool = (val) => val === "true" || val === true;
    const num = (val) =>
      val !== undefined && val !== "" ? Number(val) : undefined;
    const cd = req.body;

    const complianceDetails = {
      // ── Common ──────────────────────────────────────
      riskAssessmentPerformed: bool(cd.riskAssessmentPerformed),
      riskAssessmentMethodology: cd.riskAssessmentMethodology,
      riskMitigationSummary: cd.riskMitigationSummary,
      encryptionAtRest: bool(cd.encryptionAtRest),
      encryptionInTransit: bool(cd.encryptionInTransit),
      hipaaCompliant: bool(cd.hipaaCompliant),
      gdprCompliant: bool(cd.gdprCompliant),
      dataRetentionPolicy: cd.dataRetentionPolicy,
      auditLoggingEnabled: bool(cd.auditLoggingEnabled),
      logRetentionDays: num(cd.logRetentionDays),
      isoStandard: cd.isoStandard,
      technicalNotes: cd.technicalNotes,

      // ── Medical Device ───────────────────────────────
      medicalDevice: {
        clinicalValidationDone: bool(cd.clinicalValidationDone),
        sterilizationMethod: cd.sterilizationMethod,
        biocompatibilityTested: bool(cd.biocompatibilityTested),
        postMarketSurveillance: bool(cd.postMarketSurveillance),
        udiAssigned: bool(cd.udiAssigned),
      },

      // ── Drug ─────────────────────────────────────────
      drug: {
        clinicalTrialPhase: cd.clinicalTrialPhase,
        gmpCertified: bool(cd.gmpCertified),
        formulationType: cd.formulationType,
        activeIngredient: cd.activeIngredient,
        shelfLifeMonths: num(cd.shelfLifeMonths),
        coldChainRequired: bool(cd.coldChainRequired),
      },

      // ── Software ─────────────────────────────────────
      software: {
        softwareVersion: cd.softwareVersion,
        sdlcMethodology: cd.sdlcMethodology,
        penetrationTestingDone: bool(cd.penetrationTestingDone),
        lastPenTestDate: cd.lastPenTestDate || undefined,
        uptimeSlaPercent: num(cd.uptimeSlaPercent),
        disasterRecoveryPlan: bool(cd.disasterRecoveryPlan),
        changeManagementProcess: bool(cd.changeManagementProcess),
      },

      // ── AI System ────────────────────────────────────
      aiSystem: {
        aiModelValidated: bool(cd.aiModelValidated),
        modelVersion: cd.modelVersion,
        trainingDataDocumented: bool(cd.trainingDataDocumented),
        biasTestingDone: bool(cd.biasTestingDone),
        explainabilityMethod: cd.explainabilityMethod,
        humanOversightEnabled: bool(cd.humanOversightEnabled),
        modelDriftMonitoring: bool(cd.modelDriftMonitoring),
        euAiActRiskLevel: cd.euAiActRiskLevel || "",
      },

      // ── Diagnostic ───────────────────────────────────
      diagnostic: {
        sensitivityPercent: num(cd.sensitivityPercent),
        specificityPercent: num(cd.specificityPercent),
        labAccredited: bool(cd.labAccredited),
        accreditationBody: cd.accreditationBody,
        specimenType: cd.specimenType,
        turnaroundTimeHours: num(cd.turnaroundTimeHours),
      },
    };

    // ======================
    // CREATE PRODUCT
    // ======================
    const product = await Product.create({
      productName,
      productCode,
      description,
      productType,
      company,
      createdBy: req.user.id,
      complianceStatus,
      complianceScore,
      regulatory,
      complianceDetails,
      images,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);
    res.status(500).json({message: error.message});
  }
};

export const getProductsByCompany = async (req, res) => {
  try {
    const {companyId} = req.params;
    const products = await Product.find({
      company: companyId,
      createdBy: req.user.id,
    });
    return res.status(200).json({
      data: products,
    });
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({isActive: true});
    return res.status(200).json({
      data: products,
    });
  } catch (err) {
    return res.status(500).json({message: err.message});
  }
};
