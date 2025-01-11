import axios from "axios";
import { loadGoogleDriveFile } from "./metaData/drive.js";
import FormData from 'form-data'
const RAG_URL = `http://${process.env.RAG_HOST}:8000`;

export async function createGoolgeDriveEmbedding(auth, fileId) {

  try {
    // Get the file stream from Google Drive
    const file = await loadGoogleDriveFile(auth, fileId);
    const formData = new FormData();
    formData.append("file", file?.data, { filename: file?.name, contentType: file?.mimeType });
    formData.append("metadata", JSON.stringify(file?.metadata));
    // Send the file and metadata to the server
    const response = await EmaddingRequest(formData)
    return {
      success: true,
      message: "Embedding created successfully",
      data: response?.data
    };
  } catch (error) {
    console.error("Error creating embedding:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating the embedding"
    };
  }
}

export async function createGmailEmbedding(text, metadata) {
  try {
    const response = await TextEmaddingRequest({text,metadata})
    return {
      success: true,
      message: "Embedding created successfully",
      data: response?.data
    };
  } catch (error) {
    console.log(error)
  }
}

export async function EmaddingRequest(formData){
  const response = await axios.post(RAG_URL+"/upload", formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });
  return response
}
export async function TextEmaddingRequest(data){
  const response = await axios.post(RAG_URL+"/embed-text", data);
  return response
}