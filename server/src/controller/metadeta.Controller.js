import axios from "axios";
import AppToken from "../Schema/apptoken.js";
import { google } from "googleapis"
import { Dropbox } from 'dropbox';
import fetch from "node-fetch";

function authorizeGoogleDrive(token) {
  return new Promise((resolve, reject) => {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials(token);
    resolve(oAuth2Client);
  });
}

function listGoogleDriveFiles(auth) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth });
    drive.files.list(
      {
        pageSize: 100,
        fields:
          "files(*)"
      },
      (err, res) => {
        if (err) {
          console.error("The API returned an error:", err);
          return reject(err);
        }

        const files = res.data.files;
        if (files.length) {
        //   const formattedFiles = files.map(file => {
        //     const permissions = file.permissions || [];

        //     return {
        //       ID: file.id,
        //       Name: file.name,
        //       Owner: file.owners[0].displayName,
        //       OwnerEmail: file.owners[0].emailAddress,
        //       MimeType: file.mimeType,
        //       Size: file.size ? file.size : "N/A",
        //       CreatedTime: file.createdTime,
        //       ModifiedTime: file.modifiedTime,
        //       TotalUsers: permissions.filter(perm => perm.type === "user").length,
        //       permissions
        //     };
        //   });

          resolve(files);
        } else {
          console.log("No files found on Google Drive.");
          resolve([]); // Return an empty array if no files are found
        }
      }
    );
  });
}

async function initializeDropbox({ accessToken, refreshToken, clientId, clientSecret, expiryDate }) {
  const dbx = new Dropbox({
    fetch,
    clientId,
    clientSecret,
    accessToken,
    refreshToken,
  });

  // Check if the access token is expired
  const now = new Date().getTime();
  // if (now >= expiryDate) {
  //   // Refresh the access token
  //   try {
  //     const response = await dbx.auth.refreshAccessToken();
  //     const { access_token, refresh_token, expires_at } = response.result;

  //     // Update your stored tokens with new values (if needed)
  //     return {
  //       dbx, // Dropbox instance with updated access token
  //       accessToken: access_token,
  //       refreshToken: refresh_token || refreshToken, // Use the new refresh token if provided, else keep the existing one
  //       expiryDate: expires_at,
  //     };
  //   } catch (error) {
  //     console.error('Error refreshing access token:', error);
  //     throw new Error('Could not refresh access token');
  //   }
  // } else {
  // }
  return { dbx, accessToken, refreshToken, expiryDate };
}

export const fileMetadata = async (req, res) => {
  try {
    const connectedApps = await AppToken.find(); // Fetch all connected apps from MongoDB

    const results = [];

    for (const app of connectedApps) {
      const {
        access_token,
        refresh_token,
        scope,
        token_type,
        expiry_date
      } = app;

      try {
        if(app?.state == "Google Drive"){
          const authClient = await authorizeGoogleDrive({
            access_token,
            refresh_token,
            scope,
            token_type,
            expiry_date
          });
          // const files = await listGoogleDriveFiles(authClient);
          // results.push({ appState: app.state, files });
        }else if(app?.state == "Dropbox"){


          try {


          const { dbx } = await initializeDropbox({
            accessToken: access_token,
            refreshToken: refresh_token,
            clientId: process.env.DROPBOX_CLIENT_ID,
            clientSecret: process.env.DROPBOX_CLIENT_SECRET,
            expiryDate: expiry_date,
          });

            // Example: Get the user's account information
            const accountInfo = await dbx.usersGetCurrentAccount();
            console.log('Account Info:', accountInfo);

            // Example: List files in the user's root folder
            const files = await dbx.filesListFolder({ path: '' });
            console.log('Files:', files);

            // Return data if you want to use it further
            console.table( {
              accountInfo: accountInfo,
              files: files,
            });
          } catch (error) {
            console.error('Error fetching Dropbox data:', error);
            throw new Error('Could not fetch Dropbox data');
          }


        }
        // results.push({ appState: app.state, files });
      } catch (error) {
        console.error("Error listing Google Drive files for app:", error);
      }
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({ success: false, message: "Error fetching metadata" });
  }
};
