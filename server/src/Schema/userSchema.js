import { Schema, model } from "mongoose";
import path from "path";

const userSchema = new Schema(
  {
    first_name: {
      type: String
    },
    last_name: {
      type: String
    },
    contact_number: {
      type: String
    },
    email: {
      type: String,
      required: [true, "Email is required"]
    },
    password: {
      type: String
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"]
    },
    organization:{
        type: Schema.Types.ObjectId,
        ref: "Organization",
    },
    image: { type: String },
    address: {
      type: String
    },
    login_type: {
      type: String,
      enum: ["", "google", "credential"]
    },
    is_email_verified: {
      type: Boolean,
      default: false
    },
    is_active: {
      type: Boolean,
      default: true
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    email_verify_tokan: String,
    reset_pass_tokan: String,
    reset_pass_expiry: String
  },
  { timestamps: true }
);

// userSchema.virtual("url").get(function () {
//   if (this.image) {
//     const hostUrl = "http://192.168.1.7:5000" || process.env.HostURL.replace(/\\/g, "/"); // Replace backslashes with forward slashes
//     const newPath = this.image.replace(/\\/g, "/").replace(/^public\//, ''); // Remove "public" segment from the path
//     return `${hostUrl}/${newPath}`; // Combine hostUrl and newPath using forward slashes
//   }
//   return "http://localhost:5000/default/profile.png";
// });

userSchema.virtual("url").get(function() {
  if (this.image && this.image.includes("http")) {
    return this.image;
  } else if (this.image) {
    return `http://${this.image}`;
  } else {
    return "https://gprop-demo-server.s3.ap-south-1.amazonaws.com/public/assets/logo.png";
  }
});

// Use toJSON option to include virtuals when converting the document to JSON
userSchema.set("toJSON", { virtuals: true });

const User = model("user", userSchema);
export default User;
