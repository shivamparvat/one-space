import { createEmbedding } from "../helper/Embedding";
import { listGoogleDriveFiles } from "../helper/metaData/drive";

export const Embedding = async (req, res) => {
  initEmbedding();
};

async function initEmbedding(req, res) {
  const connectedApps = await AppToken.find();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    for (const app of connectedApps) {
      const { access_token, refresh_token, scope, token_type, expiry_date } =
        app;

      if (app?.state === "Google Drive") {
        const authClient = await authorizeGoogleDrive({
          access_token,
          refresh_token,
          scope,
          token_type,
          expiry_date,
        });

        const files = await listGoogleDriveFiles(authClient);
        const totalFiles = (files || []).length;

        for (let index = 0; index < totalFiles; index++) {
          const file = files[index];
          const fileId = file?.id;

          const embeddingResult = await createEmbedding(
            authClient,
            fileId,
            file
          );

          if (!embeddingResult.success) {
            throw new Error(
              `Failed to create embedding for file ID: ${fileId}`
            );
          }

          const progress = Math.round(((index + 1) / totalFiles) * 100);

          res.write(
            `data: ${JSON.stringify({ fileId, progress: `${progress}%` })}\n\n`
          );
        }
      }
      else if(app?.state === "Dropbox"){
        
      }
    }

    res.write(
      `data: ${JSON.stringify({
        status: 200,
        message: "All embeddings created successfully",
        overallProgress: "100%",
      })}\n\n`
    );

    res.end();
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({
        status: 500,
        message: error.message || "An error occurred while creating embeddings",
      })}\n\n`
    );
    res.end();
  }
}
