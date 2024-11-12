import axios from "axios";
import { loadGoogleDriveFile } from "./metaData/drive";

export async function createEmbedding(auth, fileId, metaData) {
  const RAG_URL = "http://localhost:8000/upload";

  try {
    // Get the file stream from Google Drive
    const fileStream = await loadGoogleDriveFile(auth, fileId);

    // Convert the stream to a buffer
    const buffer = await streamToBuffer(fileStream);

    // Create FormData and append the file as a buffer with metadata
    const formData = new FormData();
    formData.append("file", buffer, "filename_from_drive"); // Adjust filename if needed
    formData.append("metaData", JSON.stringify(metaData));

    // Send the FormData to the upload endpoint
    const response = await axios.post(RAG_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return {
      success: true,
      message: "Embedding created successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating embedding:", error);
    return {
      success: false,
      message:
        error.message || "An error occurred while creating the embedding",
    };
  }
}

// Helper function: Convert a stream to a buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}
