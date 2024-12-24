import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true, 
    },
    name: {
      type: String,
      required: true, // Organization name
    },
    domain: {
      type: String, // Domain name (e.g., example.com)
      unique: true,
    },
    contactEmail: {
      type: String,
      required: true, // Primary contact email
    },
    phone: {
      type: String, // Contact number
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    integrations: [
      {
        provider: {
          type: String,
          required: true, // e.g., Google Drive, OneDrive
          enum: ["Google Drive", "OneDrive", "Dropbox", "Slack", "Notion", "Other"],
        },
        token: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Apptokens",
        },
        metadata: {
          type: Map,
          of: String, // Additional metadata for the integration
        },
      },
    ],
  },
  { timestamps: true }
);

const Organization = mongoose.model("organization", organizationSchema);

export default Organization;
