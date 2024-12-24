import mongoose from "mongoose";

const authSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organization",
      required: true,
    },
    state: { type: String, required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    scope: { type: String },
    token_type: { type: String, required: true },
    expiry_date: { type: Number, required: true },
    driveStartPageToken: String,
  },
  { timestamps: true }
);

const AppToken = mongoose.model("Apptokens", authSchema);

export default AppToken;
