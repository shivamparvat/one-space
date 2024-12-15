import axios from "axios";
import { GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";
import AppToken from "../Schema/apptoken.js";
import { authorizeGoogleDrive } from "../helper/metaData/drive.js";

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


    const tokens = await AppToken.findOne({ user_id, organization, state: GOOGLE_DRIVE_STR });
    // const response = await axios.get(ResourceURI, {
    //   headers: { Authorization: `Bearer ${tokens?.access_token}` },
    // });

    if (ResourceID) {
    const drive = await authorizeGoogleDrive({
                      access_token: tokens?.access_token,
                      refresh_token: tokens?.refresh_token,
                      scope: tokens?.scope,
                      token_type: tokens?.token_type,
                      expiry_date: tokens?.expiry_date,
                    })
      // Fetch latest metadata using the resource ID
      const fileMetadata = await getFileMetadata(drive, ResourceID);
      console.log("File metadata:", fileMetadata);

      const previousMetadata = await getPreviousMetadata(ResourceID);

      if (
        fileMetadata.name !== previousMetadata.name ||
        fileMetadata.modifiedTime !== previousMetadata.modifiedTime ||
        fileMetadata.size !== previousMetadata.size ||
        fileMetadata.mimeType !== previousMetadata.mimeType ||
        fileMetadata.permissions !== previousMetadata.permissions
      ) {
        console.log("File metadata has changed");

      }

      if (fileMetadata.md5Checksum !== previousMetadata.md5Checksum) {
        const fileMetadata = await getFileMetadata(drive,ResourceID);
      }
    } else {
      console.log("Resource ID not found in headers");
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
};

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
