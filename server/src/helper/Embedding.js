import axios from "axios";
import { loadGoogleDriveFile } from "./metaData/drive.js";
import FormData from 'form-data'

export async function createEmbedding(auth, fileId, metaData) {
  const RAG_URL = "http://localhost:8000/upload";

  try {
    // Get the file stream from Google Drive
    const file = await loadGoogleDriveFile(auth, fileId);
    const formData = new FormData();
    formData.append("file", file?.data, { filename: file?.name, contentType: file?.mimeType });
    formData.append("metadata", JSON.stringify(file?.metadata));

    console.log("first")
    // Send the file and metadata to the server
    const response = await axios.post(RAG_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log("second")
    return {
      success: true,
      message: "Embedding created successfully",
      data: response?.data
    };
  } catch (error) {
    console.error("Error creating embedding:", error?.response?.data);
    return {
      success: false,
      message: error.message || "An error occurred while creating the embedding"
    };
  }
}
