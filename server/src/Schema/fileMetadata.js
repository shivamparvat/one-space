import mongoose from "mongoose";

const FileMetadataSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', 
      required: true, 
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    is_embedded: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

const Filedata = mongoose.model("Filedata", FileMetadataSchema);

export default Filedata;
