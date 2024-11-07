// Schema/fileMetadata.js
import mongoose from "mongoose";

const FileMetadataSchema = new mongoose.Schema({
  orgId: String, // Identifier for the service (e.g., "Google Drive", "Dropbox")
  data: mongoose.Schema.Types.Mixed, // Store any structure here
}, { timestamps: true });

export default mongoose.model("FileMetadata", FileMetadataSchema);
