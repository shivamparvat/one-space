import mongoose from "mongoose";

const SearchSchema = new mongoose.Schema(
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
      index: true,
    },
    query: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number], // Array of numbers representing the embedding vector
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add `createdAt` and `updatedAt`
  }
);

const Search = mongoose.model("Search", SearchSchema);

export default Search;
