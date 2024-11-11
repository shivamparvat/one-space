import { google } from "googleapis";

export function authorizeGoogleDrive(token) {
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
  

export function listGoogleDriveFiles(auth) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth });
    drive.files.list(
      {
        pageSize: 100,
        fields: "files(*)",
      },
      (err, res) => {
        if (err) {
          console.error("The API returned an error:", err);
          return reject(err);
        }
        const files = res.data.files;
        if (files.length) {
          resolve(files);
        } else {
          console.log("No files found on Google Drive.");
          resolve([]); // Return an empty array if no files are found
        }
      }
    );
  });
}



