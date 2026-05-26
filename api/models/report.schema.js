import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    framework: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Framework",
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    complianceScore: {
      type: Number,
      default: 0,
    },
    recommendations: [String],

    analysis: [
      {
        controlId: String,
        title: String,
        status: String,
        score: Number,
        reason: String,
      },
    ],

    reportMarkdown: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
  },
  {timestamps: true},
);

export const Report = mongoose.model("Report", reportSchema);
