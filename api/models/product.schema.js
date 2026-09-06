import mongoose from "mongoose";
import {randomUUID} from "crypto";

const productSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },

    // Basic Info
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productCode: String,
    description: String,
    productType: {
      type: String,
      enum: [
        "drug",
        "medical_device",
        "software",
        "ai_system",
        "diagnostic",
        "other",
      ],
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    //regulatory:
    regulatory: {
      deviceClass: String,
      riskCategory: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
      },
      intendedUse: String,
      market: [String],
      approvals: [
        {
          authority: String,
          approvalNumber: String,
          approvalDate: Date,
        },
      ],
    },
    // Compliance:
    complianceStatus: {
      type: String,
      enum: ["draft", "under_review", "compliant", "non_compliant"],
      default: "draft",
    },
    complianceScore: {
      type: Number,
      default: 0,
    },
    vectorIndexed: {
      type: Boolean,
      default: false,
    },
    complianceDetails: {
      // ─── Common (all types) ───────────────────────────
      riskAssessmentPerformed: {type: Boolean, default: false},
      riskAssessmentMethodology: String,
      riskMitigationSummary: String,
      encryptionAtRest: {type: Boolean, default: false},
      encryptionInTransit: {type: Boolean, default: false},
      hipaaCompliant: {type: Boolean, default: false},
      gdprCompliant: {type: Boolean, default: false},
      dataRetentionPolicy: String,
      auditLoggingEnabled: {type: Boolean, default: false},
      logRetentionDays: Number,
      isoStandard: String,
      technicalNotes: String,

      // ─── Medical Device specific ──────────────────────
      medicalDevice: {
        clinicalValidationDone: {type: Boolean, default: false},
        sterilizationMethod: String, // e.g. "ETO", "Gamma", "N/A"
        biocompatibilityTested: {type: Boolean, default: false},
        postMarketSurveillance: {type: Boolean, default: false},
        udiAssigned: {type: Boolean, default: false}, // Unique Device ID
      },

      // ─── Drug / Pharma specific ───────────────────────
      drug: {
        clinicalTrialPhase: String, // "Phase I", "Phase II", "Phase III", "Approved"
        gmpCertified: {type: Boolean, default: false},
        formulationType: String, // e.g. "tablet", "injection", "topical"
        activeIngredient: String,
        shelfLifeMonths: Number,
        coldChainRequired: {type: Boolean, default: false},
      },

      // ─── Software / SaMD specific ─────────────────────
      software: {
        softwareVersion: String,
        sdlcMethodology: String, // e.g. "Agile", "IEC 62304"
        penetrationTestingDone: {type: Boolean, default: false},
        lastPenTestDate: Date,
        uptimeSlaPercent: Number, // e.g. 99.9
        disasterRecoveryPlan: {type: Boolean, default: false},
        changeManagementProcess: {type: Boolean, default: false},
      },

      // ─── AI System specific ───────────────────────────
      aiSystem: {
        aiModelValidated: {type: Boolean, default: false},
        modelVersion: String,
        trainingDataDocumented: {type: Boolean, default: false},
        biasTestingDone: {type: Boolean, default: false},
        explainabilityMethod: String, // e.g. "SHAP", "LIME", "N/A"
        humanOversightEnabled: {type: Boolean, default: false},
        modelDriftMonitoring: {type: Boolean, default: false},
        euAiActRiskLevel: {
          type: String,
          enum: ["minimal", "limited", "high", "unacceptable", ""],
          default: "",
        },
      },

      // ─── Diagnostic specific ──────────────────────────
      diagnostic: {
        sensitivityPercent: Number, // true positive rate
        specificityPercent: Number, // true negative rate
        labAccredited: {type: Boolean, default: false},
        accreditationBody: String, // e.g. "CAP", "NABL", "ISO 15189"
        specimenType: String, // e.g. "blood", "urine", "tissue"
        turnaroundTimeHours: Number,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {timestamps: true},
);

export const Product = mongoose.model("Product", productSchema);
