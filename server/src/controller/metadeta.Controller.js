import AppToken from "../Schema/apptoken.js";
import Filedata from "../Schema/fileMetadata.js";
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
    let results = [];

    const user = req.user
    const organization = user?.organization


    if(!organization) return  res
    .status(403)
    .json({ success: false, message: "organization id missing" });

    const user_id = user?._id
    const searchQuery = req.query.search || ""; 
    const searchFilter = searchQuery
      ? {
          $text: { $search: searchQuery },
        }
      : {};

      const page = parseInt(req.query.page, 10) || 1; 
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      const connectedApps = await AppToken.find();
    for (const app of connectedApps) {
      const { access_token, refresh_token, scope, token_type, expiry_date } =
        app;

      const mainCache = `${user_id}_${organization}_${app?.state}`;
      const cacheKey = searchQuery ? `${user_id}_${organization}_${app?.state}_${searchQuery}`: mainCache
      // Check if data exists in cache
      let cachedData = await cache.get(cacheKey);

      if ((cachedData || []).length > 0) {
        results = [...results, ...cachedData];
      } else {

        const dbData = await Filedata.find({ organization,user_id, ...searchFilter })
          .skip(skip)
          .limit(limit);
        if (dbData.length > 0) {
          results = [...results, ...dbData];
          searchQuery?
          cache.set(cacheKey, dbData, 21600):
          cache.set(cacheKey, dbData, 100)
        } else {
          if(!searchQuery){
            if (app?.state == "Google Drive") {
              const authClient = await authorizeGoogleDrive({
                access_token,
                refresh_token,
                scope,
                token_type,
                expiry_date,
              });
              const files = await listGoogleDriveFiles(authClient);
              const fileDataToInsert = files.map(file => {
                return {
                  doc_id:file.id,
                  user_id,
                  organization,
                  data:file
                };
              });
              const resdb = await Filedata.insertMany(fileDataToInsert);
              
              searchQuery?
              cache.set(cacheKey, files, 21600):
              cache.set(cacheKey, files, 100)
  
  
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
  
              const fileDataToInsert = files.map(file => {
                return {
                  doc_id:file.id,
                  user_id,
                  organization,
                  data:file
                };
              });
              await Filedata.insertMany(fileDataToInsert);
  
              searchQuery?
              cache.set(cacheKey, files, 21600):
              cache.set(cacheKey, files, 100)
  
  
              results = [...results, ...files];
            }
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
