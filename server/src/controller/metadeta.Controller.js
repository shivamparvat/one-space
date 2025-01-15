import AppToken from "../Schema/apptoken.js";
import Filedata from "../Schema/fileMetadata.js";
import Search from "../Schema/searchSchema.js";

import cache from "../redis/cache.js";

export const fileMetadata = async (req, res) => {
  try {
    let results = [];
    const user = req.user;
    const organization = user?.organization?._id;

    if (!organization)
      return res
        .status(403)
        .json({ success: false, message: "organization id missing" });

    const user_id = user?._id;
    const searchQuery = req.query.search || "";
    const searchFilter = searchQuery
      ? {
          $text: { $search: searchQuery },
        }
      : {};

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    let orQurey = []

    const connectedApps = await AppToken.find({ organization, user_id }).select("state");
    if (!(connectedApps.length > 0)) {
      return res.status(200).json({
        success: true,
        data: results,
        message: "please connect apps",
        appIsEmpty: true,
      });
    }
    for (const app of connectedApps) {
      const { state } = app;
      orQurey.push(state)
      }

      const mainCache = `file_${user_id}_${organization}_${page}_${limit}`;
      const cacheKey = searchQuery
        ? `file_${user_id}_${organization}_${searchQuery}_${page}_${limit}`
        : mainCache;
      // Check if data exists in cache
      let cachedData = await cache.get(cacheKey);

      if ((cachedData || []).length > 0) {
        results = [...results, ...cachedData];
      } else {

        console.log(JSON.stringify({
          organization,
          user_id,
          ...searchFilter,
          $or: [
            { "data.trashed": false }, 
            { "data.trashed": { $exists: false } },
            { app_name: { $in: orQurey } }
          ],
        }),null,2)
        const dbData = await Filedata.find({
          organization,
          user_id,
          ...searchFilter,
          $or: [
            // { "data.trashed": false }, 
            // { "data.trashed": { $exists: false } },
            { app_name: { $in: orQurey } }
          ],
        })
          .select('-chunks.embedding')
          .sort({"data.modifiedTime": -1 }) 
          .skip(skip)
          .limit(limit);

          if (dbData.length > 0) {
            results = [...results, ...dbData];
            cache.set(cacheKey, dbData, 100);
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




export const autocomplete = async (req, res) => {
  const { query } = req.query; // User input query

  const user = req.user;
  const organization = user?.organization?._id;

  if (!organization)
    return res
      .status(403)
      .json({ success: false, message: "organization id missing" });

  const user_id = user?._id;

  try {
    // Search in FileData for matching filenames
    const fileDataResults = await Filedata.find({
      filename: { $regex: query, $options: "i" },
      user_id,
      organization,
      "data.trashed":false
    })
      .select("filename")
      .limit(5)
      .exec();

    // Search in Search for user's previous search history
    const searchResults = await Search.find({
      query: { $regex: query, $options: "i" },
      user_id,
      organization,
    })
      .select("query")
      .limit(5) // Limit the number of results
      .exec();

    // Combine both results (FileData and Search) into a single response
    const combinedResults = [...fileDataResults, ...searchResults];

    // Return the combined recommendations
    res.json({
      recommendations: combinedResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred during the search." });
  }
};







        // else {
        //   if (!searchQuery) {
        //     if (app?.state == GOOGLE_DRIVE_STR) {
        //       const authClient = await authorizeGoogleDrive({
        //         access_token,
        //         refresh_token,
        //         scope,
        //         token_type,
        //         expiry_date,
        //       });
        //       const files = await listGoogleDriveFilesRecursively(authClient,user_id, organization);
        //       const fileDataToInsert = files.map((file) => {
        //         return {
        //           updateOne: {
        //             filter: { doc_id: file.id, user_id, organization },
        //             update: {
        //               $set: {
        //                 doc_id: file.id,
        //                 user_id,
        //                 organization,
        //                 data: file,
        //               },
        //             },
        //             upsert: true, // Insert a new document if no match is found
        //           },
        //         };
        //       });
        //       await Filedata.bulkWrite(fileDataToInsert);

        //       const dbData = await Filedata.find({
        //         organization,
        //         user_id,
        //         ...searchFilter,
        //         "data.trashed":false
        //       })
        //         .select('-chunks.embedding')
        //         .sort({ "data.modifiedTime": -1 })
        //         .skip(skip)
        //         .limit(limit);
                
        //       if (dbData.length > 0) {
        //         const OrganizeData = await dataOrganizer(dbData,user) || []
        //         results = [...results, ...OrganizeData];
        //         cache.set(cacheKey, OrganizeData, 100);
        //       }
        //     } else 
        //     if (app?.state == DROPBOX_STR) {
        //       const { dbx } = await initializeDropbox({
        //         accessToken: access_token,
        //         refreshToken: refresh_token,
        //         clientId: process.env.DROPBOX_CLIENT_ID,
        //         clientSecret: process.env.DROPBOX_CLIENT_SECRET,
        //         expiryDate: expiry_date,
        //         scope,
        //       });

        //       const files = await fetchDetailedDropboxFileData(dbx);

        //       const fileDataToInsert = files.map((file) => {
        //         return {
        //           doc_id: file.id,
        //           user_id,
        //           organization,
        //           data: file,
        //         };
        //       });
        //       await Filedata.insertMany(fileDataToInsert);

        //       cache.set(cacheKey, files, 100);

        //       results = [...results, ...files];
        //     }
        //   }
        // }
      
    // }
