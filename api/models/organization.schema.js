import {randomUUID} from "crypto";
import mongoose from "mongoose";
const companySchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      index: true,
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
    },
    dbaName: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    //contact
    primaryContact: {
      name: String,
      email: {
        type: String,
        lowercase: true,
        trim: true,
      },
    },
    phoneNumber: String,
    website: String,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Auth",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // regulatory:
    identifiers: {
      // usa/ global
      fdafei: String,
      labellerCode: String,
      dunsNumber: String,

      // indian/corporate
      cin: String,
      gstin: String,
      pan: String,

      //indian regulatory
      cdsco: String, // central drugs standard control organization
      others: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Organization = mongoose.model("Organization", companySchema);
