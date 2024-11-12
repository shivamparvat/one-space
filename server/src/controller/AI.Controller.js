import { createEmbedding } from "../helper/Embedding";
import { listGoogleDriveFiles } from "../helper/metaData/drive";

export const Embedding = async (req, res) => {
  initEmbedding();
};

async function initEmbedding() {
  const connectedApps = await AppToken.find(); // Fetch all connected apps from MongoDB

  let results = [];

  for (const app of connectedApps) {
    const { access_token, refresh_token, scope, token_type, expiry_date } = app;

    if (app?.state == "Google Drive") {
      const authClient = await authorizeGoogleDrive({
        access_token,
        refresh_token,
        scope,
        token_type,
        expiry_date,
      });
      const files = await listGoogleDriveFiles(authClient);
      console.log(files);
      //   createEmbedding(authClient, fileId, metaData);
    }
  }
}
