import { google } from "googleapis";
import { GOOGLE_DRIVE_STR } from "../constants/appNameStr.js";
import { authorizeGoogleDrive } from "../helper/metaData/drive.js";
import AppToken from "../Schema/apptoken.js";
import User from "../Schema/userSchema.js";
import Filedata from "../Schema/fileMetadata.js";
import { createEmbedding } from "../helper/Embedding.js";

export async function UpdateDriveData() {
  try {
    // Retrieve all active users
    //   cache.set(cache_id, MessageNumber, 10);
    const tokens = await AppToken.find({ state: GOOGLE_DRIVE_STR });
    if (tokens.length > 0) {
      tokens.forEach(async (token) => {
        const user_id = token?.user_id;
        const user = await User.findById(user_id);
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
                { $set: { driveStartPageToken: startToken } },
                { new: true, upsert: true }
              );
            }
            await listChanges(auth, drive, startToken, user);
          }
      });
    }
    // console.log("Google Drive sync completed.");
  } catch (error) {
    console.error("Error in syncing Google Drive data:", error);
  }
}



async function listChanges(auth, drive, startPageToken, user) {

    const user_id = user?._id
    const organization = user?.organization
    try {
        const changesResponse = await drive.changes.list({
            pageToken: startPageToken,
            fields: 'changes(fileId,changeType, file(*))',
        });
        const changeFiles = await changesResponse.data.changes
        if (changeFiles.length > 0 ) {
            (changeFiles||[]).map(async(file)=>{
                const fileMetadata = file?.file
                const id = fileMetadata?.id
                if (fileMetadata?.kind == "drive#file") {
                    const previousMetadata = await getPreviousMetadata(id);
                    if (!previousMetadata) {
                        console.log("add file")
                        await Filedata.create({
                            doc_id:id,
                            organization,
                            user_id,
                            data: fileMetadata,
                        })
                        console.log("createEmbedding")
                          await createEmbedding(auth, id)
                    } else {
                        console.log("old file")
                      if (
                        fileMetadata.name !== previousMetadata.name ||
                        fileMetadata.modifiedTime !== previousMetadata.modifiedTime 
                      ) {
                        await Filedata.updateOne(
                          { doc_id: id }, 
                          { $set: { data: fileMetadata } } 
                        );
                        console.log("update meta data ")
                      }
                      if (fileMetadata.md5Checksum !== previousMetadata.md5Checksum || fileMetadata?.size == previousMetadata?.size) {
                        await createEmbedding(auth, id)
                        console.log("createEmbedding")
                      }
                    }
          
                  } else {
                    console.log("Resource ID not found in headers");
                  }
            })
        } else {
            // console.log('No changes found');
        }
    } catch (error) {
        console.error('Error listing changes:', error);
    }
}


async function getPreviousMetadata(ResourceID) {
    const prefile = await Filedata.findOne({ doc_id: ResourceID })
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
  