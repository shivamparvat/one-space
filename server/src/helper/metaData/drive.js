import { google } from "googleapis";
import { GOOGLE_DRIVE_STR } from "../../constants/appNameStr.js";
import Filedata from "../../Schema/fileMetadata.js";
import cache from "../../redis/cache.js";
import User from "../../Schema/userSchema.js";



export async function getFilesFromDrive(accessToken, user_id, organization){
  const authClient = await authorizeGoogleDrive(accessToken);
  const files = await listGoogleDriveFilesRecursively(authClient,user_id, organization);
  await Filedata.bulkWrite(files);
}


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


export function listGoogleDriveFiles(auth, pageSize = 1000, folderId = "root") {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth });
    // const query = '("me" in owners or sharedWithMe = true) and trashed = false and mimeType != "application/vnd.google-apps.shortcut"';
    const query = `'${folderId}' in parents`;
    drive.files.list(
      {
        pageSize: pageSize,
        fields: "files(*)",
        q: query,
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


export async function listGoogleDriveFilesRecursively(authClient, user_id, organization, folderId = 'root', totalPages = 1000) {
  const files = await listGoogleDriveFiles(authClient, totalPages, folderId); // Fetch files in the folder
  const fileDataToInsert = [];

  for (const file of files) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      // If the file is a folder, recursively fetch its contents
      const subfolderFiles = await listGoogleDriveFilesRecursively(authClient, user_id, organization, file.id, totalPages);
      fileDataToInsert.push(...subfolderFiles);
    } else {
      // Add file data to the batch
      const data = await dataOrganizer(file, user_id)
      fileDataToInsert.push({
        updateOne: {
          filter: { doc_id: file.id, user_id, organization },
          update: {
            $set: {
              doc_id: file.id,
              user_id,
              organization,
              data: data,
              app_name: GOOGLE_DRIVE_STR,
            },
          },
          upsert: true, // Insert a new document if no match is found
        },
      });
    }
  }

  return fileDataToInsert;
}


export async function dataOrganizer(data, user_id) {
  const cacheKey = `org_user_${user_id}`
  let user = await cache.get(cacheKey) 
  if(!user){
    user = await User.findById(user_id).populate("organization");
    await cache.set(cacheKey,user,60*60*5) 
  }
  const organization = user?.organization

  const organizationDomain = organization?.domain


    const result = (data.permissions||[]).reduce(
      (acc, { emailAddress }) => {
        if (!emailAddress) return acc;
        emailAddress.endsWith(`@${organizationDomain}`)
          ? acc.internal.push(emailAddress)
          : acc.external.push(emailAddress);

        return acc;
      },
      { internal: [], external: [] }
    );
    data = {...data, internalCount: result.internal.length,
      externalCount: result.external.length,
      internalUsers: result.internal,
      externalUsers: result.external}
    return data
}  