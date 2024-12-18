import axios from "axios";
import { GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";
import AppToken from "../Schema/apptoken.js";
import { authorizeGoogleDrive, loadGoogleDriveFile } from "../helper/metaData/drive.js";
import { google } from "googleapis";
import cache from "../redis/cache.js";
import Filedata from "../Schema/fileMetadata.js";
import { createEmbedding } from "../helper/Embedding.js";



export const driveWebhook = async (req, res) => {
  try {
    console.log(" jg jg jh g")
    const ChannelID = req.headers["x-goog-channel-id"];
    const MessageNumber = req.headers["x-goog-message-number"];
    const ResourceID = req.headers["x-goog-resource-id"];
    const ResourceState = req.headers["x-goog-resource-state"];
    const ResourceURI = req.headers["x-goog-resource-uri"];
    const Changed = req.headers["x-goog-changed"];
    const ChannelToken = req.headers["x-goog-channel-token"];
    const user_id = (ChannelID || "").split("_")[0];
    const organization = (ChannelID || "").split("_")[1];


    const cache_id = `webhook_message_${ChannelID}`


    const messagetoken = await cache.get(cache_id)

    if (!messagetoken) {
      cache.set(cache_id, MessageNumber, 10)
      console.table({
        ChannelID,
        MessageNumber,
        ResourceID,
        ResourceState,
        ResourceURI,
        Changed,
        ChannelToken,
        user_id,
        organization
      });
      const tokens = await AppToken.findOne({ user_id, organization, state: GOOGLE_DRIVE_STR });
      const response = await axios.get(ResourceURI, {
        headers: { Authorization: `Bearer ${tokens?.access_token}` },
      });
      const FileIdList = response?.data?.changes || []
      const auth = await authorizeGoogleDrive({
        access_token: tokens?.access_token,
        refresh_token: tokens?.refresh_token,
        scope: tokens?.scope,
        token_type: tokens?.token_type,
        expiry_date: tokens?.expiry_date,
      })

      FileIdList.map(async (item) => {
        const id = item?.file?.id
        const drive = google.drive({ version: "v3", auth })
        if (item?.file?.kind == "drive#file") {
          const fileMetadata = await getFileMetadata(drive, id);
          console.log("File metadata:", fileMetadata);
          const previousMetadata = await getPreviousMetadata(id);
          if (!previousMetadata) {
            await Filedata.create({
              doc_id: id,
              organization,
              user_id,
              data: fileMetadata,
            })
            await createEmbedding(auth, id)
          } else {
            if (
              fileMetadata.name !== previousMetadata.name ||
              fileMetadata.modifiedTime !== previousMetadata.modifiedTime ||
              fileMetadata.size !== previousMetadata.size ||
              fileMetadata.mimeType !== previousMetadata.mimeType ||
              fileMetadata.permissions !== previousMetadata.permissions
            ) {
              await Filedata.updateOne(
                { doc_id: id }, 
                { $set: { data: fileMetadata } } 
              );
            }

            if (fileMetadata.md5Checksum !== previousMetadata.md5Checksum) {
              await createEmbedding(auth, id)
            }
          }

        } else {
          console.log("Resource ID not found in headers");
        }
      })
    } else {
      console.log(await messagetoken, "messagetoken")
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
};
async function getPreviousMetadata(ResourceID) {
  const prefile = await Filedata.find({ doc_id: ResourceID })
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
