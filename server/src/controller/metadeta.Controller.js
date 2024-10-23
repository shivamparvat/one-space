import axios from "axios"
import AppToken from "../Schema/apptoken.js";
import {google} from "googleapis";
import fs from "fs";

const GOOGLE_CREDENTIALS_PATH = "./config/goolge-credentials.json"
// Fetch metadata from Google Drive
async function authorizeWithStoredToken(
  credentials,
  storedToken,
  callback
) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    // If you have a refresh token, set it here
    oAuth2Client.setCredentials({ access_token: storedToken });

    // Check if the token is expired, and refresh it if possible
    if (oAuth2Client.isTokenExpiring()) {
      const newTokens = await oAuth2Client.refreshAccessToken();
      oAuth2Client.setCredentials(newTokens.credentials);
    }

    callback(oAuth2Client);
  } catch (error) {
    console.error("Failed to authorize with stored token:", error);
  }
}




function listGoogleDriveFiles(auth) {
  const drive = google.drive({version: "v3", auth});
  drive.files.list(
    {
      pageSize: 100,
      fields:
        "files(id, name, mimeType, size, createdTime, modifiedTime, owners(emailAddress, displayName), permissions)"
    },
    (err, res) => {
      if (err) {
        console.error("The API returned an error: " + err);
        return;
      }
      const files = res?.data?.files;
      // if (files && files.length) {
      //   console.log("Files from Google Drive:");
      //   const formattedFiles = files.map((file) => {
      //     const permissions = file.permissions || [];
      //     const internalUsers = permissions.filter(
      //       (perm) =>
      //         perm.type === "user" &&
      //         perm.emailAddress &&
      //         perm.emailAddress.endsWith("@shivam.com")
      //     ).length;

      //     const externalUsers = permissions.filter(
      //       (perm) =>
      //         perm.type === "user" &&
      //         perm.emailAddress &&
      //         !perm.emailAddress.endsWith("@shivam.com")
      //     ).length;

      //     return {
      //       ID: file.id,
      //       Name: file.name,
      //       Owner: file.owners?.[0]?.displayName || "N/A",
      //       OwnerEmail: file.owners?.[0]?.emailAddress || "N/A",
      //       MimeType: file.mimeType,
      //       Size: file.size ? file.size : "N/A",
      //       CreatedTime: file.createdTime,
      //       ModifiedTime: file.modifiedTime,
      //       TotalUsers: permissions.filter((perm) => perm.type === "user")
      //         .length,
      //       InternalUsers: internalUsers,
      //       ExternalUsers: externalUsers,
      //     };
      //   });
      //   console.log(formattedFiles); // Display or handle the formatted files
      // } else {
      //   console.log("No files found on Google Drive.");
      // }
    }
  );
}




export const fileMetadata = async (req, res) => {
  try {
    // const connectedApps = await AppToken.find(); // Fetch all connected apps from MongoDB

    const results = [];

    // for (const app of connectedApps) {
    //   let metadata;

      // if (app.state === 'Dropbox') {
      //   metadata = await fetchDropboxMetadata(app.token);
      // } else 
      // if (app.state === 'Google Drive') {
        fs.readFile(GOOGLE_CREDENTIALS_PATH, "utf-8", (err, content) => {
          if (err) {
            console.error("Error loading client secret file:", err);
            return;
          }
          console.log(JSON.parse(content))
          authorizeWithStoredToken(JSON.parse(content), "4/0AVG7fiSpgq7KsSq3gBvVwBSwFFjsf10cbS8eS6WmuuqGXlhaiZsMpp0tnRTtg9kSYcDGgg", listGoogleDriveFiles);
        });
    //   }


    //   results.push({
    //     state: app.state,
    //     token: app.token,
    //     metadata,
    //   });
    // }

    // console.log(results)
    // res.status(200).json({success: true, data: results});
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({success: false, message: 'Error fetching metadata'});
  }
}