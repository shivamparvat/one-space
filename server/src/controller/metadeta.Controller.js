import axios from "axios";
import AppToken from "../Schema/apptoken.js";
import { google } from "googleapis"

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
          "files(id, name, mimeType, size, createdTime, modifiedTime, owners(emailAddress, displayName), permissions)"
      },
      (err, res) => {
        if (err) {
          console.error("The API returned an error:", err);
          return reject(err);
        }

        const files = res.data.files;
        if (files.length) {
          const formattedFiles = files.map(file => {
            const permissions = file.permissions || [];

            return {
              ID: file.id,
              Name: file.name,
              Owner: file.owners[0].displayName,
              OwnerEmail: file.owners[0].emailAddress,
              MimeType: file.mimeType,
              Size: file.size ? file.size : "N/A",
              CreatedTime: file.createdTime,
              ModifiedTime: file.modifiedTime,
              TotalUsers: permissions.filter(perm => perm.type === "user").length
            };
          });

          resolve(formattedFiles);
        } else {
          console.log("No files found on Google Drive.");
          resolve([]); // Return an empty array if no files are found
        }
      }
    );
  });
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
        const authClient = await authorizeGoogleDrive({
          access_token,
          refresh_token,
          scope,
          token_type,
          expiry_date
        });
        
        const files = await listGoogleDriveFiles(authClient);
        results.push({ appState: app.state, files });
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
