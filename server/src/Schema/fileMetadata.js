// Schema/fileMetadata.js
import mongoose from "mongoose";

// Define the schema for file metadata
const FileMetadataSchema = new mongoose.Schema(
  {
    // orgId: {
    //   type: mongoose.Schema.Types.ObjectId, // Reference to the organization
    //   ref: 'Organization', // Optional: If you're referencing an Organization model
    //   required: true, // Ensure this field is provided
    // },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    is_embedded: {
      type: Boolean,
      default: false
    },
    is_embedded: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Create and export the model based on the schema
const Filedata = mongoose.model("Filedata", FileMetadataSchema);

export default Filedata;
