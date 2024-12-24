import { google } from "googleapis";
import { GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";
import { authorizeGoogleDrive } from "../helper/metaData/drive.js";
import AppToken from "../Schema/apptoken.js";
import User from "../Schema/userSchema.js";
import Filedata from "../Schema/fileMetadata.js";
import { createEmbedding } from "../helper/Embedding.js";
import cache from "../redis/cache.js";
import embeddingQueue from "../Queue/embeddingQueue.js";

const QUEUE_DELAY = 1000 * 60

export async function UpdateDriveData() {
  console.log("update func")
  try {
    const cacheTokenKey = `tokens_${GOOGLE_DRIVE_STR}`
    // Retrieve all active users
    //   cache.set(cache_id, MessageNumber, 10);
    let tokens = []
    let user = {}
    let cachedData = await cache.get(cacheTokenKey);
    if ((cachedData || []).length > 0) {
      tokens = cachedData
    } else {
      tokens = await AppToken.find({ state: GOOGLE_DRIVE_STR });
      cache.set(cacheTokenKey, tokens, 100);
    }

    if (tokens.length > 0) {
      tokens.forEach(async (token) => {
        const user_id = token?.user_id;
        const cacheUserKey = `tokens_${GOOGLE_DRIVE_STR}_${user_id}`
        let cachedUserData = await cache.get(cacheUserKey);
        if ((cachedUserData || []).length > 0) {
          user = cachedUserData
        } else {
          user = await User.findById(user_id);
          cache.set(cacheUserKey, user, 100);
        }
        // if (user?.ai_permission) {
        const auth = await authorizeGoogleDrive({
          access_token: token?.access_token,
          refresh_token: token?.refresh_token,
          scope: token?.scope,
          token_type: token?.token_type,
          expiry_date: token?.expiry_date,
        });

        const drive = google.drive({ version: "v3", auth });
        const currentStartPageToken = token?.driveStartPageToken;
        const { data: startPageData } =
          await drive.changes.getStartPageToken();

        let startToken = currentStartPageToken || startPageData?.startPageToken;
        if (startToken) {
          if (startPageData?.startPageToken !== currentStartPageToken) {
            await AppToken.findOneAndUpdate(
              { user_id },
              { $set: { driveStartPageToken: startPageData?.startPageToken } },
              { new: true, upsert: true }
            );
            cache.del(cacheTokenKey)
          }
          await listChanges(token, drive, startToken, user);
        }
      });
    }

    // console.log("Google Drive sync completed.");
  } catch (error) {
    console.error("Error in syncing Google Drive data:", error);
  }
}



async function listChanges(token, drive, startPageToken, user) {
  const user_id = user?._id
  const organization = user?.organization?._id
  try {
    const changesResponse = await drive.changes.list({
      pageToken: startPageToken,
      fields: 'changes(fileId,changeType, file(*))',
    });
    const changeFiles = await changesResponse.data.changes
    // console.log(changeFiles)
    if (changeFiles.length > 0) {
      (changeFiles || []).map(async (file) => {
        const fileMetadata = file?.file
        const id = fileMetadata?.id
        if (fileMetadata?.kind == "drive#file") {
          const previousMetadata = await getPreviousMetadata(id, organization, user_id);
          if (!previousMetadata) {
            await Filedata.create({
              doc_id: id,
              organization,
              user_id,
              data: fileMetadata,
            })
            embeddingQueue.add({ token, id }, { jobId: `embedding_${id}`, delay: QUEUE_DELAY }).then((job) => console.log(`Job added: ${job.id}`))
            .catch((err) => console.error('Error adding job to queue:', err));;
          } else {
            if (+fileMetadata.version > +previousMetadata.version) {
              await Filedata.updateOne(
                { doc_id: id },
                { $set: { data: fileMetadata } },
                { upsert: true }
              );
              embeddingQueue.add({ token, id }, { jobId: `embedding_${id}`, delay: QUEUE_DELAY }).then((job) => console.log(`Job added: ${job.id}`))
              .catch((err) => console.error('Error adding job to queue:', err));;
            }
          }

        }
      })
    } else {
      // console.log('No changes found');
    }
  } catch (error) {
    console.error('Error listing changes:', error);
  }
}


async function getPreviousMetadata(ResourceID, organization, user_id) {
  const prefile = await Filedata.findOne({ doc_id: ResourceID, organization, user_id })
  return prefile?.data
}


async function getFileMetadata(drive, ResourceID) {
  try {
    const response = await drive.files.get({
      fileId: ResourceID,
      fields: "*" // Adjust fields as needed
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching file metadata:", error);
    throw error;
  }
}
