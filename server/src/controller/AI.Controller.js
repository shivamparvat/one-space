import { createGoolgeDriveEmbedding } from "../helper/Embedding.js";
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
    const user = req.user;
    const organization = user?.organization?._id;
    const user_id = user?._id;


    const connectedApps = await AppToken.find({organization, user_id});
    if(!connectedApps){
      return res.status(200).json({ success: true, data: results, message:"please connect apps", app:true});
    } 

    const query = req?.query?.searchQuery;
    const result = await AiQurey(query,user_id,organization);
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ success: false, message: "search Error" + error });
  }
};




export async function initEmbedding(req, res, permissions = false) {
  const user = req.user;

  const organization = user?.organization?._id;
  const user_id = user?._id;
  if(permissions || user?.ai_permission){

    const connectedApps = await AppToken.find({organization, user_id});
  
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
  
          const files = await listGoogleDriveFilesRecursively(authClient, user_id, organization);
          const totalFiles = (files || []).length;
          // console.log(totalFiles,"totalFiles")
  
          for (let index = 0; index < totalFiles; index++) {
            const file = files[index];
            const fileId = file?.id;
            const embeddingFilesType = ["application/zip","application/x-compressed", "application/rar",  "application/vnd.google-apps.folder", "image/jpeg",  "image/png", "image/gif", "image/bmp", "image/webp", "image/svg+xml", "image/tiff", "image/x-icon", "image/vnd.microsoft.icon"];

            if (!(file?.mimeType && embeddingFilesType.includes(file.mimeType))) {
              const embeddingResult = await createGoolgeDriveEmbedding(
                authClient,
                fileId,
                user_id
              );
    
              if (!embeddingResult.success) {
                throw new Error(
                  `Failed to create embedding for file ID: ${fileId}`
                ); 
              }
            }
  

            const progress = Math.round(((index + 1) / totalFiles) * 100);
  
            res.write(
              `data: ${JSON.stringify({ fileId,name: file?.name, progress:progress,status:200})}\n\n`
            );
          }
        }
        else if(app?.state === DROPBOX_STR){
          
        }
      }
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          status: 500,
          message: error.message || "An error occurred while creating embeddings",
        })}\n\n`
      );
    }
  }else{
    res.write(
      `data: ${JSON.stringify({
        status: 401,
        message: "Please provide AI Data Permission",
      })}\n\n`
    );
  }
}
