import AppToken from "../Schema/apptoken.js";
import FileMetadataSchema from "../Schema/fileMetadata.js";
import cache from "../redis/cache.js";
import {
  authorizeGoogleDrive,
  listGoogleDriveFiles,
} from "../helper/metaData/drive.js";
import {
  fetchDetailedDropboxFileData,
  initializeDropbox,
} from "../helper/metaData/dropbox.js";

export const fileMetadata = async (req, res) => {
  try {
    const connectedApps = await AppToken.find(); // Fetch all connected apps from MongoDB

    let results = [];

    for (const app of connectedApps) {
      const { access_token, refresh_token, scope, token_type, expiry_date } =
        app;

      const cacheKey = `orgId_${app?.state}`;

      // Check if data exists in cache
      let cachedData = await cache.get(cacheKey);

      if (cachedData) {
        console.log("Serving data from cache");
        results = [...results, ...cachedData];
      } else {
        const dbData = await FileMetadataSchema.find({ orgId: cacheKey });
        if (dbData.length > 0) {
          console.log("Serving data from MongoDB");
          results = [...results, ...dbData];
          cache.set(cacheKey, dbData, 21600);
        } else {
          if (app?.state == "Google Drive") {
            const authClient = await authorizeGoogleDrive({
              access_token,
              refresh_token,
              scope,
              token_type,
              expiry_date,
            });
            const files = await listGoogleDriveFiles(authClient);
            await FileMetadataSchema.insertMany(files);
            cache.set(cacheKey, files, 21600);
            results = [...results, ...files];
          } else if (app?.state == "Dropbox") {
            const { dbx } = await initializeDropbox({
              accessToken: access_token,
              refreshToken: refresh_token,
              clientId: process.env.DROPBOX_CLIENT_ID,
              clientSecret: process.env.DROPBOX_CLIENT_SECRET,
              expiryDate: expiry_date,
              scope,
            });

            const files = await fetchDetailedDropboxFileData(dbx);
            await FileMetadataSchema.insertMany(files);
            cache.set(cacheKey, files, 21600);
            results = [...results, ...files];
          }
        }
      }
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching metadata" });
  }
};
