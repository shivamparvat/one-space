import { createEmbedding } from "../helper/Embedding.js";
import {
  authorizeGoogleDrive,
  listGoogleDriveFiles,
} from "../helper/metaData/drive.js";
import AppToken from "../Schema/apptoken.js";
import AiQurey from "../helper/AiQurey.js";
import { DROPBOX_STR, GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";

export const Embedding = async (req, res) => {
  initEmbedding(req, res);
};

export const AIsearch = async (req, res) => {
  try {
    const query = req?.query?.searchQuery;
    const result = await AiQurey(query);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ success: false, message: "search Error" + error });
  }
};

async function initEmbedding(req, res) {
  const user = req.user;

  const organization = user?.organization;
  const user_id = user?._id;
  const connectedApps = await AppToken.find({organization, user_id});

  // res.setHeader("Content-Type", "text/event-stream");
  // res.setHeader("Cache-Control", "no-cache");
  // res.setHeader("Connection", "keep-alive");

  try {
    for (const app of connectedApps) {
      const { access_token, refresh_token, scope, token_type, expiry_date } =
        app;

      if (app?.state === GOOGLE_DRIVE_STR) {
        const authClient = await authorizeGoogleDrive({
          access_token,
          refresh_token,
          scope,
          token_type,
          expiry_date,
        });

        const files = await listGoogleDriveFiles(authClient, 10);
        const totalFiles = (files || []).length;
        // console.log(totalFiles,"totalFiles")

        for (let index = 0; index < totalFiles; index++) {
          const file = files[index];
          const fileId = file?.id;

          const embeddingResult = await createEmbedding(
            authClient,
            fileId,
            file
          );
          console.log(embeddingResult?.response);

          // if (!embeddingResult.success) {
          //   throw new Error(
          //     `Failed to create embedding for file ID: ${fileId}`
          //   );
          // }

          // const progress = Math.round(((index + 1) / totalFiles) * 100);

          // res.write(
          //   `data: ${JSON.stringify({ fileId, progress: `${progress}%` })}\n\n`
          // );
          res.status(200);
        }
      } else if (app?.state === DROPBOX_STR) {
      }
    }

    // res.write(
    //   `data: ${JSON.stringify({
    //     status: 200,
    //     message: "All embeddings created successfully",
    //     overallProgress: "100%",
    //   })}\n\n`
    // );

    res.status(200);
    // res.end();
  } catch (error) {
    // res.write(
    //   `data: ${JSON.stringify({
    //     status: 500,
    //     message: error.message || "An error occurred while creating embeddings",
    //   })}\n\n`
    // );
    // res.end();
    res
      .status(500)
      .json({ success: false, message: "Embedding Error" + error });
  }
}
