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
  

export function listGoogleDriveFiles(auth,pageSize=1) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth });
    drive.files.list(
      {
        pageSize: pageSize,
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




export async function loadGoogleDriveFile(auth, fileId, mimeType = 'application/pdf') {
  try {
    const drive = google.drive({ version: 'v3', auth });

    // Get file metadata to check its MIME type
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });

    const fileMimeType = fileMetadata.data.mimeType;

    if (fileMimeType.includes('application/vnd.google-apps')) {
      // For Google Docs/Sheets/Slides, export instead of downloading
      const exportedFile = await drive.files.export(
        {
          fileId: fileId,
          mimeType: mimeType, // Specify the format you want, e.g., PDF or DOCX
        },
        { responseType: 'stream' }
      );

      return exportedFile.data; // Return the file stream
    } else {
      // For other files, download directly
      const file = await drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' }
      );

      return file.data;
    }
  } catch (err) {
    console.error('Error downloading or exporting the file:', err);
    throw new Error('Failed to retrieve the file');
  }
}