import mongoose from "mongoose";

const FileMetadataSchema = new mongoose.Schema(
  {
    doc_id:{
      type: String, 
      required: [true, "doc_id is required"],
    },
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
    app_name: {
      type: string,
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
