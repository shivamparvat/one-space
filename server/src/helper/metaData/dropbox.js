import { dropboxMimeTypeIconMap } from "../../constants/metaData";
import fetch from "node-fetch";
import { Dropbox } from "dropbox";


const fetchProfilePhoto = async (dbx, userId) => {
    try {
      const userResponse = await dbx.usersGetAccount({ account_id: userId });
      return userResponse.result.profile_photo_url || null;
    } catch (error) {
      console.warn(
        `No profile photo available for user ID ${userId}:`,
        error.message
      );
      return null;
    }
  };



export async function initializeDropbox({
  accessToken,
  refreshToken,
  clientId,
  clientSecret,
  expiryDate,
  scope,
}) {
  const dbx = new Dropbox({
    fetch,
    clientId,
    clientSecret,
    accessToken,
    refreshToken,
    scope,
  });

  const now = new Date().getTime();
  return { dbx, accessToken, refreshToken, expiryDate };
}


export const fetchDetailedDropboxFileData = async (dbx) => {
  return new Promise(async (resolve, reject) => {
    try {
      let allFiles = [];
      let response = await dbx.filesListFolder({ path: "" });
      allFiles.push(...response.result.entries);

      while (response.result.has_more) {
        response = await dbx.filesListFolderContinue({
          cursor: response.result.cursor,
        });
        allFiles.push(...response.result.entries);
      }

      for (let file of allFiles) {
        if (file[".tag"] === "file") {
          const mimeType = file.mime_type || "application/octet-stream";
          const iconLink =
            dropboxMimeTypeIconMap[mimeType] ||
            dropboxMimeTypeIconMap["default"];

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
            const shareResponse = await dbx.sharingListFileMembers({
              file: file.id,
            });
            if (shareResponse.result && shareResponse.result.users.length > 0) {
              fileDetails.shared = true;
              for (const user of shareResponse.result.users) {
                const photoLink = await fetchProfilePhoto(
                  dbx,
                  user.user.account_id
                );
                fileDetails.permissions.push({
                  displayName: user.user.display_name,
                  emailAddress: user.user.email,
                  is_inherited: user.is_inherited,
                  photoLink: photoLink,
                  role: user.access_type[".tag"] || "viewer",
                });
              }
            }
          } catch (shareError) {
            console.warn(
              `No sharing info available for file ${file.name}:`,
              shareError
            );
          }

          // Fetch the last modifying user's info
          try {
            const metadataResponse = await dbx.filesGetMetadata({
              path: file.path_lower,
            });
            if (
              metadataResponse.result.sharing_info &&
              metadataResponse.result.sharing_info.modified_by
            ) {
              const lastModifyingUser =
                metadataResponse.result.sharing_info.modified_by;
              fileDetails.lastModifyingUser = {
                displayName: lastModifyingUser.name,
                emailAddress: lastModifyingUser.email,
                photoLink: lastModifyingUser.profile_photo_url,
              };
            }
          } catch (metaError) {
            console.warn(
              `No metadata available for file ${file.name}:`,
              metaError.message
            );
          }
        }
      }
      resolve(allFiles);
    } catch (error) {
      console.error("Error fetching file metadata:", error);
    }
  });
};
