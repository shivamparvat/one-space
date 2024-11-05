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

const fetchProfilePhoto = async (dbx, userId) => {
  try {
    const userResponse = await dbx.usersGetAccount({ account_id: userId });
    return userResponse.result.profile_photo_url || null;
  } catch (error) {
    console.warn(`No profile photo available for user ID ${userId}:`, error.message);
    return null;
  }
};

const fetchDetailedDropboxFileData = async (dbx) => {
  return new Promise(async (resolve, reject) => {
  const dropboxMimeTypeIconMap = {
    'application/pdf': 'https://example.com/icons/pdf-icon.png',
    'application/msword': 'https://example.com/icons/word-icon.png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'https://example.com/icons/word-icon.png',
    'application/vnd.ms-excel': 'https://example.com/icons/excel-icon.png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'https://example.com/icons/excel-icon.png',
    'application/vnd.ms-powerpoint': 'https://example.com/icons/ppt-icon.png',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'https://example.com/icons/ppt-icon.png',
    'application/vnd.google-apps.document': 'https://example.com/icons/google-docs-icon.png',
    'application/vnd.google-apps.spreadsheet': 'https://example.com/icons/google-sheets-icon.png',
    'application/vnd.google-apps.presentation': 'https://example.com/icons/google-slides-icon.png',
    'image/jpeg': 'https://example.com/icons/jpeg-icon.png',
    'image/png': 'https://example.com/icons/png-icon.png',
    'image/gif': 'https://example.com/icons/gif-icon.png',
    'text/plain': 'https://example.com/icons/txt-icon.png',
    'application/zip': 'https://example.com/icons/zip-icon.png',
    'application/x-rar-compressed': 'https://example.com/icons/rar-icon.png',
    'audio/mpeg': 'https://example.com/icons/audio-icon.png',
    'video/mp4': 'https://example.com/icons/video-icon.png',
    'application/json': 'https://example.com/icons/json-icon.png',
    'application/javascript': 'https://example.com/icons/js-icon.png',
    'application/xml': 'https://example.com/icons/xml-icon.png',
    'application/epub+zip': 'https://example.com/icons/epub-icon.png',
    'application/x-7z-compressed': 'https://example.com/icons/7z-icon.png',
    'application/vnd.dropbox.folder': 'https://example.com/icons/folder-icon.png',
    'application/vnd.dropbox.paper': 'https://example.com/icons/dropbox-paper-icon.png',
    'image/svg+xml': 'https://example.com/icons/svg-icon.png',
    'application/octet-stream': 'https://example.com/icons/binary-icon.png',
    'default': 'https://example.com/icons/default-file-icon.png'
  };
  
  

  try {
    let allFiles = [];
    let response = await dbx.filesListFolder({ path: '' });
    allFiles.push(...response.result.entries);

    while (response.result.has_more) {
      response = await dbx.filesListFolderContinue({ cursor: response.result.cursor });
      allFiles.push(...response.result.entries);
    }

    for (let file of allFiles) {
      if (file['.tag'] === 'file') {
        const mimeType = file.mime_type || 'application/octet-stream';
        const iconLink = dropboxMimeTypeIconMap[mimeType] || dropboxMimeTypeIconMap['default'];

        let fileDetails = {
          name: file.name,
          id: file.id,
          mimeType: mimeType,
          size: file.size,
          path_lower: file.path_lower,
          path_display: file.path_display,
          client_modified: file.client_modified,
          server_modified: file.server_modified,
          content_hash: file.content_hash,
          shared: false,
          permissions: [],
          lastModifyingUser: null,
          owners: [],
          sharingUser: null,
          webViewLink: null,
          thumbnail: null,
          iconLink: iconLink,
        };

        // Fetch sharing information to get owner and permission details
        try {
          const shareResponse = await dbx.sharingListFileMembers({ file: file.id });
          if (shareResponse.result && shareResponse.result.users.length > 0) {
            fileDetails.shared = true;
            for (const user of shareResponse.result.users) {
              const photoLink = await fetchProfilePhoto(dbx, user.user.account_id);
              fileDetails.permissions.push({
                displayName: user.user.display_name,
                emailAddress: user.user.email,
                is_inherited: user.is_inherited,
                photoLink: photoLink,
                role: user.access_type['.tag'] || 'viewer',
              });
            }
          }
        } catch (shareError) {
          console.warn(`No sharing info available for file ${file.name}:`, shareError);
        }

        // Fetch the last modifying user's info
        try {
          const metadataResponse = await dbx.filesGetMetadata({ path: file.path_lower });
          if (metadataResponse.result.sharing_info && metadataResponse.result.sharing_info.modified_by) {
            const lastModifyingUser = metadataResponse.result.sharing_info.modified_by;
            fileDetails.lastModifyingUser = {
              displayName: lastModifyingUser.name,
              emailAddress: lastModifyingUser.email,
              photoLink: lastModifyingUser.profile_photo_url,
            };
          }
        } catch (metaError) {
          console.warn(`No metadata available for file ${file.name}:`, metaError.message);
        }
      }
    }
    resolve(allFiles)

  } catch (error) {
    console.error('Error fetching file metadata:', error);
  }
})
};

// Usage




async function initializeDropbox({ accessToken, refreshToken, clientId, clientSecret, expiryDate, scope }) {
  const dbx = new Dropbox({
    fetch,
    clientId,
    clientSecret,
    accessToken,
    refreshToken,
    scope
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

    let results = [];

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
          const files = await listGoogleDriveFiles(authClient);
          results = [...results,...files];
        }else if(app?.state == "Dropbox"){
          try {
            const { dbx } = await initializeDropbox({
              accessToken: access_token,
              refreshToken: refresh_token,
              clientId: process.env.DROPBOX_CLIENT_ID,
              clientSecret: process.env.DROPBOX_CLIENT_SECRET,
              expiryDate: expiry_date,
              scope: "files.metadata.write files.content.read file_requests.write sharing.read contacts.write profile email sharing.write account_info.write"
            });
            
            const files = await fetchDetailedDropboxFileData(dbx)
            results = [...results,...files];
          } catch (error) {
            if (error.status === 401 && error.error.error['.tag'] === 'missing_scope') {
              console.error('Missing required scope:', error.error.error.required_scope);
              throw new Error(`Reauthorize with the missing scope: ${error.error.error.required_scope}`);
            } else {
              console.error('Error fetching Dropbox data:', error);
            }
          }


        }
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
