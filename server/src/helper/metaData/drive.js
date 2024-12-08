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
  

export function listGoogleDriveFiles(auth,pageSize=10) {
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

    // Get file metadata to check its MIME type and name
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, name, id',
    });

    const fileMimeType = fileMetadata.data.mimeType;
    const fileName = fileMetadata.data.name;

    if (fileMimeType.includes('application/vnd.google-apps')) {
      // Handle Google Docs, Sheets, and Slides
      if (fileMimeType === 'application/vnd.google-apps.document') {
        // Export Google Docs to PDF (or any other format)
        const exportedFile = await drive.files.export(
          {
            fileId: fileId,
            mimeType: mimeType, // e.g., 'application/pdf' or 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          },
          { responseType: 'arraybuffer' }
        );
        return {
          data: Buffer.from(exportedFile.data), // Convert exported file to binary
          name: fileName,
          mimeType: mimeType,  // The requested mime type (e.g., PDF)
          metadata: fileMetadata.data,
        };
      } else if (fileMimeType === 'application/vnd.google-apps.presentation') {
        // Export Google Slides to PDF
        const exportedFile = await drive.files.export(
          {
            fileId: fileId,
            mimeType: mimeType, // e.g., 'application/pdf' for PDF
          },
          { responseType: 'arraybuffer' }
        );
        return {
          data: Buffer.from(exportedFile.data),
          name: fileName,
          mimeType: mimeType,
          metadata: fileMetadata.data,
        };
      } else if (fileMimeType === 'application/vnd.google-apps.spreadsheet') {
        // Export Google Sheets to a desired format (e.g., PDF, XLSX, etc.)
        const exportedFile = await drive.files.export(
          {
            fileId: fileId,
            mimeType: mimeType, // e.g., 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          { responseType: 'arraybuffer' }
        );
        return {
          data: Buffer.from(exportedFile.data),
          name: fileName,
          mimeType: mimeType,
          metadata: fileMetadata.data,
        };
      } else {
        throw new Error(`Unsupported Google Drive file type: ${fileMimeType}`);
      }
    } else {
      // For non-Google files (e.g., PDFs, images, etc.), download directly
      const file = await drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      );
      return {
        data: Buffer.from(file.data),
        name: fileName,
        mimeType: fileMimeType,
        metadata: fileMetadata.data,
      };
    }
  } catch (err) {
    console.error('Error downloading or exporting the file:', err);
    throw new Error('Failed to retrieve the file');
  }
}